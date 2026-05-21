import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Registro de nuevo usuario
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Validar campos requeridos
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email y password son requeridos'
      })
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'El email o username ya está registrado'
      })
    }

    // Hashear password con bcrypt (10 rounds)
    const salt = await bcryptjs.genSalt(10)
    const password_hash = await bcryptjs.hash(password, salt)

    // Crear nuevo usuario
    const newUser = new User({
      username,
      email,
      password_hash
    })

    await newUser.save()

    // Generar JWT
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || 'tu_secreto_aqui',
      { expiresIn: '24h' }
    )

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    })
  } catch (error) {
    console.error('Error en register:', error)
    return res.status(500).json({
      success: false,
      error: 'Error al registrar usuario',
      details: error.message
    })
  }
}

// Login de usuario existente
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y password son requeridos'
      })
    }

    // Buscar usuario por email
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Email o contraseña inválidos'
      })
    }

    // Comparar password con bcrypt
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Email o contraseña inválidos'
      })
    }

    // Generar JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'tu_secreto_aqui',
      { expiresIn: '24h' }
    )

    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Error en login:', error)
    return res.status(500).json({
      success: false,
      error: 'Error al hacer login',
      details: error.message
    })
  }
}
