import express from 'express'
import { register, login } from '../controllers/authController.js'

const router = express.Router()

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', register)

// POST /api/auth/login - Login de usuario existente
router.post('/login', login)

export default router
