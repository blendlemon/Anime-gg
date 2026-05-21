/**
 * API Client para Anime
 * Funciones fetch que consumen los endpoints del backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

/**
 * Busca animes y obtiene sus openings
 * @param {string} query - Término de búsqueda
 * @returns {Promise<Array>} Array de animes con sus openings
 */
export const searchAnimeOpenings = async (query) => {
  if (!query || query.trim().length === 0) {
    throw new Error('La búsqueda no puede estar vacía')
  }

  try {
    const response = await fetch(
      `${API_URL}/anime/search?q=${encodeURIComponent(query)}`
    )

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Error al buscar animes')
    }

    return data.data
  } catch (error) {
    console.error('Error searching anime:', error)
    throw error
  }
}

/**
 * Obtiene todos los openings de un anime específico
 * @param {string} slug - Slug del anime
 * @returns {Promise<Object>} Objeto con datos del anime y sus openings
 */
export const getAnimeBySlug = async (slug) => {
  if (!slug || slug.trim().length === 0) {
    throw new Error('El slug es requerido')
  }

  try {
    const response = await fetch(`${API_URL}/anime/${slug}`)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Anime no encontrado')
      }
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Error al obtener el anime')
    }

    return data.data
  } catch (error) {
    console.error('Error fetching anime:', error)
    throw error
  }
}

/**
 * Obtiene openings populares
 * @returns {Promise<Array>} Array de openings populares
 */
export const getPopularOpenings = async () => {
  try {
    const response = await fetch(`${API_URL}/anime/popular`)

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Error al obtener openings populares')
    }

    return data.data
  } catch (error) {
    console.error('Error fetching popular openings:', error)
    throw error
  }
}
