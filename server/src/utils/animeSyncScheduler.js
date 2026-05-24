import AnimeOpening from '../models/AnimeOpening.js'
import { syncAllAnime } from './animeThemesService.js'

const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000
let syncTimer = null
let isSyncing = false

export async function runSync() {
  if (isSyncing) {
    console.log('Sincronización ya en curso, saltando...')
    return
  }

  isSyncing = true
  console.log('=== INICIO SINCRONIZACIÓN PROGRAMADA ===')

  try {
    let totalInserted = 0

    await syncAllAnime(async (page, openingsSoFar) => {
      console.log(`Progreso: página ${page} - ${openingsSoFar} openings acumulados`)
    })

    const total = await AnimeOpening.countDocuments()
    console.log(`=== SINCRONIZACIÓN COMPLETADA ===`)
    console.log(`Total en BD: ${total}`)
  } catch (error) {
    console.error('Error en sincronización programada:', error.message)
  } finally {
    isSyncing = false
  }
}

export function startSyncScheduler() {
  console.log(`Iniciando scheduler de sincronización (cada ${SYNC_INTERVAL_MS / 3600000}h)`)
  runSync()
  syncTimer = setInterval(runSync, SYNC_INTERVAL_MS)
  console.log(`Próxima sincronización en ${SYNC_INTERVAL_MS / 3600000} horas`)
}

export function stopSyncScheduler() {
  if (syncTimer) {
    clearInterval(syncTimer)
    syncTimer = null
    console.log('Scheduler de sincronización detenido')
  }
}
