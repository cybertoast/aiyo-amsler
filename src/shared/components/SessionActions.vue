<script setup lang="ts">
import { ref } from 'vue'
import { downloadText } from '../lib/download'

const props = defineProps<{
  url: string
  fileName: string
  fileContent: string
}>()

const linkInput = ref<HTMLInputElement | null>(null)
const status = ref('')

/** The clipboard API needs a secure context (https or localhost); otherwise select the text for manual copy. */
async function copyLink(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.url)
    status.value = 'Link copied.'
  } catch {
    linkInput.value?.select()
    status.value = 'Copy is not available here. The link is selected: press Ctrl+C or Cmd+C.'
  }
}

function download(): void {
  downloadText(props.fileName, props.fileContent)
  status.value = `Downloaded ${props.fileName}.`
}
</script>

<template>
  <section class="session-actions no-print" aria-label="Save or share this session">
    <label class="link-label" for="share-link">Share link (contains all session data)</label>
    <div class="row">
      <input id="share-link" ref="linkInput" data-testid="share-link" :value="url" readonly @focus="linkInput?.select()" />
      <button type="button" data-testid="copy-link" @click="copyLink">Copy link</button>
    </div>
    <div class="row">
      <button type="button" data-testid="download-session" @click="download">Download file</button>
    </div>
    <p v-if="status" role="status" data-testid="actions-status">{{ status }}</p>
  </section>
</template>

<style scoped>
.session-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.row {
  display: flex;
  gap: 0.5rem;
}
input {
  flex: 1;
  min-width: 0;
  font: inherit;
  padding: 0.25rem 0.5rem;
}
</style>
