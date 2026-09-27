import { ref, watch } from 'vue'
import { readJson, writeJson } from '../lib/storage'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'fit-eyes.theme'

function initialTheme(): Theme {
  const saved = readJson<Theme>(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const theme = ref<Theme>(initialTheme())

watch(
  theme,
  (value) => {
    document.documentElement.dataset.theme = value
    writeJson(STORAGE_KEY, value)
  },
  { immediate: true },
)

export function useTheme() {
  return {
    theme,
    toggle: () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
    },
  }
}
