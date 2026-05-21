import AnimeOpening from '../models/AnimeOpening.js'
import Tournament from '../models/Tournament.js'
import Room from '../models/Room.js'
import fetch from 'node-fetch'
import { searchOpenings, getAnimeBySlug } from '../utils/animeThemesService.js'

export const proxyVideo = async (req, res) => {
  try {
    const { url } = req.query

    if (!url || url === 'undefined') {
      return res.status(400).json({ error: 'URL requerida' })
    }

    const decodedUrl = decodeURIComponent(url)
    const response = await fetch(decodedUrl, {
      headers: {
        Referer: 'https://animethemes.moe/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'video/webm,video/*,*/*',
        Range: req.headers.range || 'bytes=0-'
      }
    })

    if (!response.ok && response.status !== 206) {
      return res.status(response.status).json({ error: 'Error al obtener vídeo' })
    }

    res.setHeader('Content-Type', 'video/webm')
    res.setHeader('Accept-Ranges', 'bytes')
    res.setHeader('Access-Control-Allow-Origin', '*')

    const contentLength = response.headers.get('content-length')
    const contentRange = response.headers.get('content-range')

    if (contentLength) {
      res.setHeader('Content-Length', contentLength)
    }
    if (contentRange) {
      res.setHeader('Content-Range', contentRange)
      res.status(206)
    }

    response.body.pipe(res)
  } catch (error) {
    console.error('Error proxy vídeo:', error)
    res.status(500).json({ error: 'Error al obtener vídeo' })
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

export const cleanupOrphanedTournaments = async (req, res) => {
  try {
    const rooms = await Room.find({}, 'tournament_id')
    const activeTournamentIds = rooms.map((room) => room.tournament_id)

    const result = await Tournament.deleteMany({
      _id: { $nin: activeTournamentIds }
    })

    res.json({
      success: true,
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error('Error cleanup torneos huérfanos:', error)
    res.status(500).json({
      success: false,
      error: 'Error en cleanup',
      details: error.message
    })
  }
}
