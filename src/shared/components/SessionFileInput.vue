<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{ multiple?: boolean }>(), { multiple: false })
const emit = defineEmits<{ load: [text: string] }>()
const dragging = ref(false)

async function readFiles(files: FileList | null | undefined): Promise<void> {
  for (const file of Array.from(files ?? [])) emit('load', await file.text())
}

function onChange(event: Event): void {
  const input = event.target as HTMLInputElement
  void readFiles(input.files)
  input.value = ''
}

function onDrop(event: DragEvent): void {
  dragging.value = false
  void readFiles(event.dataTransfer?.files)
}
</script>

<template>
  <label
    class="drop-zone no-print"
    :class="{ dragging }"
    @dragover.prevent="dragging = true"
    @dragleave="dragging = false"
    @drop.prevent="onDrop"
  >
    <span>Open saved session {{ multiple ? 'files' : 'file' }} (.json): choose or drop here.</span>
    <input type="file" accept=".json,application/json" :multiple="multiple" data-testid="session-file" @change="onChange" />
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
