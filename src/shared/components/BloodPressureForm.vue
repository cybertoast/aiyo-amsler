<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BP_RANGES, formatBloodPressure, type BloodPressure } from '../lib/blood-pressure'
import { localIsoString } from '../lib/time'

const props = defineProps<{ recent: BloodPressure | null }>()
/** The entered reading, or null when not recording or when the input is invalid. */
const reading = defineModel<BloodPressure | null>({ required: true })
/** False when recording is on and the input is incomplete or out of range. */
const valid = defineModel<boolean>('valid', { required: true })

const pad = (n: number) => String(n).padStart(2, '0')
function localInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const recording = ref(false)
const systolic = ref<number | ''>('')
const diastolic = ref<number | ''>('')
const pulse = ref<number | ''>('')
const takenAt = ref(localInputValue(new Date()))

function inRange(value: number | '', range: { min: number; max: number }): boolean {
  return value !== '' && Number.isInteger(value) && value >= range.min && value <= range.max
}

const errors = computed(() => {
  if (!recording.value) return []
  const out: string[] = []
  if (!inRange(systolic.value, BP_RANGES.systolic)) out.push(`Systolic: ${BP_RANGES.systolic.min}–${BP_RANGES.systolic.max}`)
  if (!inRange(diastolic.value, BP_RANGES.diastolic)) out.push(`Diastolic: ${BP_RANGES.diastolic.min}–${BP_RANGES.diastolic.max}`)
  if (pulse.value !== '' && !inRange(pulse.value, BP_RANGES.pulse)) out.push(`Pulse: ${BP_RANGES.pulse.min}–${BP_RANGES.pulse.max}, or leave empty`)
  if (!takenAt.value || Number.isNaN(Date.parse(takenAt.value))) out.push('Time of reading')
  return out
})

watch(
  [recording, systolic, diastolic, pulse, takenAt],
  () => {
    // Use a local value: reading a defineModel ref right after setting it returns the old prop value.
    const isValid = errors.value.length === 0
    valid.value = isValid
    if (!recording.value || !isValid) {
      reading.value = null
      return
    }
    const value: BloodPressure = {
      systolic: systolic.value as number,
      diastolic: diastolic.value as number,
      takenAt: localIsoString(new Date(takenAt.value)),
    }
    if (pulse.value !== '') value.pulse = pulse.value
    reading.value = value
  },
  { immediate: true },
)

function useRecent(): void {
  const r = props.recent
  if (!r) return
  recording.value = true
  systolic.value = r.systolic
  diastolic.value = r.diastolic
  pulse.value = r.pulse ?? ''
  takenAt.value = localInputValue(new Date(r.takenAt))
}
</script>

<template>
  <fieldset class="bp">
    <legend>Blood pressure (optional)</legend>
    <label><input v-model="recording" type="checkbox" data-testid="bp-record" /> Record a blood pressure reading taken before this test</label>
    <p v-if="recent && !recording">
      <button type="button" data-testid="bp-use-recent" @click="useRecent">
        Use recent reading: {{ formatBloodPressure(recent) }}
      </button>
    </p>
    <div v-if="recording" class="fields">
      <label>Systolic <input v-model.number="systolic" type="number" inputmode="numeric" data-testid="bp-systolic" /></label>
      <label>Diastolic <input v-model.number="diastolic" type="number" inputmode="numeric" data-testid="bp-diastolic" /></label>
      <label>Pulse <input v-model.number="pulse" type="number" inputmode="numeric" data-testid="bp-pulse" /></label>
      <label>Taken at <input v-model="takenAt" type="datetime-local" data-testid="bp-taken-at" /></label>
    </div>
    <p v-if="errors.length" class="field-error" data-testid="bp-errors">Check: {{ errors.join('; ') }}.</p>
  </fieldset>
</template>

<style scoped>
.bp {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border: 1px solid var(--border);
}
.fields {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.fields input[type='number'] {
  width: 5rem;
}
.field-error {
  color: var(--warning);
  margin: 0;
}
</style>
