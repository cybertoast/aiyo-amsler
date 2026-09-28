<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Disclaimer from '../../../shared/components/Disclaimer.vue'
import SessionFileInput from '../../../shared/components/SessionFileInput.vue'
import { compareHash, decodePayload, encodePayload, payloadFromLink, payloadsFromHash } from '../../../shared/lib/session-codec'
import ResultsGrid from '../components/ResultsGrid.vue'
import { TEST_COLOR_NAMES } from '../lib/colors'
import { summarizeResponses } from '../lib/results'
import { parseSessionFile, validateSession, type Session } from '../lib/session-schema'

const COMPARE_PATH = '/amsler/compare'

interface Entry {
  payload: string
  session: Session
}

const route = useRoute()
const router = useRouter()
const entries = ref<Entry[]>([])
const errors = ref<string[]>([])
const linkText = ref('')

const sorted = computed(() => [...entries.value].sort((a, b) => Date.parse(a.session.startedAt) - Date.parse(b.session.startedAt)))

async function loadFromHash(hash: string): Promise<void> {
  const loaded: Entry[] = []
  const failed: string[] = []
  for (const payload of new Set(payloadsFromHash(hash))) {
    try {
      loaded.push({ payload, session: validateSession(await decodePayload(payload)) })
    } catch (e) {
      failed.push((e as Error).message)
    }
  }
  entries.value = loaded
  errors.value = failed
}

/** The compare page URL lists every session, so the comparison itself can be shared. */
async function setPayloads(payloads: string[]): Promise<void> {
  await router.replace({ path: COMPARE_PATH, hash: compareHash([...new Set(payloads)]) })
}

async function add(session: Session): Promise<void> {
  await setPayloads([...entries.value.map((e) => e.payload), await encodePayload(session)])
}

async function addLink(): Promise<void> {
  const payload = payloadFromLink(linkText.value)
  if (!payload) {
    errors.value = ['That text is not a fit-eyes share link.']
    return
  }
  try {
    await add(validateSession(await decodePayload(payload)))
    linkText.value = ''
  } catch (e) {
    errors.value = [(e as Error).message]
  }
}

async function addFile(text: string): Promise<void> {
  try {
    await add(parseSessionFile(text))
  } catch (e) {
    errors.value = [(e as Error).message]
  }
}

function countsText(session: Session): string {
  const { tested, counts } = summarizeResponses(session.responses)
  return `${tested} tested: ${counts.clear} clear, ${counts.blurry} blurry, ${counts.invisible} invisible`
}

function remove(payload: string): void {
  void setPayloads(entries.value.filter((e) => e.payload !== payload).map((e) => e.payload))
}

watch(() => route.hash, loadFromHash, { immediate: true })
</script>

<template>
  <h1>Amsler grid: compare sessions</h1>
  <Disclaimer />
  <p v-for="e in errors" :key="e" class="error" role="alert" data-testid="compare-error">{{ e }}</p>

  <section class="add no-print">
    <form class="link-form" @submit.prevent="addLink">
      <input v-model="linkText" type="url" placeholder="Paste a share link" data-testid="compare-link-input" />
      <button type="submit" data-testid="compare-add-link">Add</button>
    </form>
    <SessionFileInput multiple @load="addFile" />
  </section>

  <p v-if="!entries.length">No sessions yet. Add share links or session files.</p>
  <div class="cards">
    <article v-for="entry in sorted" :key="entry.payload" class="card" data-testid="compare-card">
      <h2>{{ entry.session.name }}</h2>
      <p class="meta">
        {{ entry.session.startedAt.slice(0, 16).replace('T', ' ') }} · {{ entry.session.eye }} eye ·
        {{ TEST_COLOR_NAMES[entry.session.color] }}
      </p>
      <ResultsGrid :responses="entry.session.responses" :px-per-mm="2.4" />
      <p data-testid="compare-counts">{{ countsText(entry.session) }}</p>
      <button type="button" class="no-print" @click="remove(entry.payload)">Remove</button>
    </article>
  </div>
</template>

<style scoped>
.add {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.link-form {
  display: flex;
  gap: 0.5rem;
}
.link-form input {
  flex: 1;
  min-width: 0;
  font: inherit;
  padding: 0.25rem 0.5rem;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: 1rem;
}
.card {
  border: 1px solid var(--border);
  padding: 0.75rem;
}
.card h2 {
  font-size: 1rem;
  margin: 0;
  overflow-wrap: anywhere;
}
.meta {
  margin: 0.25rem 0 0.5rem;
  font-size: 0.9rem;
}
.error {
  border-left: 4px solid var(--warning);
  padding: 0.5rem 1rem;
}
</style>
