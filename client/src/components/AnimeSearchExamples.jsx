/**
 * Ejemplo de uso completo de los hooks y servicios AnimeThemes
 * Este archivo muestra cómo usar la integración en componentes React
 */

// ============================================
// EJEMPLO 1: Búsqueda Simple de Animes
// ============================================

import { useAnimeSearch } from '@/hooks/useAnimeSearch'

export function SearchExample() {
  const {
    results,
    loading,
    error,
    query,
    handleSearchChange,
    executeSearch,
    clearResults,
  } = useAnimeSearch()

  return (
    <div className="search-container">
      <h2>Buscar Anime</h2>
      
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearchChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && executeSearch()}
        placeholder="Escribe el nombre del anime..."
        className="search-input"
      />
      
      <button onClick={executeSearch} disabled={loading}>
        {loading ? 'Buscando...' : 'Buscar'}
      </button>
      
      <button onClick={clearResults}>Limpiar</button>

      {error && (
        <div className="error-message">
          <p>❌ Error: {error}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="results">
          <h3>Resultados ({results.length})</h3>
          {results.map((anime) => (
            <div key={anime.slug} className="anime-card">
              <h4>{anime.name}</h4>
              <p>Año: {anime.year} | Temporada: {anime.season}</p>
              <p>📺 {anime.openings.length} openings disponibles</p>
              <p>🎬 {anime.endingss.length} endings disponibles</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// EJEMPLO 2: Detalle de Anime con Openings
// ============================================

import { useAnimeDetail } from '@/hooks/useAnimeSearch'
import { useEffect } from 'react'

export function AnimeDetailExample({ animeSlug }) {
  const { anime, loading, error, loadAnime } = useAnimeDetail()

  useEffect(() => {
    if (animeSlug) {
      loadAnime(animeSlug)
    }
  }, [animeSlug, loadAnime])

  if (loading) {
    return <div className="loading">⏳ Cargando anime...</div>
  }

  if (error) {
    return <div className="error">❌ {error}</div>
  }

  if (!anime) {
    return <div className="empty">Sin datos</div>
  }

  return (
    <div className="anime-detail">
      <h1>{anime.name}</h1>
      <p>Año: {anime.year} | Temporada: {anime.season}</p>

      <section className="openings">
        <h2>Openings ({anime.openings.length})</h2>
        {anime.openings.length > 0 ? (
          <div className="themes-grid">
            {anime.openings.map((opening) => (
              <div key={opening.id} className="theme-card">
                <h3>OP {opening.sequence}</h3>
                <p className="title">{opening.title}</p>
                <p className="artist">Artista: {opening.artist}</p>
                
                {opening.videoUrl ? (
                  <video
                    src={opening.videoUrl}
                    controls
                    width="100%"
                    style={{ marginTop: '10px' }}
                  />
                ) : (
                  <p className="no-video">❌ Sin vídeo disponible</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Sin openings disponibles</p>
        )}
      </section>

      {anime.endingss.length > 0 && (
        <section className="endings">
          <h2>Endings ({anime.endingss.length})</h2>
          <div className="themes-grid">
            {anime.endingss.map((ending) => (
              <div key={ending.id} className="theme-card">
                <h3>ED {ending.sequence}</h3>
                <p className="title">{ending.title}</p>
                <p className="artist">Artista: {ending.artist}</p>
                
                {ending.videoUrl && (
                  <video
                    src={ending.videoUrl}
                    controls
                    width="100%"
                    style={{ marginTop: '10px' }}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ============================================
// EJEMPLO 3: Openings Populares
// ============================================

import { usePopularOpenings } from '@/hooks/useAnimeSearch'

export function PopularOpeningsExample() {
  const { openings, loading, error, loadPopularOpenings, refetch } = 
    usePopularOpenings()

  useEffect(() => {
    loadPopularOpenings()
  }, [loadPopularOpenings])

  if (loading) {
    return <div className="loading">⏳ Cargando openings populares...</div>
  }

  if (error) {
    return <div className="error">❌ {error}</div>
  }

  return (
    <div className="popular-openings">
      <div className="header">
        <h2>Openings Populares</h2>
        <button onClick={refetch} className="btn-refresh">
          🔄 Recargar
        </button>
      </div>

      <div className="openings-grid">
        {openings.map((opening) => (
          <div key={opening.id} className="opening-card">
            <p className="anime-name">📺 {opening.animeName}</p>
            <p className="opening-title">♪ {opening.title}</p>
            <p className="artist">🎤 {opening.artist}</p>
            
            {opening.videoUrl && (
              <video
                src={opening.videoUrl}
                controls
                style={{ marginTop: '8px', width: '100%' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// EJEMPLO 4: Búsqueda con Debounce
// ============================================

import { useState, useEffect } from 'react'

export function SearchWithDebounceExample() {
  const { results, loading, error, query, handleSearchChange, search } = 
    useAnimeSearch()
  const [debounceTimer, setDebounceTimer] = useState(null)

  const handleInputChange = (e) => {
    const newQuery = e.target.value
    handleSearchChange(newQuery)

    // Limpiar timer anterior
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Nuevo timer (espera 500ms después de escribir)
    if (newQuery.trim().length > 0) {
      const timer = setTimeout(() => {
        search(newQuery)
      }, 500)
      setDebounceTimer(timer)
    }
  }

  return (
    <div className="search-debounce">
      <h2>Buscar Anime (con debounce)</h2>
      
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Escribe para buscar automáticamente..."
        className="search-input"
      />

      {loading && <p className="searching">🔍 Buscando "{query}"...</p>}
      
      {error && <p className="error">❌ {error}</p>}

      {results.length > 0 && (
        <div className="results-list">
          <h3>Encontrados {results.length} anime(s)</h3>
          {results.map((anime) => (
            <div key={anime.slug} className="result-item">
              <h4>{anime.name}</h4>
              <p>{anime.openings.length} openings • {anime.endingss.length} endings</p>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && query && !loading && (
        <p className="no-results">No se encontraron resultados para "{query}"</p>
      )}
    </div>
  )
}

// ============================================
// EJEMPLO 5: Componente Combinado (Dashboard)
// ============================================

import { useState } from 'react'

export function AnimeSearchDashboard() {
  const search = useAnimeSearch()
  const detail = useAnimeDetail()
  const popular = usePopularOpenings()
  const [selectedAnime, setSelectedAnime] = useState(null)

  useEffect(() => {
    popular.loadPopularOpenings()
  }, [])

  const handleSelectAnime = (anime) => {
    setSelectedAnime(anime)
    detail.loadAnime(anime.slug)
  }

  return (
    <div className="dashboard">
      <div className="search-section">
        <h2>Buscar Anime</h2>
        <input
          value={search.query}
          onChange={(e) => search.handleSearchChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && search.executeSearch()}
          placeholder="Busca un anime..."
        />
        <button onClick={search.executeSearch} disabled={search.loading}>
          {search.loading ? 'Buscando...' : 'Buscar'}
        </button>

        {search.error && <p className="error">{search.error}</p>}

        <div className="search-results">
          {search.results.map((anime) => (
            <div
              key={anime.slug}
              className={`result-item ${selectedAnime?.slug === anime.slug ? 'selected' : ''}`}
              onClick={() => handleSelectAnime(anime)}
            >
              {anime.name}
            </div>
          ))}
        </div>
      </div>

      {selectedAnime && detail.anime && (
        <div className="detail-section">
          <h2>{detail.anime.name}</h2>
          <h3>Openings</h3>
          <div className="openings-list">
            {detail.anime.openings.map((op) => (
              <div key={op.id} className="opening-item">
                <p>{op.title}</p>
                {op.videoUrl && (
                  <video src={op.videoUrl} controls width="100%" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="popular-section">
        <h2>Populares</h2>
        {popular.loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="popular-grid">
            {popular.openings.slice(0, 6).map((op) => (
              <div key={op.id} className="popular-item">
                <p className="anime">{op.animeName}</p>
                <p className="title">{op.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
