<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  CARD_CORNER_MM,
  CARD_HEIGHT_MM,
  CARD_WIDTH_MM,
  MAX_PX_PER_MM,
  MIN_PX_PER_MM,
  pxPerMmFromCardWidth,
} from '../lib/calibration'

const props = defineProps<{ initialPxPerMm: number }>()
const emit = defineEmits<{ save: [pxPerMm: number] }>()

const round = (value: number) => Math.round(value * 10) / 10
const widthPx = ref(round(props.initialPxPerMm * CARD_WIDTH_MM))

const pxPerMm = computed(() => pxPerMmFromCardWidth(widthPx.value))
const cardStyle = computed(() => ({
  width: `${widthPx.value}px`,
  height: `${round(pxPerMm.value * CARD_HEIGHT_MM)}px`,
  borderRadius: `${round(pxPerMm.value * CARD_CORNER_MM)}px`,
}))

function adjust(deltaPx: number): void {
  const min = MIN_PX_PER_MM * CARD_WIDTH_MM
  const max = MAX_PX_PER_MM * CARD_WIDTH_MM
  widthPx.value = round(Math.min(max, Math.max(min, widthPx.value + deltaPx)))
}

function onKeydown(event: KeyboardEvent): void {
  const step = event.shiftKey ? 10 : 1
  if (event.key === 'ArrowRight' || event.key === '+' || event.key === '=') adjust(step)
  else if (event.key === 'ArrowLeft' || event.key === '-') adjust(-step)
  else return
  event.preventDefault()
}
</script>

<template>
  <div class="calibrator" tabindex="0" @keydown="onKeydown">
    <div data-testid="card-outline" class="card" :style="cardStyle" />
    <div class="controls">
      <button type="button" data-testid="narrower-10" @click="adjust(-10)">− 10</button>
      <button type="button" data-testid="narrower-1" @click="adjust(-1)">− 1</button>
      <span class="width" aria-live="polite">{{ widthPx }} px</span>
      <button type="button" data-testid="wider-1" @click="adjust(1)">+ 1</button>
      <button type="button" data-testid="wider-10" @click="adjust(10)">+ 10</button>
    </div>
    <button type="button" class="save" data-testid="save-calibration" @click="emit('save', pxPerMm)">
      Save calibration
    </button>
  </div>
</template>

<style scoped>
.calibrator {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  outline: none;
}
.card {
  border: 2px solid var(--accent);
  box-sizing: border-box;
}
.controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.width {
  min-width: 6rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
</style>
