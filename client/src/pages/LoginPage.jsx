import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../utils/api'

// Página de Login/Registro
export const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [tab, setTab] = useState('login') // 'login' o 'register'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // State para formulario de login
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  // State para formulario de registro
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Manejar login
  const handleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      if (!loginForm.email || !loginForm.password) {
        throw new Error('Por favor completa todos los campos')
      }

      const response = await authAPI.login(loginForm.email, loginForm.password)

      if (response.success) {
        login(response.token, response.user)
        navigate('/home')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Manejar registro
  const handleRegister = async () => {
    setError('')
    setLoading(true)

    try {
      if (!registerForm.username || !registerForm.email || !registerForm.password) {
        throw new Error('Por favor completa todos los campos')
      }

      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }

      const response = await authAPI.register(
        registerForm.username,
        registerForm.email,
        registerForm.password
      )

      if (response.success) {
        login(response.token, response.user)
        navigate('/home')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo y Título */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto text-white font-bold text-3xl">
            A
          </div>
          <h1 className="text-4xl font-bold text-zinc-100">AnimeOpening.gg</h1>
          <p className="text-zinc-400">Torneo de openings de anime</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-zinc-900 p-1 rounded-lg">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
              tab === 'login'
                ? 'bg-violet-600 text-white'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
              tab === 'register'
                ? 'bg-violet-600 text-white'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            Registro
          </button>
        </div>

        {/* Formulario */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 space-y-6">
          {/* Mensajes de error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-700 text-white font-semibold rounded-lg transition"
              >
                {loading ? 'Cargando...' : 'Iniciar sesión'}
              </button>
            </div>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  value={registerForm.username}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, username: e.target.value })
                  }
                  placeholder="tunombre"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      confirmPassword: e.target.value
                    })
                  }
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                />
              </div>

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-700 text-white font-semibold rounded-lg transition"
              >
                {loading ? 'Cargando...' : 'Registrarse'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
