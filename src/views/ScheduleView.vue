<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { state, areaName, saveSchedule, deleteSchedule, getSetting } from '../services/store.js'
import StatusBadge from '../components/StatusBadge.vue'
import EmptyState from '../components/EmptyState.vue'
import { formatDate, formatDateShort, formatDateDay, formatDateMonth, formatTime, getTodayString, getDateOffset, sortSchedules, isDateCurrentOrFuture } from '../utils/date.js'

const route = useRoute()
const { user, isAdmin } = useAuth()
const isAdminPage = computed(() => isAdmin.value && route.path.startsWith('/admin'))
const search = ref('')
const areaFilter = ref(isAdminPage.value ? 'all' : user.value?.areaId || 'all')
const wasteFilter = ref('all')
const statusFilter = ref('all')
const viewMode = ref(getSetting(user.value?.id, 'defaultScheduleView', 'list'))
const monthCursor = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
const showForm = ref(false)
const editingId = ref(null)
const formError = ref('')
const blankForm = () => ({ areaId: (isAdminPage.value ? (state.areas[0]?.id || '') : user.value?.areaId) || '', wasteType: 'household', date: getTodayString(), startTime: '07:00', endTime: '10:00', status: 'scheduled', notes: '' })
const form = ref(blankForm())
const wasteLabels = { household: 'Household waste', recyclable: 'Recyclables', organic: 'Organic waste', special: 'Special waste' }
const filteredSchedules = computed(() => sortSchedules(state.schedules.filter((item) => {
  const matchesArea = areaFilter.value === 'all' || item.areaId === areaFilter.value
  const matchesWaste = wasteFilter.value === 'all' || item.wasteType === wasteFilter.value
  const matchesStatus = statusFilter.value === 'all' || item.status === statusFilter.value
  const matchesSearch = `${areaName(item.areaId)} ${wasteLabels[item.wasteType]} ${item.notes}`.toLowerCase().includes(search.value.toLowerCase())
  const matchesResidentZone = isAdminPage.value || item.areaId === user.value?.areaId
  return matchesArea && matchesWaste && matchesStatus && matchesSearch && matchesResidentZone
})))
const monthTitle = computed(() => monthCursor.value.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }))
const calendarDays = computed(() => {
  const first = new Date(monthCursor.value.getFullYear(), monthCursor.value.getMonth(), 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start); date.setDate(start.getDate() + index)
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return { date, key: dateKey, inMonth: date.getMonth() === monthCursor.value.getMonth(), events: filteredSchedules.value.filter((item) => item.date === dateKey) }
  })
})
function openCreate() { editingId.value = null; form.value = blankForm(); formError.value = ''; showForm.value = true }
function openEdit(item) { editingId.value = item.id; form.value = { ...item }; formError.value = ''; showForm.value = true }
function save() {
  formError.value = ''
  if (!form.value.areaId || !form.value.date || !form.value.startTime || !form.value.endTime) { formError.value = 'Please complete all required fields.'; return }
  if (form.value.endTime <= form.value.startTime) { formError.value = 'End time must be later than start time.'; return }
  const conflict = state.schedules.some((item) => item.id !== editingId.value && item.areaId === form.value.areaId && item.date === form.value.date && item.status === 'scheduled' && form.value.status === 'scheduled' && form.value.startTime < item.endTime && form.value.endTime > item.startTime)
  if (conflict && !window.confirm('Another scheduled event overlaps in this zone. Save this schedule anyway?')) return
  saveSchedule({ ...form.value }, user.value, editingId.value)
  showForm.value = false
}
function remove(item) {
  if (window.confirm(`Delete the ${wasteLabels[item.wasteType]} schedule for ${formatDate(item.date)}?`)) deleteSchedule(item.id, user.value)
}
function shiftMonth(amount) { monthCursor.value = new Date(monthCursor.value.getFullYear(), monthCursor.value.getMonth() + amount, 1) }
</script>

