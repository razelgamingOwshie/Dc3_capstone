<script setup>
import { useRouter } from 'vue-router'
import { getCurrentUser } from '../services/store.js'
const router = useRouter()
function goHome() { const user = getCurrentUser(); router.push(user ? (user.role === 'admin' ? '/admin/dashboard' : '/resident/dashboard') : '/login') }
</script>
<template><main class="not-found-page"><div class="not-found-symbol">{{ $route.meta.forbidden ? '⊘' : '404' }}</div><div class="eyebrow">{{ $route.meta.forbidden ? 'ACCESS RESTRICTED' : 'PAGE NOT FOUND' }}</div><h1>{{ $route.meta.forbidden ? 'You do not have access to this page.' : 'Looks like this page wandered off.' }}</h1><p>{{ $route.meta.forbidden ? 'This page is not available for your current demo role.' : 'The page may have moved or the link may be incorrect.' }}</p><button class="button button-primary" @click="goHome">Return to CleanTrack <span>→</span></button></main></template>
