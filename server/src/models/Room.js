import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
  tournament_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
    index: true
  },
  invite_code: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
    uppercase: true
  },
  current_match_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    default: null
  },
  status: {
    type: String,
    enum: ['waiting', 'voting', 'results'],
    default: 'waiting'
  },
  connected_users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
}, { timestamps: true })

export default mongoose.model('Room', roomSchema)
