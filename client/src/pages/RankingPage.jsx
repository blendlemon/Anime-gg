import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { tournamentAPI } from '../utils/api'

// Página de ranking del torneo
export const RankingPage = () => {
  const { id } = useParams()
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await tournamentAPI.getRanking(id)
        setRanking(response.ranking || [])
      } catch (err) {
        setError('Error al cargar el ranking')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchRanking()
    }
  }, [id])

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[600px]">
          <p className="text-zinc-400">Cargando ranking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-zinc-950">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-zinc-100">Ranking Final</h1>
            <p className="text-zinc-400 mt-2">Openings ordenados por votaciones</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
              {error}
            </div>
          )}

          {/* Tabla de ranking */}
          {ranking.length > 0 ? (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              {ranking.map((item, index) => (
                <div
                  key={item._id}
                  className="flex items-center space-x-4 p-4 border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/50 transition"
                >
                  {/* Posición */}
                  <div className="w-12 h-12 flex items-center justify-center bg-violet-600/20 rounded-lg">
                    <span className="text-lg font-bold text-violet-400">
                      {index + 1}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <img
                    src={item.thumbnail_url || '/placeholder.png'}
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-zinc-100 font-semibold">{item.title}</h3>
                    <p className="text-zinc-400 text-sm">{item.anime_title}</p>
                    {item.artist && (
                      <p className="text-violet-400 text-xs">{item.artist}</p>
                    )}
                  </div>

                  {/* Votos */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-violet-400">
                      {item.wins}
                    </p>
                    <p className="text-zinc-400 text-xs">victorias</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-zinc-400">No hay datos de ranking disponibles</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
