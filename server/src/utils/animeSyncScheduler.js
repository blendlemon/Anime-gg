import { syncAllAnime } from './animeThemesService.js'

const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000
let syncTimer = null
let isSyncing = false

export async function runSync() {
  if (isSyncing) {
    return
  }

  isSyncing = true

  try {
    await syncAllAnime()
  } catch (error) {
    console.error('Error en sincronización programada:', error.message)
  } finally {
    isSyncing = false
  }
}

export function startSyncScheduler() {
  runSync()
  syncTimer = setInterval(runSync, SYNC_INTERVAL_MS)
}

export function stopSyncScheduler() {
  if (syncTimer) {
    clearInterval(syncTimer)
    syncTimer = null
  }
}
