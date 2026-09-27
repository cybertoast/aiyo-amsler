<script setup lang="ts">
import type { Answer } from '../composables/useAmslerTest'

defineProps<{ disabled: boolean }>()
const emit = defineEmits<{ answer: [answer: Answer] }>()

const buttons: { answer: Answer; key: string; label: string }[] = [
  { answer: 'clear', key: '1', label: 'Clear' },
  { answer: 'blurry', key: '2', label: 'Blurry' },
  { answer: 'invisible', key: '3', label: 'Invisible' },
]
</script>

<template>
  <div class="response-pad" role="group" aria-label="How does the highlighted cell look?">
    <button
      v-for="b in buttons"
      :key="b.answer"
      type="button"
      :data-testid="`answer-${b.answer}`"
      :disabled="disabled"
      @click="emit('answer', b.answer)"
    >
      <span class="key">{{ b.key }}</span>
      <span>{{ b.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.response-pad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}
button {
  min-height: 4rem;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--fg);
  background: var(--bg);
  color: var(--fg);
  border-radius: 0.5rem;
}
.key {
  font-size: 0.9rem;
  opacity: 0.7;
}
</style>
