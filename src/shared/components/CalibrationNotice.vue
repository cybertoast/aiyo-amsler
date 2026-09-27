<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useCalibration } from '../composables/useCalibration'

const { isCalibrated, pixelRatioChanged } = useCalibration()
</script>

<template>
  <p v-if="!isCalibrated" class="notice" role="status">
    Screen size is not calibrated, so the grid may not be 10 cm wide.
    <RouterLink to="/calibrate">Calibrate</RouterLink>
  </p>
  <p v-else-if="pixelRatioChanged" class="notice" role="status">
    Browser zoom or screen has changed since calibration.
    <RouterLink to="/calibrate">Calibrate again</RouterLink>
  </p>
</template>

<style scoped>
.notice {
  border-left: 4px solid var(--warning);
  padding: 0.5rem 1rem;
}
</style>
