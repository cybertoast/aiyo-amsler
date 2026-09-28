<script setup lang="ts">
import AmslerGrid from './AmslerGrid.vue'

withDefaults(defineProps<{ responses: string; pxPerMm?: number }>(), { pxPerMm: 3.2 })
</script>

<template>
  <figure class="results">
    <AmslerGrid :px-per-mm="pxPerMm" :show-labels="true" :results="responses" />
    <figcaption class="legend">
      <span><i class="swatch clear" /> Clear</span>
      <span><i class="swatch blurry" /> Blurry (striped)</span>
      <span><i class="swatch invisible" /> Invisible</span>
      <span><i class="swatch untested" /> Not tested</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.results {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.9rem;
}
.swatch {
  display: inline-block;
  width: 0.9rem;
  height: 0.9rem;
  vertical-align: middle;
  border: 1px solid var(--fg);
}
.clear {
  background: var(--result-clear);
}
.blurry {
  background: repeating-linear-gradient(45deg, var(--result-blurry) 0 2px, var(--result-blurry-bg) 2px 5px);
}
.invisible {
  background: var(--result-invisible);
}
.untested {
  background: var(--grid-bg);
}
</style>
