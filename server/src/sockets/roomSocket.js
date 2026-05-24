import Room from '../models/Room.js'
import Match from '../models/Match.js'
import Vote from '../models/Vote.js'
import Tournament from '../models/Tournament.js'
import AnimeOpening from '../models/AnimeOpening.js'
import mongoose from 'mongoose'
import { clearTournamentVideoCache } from '../utils/videoCache.js'

// Estado en memoria para cada sala activa (key = inviteCode)
const roomStates = new Map() // inviteCode -> { skippedBy: Set, p2Timer: timeoutId | null, timerStarted: bool }

const normalizeId = (value) => {
  if (!value) return ''
  return value.toString()
}

const mapMatchForClient = async (match, tournament) => {
  if (!match || !tournament) return null

  const participants = tournament.participants || []
  const openingIds = participants
    .map((participant) => participant.opening_id)
    .filter(Boolean)

  const openings = await AnimeOpening.find({ _id: { $in: openingIds } }).select('_id video_url')
  const openingVideos = new Map(
    openings.map((opening) => [normalizeId(opening._id), opening.video_url])
  )

  const participant1 = participants.find(
    (participant) => normalizeId(participant._id) === normalizeId(match.participant1_id)
  )
  const participant2 = participants.find(
    (participant) => normalizeId(participant._id) === normalizeId(match.participant2_id)
  )

  const withVideo = (participant) => {
    if (!participant) return null
    const openingId = normalizeId(participant.opening_id)
    return {
      ...participant.toObject(),
      video_url: participant.video_url || openingVideos.get(openingId) || null
    }
  }

  return {
    _id: match._id,
    id: match._id,
    round: match.round,
    match_number: match.match_number,
    status: match.status,
    winner_id: match.winner_id,
    participant1: withVideo(participant1),
    participant2: withVideo(participant2)
  }
}

// Coloca al ganador en el match de la siguiente ronda
const placeWinnerInBracket = async (tournamentId, currentMatch) => {
  if (!currentMatch.winner_id) return
  const nextRound = currentMatch.round + 1
  const nextMatchNumber = Math.ceil(currentMatch.match_number / 2)
  const parentMatch = await Match.findOne({
    tournament_id: tournamentId,
    round: nextRound,
    match_number: nextMatchNumber
  })
  if (!parentMatch) return
  if (currentMatch.match_number % 2 === 1) {
    parentMatch.participant1_id = currentMatch.winner_id
  } else {
    parentMatch.participant2_id = currentMatch.winner_id
  }
  await parentMatch.save()
}

const initRoomState = (inviteCode, { connectedUsersCount, participant1Id, participant2Id } = {}) => {
  roomStates.set(inviteCode, {
    skippedBy: new Set(),
    votedP1: new Set(),
    votedP2: new Set(),
    p2Timer: null,
    timerStarted: false,
    p2Ended: false,
    connectedUsersCount: connectedUsersCount || 0,
    participant1Id: participant1Id ? participant1Id.toString() : null,
    participant2Id: participant2Id ? participant2Id.toString() : null
  })
}

const advanceToNextMatch = async (io, inviteCode, room) => {
  const tournamentWithParticipants = await Tournament.findById(room.tournament_id._id)
  const totalUsers = room.connected_users.length

  const nextMatch = await Match.findOne({
    tournament_id: room.tournament_id._id,
    round: room.current_match_id.round,
    match_number: room.current_match_id.match_number + 1,
    status: 'pending',
    participant1_id: { $exists: true },
    participant2_id: { $exists: true }
  })

  if (nextMatch) {
    room.current_match_id = nextMatch._id
    await room.save()
    initRoomState(inviteCode, {
      connectedUsersCount: totalUsers,
      participant1Id: nextMatch.participant1_id,
      participant2Id: nextMatch.participant2_id
    })
    const matchData = await mapMatchForClient(nextMatch, tournamentWithParticipants)
    io.to(inviteCode).emit('match_changed', {
      currentMatch: matchData,
      phase: 'playing_p1',
      totalUsers
    })
    return
  }

  const nextRoundMatch = await Match.findOne({
    tournament_id: room.tournament_id._id,
    round: (room.current_match_id.round || 1) + 1,
    status: 'pending',
    participant1_id: { $exists: true },
    participant2_id: { $exists: true }
  }).sort({ match_number: 1 })

  if (nextRoundMatch) {
    room.current_match_id = nextRoundMatch._id
    await room.save()
    initRoomState(inviteCode, {
      connectedUsersCount: totalUsers,
      participant1Id: nextRoundMatch.participant1_id,
      participant2Id: nextRoundMatch.participant2_id
    })
    const matchData = await mapMatchForClient(nextRoundMatch, tournamentWithParticipants)
    io.to(inviteCode).emit('match_changed', {
      currentMatch: matchData,
      phase: 'playing_p1',
      totalUsers
    })
    return
  }

  const tournament = await Tournament.findById(room.tournament_id._id)
  io.to(inviteCode).emit('tournament_ended', {
    message: '¡Torneo finalizado!',
    tournament,
    status: 'results'
  })
  await clearTournamentVideoCache(room.tournament_id._id)
  await deleteRoomOnly(room, io)
}

