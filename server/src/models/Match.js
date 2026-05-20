import mongoose from 'mongoose'

const matchSchema = new mongoose.Schema({
  tournament_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
    index: true
  },
  round: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  match_number: {
    type: Number,
    required: true
  },
  participant1_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TournamentParticipant'
  },
  participant2_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TournamentParticipant'
  },
  winner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TournamentParticipant'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  }
}, { timestamps: true })

// Índice para búsquedas rápidas
matchSchema.index({ tournament_id: 1, round: 1 })

export default mongoose.model('Match', matchSchema)
