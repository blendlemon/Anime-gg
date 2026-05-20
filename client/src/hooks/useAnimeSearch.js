/**
 * Custom Hook: useAnimeSearch
 * Maneja la búsqueda de animes con estado, loading y error handling
 */

import { useState, useCallback } from 'react'
import * as animeApi from '../utils/animeApi'

/**
 * Hook para buscar animes
 * @returns {Object} Estado y funciones de búsqueda
 */
export const useAnimeSearch = () => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [lastSearchQuery, setLastSearchQuery] = useState('')

  /**
   * Realiza la búsqueda de animes
   */
  const search = useCallback(async (searchQuery) => {
    // No buscar si la query es vacía
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults([])
      setError(null)
      setLastSearchQuery('')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await animeApi.searchAnimeOpenings(searchQuery)
      setResults(data || [])
      setLastSearchQuery(searchQuery)
    } catch (err) {
      console.error('Search error:', err)
      setError(err.message || 'Error al buscar animes')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Maneja cambios en el input de búsqueda
   */
  const handleSearchChange = useCallback((newQuery) => {
    setQuery(newQuery)
  }, [])

  /**
   * Ejecuta la búsqueda con el query actual
   */
  const executeSearch = useCallback(() => {
    search(query)
  }, [query, search])

  /**
   * Limpia los resultados y errores
   */
  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
    setQuery('')
    setLastSearchQuery('')
  }, [])

  return {
    // Estado
    results,
    loading,
    error,
    query,
    lastSearchQuery,

    // Funciones
    search,
    handleSearchChange,
    executeSearch,
    clearResults,
  }
}

/**
 * Custom Hook: useAnimeDetail
 * Obtiene los detalles de un anime específico
 */
export const useAnimeDetail = () => {
  const [anime, setAnime] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Carga los detalles de un anime por slug
   */
  const loadAnime = useCallback(async (slug) => {
    if (!slug || slug.trim().length === 0) {
      setError('Slug requerido')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await animeApi.getAnimeBySlug(slug)
      setAnime(data)
    } catch (err) {
      console.error('Fetch anime error:', err)
      setError(err.message || 'Error al obtener el anime')
      setAnime(null)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Limpia el estado
   */
  const clear = useCallback(() => {
    setAnime(null)
    setError(null)
  }, [])

  return {
    // Estado
    anime,
    loading,
    error,

    // Funciones
    loadAnime,
    clear,
  }
}

/**
 * Custom Hook: usePopularOpenings
 * Carga openings populares
 */
export const usePopularOpenings = () => {
  const [openings, setOpenings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loaded, setLoaded] = useState(false)

  /**
   * Carga los openings populares
   */
  const loadPopularOpenings = useCallback(async () => {
    // Solo cargar una vez
    if (loaded) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await animeApi.getPopularOpenings()
      setOpenings(data || [])
      setLoaded(true)
    } catch (err) {
      console.error('Fetch popular openings error:', err)
      setError(err.message || 'Error al obtener openings populares')
      setOpenings([])
    } finally {
      setLoading(false)
    }
  }, [loaded])

  /**
   * Recarga los openings
   */
  const refetch = useCallback(async () => {
    setLoaded(false)
    setOpenings([])
    await loadPopularOpenings()
  }, [loadPopularOpenings])

  return {
    // Estado
    openings,
    loading,
    error,
    loaded,

    // Funciones
    loadPopularOpenings,
    refetch,
  }
}
