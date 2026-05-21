import mongoose from 'mongoose'

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    required: true,
    enum: [16, 32]
  },
  filterType: {
    type: String,
    enum: ['OP', 'ED', 'both'],
    default: 'OP'
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled'],
    default: 'planning'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [
    {
      opening_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnimeOpening'
      },
      title: String,
      anime_title: String,
      artist: String,
      video_url: String,
      cached_video_url: String,
      thumbnail_url: String,
      wins: {
        type: Number,
        default: 0
      }
    }
  ],
  matches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    }
  ],
  start_date: Date,
  end_date: Date
}, { timestamps: true })

export default mongoose.model('Tournament', tournamentSchema)
