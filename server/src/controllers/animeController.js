import AnimeOpening from '../models/AnimeOpening.js'
import Tournament from '../models/Tournament.js'
import Room from '../models/Room.js'
import { searchOpenings, getAnimeBySlug } from '../utils/animeThemesService.js'

// Proxy para reproducir vídeos que requieren Referer (animethemes.moe)
export const proxyVideo = async (req, res) => {
  try {
    const { url } = req.query
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL requerida' })
    }

    const decodedUrl = decodeURIComponent(url)
    console.log('Proxy video request:', decodedUrl)

    // Fetch con headers correctos para AnimeThemes
    const response = await fetch(decodedUrl, {
      headers: {
        'Referer': 'https://animethemes.moe/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'video/webm,video/*,*/*',
        'Range': req.headers.range || 'bytes=0-'
      }
    })

    if (!response.ok) {
      console.error(`Proxy video fetch failed: ${response.status} ${response.statusText}`)
      return res.status(response.status).json({ error: 'Error fetching video' })
    }

    // Forzar Content-Type correcto
    res.setHeader('Content-Type', 'video/webm; charset=utf-8')
    res.setHeader('Accept-Ranges', 'bytes')
    res.setHeader('Access-Control-Allow-Origin', '*')

    const contentLength = response.headers.get('content-length')
    if (contentLength) {
      res.setHeader('Content-Length', contentLength)
    }

    const contentRange = response.headers.get('content-range')
    if (contentRange) {
      res.setHeader('Content-Range', contentRange)
      res.status(206)
    }

    console.log('Proxy video serving:', {
      contentType: res.getHeader('Content-Type'),
      contentLength: contentLength,
      status: res.statusCode
    })

    // Pipe del stream al cliente
    response.body.pipe(res)
  } catch (error) {
    console.error('Error en proxyVideo:', error)
    res.status(500).json({ success: false, error: 'Error al obtener vídeo' })
  }
}

/**
 * Busca openings en AnimeThemes y guarda los nuevos en MongoDB
 */
export const searchOpeningsController = async (req, res) => {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter q es requerido'
      })
    }

    const openings = await searchOpenings(q)

    if (openings.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontraron openings',
        data: []
      })
    }

    const savedOpenings = []
    for (const opening of openings) {
      const upserted = await AnimeOpening.findOneAndUpdate(
        {
          anime_slug: opening.anime_slug,
          sequence: opening.sequence,
          type: opening.type
        },
        {
          title: opening.title,
          anime_title: opening.anime_title,
          anime_slug: opening.anime_slug,
          year: opening.year,
          season: opening.season,
          artist: opening.artist,
          video_url: opening.video_url,
          thumbnail_url: opening.thumbnail_url,
          type: opening.type,
          sequence: opening.sequence,
          source: 'animethemes'
        },
        { upsert: true, new: true }
      )
      savedOpenings.push(upserted)
    }

    res.json({
      success: true,
      data: savedOpenings,
      count: savedOpenings.length,
      message: 'Openings encontrados y guardados exitosamente'
    })
  } catch (error) {
    console.error('Error searching openings:', error)
    res.status(500).json({
      success: false,
      error: 'Error al buscar openings',
      details: error.message
    })
  }
}

/**
 * Obtiene todos los openings de un anime por slug
 */
export const getAnimeOpeningsController = async (req, res) => {
  try {
    const { slug } = req.query

    if (!slug) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter slug es requerido'
      })
    }

    let openings = await AnimeOpening.find({ anime_slug: slug }).sort({ sequence: 1 })

    if (openings.length === 0) {
      const animeThemesOpenings = await getAnimeBySlug(slug)

      if (animeThemesOpenings.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No se encontraron openings para este anime'
        })
      }

      openings = await AnimeOpening.insertMany(
        animeThemesOpenings.map(o => ({
          ...o,
          source: 'animethemes'
        }))
      )
    }

    res.json({
      success: true,
      data: openings,
      count: openings.length,
      message: 'Openings obtenidos exitosamente'
    })
  } catch (error) {
    console.error('Error getting anime openings:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener openings',
      details: error.message
    })
  }
}

/**
 * Obtiene todos los openings guardados en MongoDB
 */
export const getAllOpeningsController = async (req, res) => {
  try {
    const { limit = 50, skip = 0, type } = req.query

    const query = {}
    if (type && ['OP', 'ED'].includes(type.toUpperCase())) {
      query.type = type.toUpperCase()
    }

    const openings = await AnimeOpening.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ anime_title: 1, sequence: 1 })

    const total = await AnimeOpening.countDocuments(query)

    res.json({
      success: true,
      data: openings,
      count: openings.length,
      total,
      message: 'Openings obtenidos exitosamente'
    })
  } catch (error) {
    console.error('Error getting openings:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener openings',
      details: error.message
    })
  }
}

/**
 * GET /api/admin/cleanup
 * Elimina todos los tournaments que no tienen una Room asociada (torneos huérfanos)
 */
export const cleanupOrphanedTournaments = async (req, res) => {
  try {
    // Obtener todos los tournament IDs que tienen una Room
    const roomsWithTournaments = await Room.find().select('tournament_id')
    const associatedTournamentIds = roomsWithTournaments.map(r => r.tournament_id.toString())

    // Buscar y eliminar torneos sin sala asociada
    const result = await Tournament.deleteMany({
      _id: { $nin: associatedTournamentIds }
    })

    console.log(`✓ Limpieza completada: ${result.deletedCount} torneos huérfanos eliminados`)

    res.json({
      success: true,
      message: `${result.deletedCount} torneos huérfanos eliminados`,
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error('Error en cleanupOrphanedTournaments:', error)
    res.status(500).json({
      success: false,
      error: 'Error al limpiar torneos',
      details: error.message
    })
  }
}
