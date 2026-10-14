<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from './layouts/DashboardLayout.vue'
import { state } from './services/store.js'

const route = useRoute()
const showLayout = computed(() => route.meta.requiresAuth && route.path !== '/403')
</script>

<template>
  <DashboardLayout v-if="showLayout"><router-view /></DashboardLayout>
  <router-view v-else />
  <div v-if="state.storageError" class="storage-warning" role="alert">
    <strong>Storage warning:</strong> CleanTrack could not save changes in this browser. Check browser storage settings and available space.
  </div>
  <Transition name="toast">
    <div v-if="state.toast" class="toast" :class="`toast--${state.toast.type}`" role="status">
      <span class="toast-mark">{{ state.toast.type === 'error' ? '!' : '✓' }}</span>
      <span>{{ state.toast.message }}</span>
      <button class="toast-close" aria-label="Dismiss message" @click="state.toast = null">×</button>
    </div>
  </Transition>
</template>
