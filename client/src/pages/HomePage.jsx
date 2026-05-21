import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { OpeningCard } from '../components/OpeningCard'
import { animeAPI } from '../utils/api'

// Página principal con búsqueda de openings
export const HomePage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [openings, setOpenings] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Buscar openings
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setHasSearched(true)
    try {
      const response = await animeAPI.search(searchQuery)
      setOpenings(response.data || [])
    } catch (err) {
      console.error('Error en búsqueda:', err)
      setOpenings([])
    } finally {
      setLoading(false)
    }
  }

  // Buscar al presionar Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="w-full min-h-screen bg-zinc-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="mb-16 space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-zinc-100">
              Bienvenido a
              <span className="text-violet-500 block">AnimeOpening.gg</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl">
              Crea torneos épicos de openings de anime y elige tu favorito en tiempo real
            </p>
          </div>

          {/* Botón crear torneo */}
          <button
            onClick={() => navigate('/create')}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition"
          >
            <span>✨</span>
            <span>Crear Torneo</span>
          </button>
        </section>

        {/* Sección de búsqueda */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-6">
              Explorar Openings
            </h2>

            {/* Barra de búsqueda */}
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Busca anime (ej: Demon Slayer, Attack on Titan)..."
                  className="w-full px-4 py-3 pl-12 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  🔍
                </span>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-700 text-white font-semibold rounded-xl transition"
              >
                {loading ? '...' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Grid de openings */}
          {hasSearched && (
            <div>
              <p className="text-zinc-400 mb-6">
                {loading ? 'Buscando...' : `${openings.length} resultados encontrados`}
              </p>

              {openings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {openings.map((opening) => (
                    <OpeningCard 
                      key={`${opening._id}-${opening.anime_slug || 'default'}-${opening.sequence || Math.random()}`} 
                      opening={opening} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-zinc-400">No se encontraron openings</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
