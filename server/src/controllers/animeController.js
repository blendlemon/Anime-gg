/**
 * Anime Controller
 * Controlador para manejar peticiones relacionadas con anime
 */

import * as animeThemesService from '../utils/animeThemesService.js'

/**
 * Buscar openings por nombre de anime
 */
export const searchOpenings = async (req, res) => {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'El parámetro de búsqueda "q" es requerido'
      })
    }

    const results = await animeThemesService.searchOpenings(q)

    res.status(200).json({
      success: true,
      data: results,
      query: q,
      count: results.length,
      message: 'Búsqueda de openings completada'
    })
  } catch (error) {
    console.error('Error in searchOpenings controller:', error)
    res.status(500).json({
      success: false,
      error: 'Error al buscar openings',
      details: error.message
    })
  }
}

/**
 * Obtener anime con todos sus openings por slug
 */
export const getAnimeBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    if (!slug) {
      return res.status(400).json({
        success: false,
        error: 'El slug del anime es requerido'
      })
    }

    const anime = await animeThemesService.getAnimeBySlug(slug)

    if (!anime) {
      return res.status(404).json({
        success: false,
        error: 'Anime no encontrado'
      })
    }

    res.status(200).json({
      success: true,
      data: anime,
      message: 'Anime obtenido exitosamente'
    })
  } catch (error) {
    console.error('Error in getAnimeBySlug controller:', error)

    if (error.message === 'Anime no encontrado') {
      return res.status(404).json({
        success: false,
        error: error.message
      })
    }

    res.status(500).json({
      success: false,
      error: 'Error al obtener el anime',
      details: error.message
    })
  }
}

/**
 * Obtener openings populares
 */
export const getPopularOpenings = async (req, res) => {
  try {
    const openings = await animeThemesService.getPopularOpenings()

    res.status(200).json({
      success: true,
      data: openings,
      count: openings.length,
      message: 'Openings populares obtenidos exitosamente'
    })
  } catch (error) {
    console.error('Error in getPopularOpenings controller:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener openings populares',
      details: error.message
    })
  }
}

