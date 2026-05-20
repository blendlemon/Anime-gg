import mongoose from 'mongoose'

const animeOpeningSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  anime_title: {
    type: String,
    required: true
  },
  anime_slug: {
    type: String,
    index: true
  },
  year: Number,
  season: String,
  artist: String,
  thumbnail_url: String,
  youtube_url: String,
  video_url: String,
  video_resolution: Number,
  type: {
    type: String,
    enum: ['OP', 'ED'],
    default: 'OP'
  },
  sequence: {
    type: Number,
    default: 1
  },
  source: {
    type: String,
    enum: ['animethemes', 'user'],
    default: 'animethemes'
  }
}, { timestamps: true })

export default mongoose.model('AnimeOpening', animeOpeningSchema)
