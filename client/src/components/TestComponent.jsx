/**
 * Componente Simple para Testing
 * Copia este código a App.jsx temporalmente para probar
 */

import { useState, useEffect } from 'react'
import { useAnimeSearch, usePopularOpenings } from './hooks/useAnimeSearch'

function TestComponent() {
  const search = useAnimeSearch()
  const popular = usePopularOpenings()

  useEffect(() => {
    // Cargar populares automáticamente
    popular.loadPopularOpenings()
  }, [])

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      backgroundColor: '#1a1a1a',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <h1>🧪 Test AnimeThemes Integration</h1>
      
      <div style={{ 
        backgroundColor: '#2a2a2a', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Test 1: Búsqueda de Anime</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            type="text"
            value={search.query}
            onChange={(e) => search.handleSearchChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && search.executeSearch()}
            placeholder="Ej: naruto, attack on titan, jojo..."
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #444',
              backgroundColor: '#333',
              color: '#fff',
              fontSize: '14px'
            }}
          />
          
          <button
            onClick={search.executeSearch}
            disabled={search.loading}
            style={{
              padding: '10px 20px',
              backgroundColor: search.loading ? '#555' : '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: search.loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {search.loading ? '🔄 Buscando...' : '🔍 Buscar'}
          </button>
        </div>

        {search.error && (
          <div style={{
            backgroundColor: '#422',
            color: '#faa',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            ❌ Error: {search.error}
          </div>
        )}

        {search.results.length > 0 && (
          <div>
            <h3>✅ {search.results.length} resultado(s) encontrado(s)</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '15px'
            }}>
              {search.results.map((anime) => (
                <div
                  key={anime.slug}
                  style={{
                    backgroundColor: '#333',
                    padding: '15px',
                    borderRadius: '6px',
                    border: '1px solid #444',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#3a3a3a'
                    e.currentTarget.style.borderColor = '#7c3aed'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#333'
                    e.currentTarget.style.borderColor = '#444'
                  }}
                >
                  <h4 style={{ margin: '0 0 10px 0' }}>
                    📺 {anime.name}
                  </h4>
                  <p style={{ margin: '5px 0', fontSize: '13px', color: '#aaa' }}>
                    Año: {anime.year} | Temporada: {anime.season}
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '13px' }}>
                    ♪ {anime.openings.length} openings
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '13px' }}>
                    🎬 {anime.endingss.length} endings
                  </p>
                  
                  {anime.openings.length > 0 && (
                    <div style={{
                      marginTop: '10px',
                      padding: '10px',
                      backgroundColor: '#2a2a2a',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                        Primer Opening:
                      </p>
                      <p style={{ margin: '0 0 3px 0' }}>
                        {anime.openings[0]?.title}
                      </p>
                      <p style={{ margin: '0', color: '#888' }}>
                        Por: {anime.openings[0]?.artist}
                      </p>
                      {anime.openings[0]?.videoUrl && (
                        <p style={{ margin: '5px 0 0 0', color: '#7c3aed' }}>
                          ✅ Tiene vídeo
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!search.loading && search.results.length === 0 && search.lastSearchQuery && (
          <div style={{
            backgroundColor: '#323',
            color: '#aaf',
            padding: '10px',
            borderRadius: '4px'
          }}>
            ℹ️ No se encontraron resultados para "{search.lastSearchQuery}"
          </div>
        )}
      </div>

      <div style={{ 
        backgroundColor: '#2a2a2a', 
        padding: '20px', 
        borderRadius: '8px'
      }}>
        <h2>Test 2: Openings Populares</h2>
        
        {popular.loading && (
          <p>⏳ Cargando openings populares...</p>
        )}

        {popular.error && (
          <div style={{
            backgroundColor: '#422',
            color: '#faa',
            padding: '10px',
            borderRadius: '4px'
          }}>
            ❌ Error: {popular.error}
          </div>
        )}

        {popular.openings.length > 0 && (
          <div>
            <h3>✅ {popular.openings.length} openings cargados</h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '15px',
              marginTop: '15px'
            }}>
              {popular.openings.slice(0, 12).map((opening) => (
                <div
                  key={opening.id}
                  style={{
                    backgroundColor: '#333',
                    padding: '15px',
                    borderRadius: '6px',
                    border: '1px solid #444'
                  }}
                >
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#7c3aed' }}>
                    📺 {opening.animeName}
                  </p>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                    ♪ {opening.title}
                  </h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#aaa' }}>
                    🎤 {opening.artist}
                  </p>
                  <p style={{ 
                    margin: '0', 
                    fontSize: '11px', 
                    color: opening.videoUrl ? '#7c3aed' : '#666'
                  }}>
                    {opening.videoUrl ? '✅ Con vídeo' : '❌ Sin vídeo'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#2a3a2a',
        color: '#aaf',
        borderRadius: '6px',
        fontSize: '12px'
      }}>
        <p>💡 <strong>Tips de Testing:</strong></p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Busca animes comunes: "naruto", "attack on titan", "jojo"</li>
          <li>Verifica que haya vídeos disponibles (✅ Con vídeo)</li>
          <li>Abre la consola (F12) para ver detalles de errores</li>
          <li>Los openings populares se cargan automáticamente</li>
        </ul>
      </div>
    </div>
  )
}

export default TestComponent
