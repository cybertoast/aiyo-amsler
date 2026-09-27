import { computed, ref } from 'vue'
import { DEFAULT_PX_PER_MM, MAX_PX_PER_MM, MIN_PX_PER_MM } from '../lib/calibration'
import { readJson, removeKey, writeJson } from '../lib/storage'

const STORAGE_KEY = 'fit-eyes.calibration'

interface StoredCalibration {
  pxPerMm: number
  devicePixelRatio: number
  savedAt: string
}

const stored = ref<StoredCalibration | null>(null)
const currentPixelRatio = ref(1)

function isValid(value: StoredCalibration | null): value is StoredCalibration {
  return (
    value !== null &&
    typeof value.pxPerMm === 'number' &&
    value.pxPerMm >= MIN_PX_PER_MM &&
    value.pxPerMm <= MAX_PX_PER_MM &&
    typeof value.devicePixelRatio === 'number'
  )
}

function reload(): void {
  const value = readJson<StoredCalibration>(STORAGE_KEY)
  stored.value = isValid(value) ? value : null
  currentPixelRatio.value = window.devicePixelRatio
}

function save(pxPerMm: number): void {
  const value: StoredCalibration = {
    pxPerMm,
    devicePixelRatio: window.devicePixelRatio,
    savedAt: new Date().toISOString(),
  }
  writeJson(STORAGE_KEY, value)
  stored.value = value
  currentPixelRatio.value = window.devicePixelRatio
}

function reset(): void {
  removeKey(STORAGE_KEY)
  stored.value = null
}

reload()

/** Calibration shared by all experiences. Stored per device, never in a session. */
export function useCalibration() {
  return {
    pxPerMm: computed(() => stored.value?.pxPerMm ?? DEFAULT_PX_PER_MM),
    isCalibrated: computed(() => stored.value !== null),
    pixelRatioChanged: computed(
      () => stored.value !== null && stored.value.devicePixelRatio !== currentPixelRatio.value,
    ),
    reload,
    save,
    reset,
  }
}
