<script setup lang="ts">
import { computed } from 'vue'
import { CELL_MM, COLUMN_LABELS, GRID_CELLS, GRID_MM, ROW_LABELS, cellName } from '../lib/grid'

export interface GridHighlight {
  cell: number
  /** Any SVG color; 'currentColor' uses the grid foreground. */
  color: string
  mode: 'cell' | 'label'
}

const props = defineProps<{
  pxPerMm: number
  showLabels: boolean
  highlight?: GridHighlight | null
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
/** Two-character labels (A1) use the larger size; three-character labels (O15) must still fit in a 5 mm cell. */
const HIGHLIGHT_FONT_MM = { short: 3.2, long: 2.4 }
const highlightBox = computed(() => {
  if (!props.highlight) return null
  const { cell } = props.highlight
  return {
    x: (cell % GRID_CELLS) * CELL_MM,
    y: Math.floor(cell / GRID_CELLS) * CELL_MM,
    name: cellName(cell),
    fontSize: cellName(cell).length > 2 ? HIGHLIGHT_FONT_MM.long : HIGHLIGHT_FONT_MM.short,
  }
})
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
    <rect
      v-if="highlight && highlightBox && highlight.mode === 'cell'"
      data-testid="highlight-cell"
      :x="highlightBox.x"
      :y="highlightBox.y"
      :width="CELL_MM"
      :height="CELL_MM"
      :fill="highlight.color"
    />
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
    <text
      v-if="highlight && highlightBox && highlight.mode === 'label'"
      data-testid="highlight-label"
      :x="highlightBox.x + CELL_MM / 2"
      :y="highlightBox.y + CELL_MM / 2"
      :font-size="highlightBox.fontSize"
      :fill="highlight.color"
      font-weight="700"
      text-anchor="middle"
      dominant-baseline="central"
    >{{ highlightBox.name }}</text>
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
text:not([data-testid='highlight-label']) {
  fill: currentColor;
}
</style>
