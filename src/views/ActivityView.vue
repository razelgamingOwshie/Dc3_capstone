<script setup>
import { computed, ref } from 'vue'
import { state, userName, areaName } from '../services/store.js'
import EmptyState from '../components/EmptyState.vue'
import { formatDateTime } from '../utils/date.js'
const search = ref('')
const actionFilter = ref('all')
const actionLabels = { INITIALIZED_DEMO: 'Demo data initialized', LOGIN: 'Signed in', LOGOUT: 'Signed out', REPORT_CREATED: 'Report submitted', REPORT_STATUS_CHANGED: 'Report status changed', REPORT_UPDATED: 'Report updated', SCHEDULE_CREATED: 'Schedule created', SCHEDULE_UPDATED: 'Schedule updated', SCHEDULE_DELETED: 'Schedule deleted', RESIDENT_REGISTERED: 'Resident registered' }
const entries = computed(() => state.audit.filter((item) => (actionFilter.value === 'all' || item.action === actionFilter.value) && `${actionLabels[item.action] || item.action} ${item.details} ${userName(item.actorId)}`.toLowerCase().includes(search.value.toLowerCase())).sort((a, b) => b.timestamp.localeCompare(a.timestamp)))
function exportCSV() {
  const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const rows = [['Timestamp', 'Actor', 'Action', 'Entity type', 'Entity ID', 'Details'], ...entries.value.map((item) => [item.timestamp, userName(item.actorId), actionLabels[item.action] || item.action, item.entityType, item.entityId, item.details])]
  if (rows.length <= 1) { alert('No activity records to export.'); return }
  const blob = new Blob([rows.map((row) => row.map(quote).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'cleantrack-activity-log.csv'; link.click(); URL.revokeObjectURL(url)
}
</script>
<template>
  <div class="page-heading"><div><div class="eyebrow">SYSTEM HISTORY</div><h1>Activity log</h1><p>Review important actions performed in this local CleanTrack demo.</p></div><button class="button button-secondary" @click="exportCSV">↓ Export log</button></div>
  <section class="panel filter-panel"><div class="filter-row"><label class="search-field"><span>⌕</span><input v-model="search" type="search" placeholder="Search activity..." aria-label="Search activity log" /></label><label class="filter-control"><span>Action type</span><select v-model="actionFilter"><option value="all">All actions</option><option v-for="(label, key) in actionLabels" :key="key" :value="key">{{ label }}</option></select></label></div><div class="filter-bottom"><span class="muted">{{ entries.length }} activity records</span></div></section>
  <section class="panel table-panel"><div v-if="entries.length" class="activity-list"><article v-for="item in entries" :key="item.id" class="activity-row"><div class="activity-icon">{{ item.action.includes('REPORT') ? '⚑' : item.action.includes('SCHEDULE') ? '▤' : '◷' }}</div><div class="activity-body"><div class="activity-title"><strong>{{ actionLabels[item.action] || item.action }}</strong><span>{{ formatDateTime(item.timestamp) }}</span></div><p>{{ item.details || 'No additional details.' }}</p><small>Actor: {{ userName(item.actorId) }} · {{ item.entityType }} · {{ item.entityId }}</small></div></article></div><EmptyState v-else icon="◷" title="No activity found" description="Try changing the search or action filter." /></section>
  <div class="info-callout"><span>ⓘ</span><p>This activity log is stored locally for demonstration and can be modified through browser developer tools. It is not a tamper-proof audit system.</p></div>
</template>
