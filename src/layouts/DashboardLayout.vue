<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useNotifications } from '../composables/useNotifications.js'
import { areaName, logout as logOut, state, getSetting } from '../services/store.js'
import { formatDateTime } from '../utils/date.js'

const route = useRoute()
const router = useRouter()
const { user, isAdmin } = useAuth()
const mobileOpen = ref(false)
const notificationOpen = ref(false)
const { notifications, unreadCount, markRead, generateReminders } = useNotifications(computed(() => user.value?.id))

// Generate reminders when user, schedules, or settings change
const schedulesLength = computed(() => state.schedules.length)
const settingsVersion = computed(() => JSON.stringify(state.settings))
watch([user, schedulesLength, settingsVersion], () => {
  generateReminders()
}, { immediate: true })

watch(user, (value) => { document.documentElement.dataset.theme = value ? getSetting(value.id, 'theme', 'light') : 'light' }, { immediate: true })

const links = computed(() => isAdmin.value ? [
  { label: 'Dashboard', icon: '▦', to: '/admin/dashboard' },
  { label: 'Schedules', icon: '▤', to: '/admin/schedules' },
  { label: 'Reports', icon: '⚑', to: '/admin/reports' },
  { label: 'Activity log', icon: '◷', to: '/admin/activity' }
] : [
  { label: 'Dashboard', icon: '▦', to: '/resident/dashboard' },
  { label: 'Collection schedule', icon: '▤', to: '/resident/schedule' },
  { label: 'Community reports', icon: '⚑', to: '/resident/reports' }
])
const pageTitle = computed(() => route.meta.title || 'CleanTrack')
const initials = computed(() => (user.value?.fullName || 'CT').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase())
function signOut() {
  logOut()
  router.push('/login')
}
const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
  <div class="app-shell" :class="{ 'sidebar-open': mobileOpen }">
    <div v-if="mobileOpen" class="mobile-scrim" @click="mobileOpen = false"></div>
    <aside class="sidebar">
      <router-link class="brand" :to="isAdmin ? '/admin/dashboard' : '/resident/dashboard'" @click="mobileOpen = false">
        <span class="brand-mark">♻</span><span class="brand-copy"><strong>CleanTrack</strong><small>Community care, organized.</small></span>
      </router-link>
      <div class="sidebar-label">WORKSPACE</div>
      <nav class="side-nav" aria-label="Main navigation">
        <router-link v-for="link in links" :key="link.to" :to="link.to" class="nav-link" :class="{ active: route.path === link.to || (link.to.includes('reports') && route.path.includes('reports')) || (link.to.includes('schedules') && route.path.includes('schedules')) }" @click="mobileOpen = false">
          <span class="nav-icon">{{ link.icon }}</span><span>{{ link.label }}</span>
          <span v-if="link.label.includes('Reports') && isAdmin && state.reports.some(r => r.status === 'pending')" class="nav-count">{{ state.reports.filter(r => r.status === 'pending').length }}</span>
        </router-link>
      </nav>
      <div class="sidebar-label sidebar-label--lower">PERSONAL</div>
      <nav class="side-nav">
        <router-link to="/profile" class="nav-link" @click="mobileOpen = false"><span class="nav-icon">◎</span><span>My profile</span></router-link>
        <router-link to="/settings" class="nav-link" @click="mobileOpen = false"><span class="nav-icon">⚙</span><span>Settings</span></router-link>
      </nav>
      <div class="sidebar-bottom">
        <div class="help-card"><span class="help-icon">✳</span><strong>Keep your area clean</strong><p>Small actions make a healthier community.</p></div>
        <button class="nav-link logout-link" @click="signOut"><span class="nav-icon">↪</span><span>Sign out</span></button>
        <div class="sidebar-foot">CLEANTRACK · DEMO VERSION</div>
      </div>
    </aside>

    <div class="main-column">
      <header class="topbar">
        <button class="mobile-menu icon-button" aria-label="Open navigation" @click="mobileOpen = !mobileOpen">☰</button>
        <div class="breadcrumbs"><span>CleanTrack</span><span class="crumb-separator">/</span><strong>{{ pageTitle }}</strong></div>
        <div class="topbar-actions">
          <div class="notification-wrap">
            <button class="icon-button notification-button" aria-label="Notifications" :aria-expanded="notificationOpen" @click="notificationOpen = !notificationOpen">♧<span v-if="unreadCount" class="notification-dot"></span></button>
            <div v-if="notificationOpen" class="notification-popover">
              <div class="popover-heading"><strong>Notifications</strong><span class="muted">{{ unreadCount }} unread</span></div>
              <div v-if="!notifications.length" class="empty-mini">You're all caught up.</div>
              <button v-for="note in notifications.slice(0, 6)" :key="note.id" class="notification-item" :class="{ unread: !note.read }" @click="markRead(note.id)">
                <span class="notification-item-icon">{{ note.type === 'collection_reminder' ? '▤' : '•' }}</span><span><strong>{{ note.title }}</strong><small>{{ note.message }}</small><em>{{ formatDateTime(note.createdAt) }}</em></span>
              </button>
            </div>
          </div>
          <div class="top-user"><div class="avatar">{{ initials }}</div><div class="top-user-copy"><strong>{{ user?.fullName }}</strong><small>{{ isAdmin ? 'Administrator' : areaName(user?.areaId) }}</small></div></div>
        </div>
      </header>
      <main class="page-content"><router-view /></main>
      <footer class="app-footer"><span>© {{ currentYear }} CleanTrack</span><span>Student capstone prototype · Local data only</span></footer>
    </div>
  </div>
</template>
