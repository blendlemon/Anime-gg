import mongoose from 'mongoose'

const tournamentParticipantSchema = new mongoose.Schema({
  tournament_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
    index: true
  },
  opening_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnimeOpening',
    required: true,
    index: true
  },
  seed: {
    type: Number,
    index: true
  }
}, { timestamps: true })

// Crear índice único compuesto
tournamentParticipantSchema.index({ tournament_id: 1, opening_id: 1 }, { unique: true })

export default mongoose.model('TournamentParticipant', tournamentParticipantSchema)
