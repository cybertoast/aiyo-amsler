<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Disclaimer from '../../../shared/components/Disclaimer.vue'
import SessionActions from '../../../shared/components/SessionActions.vue'
import SessionFileInput from '../../../shared/components/SessionFileInput.vue'
import { decodePayload, encodePayload, payloadFromHash, PAYLOAD_PARAM, shareUrl } from '../../../shared/lib/session-codec'
import { summarizeResponses } from '../lib/results'
import { parseSessionFile, sessionFileName, sessionToFileJson, validateSession, type Session } from '../lib/session-schema'

const REVIEW_PATH = '/amsler/review'

const route = useRoute()
const router = useRouter()
const session = ref<Session | null>(null)
const url = ref('')
const error = ref('')

const summary = computed(() => (session.value ? summarizeResponses(session.value.responses) : null))
const scopeText = computed(() => {
  const scope = session.value?.scope
  if (!scope) return ''
  if (scope.type === 'full') return 'Full grid'
  if (scope.type === 'region') return scope.region === 'center' ? 'Central 10×10' : `Quadrant ${scope.region}`
  return `Random sample of ${scope.n} cells`
})

async function show(value: Session): Promise<void> {
  const payload = await encodePayload(value)
  session.value = value
  url.value = shareUrl(window.location.origin, REVIEW_PATH, payload)
  error.value = ''
  if (payloadFromHash(route.hash) !== payload) {
    await router.replace({ path: REVIEW_PATH, hash: `#${PAYLOAD_PARAM}=${payload}` })
  }
}

async function loadFromHash(hash: string): Promise<void> {
  const payload = payloadFromHash(hash)
  if (!payload) return
  try {
    await show(validateSession(await decodePayload(payload)))
  } catch (e) {
    session.value = null
    error.value = (e as Error).message
  }
}

async function loadFromFile(text: string): Promise<void> {
  try {
    await show(parseSessionFile(text))
  } catch (e) {
    error.value = (e as Error).message
  }
}

watch(() => route.hash, loadFromHash, { immediate: true })
</script>

<template>
  <h1>Amsler grid: review</h1>
  <Disclaimer />
  <p v-if="error" class="error" role="alert" data-testid="load-error">{{ error }}</p>

  <template v-if="session && summary">
    <h2 data-testid="session-name">{{ session.name }}</h2>
    <dl class="details">
      <dt>Started</dt><dd>{{ session.startedAt }}</dd>
      <template v-if="session.completedAt"><dt>Completed</dt><dd>{{ session.completedAt }}</dd></template>
      <dt>Eye</dt><dd data-testid="session-eye">{{ session.eye }}</dd>
      <dt>Color</dt><dd>{{ session.color }} ({{ session.theme }} theme)</dd>
      <dt>Display</dt><dd>{{ session.displayMode === 'cell' ? 'Colored cell' : 'Coordinate label' }}, {{ session.order }} order</dd>
      <dt>Scope</dt><dd>{{ scopeText }}</dd>
      <template v-if="session.bloodPressure">
        <dt>Blood pressure</dt>
        <dd>
          {{ session.bloodPressure.systolic }}/{{ session.bloodPressure.diastolic }} mmHg<template
            v-if="session.bloodPressure.pulse">, pulse {{ session.bloodPressure.pulse }}</template>,
          taken {{ session.bloodPressure.takenAt }}
        </dd>
      </template>
    </dl>

    <h3>Responses</h3>
    <p data-testid="response-counts">
      {{ summary.tested }} cells tested: {{ summary.counts.clear }} clear, {{ summary.counts.blurry }} blurry,
      {{ summary.counts.invisible }} invisible.
    </p>
    <p v-if="summary.blurry.length">Blurry: {{ summary.blurry.join(', ') }}</p>
    <p v-if="summary.invisible.length">Invisible: {{ summary.invisible.join(', ') }}</p>
    <template v-if="session.notes">
      <h3>Notes</h3>
      <p class="notes">{{ session.notes }}</p>
    </template>

    <h3>Save or share</h3>
    <SessionActions :url="url" :file-name="sessionFileName(session)" :file-content="sessionToFileJson(session, url)" />
  </template>

  <p v-else-if="!error">No session loaded. Open a share link, or open a saved file below.</p>

  <h3>Open another session</h3>
  <SessionFileInput @load="loadFromFile" />
</template>

<style scoped>
.details {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 1rem;
}
.details dt {
  font-weight: 600;
}
.details dd {
  margin: 0;
}
.error {
  border-left: 4px solid var(--warning);
  padding: 0.5rem 1rem;
}
.notes {
  white-space: pre-wrap;
}
</style>
