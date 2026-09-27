import { ref, watch } from 'vue'
import { readJson, writeJson } from '../../../shared/lib/storage'
import type { SessionSettings } from '../lib/session-schema'

const LABELS_KEY = 'fit-eyes.amsler.showLabels'
const SETTINGS_KEY = 'fit-eyes.amsler.lastSettings'

export type TestSetup = Omit<SessionSettings, 'theme' | 'seed'>

export const DEFAULT_SETUP: TestSetup = {
  eye: 'left',
  color: 'mono',
  displayMode: 'cell',
  order: 'random',
  scope: { type: 'full' },
}

const showLabels = ref(readJson<boolean>(LABELS_KEY) === true)
watch(showLabels, (value) => writeJson(LABELS_KEY, value))

/** Per-device preferences for the Amsler experience. Not part of any session. */
export function useAmslerPreferences() {
  return {
    showLabels,
    loadSetup: (): TestSetup => ({ ...DEFAULT_SETUP, ...(readJson<Partial<TestSetup>>(SETTINGS_KEY) ?? {}) }),
    saveSetup: (setup: TestSetup) => writeJson(SETTINGS_KEY, setup),
  }
}
