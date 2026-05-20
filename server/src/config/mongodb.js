import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:rootpassword@localhost:27017/anime_tournament?authSource=admin'

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✓ MongoDB connected successfully')
    return mongoose.connection
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message)
    process.exit(1)
  }
}

export default mongoose
