import Room from '../models/Room.js'
import Match from '../models/Match.js'
import Vote from '../models/Vote.js'
import Tournament from '../models/Tournament.js'
import TournamentParticipant from '../models/TournamentParticipant.js'
import mongoose from 'mongoose'

/**
 * Configura los eventos de Socket.IO para las salas de votación con sistema de host
 */
export function setupRoomSocket(io) {
  io.on('connection', (socket) => {
    console.log(`✓ Usuario conectado: ${socket.id}`)

    /**
     * join_room: Un usuario se une a una sala por código de invitación
     * Recibe: { inviteCode, userId, username }
     */
    socket.on('join_room', async (data) => {
      try {
        const { inviteCode, userId, username } = data

        if (!inviteCode || !userId) {
          socket.emit('error', { message: 'Código e ID requeridos' })
          return
        }

        // Guardar mapping socket -> userId para manejar disconnects
        socket.data = socket.data || {}
        socket.data.userId = userId

        // Buscar la sala por invite_code
        let room = await Room.findOne({ invite_code: inviteCode.toUpperCase() })
          .populate('tournament_id')
          .populate('current_match_id')
          .populate('connected_users')

        if (!room) {
          socket.emit('error', { message: 'Sala no encontrada' })
          return
        }

        // Si es el primer usuario, lo marca como host
        if (room.connected_users.length === 0) {
          room.host_user_id = userId
        }

        // Añadir el usuario a la lista de conectados si no está ya
        if (!room.connected_users.some(u => u._id.toString() === userId)) {
          room.connected_users.push(userId)
          await room.save()
        }

        // Unir el socket al canal de la sala
        socket.join(inviteCode)
        console.log(`✓ Usuario ${userId} en sala ${inviteCode}`)

        // Emitir lista actualizada de usuarios a toda la sala
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
          current_match_id: updatedRoom.current_match_id
        })
      } catch (error) {
        console.error('Error en join_room:', error)
        socket.emit('error', { message: 'Error al unirse a la sala' })
      }
    })

    /**
     * start_tournament: El host inicia el torneo
     * Solo el host puede llamar esto
     * Recibe: { inviteCode, userId }
     */
    socket.on('start_tournament', async (data) => {
      try {
        const { inviteCode, userId } = data

        // Buscar la sala
        let room = await Room.findOne({ invite_code: inviteCode.toUpperCase() })
          .populate('tournament_id')

        if (!room) {
          socket.emit('error', { message: 'Sala no encontrada' })
          return
        }

        // Verificar que el usuario es el host
        if (room.host_user_id.toString() !== userId) {
          socket.emit('error', { message: 'Solo el host puede iniciar el torneo' })
          return
        }

        // Cambiar estado del torneo a 'active'
        const tournament = await Tournament.findByIdAndUpdate(
          room.tournament_id._id,
          { status: 'active' },
          { new: true }
        )

        // Cambiar estado de la sala a 'voting'
        room.status = 'voting'
        await room.save()

        // Obtener el primer match del torneo
        const firstMatch = await Match.findOne({
          tournament_id: tournament._id,
          round: 1,
          match_number: 1
        })

        if (firstMatch) {
          // Mapear participantes desde tournament.participants embebidos
          const tournament_populated = await Tournament.findById(tournament._id)
          const participant1 = tournament_populated.participants.find(
            p => p._id.toString() === firstMatch.participant1_id?.toString()
          )
          const participant2 = tournament_populated.participants.find(
            p => p._id.toString() === firstMatch.participant2_id?.toString()
          )

          const enrichedMatch = {
            _id: firstMatch._id,
            tournament_id: firstMatch.tournament_id,
            round: firstMatch.round,
            match_number: firstMatch.match_number,
            participant1_id: firstMatch.participant1_id,
            participant2_id: firstMatch.participant2_id,
            participant1: participant1 || null,
            participant2: participant2 || null,
            status: firstMatch.status
          }

          room.current_match_id = firstMatch._id
          await room.save()

          console.log(`✓ Torneo iniciado: ${inviteCode}`)

          // Emitir evento a toda la sala
          io.to(inviteCode).emit('tournament_started', {
            tournament: tournament,
            currentMatch: enrichedMatch,
            status: 'voting'
          })
        }
      } catch (error) {
        console.error('Error en start_tournament:', error)
        socket.emit('error', { message: 'Error al iniciar el torneo' })
      }
    })

    /**
     * submit_vote: Un usuario vota por un participante
     * Recibe: { inviteCode, matchId, participantId, userId }
     */
    socket.on('submit_vote', async (data) => {
      try {
        const { inviteCode, matchId, participantId, userId } = data

        if (!inviteCode || !matchId || !participantId || !userId) {
          socket.emit('error', { message: 'Parámetros incompletos para votar' })
          return
        }

        // Convertir a ObjectId para evitar problemas de comparación
        const matchObjId = mongoose.Types.ObjectId(matchId)
        const participantObjId = mongoose.Types.ObjectId(participantId)
        const userObjId = mongoose.Types.ObjectId(userId)

        // Upsert del voto por match+user para evitar duplicados
        await Vote.findOneAndUpdate(
          { match_id: matchObjId, user_id: userObjId },
          { participant_id: participantObjId },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        // Contar votos de cada participante en este match
        const voteStats = await Vote.aggregate([
          { $match: { match_id: matchObjId } },
          { $group: { _id: '$participant_id', count: { $sum: 1 } } }
        ])

        // Obtener IDs de los participantes del match
        const match = await Match.findById(matchObjId)

        let votes_p1 = 0
        let votes_p2 = 0

        voteStats.forEach(stat => {
          if (stat._id.toString() === match.participant1_id.toString()) {
            votes_p1 = stat.count
          }
          if (stat._id.toString() === match.participant2_id.toString()) {
            votes_p2 = stat.count
          }
        })

        console.log(`✓ Voto registrado en match ${matchId}: P1=${votes_p1}, P2=${votes_p2}`)

        // Emitir actualización a toda la sala
        io.to(inviteCode).emit('vote_update', {
          matchId: matchId,
          votes: {
            participant1: votes_p1,
            participant2: votes_p2
          },
          totalVoters: voteStats.reduce((acc, s) => acc + s.count, 0)
        })
      } catch (error) {
        console.error('Error en submit_vote:', error)
        socket.emit('error', { message: 'Error al votar' })
      }
    })

    /**
     * next_match: El host avanza al siguiente match
     * Solo el host puede llamar esto
     * Recibe: { inviteCode, userId }
     */
    socket.on('next_match', async (data) => {
      try {
        const { inviteCode, userId } = data

        // Buscar la sala
        let room = await Room.findOne({ invite_code: inviteCode.toUpperCase() })
          .populate('tournament_id')

        if (!room) {
          socket.emit('error', { message: 'Sala no encontrada' })
          return
        }

        // Verificar que el usuario es el host
        if (room.host_user_id.toString() !== userId) {
          socket.emit('error', { message: 'Solo el host puede avanzar matches' })
          return
        }

        // Obtener el match actual
        const currentMatch = await Match.findById(room.current_match_id)

        if (!currentMatch) {
          socket.emit('error', { message: 'Match actual no encontrado' })
          return
        }

        // Determinar el ganador según votos
        const voteStats = await Vote.aggregate([
          { $match: { match_id: currentMatch._id } },
          { $group: { _id: '$participant_id', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])

        if (voteStats.length > 0) {
          currentMatch.winner_id = voteStats[0]._id
          currentMatch.status = 'completed'
          await currentMatch.save()
        }

        // Helper: mapear match con participantes embebidos
        const enrichMatchWithParticipants = (match, tournament) => {
          const participant1 = tournament.participants.find(
            p => p._id.toString() === match.participant1_id?.toString()
          )
          const participant2 = tournament.participants.find(
            p => p._id.toString() === match.participant2_id?.toString()
          )
          return {
            _id: match._id,
            tournament_id: match.tournament_id,
            round: match.round,
            match_number: match.match_number,
            participant1_id: match.participant1_id,
            participant2_id: match.participant2_id,
            participant1: participant1 || null,
            participant2: participant2 || null,
            status: match.status
          }
        }

        // Buscar el siguiente match
        const nextMatch = await Match.findOne({
          tournament_id: room.tournament_id._id,
          round: currentMatch.round,
          match_number: currentMatch.match_number + 1,
          status: 'pending'
        })

        if (nextMatch) {
          // Hay más matches en esta ronda
          room.current_match_id = nextMatch._id
          await room.save()

          // Limpiar votos del match anterior
          await Vote.deleteMany({ match_id: currentMatch._id })

          console.log(`✓ Avanzado a siguiente match: ${nextMatch._id}`)

          const enrichedMatch = enrichMatchWithParticipants(nextMatch, room.tournament_id)

          io.to(inviteCode).emit('match_changed', {
            currentMatch: enrichedMatch,
            status: 'voting'
          })
        } else {
          // Buscar siguiente ronda
          const nextRoundMatch = await Match.findOne({
            tournament_id: room.tournament_id._id,
            round: currentMatch.round + 1,
            status: 'pending'
          })

          if (nextRoundMatch) {
            // Hay siguiente ronda
            room.current_match_id = nextRoundMatch._id
            await room.save()

            // Limpiar votos
            await Vote.deleteMany({ match_id: currentMatch._id })

            console.log(`✓ Pasada a siguiente ronda: ${nextRoundMatch._id}`)

            const enrichedMatch = enrichMatchWithParticipants(nextRoundMatch, room.tournament_id)

            io.to(inviteCode).emit('match_changed', {
              currentMatch: enrichedMatch,
              status: 'voting'
            })
          } else {
            // Torneo finalizado - obtener ranking
            const tournament = await Tournament.findById(room.tournament_id._id)
              .populate('participants')

            room.status = 'results'
            await room.save()

            // Limpiar votos
            await Vote.deleteMany({ match_id: currentMatch._id })

            console.log(`✓ Torneo finalizado`)

            io.to(inviteCode).emit('tournament_ended', {
              message: '¡Torneo finalizado!',
              tournament: tournament,
              status: 'results'
            })
          }
        }
      } catch (error) {
        console.error('Error en next_match:', error)
        socket.emit('error', { message: 'Error al avanzar al siguiente match' })
      }
    })

    /**
     * Desconexión: Maneja cuando un usuario se desconecta
     */
    socket.on('disconnect', async () => {
      try {
        const userId = socket.data?.userId
        console.log(`✓ Usuario desconectado: ${socket.id}`, 'userId:', userId)

        if (!userId) {
          // No tenemos mapping userId -> socket, salir
          return
        }

        // Buscar todas las salas donde estaba este usuario
        const rooms = await Room.find({ connected_users: userId }).populate('tournament_id')

        for (const room of rooms) {
          // Remover usuario de la lista
          room.connected_users = room.connected_users.filter(u => u.toString() !== userId)

          // Si era el host O si la sala se queda vacía
          if ((room.host_user_id && room.host_user_id.toString() === userId) || room.connected_users.length === 0) {
            // Obtener todos los matches del torneo para borrar sus votos
            const matches = await Match.find({ tournament_id: room.tournament_id._id })
            const matchIds = matches.map(m => m._id)

            // Borrar todos los votos del torneo
            if (matchIds.length > 0) {
              await Vote.deleteMany({ match_id: { $in: matchIds } })
            }

            // Borrar todos los matches del torneo
            await Match.deleteMany({ tournament_id: room.tournament_id._id })

            // Borrar la sala
            await Room.findByIdAndDelete(room._id)

            // Borrar el torneo completamente
            await Tournament.findByIdAndDelete(room.tournament_id._id)

            console.log('Torneo y sala eliminados:', room.invite_code)

            // Emitir evento a toda la sala antes de que se elimine
            io.to(room.invite_code).emit('room_closed', {
              message: room.host_user_id?.toString() === userId ? 'El host ha abandonado la sala' : 'Inactividad',
              reason: 'host_left'
            })
          } else {
            // No era host y hay usuarios
            await room.save()

            // Emitir lista actualizada
            const updatedRoom = await Room.findById(room._id).populate('connected_users', 'username email')

            io.to(room.invite_code).emit('room_updated', {
              connected_users: updatedRoom.connected_users,
              users_count: updatedRoom.connected_users.length,
              status: updatedRoom.status,
              host_user_id: updatedRoom.host_user_id
            })
          }
        }
      } catch (error) {
        console.error('Error en disconnect:', error)
      }
    })

    /**
     * leave_room: El usuario explícitamente abandona una sala
     * Recibe: { inviteCode, userId }
     */
    socket.on('leave_room', async (data) => {
      try {
        const { inviteCode, userId } = data

        // Buscar la sala
        let room = await Room.findOne({ invite_code: inviteCode.toUpperCase() })
          .populate('tournament_id')

        if (!room) {
          return
        }

        // Remover usuario de connected_users
        room.connected_users = room.connected_users.filter(
          u => u.toString() !== userId
        )

        // Si era el host
        if (room.host_user_id.toString() === userId) {
          // Cambiar estado de la sala a 'closed'
          room.status = 'closed'

          // Cambiar estado del torneo a 'cancelled'
          const tournament = await Tournament.findByIdAndUpdate(
            room.tournament_id._id,
            { status: 'cancelled' },
            { new: true }
          )

          await room.save()

          console.log(`✓ Host abandonó la sala: ${inviteCode}`)

          // Emitir evento a toda la sala
          io.to(inviteCode).emit('room_closed', {
            message: 'El host ha abandonado la sala',
            reason: 'host_left'
          })

          // Eliminar la sala de la BD
          await Room.findByIdAndDelete(room._id)
        } else {
          // No era host, solo remover de la lista
          await room.save()

          console.log(`✓ Usuario abandonó la sala: ${inviteCode}`)

          // Emitir lista actualizada
          const updatedRoom = await Room.findById(room._id)
            .populate('connected_users', 'username email')

          io.to(inviteCode).emit('room_updated', {
            connected_users: updatedRoom.connected_users,
            users_count: updatedRoom.connected_users.length,
            status: updatedRoom.status
          })
        }

        // Desconectar el socket del canal
        socket.leave(inviteCode)
      } catch (error) {
        console.error('Error en leave_room:', error)
        socket.emit('error', { message: 'Error al abandonar la sala' })
      }
    })
  })
}

export default setupRoomSocket
