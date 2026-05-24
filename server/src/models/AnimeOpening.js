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
  anime_id: {
    type: Number,
    index: true
  },
  theme_id: {
    type: Number
  },
  video_id: {
    type: Number
  },
  year: Number,
  season: String,
  artist: String,
  thumbnail_url: String,
  video_url: String,
  video_resolution: Number,
  media_format: String,
  synopsis: String,
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
    enum: ['animethemes', 'user', 'sync'],
    default: 'animethemes'
  }
}, { timestamps: true })

animeOpeningSchema.index({ anime_slug: 1, sequence: 1, type: 1 }, { unique: true })

export default mongoose.model('AnimeOpening', animeOpeningSchema)
