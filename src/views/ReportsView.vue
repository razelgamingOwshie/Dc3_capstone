<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { state, areaName, userName } from '../services/store.js'
import StatusBadge from '../components/StatusBadge.vue'
import EmptyState from '../components/EmptyState.vue'
import { formatDateOnly } from '../utils/date.js'

const route = useRoute(); const router = useRouter(); const { user, isAdmin } = useAuth()
const search = ref(''); const statusFilter = ref('all'); const typeFilter = ref('all'); const priorityFilter = ref('all'); const areaFilter = ref(isAdmin.value ? 'all' : user.value?.areaId || 'all')
const typeLabels = { missed_collection: 'Missed collection', overflowing_garbage: 'Overflowing garbage', illegal_dumping: 'Illegal dumping', damaged_bin: 'Damaged bin', irregular_collection: 'Irregular collection', other: 'Other' }
const filteredReports = computed(() => state.reports.filter((report) => {
  const zoneAllowed = isAdmin.value ? (areaFilter.value === 'all' || report.areaId === areaFilter.value) : report.areaId === user.value?.areaId
  const matchesStatus = statusFilter.value === 'all' || report.status === statusFilter.value
  const matchesType = typeFilter.value === 'all' || report.type === typeFilter.value
  const matchesPriority = priorityFilter.value === 'all' || report.priority === priorityFilter.value
  const text = `${typeLabels[report.type]} ${report.description} ${areaName(report.areaId)} ${userName(report.userId)}`.toLowerCase()
  return zoneAllowed && matchesStatus && matchesType && matchesPriority && text.includes(search.value.toLowerCase())
}).sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
function openReport(report) { router.push(isAdmin.value ? `/admin/reports/${report.id}` : `/resident/reports/${report.id}`) }
function exportCSV() {
  const columns = ['Report ID', 'Type', 'Area', 'Submitted By', 'Priority', 'Status', 'Description', 'Created At']
  const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const rows = filteredReports.value.map((r) => [r.id, typeLabels[r.type], areaName(r.areaId), userName(r.userId), r.priority, r.status, r.description, r.createdAt])
  const csv = [columns, ...rows].map((row) => row.map(quote).join(',')).join('\r\n')
  if (!rows.length) { alert('No reports to export.'); return }
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a'); link.href = url; link.download = 'cleantrack-reports.csv'; link.click(); URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="page-heading"><div><div class="eyebrow">COMMUNITY FEEDBACK</div><h1>{{ isAdmin ? 'Report management' : 'Community reports' }}</h1><p>{{ isAdmin ? 'Review, prioritize and resolve reports from all sample zones.' : `See reports submitted by residents in ${areaName(user?.areaId)} and follow their progress.` }}</p></div><div class="heading-actions"><button v-if="isAdmin" class="button button-secondary" @click="exportCSV">↓ Export CSV</button><button v-else class="button button-primary" @click="router.push('/resident/reports/new')">＋ Submit report</button></div></div>
  <div class="report-summary-strip"><div><span class="summary-number">{{ filteredReports.length }}</span><span>Matching reports</span></div><div><span class="summary-number">{{ filteredReports.filter(r => r.status === 'pending').length }}</span><span>Pending</span></div><div><span class="summary-number">{{ filteredReports.filter(r => r.status === 'in_progress').length }}</span><span>In progress</span></div><div><span class="summary-number">{{ filteredReports.filter(r => r.status === 'resolved').length }}</span><span>Resolved</span></div></div>
  <section class="panel filter-panel"><div class="filter-row"><label class="search-field"><span>⌕</span><input v-model="search" type="search" placeholder="Search reports..." aria-label="Search reports" /></label><label v-if="isAdmin" class="filter-control"><span>Area</span><select v-model="areaFilter"><option value="all">All zones</option><option v-for="area in state.areas" :key="area.id" :value="area.id">{{ area.name }}</option></select></label><label class="filter-control"><span>Status</span><select v-model="statusFilter"><option value="all">All statuses</option><option value="pending">Pending</option><option value="reviewing">Reviewing</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="rejected">Rejected</option></select></label><label class="filter-control"><span>Report type</span><select v-model="typeFilter"><option value="all">All types</option><option v-for="(label, key) in typeLabels" :key="key" :value="key">{{ label }}</option></select></label><label class="filter-control"><span>Priority</span><select v-model="priorityFilter"><option value="all">All priorities</option><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label></div><div class="filter-bottom"><span class="muted">Showing {{ filteredReports.length }} of {{ isAdmin ? state.reports.length : state.reports.filter(r => r.areaId === user?.areaId).length }} reports</span><button class="clear-filters" @click="search = ''; statusFilter = 'all'; typeFilter = 'all'; priorityFilter = 'all'; areaFilter = isAdmin ? 'all' : user?.areaId">Clear filters</button></div></section>
  <section class="panel table-panel"><div v-if="filteredReports.length" class="table-wrap"><table class="data-table"><thead><tr><th>Report details</th><th>Zone</th><th>Submitted by</th><th>Priority</th><th>Status</th><th>Date submitted</th><th></th></tr></thead><tbody><tr v-for="report in filteredReports" :key="report.id" class="clickable-row" @click="openReport(report)"><td><strong>{{ typeLabels[report.type] }}</strong><small class="table-subtext">{{ report.description }}</small><small class="report-id">{{ report.id }}</small></td><td>{{ areaName(report.areaId) }}</td><td>{{ userName(report.userId) }}<small v-if="report.userId === user?.id" class="table-subtext">You</small></td><td><StatusBadge :status="report.priority" /></td><td><StatusBadge :status="report.status" /></td><td>{{ formatDateOnly(report.createdAt) }}</td><td><button class="table-action" :aria-label="`View report ${report.id}`" @click.stop="openReport(report)">↗</button></td></tr></tbody></table></div><EmptyState v-else icon="⚑" title="No reports match these filters" description="Try clearing some filters or submit a new report." ><button v-if="!isAdmin" class="button button-primary button-small" @click="router.push('/resident/reports/new')">Submit a report</button></EmptyState></section>
  <div class="info-callout"><span>ⓘ</span><p>Reports are visible to residents in the same zone. Please avoid including private information in report descriptions.</p></div>
</template>
