import mongoose from 'mongoose'
import User from './src/models/User.js'
import AnimeOpening from './src/models/AnimeOpening.js'
import Tournament from './src/models/Tournament.js'
import TournamentParticipant from './src/models/TournamentParticipant.js'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:rootpassword@localhost:27017/anime_tournament?authSource=admin'

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✓ Connected to MongoDB')

    // Limpiar datos existentes
    await User.deleteMany({})
    await AnimeOpening.deleteMany({})
    await Tournament.deleteMany({})
    await TournamentParticipant.deleteMany({})
    console.log('✓ Cleaned existing data')

    // Crear usuario de prueba
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: '$2b$10$hash123456789'
    })
    console.log('✓ User created:', user._id)

    // Crear algunos openings de prueba
    const openings = await AnimeOpening.insertMany([
      {
        title: 'Unravel',
        anime_title: 'Tokyo Ghoul',
        anime_slug: 'tokyo-ghoul',
        artist: 'TK from Ling tosite Sigure',
        type: 'OP',
        sequence: 1,
        source: 'animethemes'
      },
      {
        title: 'A Cruel Angel\'s Thesis',
        anime_title: 'Neon Genesis Evangelion',
        anime_slug: 'neon-genesis-evangelion',
        artist: 'Yoko Takahashi',
        type: 'OP',
        sequence: 1,
        source: 'animethemes'
      },
      {
        title: 'Guren no Yumiya',
        anime_title: 'Attack on Titan',
        anime_slug: 'attack-on-titan',
        artist: 'Linked Horizon',
        type: 'OP',
        sequence: 1,
        source: 'animethemes'
      },
      {
        title: 'Papermoon',
        anime_title: 'Soul Eater',
        anime_slug: 'soul-eater',
        artist: 'Tommy heavenly6',
        type: 'OP',
        sequence: 1,
        source: 'animethemes'
      }
    ])
    console.log('✓ Openings created:', openings.length)

    // Crear un torneo
    const tournament = await Tournament.create({
      name: 'Torneo de Primavera 2026',
      description: 'Competición de openings de anime - Primavera 2026',
      created_by: user._id,
      status: 'planning'
    })
    console.log('✓ Tournament created:', tournament._id)

    // Agregar participantes
    const participants = await TournamentParticipant.insertMany(
      openings.map((opening, index) => ({
        tournament_id: tournament._id,
        opening_id: opening._id,
        seed: index + 1
      }))
    )
    console.log('✓ Participants added:', participants.length)

    console.log('\n✅ Database seeding completed successfully!')
    console.log(`\nTest data:`)
    console.log(`- User ID: ${user._id}`)
    console.log(`- Tournament ID: ${tournament._id}`)
    console.log(`- Openings: ${openings.length}`)

    process.exit(0)
  } catch (error) {
    console.error('✗ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
