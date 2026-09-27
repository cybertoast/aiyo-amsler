<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ load: [text: string] }>()
const dragging = ref(false)

async function readFile(file: File | undefined): Promise<void> {
  if (file) emit('load', await file.text())
}

function onChange(event: Event): void {
  const input = event.target as HTMLInputElement
  void readFile(input.files?.[0])
  input.value = ''
}

function onDrop(event: DragEvent): void {
  dragging.value = false
  void readFile(event.dataTransfer?.files[0])
}
</script>

<template>
  <label
    class="drop-zone"
    :class="{ dragging }"
    @dragover.prevent="dragging = true"
    @dragleave="dragging = false"
    @drop.prevent="onDrop"
  >
    <span>Open a saved session file (.json): choose a file or drop it here.</span>
    <input type="file" accept=".json,application/json" data-testid="session-file" @change="onChange" />
  </label>
</template>

<style scoped>
.drop-zone {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px dashed var(--border);
}
.dragging {
  border-color: var(--accent);
}
</style>
