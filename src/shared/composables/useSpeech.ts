import { ref, watch } from 'vue'
import { readJson, writeJson } from '../lib/storage'

const STORAGE_KEY = 'fit-eyes.speech'

/** speechSynthesis runs on the device; no audio is sent anywhere. Speech recognition is not used. */
const supported = typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined'
const enabled = ref(supported && readJson<boolean>(STORAGE_KEY) === true)
watch(enabled, (value) => writeJson(STORAGE_KEY, value))

function say(text: string): void {
  if (!supported || !enabled.value) return
  speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.9
  speechSynthesis.speak(utterance)
}

export function useSpeech() {
  return { supported, enabled, say, stop: () => supported && speechSynthesis.cancel() }
}
