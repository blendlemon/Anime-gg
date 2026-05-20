import jwt from 'jsonwebtoken'

// Middleware para verificar JWT
export const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]

    if (!token) {
      console.log('⚠️  No hay token en Authorization header')
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      })
    }

    console.log(`🔐 Verificando token: ${token.substring(0, 20)}...`)

    // Usar el mismo secret en todas partes
    const secret = process.env.JWT_SECRET || 'secret'
    const decoded = jwt.verify(token, secret)
    req.user = { id: decoded.id }
    console.log(`✓ Token válido para usuario: ${decoded.id}`)
    next()
  } catch (error) {
    console.error('❌ Error de autenticación:', error.message)
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    })
  }
}
