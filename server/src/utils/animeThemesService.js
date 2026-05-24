import fetch from 'node-fetch'
import AnimeOpening from '../models/AnimeOpening.js'

const DEFAULT_HEADERS = {
  'User-Agent': 'AnimeOpeningsTournamentApp/1.0'
}

const API_BASE = 'https://api.animethemes.moe'
const RATE_LIMIT_MAX = 90
const REQUEST_DELAY_MS = 800

let requestTimestamps = []

function respectRateLimit() {
  const now = Date.now()
  requestTimestamps = requestTimestamps.filter(t => now - t < 60000)
  if (requestTimestamps.length >= RATE_LIMIT_MAX) {
    const oldest = requestTimestamps[0]
    const waitTime = oldest + 60000 - now + 100
    return waitTime
  }
  return 0
}

async function rateLimitedFetch(url) {
  const waitTime = respectRateLimit()
  if (waitTime > 0) {
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }
  requestTimestamps.push(Date.now())
  return fetch(url, { headers: DEFAULT_HEADERS })
}

function buildVideoUrl(basename) {
  if (!basename) return null
  return `https://v.animethemes.moe/${basename}`
}

function selectBestVideo(videos) {
  if (!videos || videos.length === 0) return null
  return videos.sort((a, b) => (b.resolution || 0) - (a.resolution || 0))[0]
}

function parseAnimeThemes(anime) {
  const openings = []
  if (!anime || !anime.animethemes) return openings

  const thumbnail = anime.images?.[0]?.link || null

  for (const theme of anime.animethemes) {
    const title = theme.song?.title || ''
    const artist = theme.song?.artists?.[0]?.name || ''
    const entries = theme.animethemeentries || []
    let videoUrl = null
    let videoResolution = null
    let videoId = null

    if (entries.length > 0) {
      const videos = entries[0].videos || []
      const bestVideo = selectBestVideo(videos)
      if (bestVideo) {
        videoUrl = buildVideoUrl(bestVideo.basename)
        videoResolution = bestVideo.resolution || null
        videoId = bestVideo.id || null
      }
    }

    if (title && videoUrl) {
      openings.push({
        title,
        anime_title: anime.name || '',
        anime_slug: anime.slug || '',
        anime_id: anime.id || null,
        theme_id: theme.id || null,
        video_id: videoId,
        year: anime.year || null,
        season: anime.season || null,
        artist,
        video_url: videoUrl,
        video_resolution: videoResolution,
        thumbnail_url: thumbnail,
        media_format: anime.media_format || null,
        synopsis: anime.synopsis || null,
        type: theme.type || 'OP',
        sequence: theme.sequence || 1
      })
    }
  }
  return openings
}

export async function searchOpenings(query) {
  try {
    if (!query || query.trim().length === 0) return []

    const url = new URL(`${API_BASE}/search`)
    url.searchParams.append('q', query)
    url.searchParams.append('include[anime]', 'animethemes.song.artists,animethemes.animethemeentries.videos,images')

    const response = await rateLimitedFetch(url.toString())
    if (!response.ok) {
      console.error(`Error AnimeThemes API: ${response.status}`)
      return []
    }

    const data = await response.json()
    const animes = data.search?.anime || []
    if (animes.length === 0) return []

    const openings = []
    for (const anime of animes) {
      openings.push(...parseAnimeThemes(anime))
    }
    return openings
  } catch (error) {
    console.error('Error buscando en AnimeThemes:', error.message)
    return []
  }
}

export async function getAnimeBySlug(slug) {
  try {
    if (!slug || slug.trim().length === 0) return []

    const url = new URL(`${API_BASE}/anime/${encodeURIComponent(slug)}`)
    url.searchParams.append('include', 'animethemes.song.artists,animethemes.animethemeentries.videos,images')

    const response = await rateLimitedFetch(url.toString())
    if (!response.ok) {
      console.error(`Error AnimeThemes API: ${response.status}`)
      return []
    }

    const data = await response.json()
    const anime = data.anime
    if (!anime) return []

    return parseAnimeThemes(anime)
  } catch (error) {
    console.error('Error obteniendo anime:', error.message)
    return []
  }
}

export async function getAnimePage(page = 1, perPage = 50) {
  try {
    const url = new URL(`${API_BASE}/anime`)
    url.searchParams.append('page[number]', String(page))
    url.searchParams.append('page[size]', String(perPage))
    url.searchParams.append('include', 'animethemes.song.artists,animethemes.animethemeentries.videos,images')

    const response = await rateLimitedFetch(url.toString())
    if (!response.ok) {
      console.error(`Error AnimeThemes list API: ${response.status}`)
      return { anime: [], links: null }
    }

    const data = await response.json()
    return {
      anime: data.anime || [],
      links: data.links || null
    }
  } catch (error) {
    console.error('Error obteniendo página de animes:', error.message)
    return { anime: [], links: null }
  }
}

export async function syncAllAnime(progressCallback) {
  let page = 1
  const perPage = 50
  let hasNext = true
  let totalOpenings = 0
  let pageOpenings = 0
  let inserted = 0
  let skipped = 0
  let errors = 0

  console.log('Iniciando sincronización completa desde AnimeThemes...')

  while (hasNext) {
    const { anime, links } = await getAnimePage(page, perPage)
    if (!anime || anime.length === 0) break

    pageOpenings = 0
    for (const a of anime) {
      const openings = parseAnimeThemes(a)
      for (const opening of openings) {
        try {
          await AnimeOpening.findOneAndUpdate(
            {
              anime_slug: opening.anime_slug,
              sequence: opening.sequence,
              type: opening.type
            },
            { ...opening, source: 'sync' },
            { upsert: true, new: true }
          )
          inserted++
          pageOpenings++
        } catch (err) {
          if (err.code === 11000) {
            skipped++
          } else {
            errors++
            console.error(`Error guardando opening: ${err.message}`)
          }
        }
      }
    }

    totalOpenings += pageOpenings

    if (progressCallback) {
      progressCallback(page, totalOpenings)
    }

    console.log(`Página ${page} - ${anime.length} animes - ${pageOpenings} openings nuevos - Total: ${totalOpenings}`)

    hasNext = links?.next != null
    page++

    if (hasNext) {
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS))
    }
  }

  console.log(`Sync completado: ${inserted} insertados, ${skipped} saltados, ${errors} errores de ${page - 1} páginas`)
  return totalOpenings
}
