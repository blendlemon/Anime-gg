import fs from 'fs/promises'
import path from 'path'
import fetch from 'node-fetch'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CACHE_PREFIX = 'cache://'
const VIDEO_CACHE_ROOT = path.resolve(
  process.env.VIDEO_CACHE_DIR
    ? path.resolve(__dirname, '../../', process.env.VIDEO_CACHE_DIR)
    : path.join(__dirname, '../../tmp/video-cache')
)

const getTournamentCacheDir = (tournamentId) => (
  path.join(VIDEO_CACHE_ROOT, tournamentId.toString())
)

const sanitizeVideoUrl = (url) => {
  if (!url || url === 'undefined' || url === 'null') return null
  return url
}

const downloadVideoToCache = async (sourceUrl, outputPath) => {
  const response = await fetch(sourceUrl, {
    headers: {
      Referer: 'https://animethemes.moe/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'video/webm,video/*,*/*'
    }
  })

  if (!response.ok || !response.body) {
    throw new Error(`No se pudo descargar vídeo: ${response.status}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  await fs.writeFile(outputPath, Buffer.from(arrayBuffer))
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const ensureTournamentVideoCache = async (tournamentId, participants = []) => {
  const tournamentIdString = tournamentId.toString()
  const tournamentCacheDir = getTournamentCacheDir(tournamentIdString)
  await fs.mkdir(tournamentCacheDir, { recursive: true })

  for (let i = 0; i < participants.length; i++) {
    const participant = participants[i]
    const participantId = participant?._id?.toString()
    const sourceVideoUrl = sanitizeVideoUrl(participant?.video_url)

    if (!participantId || !sourceVideoUrl) {
      throw new Error('Participante sin vídeo válido para cachear')
    }

    const outputFile = path.join(tournamentCacheDir, `${participantId}.webm`)

    try {
      await fs.access(outputFile)
    } catch {
      const waitSeconds = 10 + Math.floor(Math.random() * 11)
      await delay(waitSeconds * 1000)
      await downloadVideoToCache(sourceVideoUrl, outputFile)
    }

    participant.cached_video_url = `${CACHE_PREFIX}${tournamentIdString}/${participantId}.webm`
  }
}

export const clearTournamentVideoCache = async (tournamentId) => {
  if (!tournamentId) return
  const tournamentCacheDir = getTournamentCacheDir(tournamentId.toString())
  await fs.rm(tournamentCacheDir, { recursive: true, force: true })
}

export const resolveCachedVideoPath = (cacheUrl) => {
  if (!cacheUrl || !cacheUrl.startsWith(CACHE_PREFIX)) {
    return null
  }

  const relativePath = cacheUrl.slice(CACHE_PREFIX.length)
  const resolvedPath = path.resolve(VIDEO_CACHE_ROOT, relativePath)

  if (!resolvedPath.startsWith(VIDEO_CACHE_ROOT)) {
    return null
  }

  return resolvedPath
}
