/**
 * AnimeThemes Service
 * Servicio para consumir la API pública de AnimeThemes
 * Documentación: https://api-docs.animethemes.moe/
 * No requiere API key
 */

const ANIMETHEMES_API = 'https://api.animethemes.moe'

// Headers requeridos por AnimeThemes API
const DEFAULT_HEADERS = {
  'Accept': 'application/vnd.api+json',
  'User-Agent': 'AnimeOpeningsTournamentApp/1.0'
}

/**
 * Busca animes por nombre descargando múltiples páginas (búsqueda en memoria)
 * @param {string} query - Nombre del anime a buscar
 * @returns {Promise<Array>} Array de animes encontrados
 */
export const searchOpenings = async (query) => {
  if (!query || query.trim().length === 0) {
    throw new Error('La búsqueda no puede estar vacía')
  }

  try {
    const queryLower = query.toLowerCase()
    const results = []
    let page = 1
    const maxPages = 5 // Limitar a 5 páginas para evitar requests infinitos

    // Descargar múltiples páginas y buscar en memoria
    while (page <= maxPages && results.length < 10) {
      const url = new URL(`${ANIMETHEMES_API}/anime`)
      url.searchParams.append('page[number]', page.toString())
      url.searchParams.append('page[size]', '50')
      url.searchParams.append('include', 'animethemes.animethemeentries.videos')

      const response = await fetch(url.toString(), {
        headers: DEFAULT_HEADERS
      })

      if (!response.ok) {
        throw new Error(`Error en API: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.anime || data.anime.length === 0) {
        break // No más animes
      }

      // Filtrar por coincidencia
      data.anime.forEach((anime) => {
        if (
          anime.name.toLowerCase().includes(queryLower) ||
          anime.slug.toLowerCase().includes(queryLower) ||
          anime.synonym?.some((syn) => syn.toLowerCase().includes(queryLower))
        ) {
          results.push(transformAnimeData(anime, data))
        }
      })

      page++
    }

    return results.slice(0, 10) // Retornar máximo 10 resultados
  } catch (error) {
    console.error('Error searching openings:', error)
    throw error
  }
}

/**
 * Obtiene un anime específico por slug
 * @param {string} slug - Slug único del anime
 * @returns {Promise<Object>} Objeto con información del anime y sus themes
 */
export const getAnimeBySlug = async (slug) => {
  if (!slug || slug.trim().length === 0) {
    throw new Error('El slug del anime es requerido')
  }

  try {
    const url = new URL(`${ANIMETHEMES_API}/anime`)
    url.searchParams.append('filter[slug][]', slug)
    url.searchParams.append('include', 'animethemes.animethemeentries.videos')

    const response = await fetch(url.toString(), {
      headers: DEFAULT_HEADERS
    })

    if (!response.ok) {
      throw new Error(`Error en API: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.anime || data.anime.length === 0) {
      throw new Error('Anime no encontrado')
    }

    return transformAnimeData(data.anime[0], data)
  } catch (error) {
    console.error('Error fetching anime:', error)
    throw error
  }
}

/**
 * Obtiene openings populares (top animes)
 * Útil para página de inicio
 * @returns {Promise<Array>} Array de openings más populares
 */
export const getPopularOpenings = async () => {
  try {
    const url = new URL(`${ANIMETHEMES_API}/anime`)
    url.searchParams.append('page[size]', '20') // Top 20 animes
    url.searchParams.append('sort', '-year,-season')
    url.searchParams.append('include', 'animethemes.animethemeentries.videos')

    const response = await fetch(url.toString(), {
      headers: DEFAULT_HEADERS
    })

    if (!response.ok) {
      throw new Error(`Error en API: ${response.status}`)
    }

    const data = await response.json()
    const allOpenings = []

    data.anime.forEach((anime) => {
      const openings = extractOpenings(anime)
      openings.forEach((opening) => {
        allOpenings.push({
          ...opening,
          animeSlug: anime.slug,
          animeName: anime.name,
        })
      })
    })

    return allOpenings
  } catch (error) {
    console.error('Error fetching popular openings:', error)
    throw error
  }
}

/**
 * Transforma los datos del anime a formato simplificado
 * @private
 */
const transformAnimeData = (anime, fullData) => {
  if (!anime) return null

  return {
    id: anime.id,
    slug: anime.slug,
    name: anime.name,
    year: anime.year,
    season: anime.season,
    mediaFormat: anime.media_format,
    synopsis: anime.synopsis,
    openings: extractOpenings(anime),
    endings: extractEndings(anime),
  }
}

/**
 * Extrae los openings de los datos del anime
 * @private
 */
const extractOpenings = (anime) => {
  if (!anime.animethemes) {
    return []
  }

  return anime.animethemes
    .filter((theme) => theme.type === 'OP')
    .map((theme) => extractThemeData(theme, 'OP'))
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
}

/**
 * Extrae los endings de los datos del anime
 * @private
 */
const extractEndings = (anime) => {
  if (!anime.animethemes) {
    return []
  }

  return anime.animethemes
    .filter((theme) => theme.type === 'ED')
    .map((theme) => extractThemeData(theme, 'ED'))
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
}

/**
 * Extrae datos de un theme (opening/ending)
 * @private
 */
const extractThemeData = (theme, type) => {
  const entry = theme.animethemeentries?.[0]
  const video = entry?.videos?.[0]

  return {
    id: theme.id,
    title: theme.song?.title || `${type} ${theme.sequence || 1}`,
    type,
    sequence: theme.sequence || 1,
    artist: theme.song?.artist?.name || 'Unknown Artist',
    videoUrl: video?.link || null,
    videoResolution: video?.resolution || null,
    source: 'animethemes',
  }
}

