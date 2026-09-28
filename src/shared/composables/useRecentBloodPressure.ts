import type { BloodPressure } from '../lib/blood-pressure'
import { readJson, writeJson } from '../lib/storage'

const STORAGE_KEY = 'fit-eyes.recentBloodPressure'
export const RECENT_WINDOW_MINUTES = 60

interface Stored {
  reading: BloodPressure
  savedAt: string
}

/** Keeps the last reading on this device only, so the next test within the window can reuse it. */
export function useRecentBloodPressure() {
  return {
    remember(reading: BloodPressure, now: Date = new Date()): void {
      writeJson(STORAGE_KEY, { reading, savedAt: now.toISOString() } satisfies Stored)
    },
    recent(now: Date = new Date()): BloodPressure | null {
      const stored = readJson<Stored>(STORAGE_KEY)
      if (!stored || typeof stored !== 'object' || !stored.reading || typeof stored.savedAt !== 'string') return null
      const ageMs = now.getTime() - Date.parse(stored.savedAt)
      return ageMs >= 0 && ageMs <= RECENT_WINDOW_MINUTES * 60_000 ? stored.reading : null
    },
  }
}
