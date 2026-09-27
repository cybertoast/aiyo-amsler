import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './shared/views/HomeView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/calibrate', name: 'calibrate', component: () => import('./shared/views/CalibrateView.vue') },
    { path: '/amsler', name: 'amsler', component: () => import('./experiences/amsler/views/GridView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
