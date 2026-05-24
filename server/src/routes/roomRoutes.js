import express from 'express'
import { getOpenRooms, getRoomByInviteCode, joinRoom } from '../controllers/roomController.js'

const router = express.Router()

// Obtener salas abiertas (debe ir antes de /:inviteCode)
router.get('/open/list', getOpenRooms)

// Obtener sala por invite_code
router.get('/:inviteCode', getRoomByInviteCode)

// Unirse a una sala
router.post('/:inviteCode/join', joinRoom)

export default router
