<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AmslerGrid from '../components/AmslerGrid.vue'
import CalibrationNotice from '../../../shared/components/CalibrationNotice.vue'
import { useCalibration } from '../../../shared/composables/useCalibration'
import { readJson, writeJson } from '../../../shared/lib/storage'

const LABELS_KEY = 'fit-eyes.amsler.showLabels'
const { pxPerMm } = useCalibration()
const showLabels = ref(readJson<boolean>(LABELS_KEY) === true)
watch(showLabels, (value) => writeJson(LABELS_KEY, value))
</script>

<template>
  <h1>Amsler grid</h1>
  <CalibrationNotice />
  <ul class="instructions">
    <li>Hold the screen 30–35 cm from your eyes.</li>
    <li>Wear your reading glasses if you normally use them.</li>
    <li>Cover one eye and look at the center dot.</li>
    <li>While looking at the dot, notice whether any lines look wavy, blurry, or missing.</li>
  </ul>
  <p><RouterLink to="/amsler/review">Open a saved session</RouterLink></p>
  <label class="option">
    <input v-model="showLabels" type="checkbox" data-testid="toggle-labels" />
    Show row numbers and column letters
  </label>
  <div class="grid-wrap">
    <AmslerGrid :px-per-mm="pxPerMm" :show-labels="showLabels" />
  </div>
</template>

<style scoped>
.grid-wrap {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
  overflow-x: auto;
}
.option {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
}
</style>
