<script setup lang="ts">
import { ref } from 'vue'
import CardCalibrator from '../components/CardCalibrator.vue'
import { useCalibration } from '../composables/useCalibration'

const { pxPerMm, isCalibrated, save, reset } = useCalibration()
const savedMessage = ref('')
const calibratorKey = ref(0)

function onSave(value: number): void {
  save(value)
  savedMessage.value = `Saved: ${value.toFixed(3)} px per mm.`
}

function onReset(): void {
  reset()
  savedMessage.value = 'Calibration removed.'
  calibratorKey.value++
}
</script>

<template>
  <h1>Calibrate screen size</h1>
  <p>
    Hold a credit card (or any ID-1 size card) flat against the screen, with its top-left corner on
    the top-left corner of the outline. Adjust until the outline matches the card width. Use the
    buttons, or click the outline area and use the arrow keys (Shift for steps of 10).
  </p>
  <p>Calibrate again after changing browser zoom or moving to another screen.</p>
  <CardCalibrator :key="calibratorKey" :initial-px-per-mm="pxPerMm" @save="onSave" />
  <p v-if="savedMessage" role="status">{{ savedMessage }}</p>
  <p v-if="isCalibrated">
    <button type="button" @click="onReset">Remove calibration</button>
  </p>
</template>
