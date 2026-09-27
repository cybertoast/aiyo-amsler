<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useTheme } from './shared/composables/useTheme'

const { theme, toggle } = useTheme()
</script>

<template>
  <header class="site-header">
    <nav>
      <RouterLink to="/">fit-eyes</RouterLink>
      <RouterLink to="/amsler">Amsler grid</RouterLink>
      <RouterLink to="/calibrate">Calibrate</RouterLink>
    </nav>
    <button type="button" data-testid="toggle-theme" @click="toggle">
      {{ theme === 'light' ? 'Dark mode' : 'Light mode' }}
    </button>
  </header>
  <main class="app">
    <RouterView />
  </main>
</template>

<style scoped>
.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  max-width: 48rem;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
}
nav {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
