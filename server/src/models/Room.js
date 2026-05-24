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
    enum: ['waiting', 'voting', 'results', 'closed', 'cancelled'],
    default: 'waiting'
  },
  // Usuario que hosts la sala (puede cerrarla/iniciar torneo)
  host_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  connected_users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  videos_ready: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

export default mongoose.model('Room', roomSchema)
