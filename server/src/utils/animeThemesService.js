import fetch from 'node-fetch'

// Headers simples - AnimeThemes devuelve JSON normal, no JSON:API
const DEFAULT_HEADERS = {
  'User-Agent': 'AnimeOpeningsTournamentApp/1.0'
}

/**
 * Construye la URL del video desde el basename
 * @param {string} basename - Nombre del archivo (ej: "CowboyBebop-OP1.webm")
 * @returns {string} URL completa del video
 */
function buildVideoUrl(basename) {
  if (!basename) return null
  return `https://v.animethemes.moe/${basename}`
}

/**
 * Selecciona el video con mayor resolución de un array de videos
 * @param {Array} videos - Array de videos con resolutions
 * @returns {Object} Video con mayor resolución
 */
function selectBestVideo(videos) {
  if (!videos || videos.length === 0) return null
  
  // Ordenar por resolución descendente y tomar el primero
  return videos.sort((a, b) => (b.resolution || 0) - (a.resolution || 0))[0]
}

/**
 * Parsea un anime y extrae todos sus openings
 * @param {Object} anime - Objeto anime de AnimeThemes
 * @returns {Array} Array de openings formateados
 */
function parseAnimeThemes(anime) {
  const openings = []

  if (!anime || !anime.animethemes) {
    return openings
  }

  const thumbnail = anime.images?.[0]?.link || null

  for (const theme of anime.animethemes) {
    // Obtener título del opening desde song
    const title = theme.song?.title || ''
    
    // Obtener artista (primer artista si existe)
    const artist = theme.song?.artists?.[0]?.name || ''

    // Seleccionar el mejor video (mayor resolución)
    const entries = theme.animethemeentries || []
    let videoUrl = null

    if (entries.length > 0) {
      const videos = entries[0].videos || []
      const bestVideo = selectBestVideo(videos)
      if (bestVideo) {
        videoUrl = buildVideoUrl(bestVideo.basename)
      }
    }

    // Solo agregar si tenemos título y video
    if (title && videoUrl) {
      openings.push({
        title,
        anime_title: anime.name || '',
        anime_slug: anime.slug || '',
        year: anime.year || null,
        season: anime.season || null,
        artist,
        video_url: videoUrl,
        thumbnail_url: thumbnail,
        type: theme.type || 'OP',
        sequence: theme.sequence || 1
      })
    }
  }

  return openings
}

/**
 * Busca openings en AnimeThemes por query
 * @param {string} query - Término de búsqueda
 * @returns {Promise<Array>} Array de openings encontrados
 */
export async function searchOpenings(query) {
  try {
    if (!query || query.trim().length === 0) {
      return []
    }

    // Construir URL con parámetros
    const url = new URL('https://api.animethemes.moe/search')
    url.searchParams.append('q', query)
    url.searchParams.append('include[anime]', 'animethemes.song.artists,animethemes.animethemeentries.videos,images')

    console.log(`🔍 Buscando en AnimeThemes: ${query}`)

    const response = await fetch(url.toString(), {
      headers: DEFAULT_HEADERS
    })

    if (!response.ok) {
      console.error(`❌ Error en AnimeThemes API: ${response.status}`)
      return []
    }

    const data = await response.json()

    // La respuesta tiene estructura: { search: { anime: [...] } }
    const animes = data.search?.anime || []

    if (animes.length === 0) {
      console.log(`ℹ️  No se encontraron animes para: ${query}`)
      return []
    }

    // Parsear todos los openings de todos los animes
    const openings = []
    for (const anime of animes) {
      const animeOpenings = parseAnimeThemes(anime)
      openings.push(...animeOpenings)
    }

    console.log(`✓ Encontrados ${openings.length} openings en AnimeThemes`)
    return openings
  } catch (error) {
    console.error('❌ Error buscando en AnimeThemes:', error.message)
    return []
  }
}

/**
 * Obtiene todos los openings de un anime específico por slug
 * @param {string} slug - Slug del anime (ej: "cowboy_bebop")
 * @returns {Promise<Array>} Array de openings del anime
 */
export async function getAnimeBySlug(slug) {
  try {
    if (!slug || slug.trim().length === 0) {
      return []
    }

    // Construir URL
    const url = new URL(`https://api.animethemes.moe/anime/${encodeURIComponent(slug)}`)
    url.searchParams.append('include', 'animethemes.song.artists,animethemes.animethemeentries.videos,images')

    console.log(`🔍 Obteniendo anime: ${slug}`)

    const response = await fetch(url.toString(), {
      headers: DEFAULT_HEADERS
    })

    if (!response.ok) {
      console.error(`❌ Error en AnimeThemes API: ${response.status}`)
      return []
    }

    const data = await response.json()

    // La respuesta tiene estructura: { anime: { ... } }
    const anime = data.anime

    if (!anime) {
      console.log(`ℹ️  Anime no encontrado: ${slug}`)
      return []
    }

    // Parsear openings del anime
    const openings = parseAnimeThemes(anime)

    console.log(`✓ Obtenidos ${openings.length} openings de ${anime.name}`)
    return openings
  } catch (error) {
    console.error('❌ Error obteniendo anime:', error.message)
    return []
  }
}
