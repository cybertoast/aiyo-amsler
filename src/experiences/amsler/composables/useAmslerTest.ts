import { computed, ref } from 'vue'
import { buildSequence, needsSeed, newSeed } from '../lib/sequence'
import { RESPONSE_CODES, createSession, type Session, type SessionSettings } from '../lib/session-schema'
import { localIsoString } from '../../../shared/lib/time'

export type Answer = 'clear' | 'blurry' | 'invisible'

export const ANSWER_KEYS: Record<string, Answer> = { '1': 'clear', '2': 'blurry', '3': 'invisible' }

function setChar(text: string, index: number, char: string): string {
  return text.slice(0, index) + char + text.slice(index + 1)
}

/** State for one test run. Each call creates independent state. */
export function useAmslerTest() {
  const session = ref<Session | null>(null)
  const sequence = ref<number[]>([])
  const position = ref(0)
  const paused = ref(false)

  const total = computed(() => sequence.value.length)
  const finished = computed(() => session.value !== null && position.value >= total.value)
  const currentCell = computed(() => (finished.value ? null : (sequence.value[position.value] ?? null)))

  function start(settings: SessionSettings, name?: string): void {
    const withSeed: SessionSettings =
      needsSeed(settings.scope, settings.order) && settings.seed === undefined
        ? { ...settings, seed: newSeed() }
        : settings
    const created = createSession(withSeed)
    const trimmed = name?.trim()
    if (trimmed) created.name = trimmed
    session.value = created
    sequence.value = buildSequence(withSeed.scope, withSeed.order, withSeed.seed)
    position.value = 0
    paused.value = false
  }

  function respond(answer: Answer): void {
    const s = session.value
    const cell = currentCell.value
    if (!s || cell === null || paused.value) return
    s.responses = setChar(s.responses, cell, RESPONSE_CODES[answer])
    position.value++
    if (position.value >= total.value) s.completedAt = localIsoString(new Date())
  }

  function back(): void {
    const s = session.value
    if (!s || position.value === 0 || paused.value) return
    position.value--
    s.responses = setChar(s.responses, sequence.value[position.value]!, RESPONSE_CODES.untested)
    delete s.completedAt
  }

  return {
    session,
    position,
    total,
    paused,
    finished,
    currentCell,
    start,
    respond,
    back,
    pause: () => (paused.value = true),
    resume: () => (paused.value = false),
  }
}