const cleanupRoomTournamentData = async (room) => {
  const tournamentId = room.tournament_id?._id || room.tournament_id
  const matches = await Match.find({ tournament_id: tournamentId }, '_id')
  const matchIds = matches.map((match) => match._id)
  if (matchIds.length > 0) {
    await Vote.deleteMany({ match_id: { $in: matchIds } })
  }
  await Match.deleteMany({ tournament_id: tournamentId })
  await Room.findByIdAndDelete(room._id)
  await Tournament.findByIdAndDelete(tournamentId)
  await clearTournamentVideoCache(tournamentId)
}

const deleteRoomOnly = async (room, io) => {
  if (!room) return
  if (io) {
    io.to(room.invite_code).emit('room_closed', {
      message: 'La sala se ha cerrado',
      reason: 'tournament_ended'
    })
    const sockets = await io.in(room.invite_code).fetchSockets()
    for (const s of sockets) {
      s.leave(room.invite_code)
    }
  }
  await Room.findByIdAndDelete(room._id)
}

export function setupRoomSocket(io) {
  io.on('connection', (socket) => {
    console.log(`✓ Usuario conectado: ${socket.id}`)

    /**
     * join_room: Un usuario se une a una sala por código de invitación
     */
    socket.on('join_room', async (data) => {
      try {
        const { inviteCode, userId, username } = data
        if (!inviteCode || !userId) {
          socket.emit('error', { message: 'Código e ID requeridos' })
          return
        }

        let room = await Room.findOne({ invite_code: inviteCode.toUpperCase() })
          .populate('tournament_id')
          .populate('current_match_id')
          .populate('connected_users')

        if (!room) {
          socket.emit('error', { message: 'Sala no encontrada' })
          return
        }

        if (room.connected_users.length === 0) {
          room.host_user_id = userId
        }

        if (!room.connected_users.some(u => u._id.toString() === userId)) {
          room.connected_users.push(userId)
          await room.save()
        }

        socket.join(inviteCode)
        socket.data.userId = userId
        socket.data.inviteCode = inviteCode

        const updatedRoom = await Room.findById(room._id)
          .populate('connected_users', 'username email')
          .populate('tournament_id')

        io.to(inviteCode).emit('room_updated', {
          room_id: room._id,
          connected_users: updatedRoom.connected_users,
          users_count: updatedRoom.connected_users.length,
          status: updatedRoom.status,
          host_user_id: updatedRoom.host_user_id,
          tournament: updatedRoom.tournament_id,
          current_match_id: updatedRoom.current_match_id,
          videos_ready: updatedRoom.videos_ready
        })
      } catch (error) {
        console.error('Error en join_room:', error)
        socket.emit('error', { message: 'Error al unirse a la sala' })
      }
    })

    /**
     * start_tournament: El host inicia el torneo
     */
    socket.on('start_tournament', async (data) => {
      try {
        const { inviteCode, userId } = data

        let room = await Room.findOne({ invite_code: inviteCode.toUpperCase() })
          .populate('tournament_id')

        if (!room) {
          socket.emit('error', { message: 'Sala no encontrada' })
          return
        }

        if (room.host_user_id.toString() !== userId) {
          socket.emit('error', { message: 'Solo el host puede iniciar el torneo' })
          return
        }

        const tournament = await Tournament.findByIdAndUpdate(
          room.tournament_id._id,
          { status: 'active' },
          { new: true }
        )

        room.status = 'voting'
        await room.save()

        const firstMatch = await Match.findOne({
          tournament_id: tournament._id,
          round: 1,
          match_number: 1
        })

        if (firstMatch) {
          room.current_match_id = firstMatch._id
          await room.save()
        }

        const tournamentWithParticipants = await Tournament.findById(tournament._id)
        const currentMatch = await mapMatchForClient(firstMatch, tournamentWithParticipants)

        // Inicializar estado de la sala en memoria
        initRoomState(inviteCode, {
          connectedUsersCount: room.connected_users.length,
          participant1Id: firstMatch?.participant1_id,
          participant2Id: firstMatch?.participant2_id
        })

        console.log(`✓ Torneo iniciado: ${inviteCode}`)

        io.to(inviteCode).emit('tournament_started', {
          tournament,
          currentMatch,
          phase: 'playing_p1',
          totalUsers: room.connected_users.length
        })
      } catch (error) {
        console.error('Error en start_tournament:', error)
        socket.emit('error', { message: 'Error al iniciar el torneo' })
      }
    })

    /**
     * skip_p1: Un usuario salta el primer opening
     * Si todos saltan, se pasa al segundo opening
     */
    socket.on('skip_p1', (data) => {
      const { inviteCode, matchId, userId } = data
      const code = inviteCode.toUpperCase()

      const state = roomStates.get(code)
      if (!state) {
        socket.emit('error', { message: 'El torneo no ha iniciado correctamente' })
        return
      }

      state.skippedBy.add(userId.toString())

      const connectedCount = state.connectedUsersCount

      io.to(inviteCode).emit('p1_skip_update', {
        matchId,
        skippedCount: state.skippedBy.size,
        totalUsers: connectedCount
      })

      if (state.skippedBy.size >= connectedCount) {
        io.to(inviteCode).emit('p1_skipped', { matchId })
      }
    })

    /**
     * video_ended: El frontend notifica que un vídeo terminó
     * Si terminó P1 y no todos lo saltaron, pasar a P2
     */
    socket.on('video_ended', async (data) => {
      try {
        const { inviteCode, matchId, participant } = data
        const code = inviteCode.toUpperCase()

        if (participant === 1) {
          io.to(inviteCode).emit('p1_skipped', { matchId })
        } else if (participant === 2) {
          const state = roomStates.get(code)
          if (!state || state.timerStarted) {
            return
          }

          state.p2Ended = true
          state.timerStarted = true
          state.p2Timer = setTimeout(async () => {
            await finalizeMatch(io, inviteCode)
          }, 10000)

          io.to(inviteCode).emit('p2_ended', { matchId })
        }
      } catch (error) {
        console.error('Error en video_ended:', error)
      }
    })

    /**
     * p2_ready: El frontend notifica que P2 empezó a reproducirse
     */
    socket.on('p2_ready', async (data) => {
      try {
        const { inviteCode } = data
        const code = inviteCode.toUpperCase()

        const room = await Room.findOne({ invite_code: code })
        if (!room) return

        const state = roomStates.get(code)
        if (!state) return
      } catch (error) {
        console.error('Error en p2_ready:', error)
      }
    })

    /**
     * submit_vote: Un usuario vota por su opening favorito
     */
    socket.on('submit_vote', async (data) => {
      try {
        const { inviteCode, matchId, participantId, userId } = data

        if (!inviteCode || !matchId || !participantId || !userId) {
          socket.emit('error', { message: 'Parametros incompletos para votar' })
          return
        }

        const code = inviteCode.toUpperCase()
        const state = roomStates.get(code)
        if (!state) {
          socket.emit('error', { message: 'El torneo no está activo' })
          return
        }

        const uid = userId.toString()
        const pid = participantId.toString()

        if (state.votedP1.has(uid) || state.votedP2.has(uid)) {
          state.votedP1.delete(uid)
          state.votedP2.delete(uid)
        }
        if (pid === state.participant1Id) {
          state.votedP1.add(uid)
        } else if (pid === state.participant2Id) {
          state.votedP2.add(uid)
        } else {
          socket.emit('error', { message: 'Participante inválido' })
          return
        }

        Vote.findOneAndUpdate(
          { match_id: matchId, user_id: userId },
          { participant_id: participantId },
          { upsert: true }
        ).catch(err => console.error('Error persistir voto:', err))

        const votes_p1 = state.votedP1.size
        const votes_p2 = state.votedP2.size
        const totalVotes = votes_p1 + votes_p2

        io.to(inviteCode).emit('vote_update', {
          matchId,
          votes: { participant1: votes_p1, participant2: votes_p2 },
          totalVotes
        })

        if (totalVotes >= state.connectedUsersCount) {
          await finalizeMatch(io, inviteCode)
        }
      } catch (error) {
        console.error('Error en submit_vote:', error)
        socket.emit('error', { message: 'Error al votar' })
      }
    })

    // --- Funcion auxiliar para finalizar un match ---
    async function finalizeMatch(io, inviteCode) {
      const code = inviteCode.toUpperCase()
      const state = roomStates.get(code)

      let votesP1 = 0
      let votesP2 = 0
      if (state) {
        votesP1 = state.votedP1.size
        votesP2 = state.votedP2.size
        if (state.p2Timer) clearTimeout(state.p2Timer)
        roomStates.delete(code)
      }

      const room = await Room.findOne({ invite_code: code })
        .populate('tournament_id')
        .populate('current_match_id')

      if (!room || !room.current_match_id) {
        return
      }

      const match = room.current_match_id
      if (match.status === 'completed') {
        return
      }

      let winnerId = null
      if (votesP1 > votesP2) {
        winnerId = match.participant1_id
      } else if (votesP2 > votesP1) {
        winnerId = match.participant2_id
      } else {
        const participants = [match.participant1_id, match.participant2_id]
        winnerId = participants[Math.floor(Math.random() * participants.length)]
      }

      match.winner_id = winnerId
      match.status = 'completed'
      await match.save()

      await Tournament.findOneAndUpdate(
        { _id: match.tournament_id, 'participants._id': winnerId },
        { $inc: { 'participants.$.wins': 1 } }
      )

      await Vote.deleteMany({ match_id: match._id })

      await placeWinnerInBracket(room.tournament_id._id, match)
      await advanceToNextMatch(io, inviteCode, room)
    }

    /**
     * disconnect: Usuario se desconecta
     */
    socket.on('disconnect', async () => {
      try {
        console.log(`✓ Usuario desconectado: ${socket.id}`)

        const disconnectedUserId = socket.data.userId
        if (!disconnectedUserId) return

        const rooms = await Room.find({ connected_users: disconnectedUserId })

        for (const room of rooms) {
          room.connected_users = room.connected_users.filter(
            (connectedUserId) => normalizeId(connectedUserId) !== normalizeId(disconnectedUserId)
          )

          const hostLeft = normalizeId(room.host_user_id) === normalizeId(disconnectedUserId)

          if (room.connected_users.length === 0 || hostLeft) {
            await cleanupRoomTournamentData(room)
            io.to(room.invite_code).emit('room_closed', {
              message: 'La sala se cerró por inactividad o salida del host',
              reason: hostLeft ? 'host_left' : 'empty_room'
            })
            console.log('Torneo y sala eliminados:', room.invite_code)
            continue
          }

          await room.save()
          const state = roomStates.get(room.invite_code.toUpperCase())
          if (state) {
            state.connectedUsersCount = room.connected_users.length
            state.votedP1.delete(disconnectedUserId.toString())
            state.votedP2.delete(disconnectedUserId.toString())
          }

          const updatedRoom = await Room.findById(room._id).populate('connected_users', 'username email')

          io.to(room.invite_code).emit('room_updated', {
            connected_users: updatedRoom?.connected_users || [],
            users_count: updatedRoom?.connected_users?.length || 0,
            status: updatedRoom?.status || 'waiting',
            host_user_id: updatedRoom?.host_user_id || null,
            videos_ready: updatedRoom?.videos_ready || false
          })
        }
      } catch (error) {
        console.error('Error en disconnect:', error)
      }
    })

    /**
     * leave_room: Usuario abandona una sala
     */
    socket.on('leave_room', async (data) => {
      try {
        const { inviteCode, userId } = data

        let room = await Room.findOne({ invite_code: inviteCode.toUpperCase() })
          .populate('tournament_id')

        if (!room) return

        room.connected_users = room.connected_users.filter(
          u => u.toString() !== userId
        )

        const hostLeft = normalizeId(room.host_user_id) === normalizeId(userId)
        if (room.connected_users.length === 0 || hostLeft) {
          await cleanupRoomTournamentData(room)
          io.to(inviteCode).emit('room_closed', {
            message: 'La sala se cerró por inactividad o salida del host',
            reason: hostLeft ? 'host_left' : 'empty_room'
          })
          console.log('Torneo y sala eliminados:', room.invite_code)
        } else {
          await room.save()
          const state = roomStates.get(inviteCode.toUpperCase())
          if (state) {
            state.connectedUsersCount = room.connected_users.length
            state.votedP1.delete(userId)
            state.votedP2.delete(userId)
          }

          const updatedRoom = await Room.findById(room._id).populate('connected_users', 'username email')
          io.to(inviteCode).emit('room_updated', {
            connected_users: updatedRoom.connected_users,
            users_count: updatedRoom.connected_users.length,
            status: updatedRoom.status,
            host_user_id: updatedRoom.host_user_id,
            videos_ready: updatedRoom.videos_ready
          })
        }

        socket.leave(inviteCode)
      } catch (error) {
        console.error('Error en leave_room:', error)
        socket.emit('error', { message: 'Error al abandonar la sala' })
      }
    })
  })
}

export default setupRoomSocket
