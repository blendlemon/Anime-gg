import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { tournamentAPI } from '../utils/api'

// Página para crear nuevo torneo
export const CreateTournamentPage = () => {
  const navigate = useNavigate()
  const appUrl = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [inviteCode, setInviteCode] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    size: 16,
    filterType: 'OP'
  })

  const [tournamentId, setTournamentId] = useState('')

  // Crear torneo
  const handleCreate = async () => {
    setError('')
    setLoading(true)

    try {
      if (!form.name.trim()) {
        throw new Error('El nombre del torneo es requerido')
      }

      const response = await tournamentAPI.create(
        form.name,
        form.description,
        form.size,
        form.filterType
      )

      if (response.success) {
        navigate(`/room/${response.tournament.invite_code}`, {
          state: { isHost: true, tournamentId: response.tournament._id }
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Copiar invite code
  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
    alert('¡Código copiado al portapapeles!')
  }

  // Copiar enlace de sala
  const copyRoomLink = () => {
    const roomLink = `${appUrl}/room/${inviteCode}`
    navigator.clipboard.writeText(roomLink)
    alert('¡Enlace de sala copiado al portapapeles!')
  }

  if (success) {
    return (
      <div className="w-full min-h-screen bg-zinc-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[600px]">
          <div className="text-center space-y-8 max-w-md">
            <div className="text-6xl">🎉</div>
            <h1 className="text-4xl font-bold text-zinc-100">¡Torneo Creado!</h1>
            <p className="text-zinc-400">
              Comparte este código con tus amigos para que se unan
            </p>

            {/* Invite Code Display */}
            <div className="bg-zinc-900 border-2 border-violet-600 rounded-2xl p-8 space-y-4">
              <p className="text-sm text-zinc-400 uppercase tracking-wider">
                Código de invitación
              </p>
              <p className="text-5xl font-bold text-violet-400 font-mono tracking-widest">
                {inviteCode}
              </p>
              <button
                onClick={copyInviteCode}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition"
              >
                📋 Copiar código
              </button>
              
              {/* Nuevos botones para navegar */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800">
                <button
                  onClick={() => navigate(`/tournament/${tournamentId}`)}
                  className="py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold rounded-lg transition"
                >
                  👁️ Ver torneo
                </button>
                <button
                  onClick={copyRoomLink}
                  className="py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold rounded-lg transition"
                >
                  🔗 Copiar enlace de sala
                </button>
              </div>
            </div>

            <p className="text-zinc-500 text-sm">Redirigiendo en 3 segundos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-zinc-950">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-zinc-100">Crear Torneo</h1>
            <p className="text-zinc-400 mt-2">
              Configura tu torneo de openings y comienza a votar
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
                {error}
              </div>
            )}

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Nombre del Torneo
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Mi increíble torneo de openings"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Descripción (Opcional)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe tu torneo..."
                rows="3"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition resize-none"
              />
            </div>

            {/* Tamaño */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Cantidad de Participantes
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[16, 32].map((size) => (
                  <button
                    key={size}
                    onClick={() => setForm({ ...form, size })}
                    className={`py-3 px-4 rounded-lg font-semibold transition ${
                      form.size === size
                        ? 'bg-violet-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {size} Openings
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo de Opening */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Tipo de Opening
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'OP', label: 'Openings' },
                  { value: 'ED', label: 'Endings' },
                  { value: 'both', label: 'Ambos' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setForm({ ...form, filterType: type.value })}
                    className={`py-3 px-4 rounded-lg font-semibold transition text-sm ${
                      form.filterType === type.value
                        ? 'bg-violet-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Botón crear */}
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-4 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-700 text-white font-semibold rounded-lg transition text-lg"
            >
              {loading ? 'Creando torneo...' : '✨ Crear Torneo'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
