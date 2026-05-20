import mongoose from 'mongoose'

const voteSchema = new mongoose.Schema({
  match_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
    index: true
  },
  participant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TournamentParticipant',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }
}, { timestamps: true })

export default mongoose.model('Vote', voteSchema)
