<script setup>
import { computed } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { state, areaName, userName } from '../services/store.js'
import StatCard from '../components/StatCard.vue'
import StatusBadge from '../components/StatusBadge.vue'
import EmptyState from '../components/EmptyState.vue'
import { useRouter } from 'vue-router'
import { formatDate, formatDateShort, formatDateDay, formatDateMonth, formatDateOnly, formatTime, getTodayString, sortSchedules } from '../utils/date.js'

const router = useRouter()
const { user, isAdmin } = useAuth()
const todayString = getTodayString()
const scopedReports = computed(() => isAdmin.value ? state.reports : state.reports.filter((report) => report.areaId === user.value?.areaId))
const scopedSchedules = computed(() => sortSchedules(state.schedules.filter((item) => item.status === 'scheduled' && (isAdmin.value || item.areaId === user.value?.areaId))))
const upcoming = computed(() => scopedSchedules.value.filter((item) => item.date >= todayString).slice(0, 5))
const pending = computed(() => scopedReports.value.filter((report) => ['pending', 'reviewing', 'in_progress'].includes(report.status)).length)
const resolved = computed(() => scopedReports.value.filter((report) => report.status === 'resolved').length)
const rate = computed(() => scopedReports.value.length ? Math.round(resolved.value / scopedReports.value.length * 100) : 0)
const categoryStats = computed(() => {
  const labels = { missed_collection: 'Missed collection', overflowing_garbage: 'Overflowing garbage', illegal_dumping: 'Illegal dumping', damaged_bin: 'Damaged bin', irregular_collection: 'Irregular collection', other: 'Other' }
  const counts = Object.keys(labels).map((key) => ({ key, label: labels[key], count: scopedReports.value.filter((report) => report.type === key).length }))
  const max = Math.max(1, ...counts.map((item) => item.count))
  return counts.filter((item) => item.count > 0).map((item) => ({ ...item, width: `${Math.max(8, item.count / max * 100)}%` })).sort((a, b) => b.count - a.count)
})
const recentReports = computed(() => [...scopedReports.value].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4))
const greeting = computed(() => { const hour = new Date().getHours(); return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening' })
const wasteLabels = { household: 'Household waste', recyclable: 'Recyclables', organic: 'Organic waste', special: 'Special waste' }
const reportLabels = { missed_collection: 'Missed collection', overflowing_garbage: 'Overflowing garbage', illegal_dumping: 'Illegal dumping', damaged_bin: 'Damaged bin', irregular_collection: 'Irregular collection', other: 'Other' }
</script>

<template>
  <div class="page-heading"><div><div class="eyebrow">{{ isAdmin ? 'ADMIN WORKSPACE' : 'RESIDENT WORKSPACE' }}</div><h1>{{ greeting }}, {{ user?.fullName.split(' ')[0] }} <span class="heading-wave">✳</span></h1><p>{{ isAdmin ? 'Here is the latest overview of collection activity and community reports.' : 'Here is what is happening with collection in your community.' }}</p></div><button v-if="!isAdmin" class="button button-primary" @click="router.push('/resident/reports/new')"><span>＋</span> Submit a report</button><button v-else class="button button-primary" @click="router.push('/admin/schedules')"><span>＋</span> Add schedule</button></div>
  <div class="notice-banner"><div class="notice-icon">♻</div><div><strong>Cleaner spaces start with good information.</strong><p>{{ isAdmin ? 'Keep schedules current and follow up on reports that need attention.' : `Your current collection area is ${areaName(user?.areaId)}. Check the schedule before putting waste out.` }}</p></div><span class="notice-decoration">✳</span></div>

  <section class="stats-grid">
    <StatCard :label="isAdmin ? 'Total reports' : 'Reports in your zone'" :value="scopedReports.length" detail="All recorded reports" icon="⚑" tone="green" />
    <StatCard label="Needs attention" :value="pending" detail="Pending, reviewing or in progress" icon="◷" tone="orange" />
    <StatCard label="Resolved reports" :value="resolved" detail="Marked as resolved" icon="✓" tone="blue" />
    <StatCard label="Resolution rate" :value="`${rate}%`" detail="Resolved / total reports" icon="↗" tone="purple" />
  </section>

  <div class="dashboard-grid">
    <section class="panel upcoming-panel">
      <div class="panel-heading"><div><h2>Upcoming collections</h2><p>{{ isAdmin ? 'Across all sample zones' : `Scheduled for ${areaName(user?.areaId)}` }}</p></div><router-link :to="isAdmin ? '/admin/schedules' : '/resident/schedule'" class="text-link">View schedule <span>→</span></router-link></div>
      <div v-if="upcoming.length" class="collection-list">
        <div v-for="item in upcoming" :key="item.id" class="collection-row"><div class="date-tile"><strong>{{ formatDateDay(item.date) }}</strong><small>{{ formatDateMonth(item.date) }}</small></div><div class="collection-info"><strong>{{ wasteLabels[item.wasteType] }}</strong><span>{{ areaName(item.areaId) }} · {{ formatTime(item.startTime) }}–{{ formatTime(item.endTime) }}</span></div><StatusBadge :status="item.status" /></div>
      </div>
      <EmptyState v-else icon="▤" title="No upcoming collections" description="No scheduled events were found for this view." />
    </section>
    <section class="panel category-panel"><div class="panel-heading"><div><h2>Reports by category</h2><p>Distribution of community concerns</p></div><span class="panel-heading-icon">▥</span></div><div v-if="categoryStats.length" class="bar-chart"><div v-for="item in categoryStats" :key="item.key" class="bar-row"><div class="bar-label"><span>{{ item.label }}</span><strong>{{ item.count }}</strong></div><div class="bar-track"><div class="bar-fill" :style="{ width: item.width }"></div></div></div></div><EmptyState v-else icon="▥" title="No report data" description="Category statistics will appear after reports are submitted." /></section>
  </div>

  <section class="panel recent-panel"><div class="panel-heading"><div><h2>Recent reports</h2><p>{{ isAdmin ? 'Latest reports from all zones' : 'Latest reports from your zone' }}</p></div><router-link :to="isAdmin ? '/admin/reports' : '/resident/reports'" class="text-link">View all <span>→</span></router-link></div><div v-if="recentReports.length" class="table-wrap"><table class="data-table"><thead><tr><th>Report</th><th>Location</th><th>Submitted by</th><th>Date submitted</th><th>Status</th><th></th></tr></thead><tbody><tr v-for="report in recentReports" :key="report.id"><td><strong>{{ reportLabels[report.type] }}</strong><small class="table-subtext">{{ report.description }}</small></td><td>{{ areaName(report.areaId) }}</td><td>{{ userName(report.userId) }}</td><td>{{ formatDateOnly(report.createdAt) }}</td><td><StatusBadge :status="report.status" /></td><td><router-link class="table-action" :to="isAdmin ? `/admin/reports/${report.id}` : `/resident/reports/${report.id}`" :aria-label="`Open ${report.id}`">↗</router-link></td></tr></tbody></table></div><EmptyState v-else title="No reports yet" description="Community reports will appear here." /></section>
  <div class="demo-footnote"><span class="demo-dot"></span> Demo data is stored in this browser only. It is not connected to a real barangay collection service.</div>
</template>
