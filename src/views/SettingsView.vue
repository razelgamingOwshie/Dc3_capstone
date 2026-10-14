<script setup>
import { computed, ref, watch } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { state, getSetting, updateSettings, resetDemoData, logAction, notify } from '../services/store.js'
import { useRouter } from 'vue-router'
const { user, isAdmin } = useAuth(); const router = useRouter()
const theme = ref('light'); const remindersEnabled = ref(true); const reminderLead = ref('1'); const defaultScheduleView = ref('list')
watch(user, (value) => { if (value) { theme.value = getSetting(value.id, 'theme', 'light'); remindersEnabled.value = getSetting(value.id, 'remindersEnabled', true); reminderLead.value = String(getSetting(value.id, 'reminderLead', '1')); defaultScheduleView.value = getSetting(value.id, 'defaultScheduleView', 'list') } }, { immediate: true })
const currentTheme = computed(() => theme.value)
function applyTheme(value) {
  theme.value = value
  document.documentElement.dataset.theme = value
}
function save() {
  updateSettings(user.value.id, { theme: theme.value, remindersEnabled: remindersEnabled.value, reminderLead: reminderLead.value, defaultScheduleView: defaultScheduleView.value })
  document.documentElement.dataset.theme = theme.value
  logAction(user.value.id, 'SETTINGS_UPDATED', 'settings', user.value.id, `Theme: ${theme.value}; reminders: ${remindersEnabled.value ? 'on' : 'off'}.`)
  notify('Settings saved.')
}
function toggleReminders() {
  remindersEnabled.value = !remindersEnabled.value
}
function reset() {
  if (!window.confirm('Reset all CleanTrack demo data? This removes local changes and restores the sample accounts, schedules and reports.')) return
  resetDemoData()
  router.push('/login')
}
</script>
<template>
  <div class="page-heading"><div><div class="eyebrow">PREFERENCES</div><h1>Settings</h1><p>Personalize your CleanTrack experience.</p></div></div>
  <div class="settings-layout"><section class="panel settings-panel"><div class="panel-heading"><div><h2>Appearance</h2><p>Choose how the dashboard looks.</p></div><span class="panel-heading-icon">◐</span></div><div class="setting-row"><div><strong>Theme</strong><p>Switch between light and dark display.</p></div><div class="setting-control"><button class="choice-chip" :class="{ selected: currentTheme === 'light' }" @click="applyTheme('light')">☀ Light</button><button class="choice-chip" :class="{ selected: currentTheme === 'dark' }" @click="applyTheme('dark')">☾ Dark</button></div></div><div class="setting-row"><div><strong>Default schedule view</strong><p>Choose how collection events are displayed.</p></div><select v-model="defaultScheduleView" class="setting-select"><option value="list">List</option><option value="calendar">Calendar</option></select></div><div class="panel-heading settings-subheading"><div><h2>Reminders</h2><p>Local in-app collection reminders.</p></div><span class="panel-heading-icon">♧</span></div><div class="setting-row"><div><strong>Collection reminders</strong><p>Show reminders for upcoming collections in your zone.</p></div><button class="switch" :class="{ on: remindersEnabled }" role="switch" :aria-checked="remindersEnabled" aria-label="Toggle collection reminders" @click="toggleReminders"><span></span></button></div><div class="setting-row"><div><strong>Reminder timing</strong><p>Which upcoming collections should create a reminder.</p></div><select v-model="reminderLead" class="setting-select"><option value="0">Same day</option><option value="1">Today and tomorrow</option></select></div><div class="settings-actions"><button class="button button-primary" @click="save">Save preferences</button></div></section>
  <aside class="panel settings-side"><div class="side-info-icon">ⓘ</div><h3>About local data</h3><p>CleanTrack stores demonstration accounts, schedules, reports and preferences in this browser. Clearing site data will remove your changes.</p><div class="settings-side-divider"></div><div class="data-stat"><span>Saved schedules</span><strong>{{ state.schedules.length }}</strong></div><div class="data-stat"><span>Saved reports</span><strong>{{ state.reports.length }}</strong></div><div class="data-stat"><span>Audit entries</span><strong>{{ state.audit.length }}</strong></div><div class="settings-side-divider"></div><span class="role-pill">Schema v{{ state.meta.schemaVersion }}</span></aside></div>
  <section v-if="isAdmin" class="panel danger-zone"><div><div class="danger-heading">Reset demonstration data</div><p>Restore the sample accounts, zones, schedules and reports. All local edits will be removed.</p></div><button class="button button-danger" @click="reset">Reset demo data</button></section>
</template>