<template>
  <div class="page-heading"><div><div class="eyebrow">COLLECTION PLANNING</div><h1>{{ isAdminPage ? 'Schedule management' : 'Collection schedule' }}</h1><p>{{ isAdminPage ? 'Create and maintain dated waste collection events for each zone.' : 'Check when different types of waste are collected in your area.' }}</p></div><button v-if="isAdminPage" class="button button-primary" @click="openCreate">＋ Add schedule</button></div>
  <section class="panel filter-panel"><div class="filter-row"><label class="search-field"><span>⌕</span><input v-model="search" type="search" placeholder="Search schedules..." aria-label="Search schedules" /></label><label class="filter-control"><span>Area</span><select v-model="areaFilter" :disabled="!isAdminPage"><option value="all">All zones</option><option v-for="area in state.areas.filter(a => a.active)" :key="area.id" :value="area.id">{{ area.name }}</option></select></label><label class="filter-control"><span>Waste type</span><select v-model="wasteFilter"><option value="all">All types</option><option value="household">Household</option><option value="recyclable">Recyclable</option><option value="organic">Organic</option><option value="special">Special waste</option></select></label><label class="filter-control"><span>Status</span><select v-model="statusFilter"><option value="all">All statuses</option><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label></div><div class="filter-bottom"><span class="muted">{{ filteredSchedules.length }} schedule{{ filteredSchedules.length === 1 ? '' : 's' }} found</span><div class="view-toggle"><button :class="{ selected: viewMode === 'list' }" @click="viewMode = 'list'">☷ List</button><button :class="{ selected: viewMode === 'calendar' }" @click="viewMode = 'calendar'">▦ Calendar</button></div></div></section>

  <section v-if="viewMode === 'list'" class="panel table-panel"><div v-if="filteredSchedules.length" class="table-wrap"><table class="data-table"><thead><tr><th>Date & time</th><th>Collection type</th><th>Area</th><th>Status</th><th>Notes</th><th v-if="isAdminPage">Actions</th></tr></thead><tbody><tr v-for="item in filteredSchedules" :key="item.id"><td><strong>{{ formatDate(item.date) }}</strong><small class="table-subtext">{{ formatTime(item.startTime) }} – {{ formatTime(item.endTime) }}</small></td><td><span class="type-cell-icon">{{ item.wasteType === 'recyclable' ? '♻' : item.wasteType === 'organic' ? '✿' : item.wasteType === 'special' ? '⚠' : '▣' }}</span>{{ wasteLabels[item.wasteType] }}</td><td>{{ areaName(item.areaId) }}</td><td><StatusBadge :status="item.status" /></td><td class="notes-cell">{{ item.notes || '—' }}</td><td v-if="isAdminPage"><div class="table-actions"><button class="mini-action" aria-label="Edit schedule" @click="openEdit(item)">Edit</button><button class="mini-action danger-text" aria-label="Delete schedule" @click="remove(item)">Delete</button></div></td></tr></tbody></table></div><EmptyState v-else icon="▤" title="No schedules found" description="Try another filter or add a collection event." ><button v-if="isAdminPage" class="button button-primary button-small" @click="openCreate">Add schedule</button></EmptyState></section>

  <section v-else class="panel calendar-panel"><div class="calendar-toolbar"><button class="icon-button" aria-label="Previous month" @click="shiftMonth(-1)">←</button><h2>{{ monthTitle }}</h2><button class="icon-button" aria-label="Next month" @click="shiftMonth(1)">→</button><button class="button button-secondary button-small calendar-today" @click="monthCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1); viewMode.value = 'calendar'">Today</button></div><div class="calendar-grid"><div v-for="day in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="day" class="calendar-weekday">{{ day }}</div><div v-for="day in calendarDays" :key="day.key" class="calendar-cell" :class="{ 'other-month': !day.inMonth, 'is-today': day.key === getTodayString() }"><span class="calendar-day-number">{{ day.date.getDate() }}</span><button v-for="event in day.events.slice(0, 2)" :key="event.id" class="calendar-event" :class="`event-${event.wasteType}`" :title="`${wasteLabels[event.wasteType]} · ${areaName(event.areaId)}`" @click="isAdminPage ? openEdit(event) : null">{{ wasteLabels[event.wasteType] }}<small>{{ areaName(event.areaId) }}</small></button><span v-if="day.events.length > 2" class="calendar-more">+{{ day.events.length - 2 }} more</span></div></div><div class="calendar-legend"><span><i class="legend-dot event-household"></i> Household</span><span><i class="legend-dot event-recyclable"></i> Recyclable</span><span><i class="legend-dot event-organic"></i> Organic</span><span><i class="legend-dot event-special"></i> Special</span></div></section>

  <div class="info-callout"><span>ⓘ</span><p>Schedules shown here are sample collection events for the CleanTrack capstone. Confirm actual collection times with your local barangay.</p></div>

  <div v-if="showForm" class="modal-backdrop" @click.self="showForm = false"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="schedule-form-title"><div class="modal-heading"><div><div class="eyebrow">SCHEDULE DETAILS</div><h2 id="schedule-form-title">{{ editingId ? 'Edit schedule' : 'Add collection schedule' }}</h2></div><button class="icon-button" aria-label="Close dialog" @click="showForm = false">×</button></div><form class="form-stack" @submit.prevent="save"><div v-if="formError" class="form-error" role="alert">{{ formError }}</div><div class="form-grid"><label class="field"><span>Collection zone <b>*</b></span><select v-model="form.areaId" required><option v-for="area in state.areas.filter(a => a.active)" :key="area.id" :value="area.id">{{ area.name }} — {{ area.description }}</option></select></label><label class="field"><span>Waste type <b>*</b></span><select v-model="form.wasteType" required><option value="household">Household waste</option><option value="recyclable">Recyclables</option><option value="organic">Organic waste</option><option value="special">Special waste</option></select></label><label class="field"><span>Collection date <b>*</b></span><input v-model="form.date" type="date" required /></label><label class="field"><span>Status</span><select v-model="form.status"><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label><label class="field"><span>Start time <b>*</b></span><input v-model="form.startTime" type="time" required /></label><label class="field"><span>End time <b>*</b></span><input v-model="form.endTime" type="time" required /></label><label class="field field-full"><span>Instructions / notes</span><textarea v-model="form.notes" rows="3" maxlength="300" placeholder="Add collection instructions (optional)"></textarea></label></div><div class="modal-actions"><button type="button" class="button button-secondary" @click="showForm = false">Cancel</button><button type="submit" class="button button-primary">{{ editingId ? 'Save changes' : 'Create schedule' }}</button></div></form></section></div>
</template>
