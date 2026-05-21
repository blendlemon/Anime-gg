import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { rateLimit } from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { connectDB } from './config/mongodb.js'
import tournamentsRouter from './routes/tournamentRoutes.js'
import animeRoutes from './routes/animeRoutes.js'
import authRoutes from './routes/authRoutes.js'
import roomRoutes from './routes/roomRoutes.js'
import setupRoomSocket from './sockets/roomSocket.js'
import { proxyVideo, cleanupOrphanedTournaments } from './controllers/animeController.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
const io = new Server(httpServer, {
  cors: {
    origin: clientUrl,
    methods: ['GET', 'POST']
  }
})
const PORT = process.env.PORT || 5001
const cleanupRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiadas solicitudes, intenta de nuevo en 1 minuto'
  }
})
const proxyRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false
})

// Middleware
app.use(cors({ origin: clientUrl }))
app.use(express.json())

// Conectar a MongoDB
await connectDB()

// Configurar Socket.IO
setupRoomSocket(io)

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    database: 'MongoDB',
    sockets: 'Socket.IO enabled',
    timestamp: new Date().toISOString()
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/tournaments', tournamentsRouter)
app.use('/api/anime', animeRoutes)
app.use('/api/rooms', roomRoutes)
app.get('/api/proxy/video', proxyRateLimit, proxyVideo)
app.get('/api/admin/cleanup', cleanupRateLimit, cleanupOrphanedTournaments)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.originalUrl
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err)
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

httpServer.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`)
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`✓ API Health: http://localhost:${PORT}/api/health`)
  console.log(`✓ Socket.IO: ws://localhost:${PORT}`)
})
