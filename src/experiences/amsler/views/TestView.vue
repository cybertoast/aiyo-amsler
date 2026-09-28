<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AmslerGrid from '../components/AmslerGrid.vue'
import ResponsePad from '../components/ResponsePad.vue'
import TestSetupForm from '../components/TestSetupForm.vue'
import CalibrationNotice from '../../../shared/components/CalibrationNotice.vue'
import { useCalibration } from '../../../shared/composables/useCalibration'
import { useTheme } from '../../../shared/composables/useTheme'
import { useRecentBloodPressure } from '../../../shared/composables/useRecentBloodPressure'
import { useSpeech } from '../../../shared/composables/useSpeech'
import type { BloodPressure } from '../../../shared/lib/blood-pressure'
import { encodePayload, PAYLOAD_PARAM } from '../../../shared/lib/session-codec'
import { ANSWER_KEYS, useAmslerTest } from '../composables/useAmslerTest'
import { useAmslerPreferences, type TestSetup } from '../composables/useAmslerPreferences'
import { TEST_COLOR_VALUES } from '../lib/colors'
import { cellName } from '../lib/grid'

const router = useRouter()
const { pxPerMm } = useCalibration()
const { theme } = useTheme()
const { showLabels, loadSetup, saveSetup } = useAmslerPreferences()
const speech = useSpeech()
const recentBloodPressure = useRecentBloodPressure()
const test = useAmslerTest()
const { session, position, total, paused, finished, currentCell } = test

const running = computed(() => session.value !== null && !finished.value)
const highlight = computed(() => {
  const s = session.value
  if (!s || currentCell.value === null || paused.value) return null
  return { cell: currentCell.value, color: TEST_COLOR_VALUES[s.color], mode: s.displayMode }
})
const coverText = computed(() => {
  const eye = session.value?.eye
  if (eye === 'left') return 'Cover your right eye.'
  if (eye === 'right') return 'Cover your left eye.'
  return 'Keep both eyes open.'
})

function onStart(setup: TestSetup, name: string, bloodPressure: BloodPressure | null): void {
  saveSetup(setup)
  if (bloodPressure) recentBloodPressure.remember(bloodPressure)
  test.start({ ...setup, theme: theme.value }, name, bloodPressure ?? undefined)
}

/** "C7" is spoken as "C 7" so speech engines read a letter and a number. */
function cellPrompt(cell: number): string {
  if (session.value?.displayMode !== 'label') return 'Next cell.'
  const name = cellName(cell)
  return `Cell ${name[0]} ${name.slice(1)}.`
}

watch(currentCell, (cell) => {
  if (cell === null) return
  if (position.value === 0) {
    speech.say(`${coverText.value} Look at the center dot. Press 1 for clear, 2 for blurry, 3 for invisible. ${cellPrompt(cell)}`)
  } else speech.say(cellPrompt(cell))
})
watch(paused, (value) => speech.say(value ? 'Paused.' : 'Resumed.'))

function onKeydown(event: KeyboardEvent): void {
  if (!running.value || event.metaKey || event.ctrlKey || event.altKey) return
  const answer = ANSWER_KEYS[event.key]
  if (answer) test.respond(answer)
  else if (event.key === 'Backspace') test.back()
  else if (event.key === 'Escape') (paused.value ? test.resume : test.pause)()
  else return
  event.preventDefault()
}

watch(finished, async (done) => {
  if (!done || !session.value) return
  speech.say('Test complete.')
  const payload = await encodePayload(session.value)
  await router.push({ path: '/amsler/review', hash: `#${PAYLOAD_PARAM}=${payload}` })
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  speech.stop()
})
</script>

<template>
  <h1>Amsler grid: incremental test</h1>
  <CalibrationNotice />

  <template v-if="!session">
    <p>
      One cell at a time is highlighted. For each cell, answer whether it looks clear, blurry, or
      invisible. Hold the screen 30–35 cm away and keep looking at the center dot.
    </p>
    <label class="option">
      <input v-model="showLabels" type="checkbox" /> Show row numbers and column letters
    </label>
    <TestSetupForm :initial="loadSetup()" @start="onStart" />
  </template>

  <template v-else-if="running">
    <p class="instruction">{{ coverText }} Look at the center dot.</p>
    <p class="progress" data-testid="progress" aria-live="polite">{{ position + 1 }} / {{ total }}</p>
    <div class="grid-wrap">
      <AmslerGrid :px-per-mm="pxPerMm" :show-labels="showLabels" :highlight="highlight" />
    </div>
    <p v-if="paused" class="paused" role="status">Paused. Press Esc or select Resume to continue.</p>
    <ResponsePad :disabled="paused" @answer="test.respond" />
    <div class="controls">
      <button type="button" data-testid="back" :disabled="position === 0 || paused" @click="test.back">Back (Backspace)</button>
      <button v-if="!paused" type="button" data-testid="pause" @click="test.pause">Pause (Esc)</button>
      <button v-else type="button" data-testid="resume" @click="test.resume">Resume (Esc)</button>
    </div>
  </template>

  <p v-else role="status">Test complete. Opening results…</p>
</template>

<style scoped>
.grid-wrap {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
  overflow-x: auto;
}
.instruction,
.progress {
  text-align: center;
  margin: 0.25rem 0;
}
.progress {
  font-variant-numeric: tabular-nums;
}
.paused {
  text-align: center;
  font-weight: 600;
}
.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}
.option {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1rem;
}
</style>
