import Room from '../models/Room.js'
import Match from '../models/Match.js'
import Vote from '../models/Vote.js'
import TournamentParticipant from '../models/TournamentParticipant.js'

/**
 * Configura los eventos de Socket.IO para las salas de votación
 */
export function setupRoomSocket(io) {
  io.on('connection', (socket) => {
    console.log(`✓ Usuario conectado: ${socket.id}`)

    /**
     * join_room: Un usuario se une a una sala por código de invitación
     */
    socket.on('join_room', async (data) => {
      try {
        const { invite_code, user_id } = data

        if (!invite_code || !user_id) {
          socket.emit('error', { message: 'Código e ID requeridos' })
          return
        }

        const room = await Room.findOne({ invite_code: invite_code.toUpperCase() })
          .populate('tournament_id')
          .populate('current_match_id')
          .populate('connected_users')

        if (!room) {
          socket.emit('error', { message: 'Sala no encontrada' })
          return
        }

        if (!room.connected_users.some(u => u._id.toString() === user_id)) {
          room.connected_users.push(user_id)
          await room.save()
        }

        socket.join(invite_code)
        console.log(`✓ Usuario ${user_id} en sala ${invite_code}`)

        io.to(invite_code).emit('user_joined', {
          room_id: room._id,
          users_count: room.connected_users.length,
          status: room.status
        })
      } catch (error) {
        console.error('Error en join_room:', error)
        socket.emit('error', { message: 'Error al unirse' })
      }
    })

    /**
     * start_vote: El host inicia la votación
     */
    socket.on('start_vote', async (data) => {
      try {
        const { invite_code, match_id } = data

        const room = await Room.findOneAndUpdate(
          { invite_code: invite_code.toUpperCase() },
          { status: 'voting', current_match_id: match_id },
          { new: true }
        ).populate('current_match_id')

        if (!room) {
          socket.emit('error', { message: 'Sala no encontrada' })
          return
        }

        const match = await Match.findById(match_id)
          .populate('participant1_id')
          .populate('participant2_id')

        console.log(`✓ Votación iniciada: ${invite_code}`)

        io.to(invite_code).emit('voting_started', {
          match: match,
          status: 'voting'
        })
      } catch (error) {
        console.error('Error en start_vote:', error)
        socket.emit('error', { message: 'Error al iniciar votación' })
      }
    })

    /**
     * submit_vote: Un usuario vota
     */
    socket.on('submit_vote', async (data) => {
      try {
        const { invite_code, match_id, participant_id, user_id } = data

        await Vote.findOneAndUpdate(
          { match_id, user_id },
          { participant_id },
          { upsert: true, new: true }
        )

        const allVotes = await Vote.find({ match_id })

        io.to(invite_code).emit('vote_update', {
          votes_count: allVotes.length,
          votes: allVotes
        })
      } catch (error) {
        console.error('Error en submit_vote:', error)
        socket.emit('error', { message: 'Error al votar' })
      }
    })

    /**
     * next_match: Avanza al siguiente match
     */
    socket.on('next_match', async (data) => {
      try {
        const { invite_code, tournament_id } = data

        const room = await Room.findOne({ invite_code: invite_code.toUpperCase() })
        const currentMatch = await Match.findById(room.current_match_id)

        if (!currentMatch) {
          socket.emit('error', { message: 'Match no encontrado' })
          return
        }

        // Determinar ganador por votos
        const votes = await Vote.aggregate([
          { $match: { match_id: currentMatch._id } },
          { $group: { _id: '$participant_id', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 }
        ])

        if (votes.length > 0) {
          currentMatch.winner_id = votes[0]._id
          currentMatch.status = 'completed'
          await currentMatch.save()
        }

        // Buscar siguiente match
        const nextMatch = await Match.findOne({
          tournament_id,
          round: currentMatch.round + 1,
          status: 'pending'
        })

        if (nextMatch) {
          room.current_match_id = nextMatch._id
          room.status = 'waiting'
          await room.save()

          await Vote.deleteMany({ match_id: currentMatch._id })

          io.to(invite_code).emit('match_updated', {
            next_match: nextMatch,
            status: 'waiting'
          })
        } else {
          // Torneo terminado
          room.status = 'results'
          await room.save()

          io.to(invite_code).emit('tournament_end', {
            message: '¡Torneo finalizado!',
            tournament_id
          })
        }
      } catch (error) {
        console.error('Error en next_match:', error)
        socket.emit('error', { message: 'Error al avanzar' })
      }
    })

    /**
     * tournament_end: Emite el ranking final
     */
    socket.on('tournament_end', async (data) => {
      try {
        const { invite_code, tournament_id } = data

        const finalMatch = await Match.findOne({
          tournament_id,
          status: 'completed',
          round: { $gt: 0 }
        }).sort({ round: -1 }).populate('winner_id')

        if (!finalMatch || !finalMatch.winner_id) {
          io.to(invite_code).emit('error', { message: 'Ganador no determinado' })
          return
        }

        const winnerParticipant = await TournamentParticipant.findById(
          finalMatch.winner_id
        ).populate('opening_id')

        io.to(invite_code).emit('final_results', {
          winner: winnerParticipant,
          tournament_id,
          message: '¡Torneo completado!'
        })
      } catch (error) {
        console.error('Error en tournament_end:', error)
        socket.emit('error', { message: 'Error al finalizar' })
      }
    })

    /**
     * Desconexión
     */
    socket.on('disconnect', async () => {
      console.log(`✓ Usuario desconectado: ${socket.id}`)
    })
  })
}

export default setupRoomSocket
