<script setup lang="ts">
import { computed, ref } from 'vue'
import { REGIONS, NAME_MAX } from '../lib/session-schema'
import { TEST_COLOR_NAMES } from '../lib/colors'
import { CELL_COUNT } from '../lib/grid'
import type { TestSetup } from '../composables/useAmslerPreferences'

const props = defineProps<{ initial: TestSetup }>()
const emit = defineEmits<{ start: [setup: TestSetup, name: string] }>()

const eye = ref(props.initial.eye)
const color = ref(props.initial.color)
const displayMode = ref(props.initial.displayMode)
const order = ref(props.initial.order)
const scopeType = ref(props.initial.scope.type)
const region = ref(props.initial.scope.type === 'region' ? props.initial.scope.region : 'center')
const sampleSize = ref(props.initial.scope.type === 'sample' ? props.initial.scope.n : 50)
const name = ref('')

const sampleValid = computed(
  () => Number.isInteger(sampleSize.value) && sampleSize.value >= 1 && sampleSize.value <= CELL_COUNT,
)
const REGION_NAMES: Record<string, string> = {
  NW: 'Top left quadrant',
  NE: 'Top right quadrant',
  SW: 'Bottom left quadrant',
  SE: 'Bottom right quadrant',
  center: 'Central 10×10',
}

function submit(): void {
  if (scopeType.value === 'sample' && !sampleValid.value) return
  const scope =
    scopeType.value === 'full'
      ? ({ type: 'full' } as const)
      : scopeType.value === 'region'
        ? ({ type: 'region', region: region.value } as const)
        : ({ type: 'sample', n: sampleSize.value } as const)
  emit(
    'start',
    { eye: eye.value, color: color.value, displayMode: displayMode.value, order: order.value, scope },
    name.value,
  )
}
</script>

<template>
  <form class="setup" @submit.prevent="submit">
    <fieldset>
      <legend>Eye</legend>
      <label><input v-model="eye" type="radio" value="left" data-testid="eye-left" /> Left</label>
      <label><input v-model="eye" type="radio" value="right" data-testid="eye-right" /> Right</label>
      <label><input v-model="eye" type="radio" value="both" data-testid="eye-both" /> Both</label>
    </fieldset>
    <fieldset>
      <legend>Test color</legend>
      <label v-for="(label, key) in TEST_COLOR_NAMES" :key="key">
        <input v-model="color" type="radio" :value="key" :data-testid="`color-${key}`" /> {{ label }}
      </label>
    </fieldset>
    <fieldset>
      <legend>Highlight</legend>
      <label><input v-model="displayMode" type="radio" value="cell" data-testid="mode-cell" /> Colored cell (keep looking at the center dot)</label>
      <label><input v-model="displayMode" type="radio" value="label" data-testid="mode-label" /> Coordinate label (e.g. C7)</label>
    </fieldset>
    <fieldset>
      <legend>Order</legend>
      <label><input v-model="order" type="radio" value="random" data-testid="order-random" /> Random</label>
      <label><input v-model="order" type="radio" value="sequential" data-testid="order-sequential" /> Row by row</label>
    </fieldset>
    <fieldset>
      <legend>Cells to test</legend>
      <label><input v-model="scopeType" type="radio" value="full" data-testid="scope-full" /> Full grid ({{ CELL_COUNT }} cells)</label>
      <label>
        <input v-model="scopeType" type="radio" value="region" data-testid="scope-region" /> Region (100 cells):
        <select v-model="region" :disabled="scopeType !== 'region'" data-testid="scope-region-select">
          <option v-for="r in REGIONS" :key="r" :value="r">{{ REGION_NAMES[r] }}</option>
        </select>
      </label>
      <label>
        <input v-model="scopeType" type="radio" value="sample" data-testid="scope-sample" /> Random sample of
        <input
          v-model.number="sampleSize"
          type="number"
          min="1"
          :max="CELL_COUNT"
          class="number"
          :disabled="scopeType !== 'sample'"
          data-testid="scope-sample-n"
        />
        cells
      </label>
      <p v-if="scopeType === 'sample' && !sampleValid" class="field-error">Enter a number from 1 to {{ CELL_COUNT }}.</p>
    </fieldset>
    <label class="name">
      Session name (optional)
      <input v-model="name" type="text" :maxlength="NAME_MAX" placeholder="Generated from eye, color, and time" data-testid="session-name-input" />
      <small>Do not enter your own name or other personal details. Anyone with the link or file can read it.</small>
    </label>
    <button type="submit" class="start" data-testid="start-test">Start test</button>
  </form>
</template>

<style scoped>
.setup {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
fieldset {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border: 1px solid var(--border);
}
.number {
  width: 5rem;
}
.name {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.field-error {
  color: var(--warning);
  margin: 0;
}
.start {
  align-self: flex-start;
  min-height: 3rem;
  font-weight: 600;
}
</style>
