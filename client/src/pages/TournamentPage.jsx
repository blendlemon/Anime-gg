import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { MatchCard } from '../components/MatchCard'
import { tournamentAPI } from '../utils/api'

// Página del torneo mostrando el bracket
export const TournamentPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await tournamentAPI.getById(id)

        if (response.success) {
          setTournament(response.tournament)
          
          const matchesData = response.matches || response.tournament.matches || []
          
          setMatches(matchesData)
        } else {
          setError(response.error || 'Error al cargar el torneo')
        }
      } catch (err) {
        console.error('Error fetching tournament:', err)
        setError(err.message || 'Error al cargar el torneo')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTournament()
    }
  }, [id])

  // Manejar navegación a la sala de votación
  const handleJoinRoom = () => {
    if (tournament?.invite_code) {
      navigate(`/room/${tournament.invite_code}`)
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center space-y-4">
            <div className="text-4xl">🎮</div>
            <p className="text-zinc-400">Cargando torneo...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center space-y-4 bg-red-500/10 border border-red-500/50 rounded-lg p-8 max-w-md">
            <div className="text-4xl">❌</div>
            <p className="text-red-400 font-semibold">{error}</p>
            <p className="text-zinc-400 text-sm">Intenta recargar la página o verifica el ID del torneo</p>
          </div>
        </div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="w-full min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[600px]">
          <p className="text-zinc-400">Torneo no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-zinc-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl font-bold text-zinc-100">{tournament.name}</h1>
          {tournament.description && (
            <p className="text-zinc-400">{tournament.description}</p>
          )}
          <div className="flex items-center space-x-4 text-sm">
            <span className="bg-violet-600/20 text-violet-300 px-3 py-1 rounded-full">
              {tournament.status}
            </span>
            <span className="text-zinc-400">
              {tournament.size} Participantes
            </span>
            <span className="text-zinc-400">
              Código: <span className="font-mono text-violet-400">{tournament.invite_code}</span>
            </span>
          </div>
        </div>

        {/* Bracket Ronda 1 */}
        <section>
          <h2 className="text-2xl font-bold text-zinc-100 mb-8">
            Ronda 1 - {matches?.length || 0} Matches
          </h2>

          {matches && matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
              <p className="text-zinc-400">No hay matches disponibles</p>
            </div>
          )}
        </section>

        {/* Botón unirse a sala */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleJoinRoom}
            className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition"
          >
            🎤 Entrar a Sala de Votación
          </button>
        </div>
      </main>
    </div>
  )
}
