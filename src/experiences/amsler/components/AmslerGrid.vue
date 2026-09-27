<script setup lang="ts">
import { computed } from 'vue'
import { CELL_MM, COLUMN_LABELS, GRID_CELLS, GRID_MM, ROW_LABELS } from '../lib/grid'

const props = defineProps<{
  pxPerMm: number
  showLabels: boolean
}>()

/** Space for labels, in mm, left of and above the grid. */
const LABEL_MARGIN_MM = 6
const LABEL_FONT_MM = 3
const LINE_MM = 0.3
const DOT_RADIUS_MM = 1.2

const margin = computed(() => (props.showLabels ? LABEL_MARGIN_MM : 0))
const totalMm = computed(() => GRID_MM + margin.value)
const sizePx = computed(() => Math.round(totalMm.value * props.pxPerMm * 1000) / 1000)
const viewBox = computed(() => `${-margin.value} ${-margin.value} ${totalMm.value} ${totalMm.value}`)
const offsets = Array.from({ length: GRID_CELLS + 1 }, (_, i) => i * CELL_MM)
</script>

<template>
  <svg
    class="amsler-grid"
    :width="sizePx"
    :height="sizePx"
    :viewBox="viewBox"
    role="img"
    aria-label="Amsler grid, 20 by 20 squares with a center dot"
  >
    <rect data-testid="grid-area" x="0" y="0" :width="GRID_MM" :height="GRID_MM" class="background" />
    <line
      v-for="x in offsets"
      :key="`v${x}`"
      :x1="x"
      :x2="x"
      y1="0"
      :y2="GRID_MM"
      :stroke-width="LINE_MM"
    />
    <line
      v-for="y in offsets"
      :key="`h${y}`"
      x1="0"
      :x2="GRID_MM"
      :y1="y"
      :y2="y"
      :stroke-width="LINE_MM"
    />
    <circle
      data-testid="fixation-dot"
      :cx="GRID_MM / 2"
      :cy="GRID_MM / 2"
      :r="DOT_RADIUS_MM"
      class="dot"
    />
    <template v-if="showLabels">
      <text
        v-for="(label, i) in COLUMN_LABELS"
        :key="`c${label}`"
        :x="i * CELL_MM + CELL_MM / 2"
        :y="-LABEL_MARGIN_MM / 2"
        :font-size="LABEL_FONT_MM"
        text-anchor="middle"
        dominant-baseline="central"
      >{{ label }}</text>
      <text
        v-for="(label, i) in ROW_LABELS"
        :key="`r${label}`"
        :x="-LABEL_MARGIN_MM / 2"
        :y="i * CELL_MM + CELL_MM / 2"
        :font-size="LABEL_FONT_MM"
        text-anchor="middle"
        dominant-baseline="central"
      >{{ label }}</text>
    </template>
  </svg>
</template>

<style scoped>
.amsler-grid {
  display: block;
  color: var(--grid-fg);
}
.background {
  fill: var(--grid-bg);
}
line {
  stroke: currentColor;
}
.dot,
text {
  fill: currentColor;
}
</style>
