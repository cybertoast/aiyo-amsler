<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Disclaimer from '../components/Disclaimer.vue'
</script>

<template>
  <h1>fit-eyes</h1>
  <p>Interactive experiences on visual perception.</p>
  <Disclaimer />
  <h2>Experiences</h2>
  <ul class="experiences">
    <li><RouterLink to="/amsler">Amsler grid</RouterLink></li>
  </ul>
  <p>
    Before starting, <RouterLink to="/calibrate">calibrate your screen size</RouterLink> with a
    credit card so that sizes on screen match real sizes.
  </p>
</template>
