import express from 'express'
import { getRoomByInviteCode, joinRoom } from '../controllers/roomController.js'

const router = express.Router()

// Obtener sala por invite_code
router.get('/:inviteCode', getRoomByInviteCode)

// Unirse a una sala
router.post('/:inviteCode/join', joinRoom)

export default router
