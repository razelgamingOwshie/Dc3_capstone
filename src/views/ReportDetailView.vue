<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { state, areaName, userName, addReport, updateReport, notify } from '../services/store.js'
import StatusBadge from '../components/StatusBadge.vue'
import EmptyState from '../components/EmptyState.vue'
import { formatDateTime, formatDateOnly } from '../utils/date.js'

const route = useRoute(); const router = useRouter(); const { user, isAdmin } = useAuth()
const isCreate = computed(() => Boolean(route.meta.create))
const report = computed(() => state.reports.find((item) => item.id === route.params.id) || null)
const typeLabels = { missed_collection: 'Missed collection', overflowing_garbage: 'Overflowing garbage', illegal_dumping: 'Illegal dumping', damaged_bin: 'Damaged bin', irregular_collection: 'Irregular collection', other: 'Other' }
const form = ref({ type: 'missed_collection', description: '', priority: 'normal' })
const editForm = ref({ status: 'pending', priority: 'normal', resolutionNotes: '', note: '' })
const formError = ref('')
const editFormError = ref('')
watch(report, (item) => { if (item) editForm.value = { status: item.status, priority: item.priority, resolutionNotes: item.resolutionNotes || '', note: '' } }, { immediate: true })
const history = computed(() => state.history.filter((item) => item.reportId === report.value?.id).sort((a, b) => b.timestamp.localeCompare(a.timestamp)))
const canView = computed(() => Boolean(report.value && (isAdmin.value || report.value.areaId === user.value?.areaId)))
function submitReport() {
  formError.value = ''
  if (form.value.description.trim().length < 10) { formError.value = 'Please describe the problem in at least 10 characters.'; return }
  if (form.value.description.trim().length > 600) { formError.value = 'Description must be 600 characters or fewer.'; return }
  const created = addReport(form.value, user.value)
  router.replace(`/resident/reports/${created.id}`)
}
function saveUpdate() {
  if (!report.value) return
  if (editForm.value.resolutionNotes.length > 500 || editForm.value.note.length > 300) { editFormError.value = 'Notes are too long. Please shorten them.'; return }
  editFormError.value = ''
  updateReport(report.value.id, editForm.value, user.value)
  editForm.value.note = ''
}
function backToReports() { router.push(isAdmin.value ? '/admin/reports' : '/resident/reports') }
</script>

<template>
  <template v-if="isCreate">
    <div class="page-heading"><div><div class="eyebrow">COMMUNITY FEEDBACK</div><h1>Submit a garbage report</h1><p>Tell the barangay team about a collection or waste concern in your zone.</p></div><button class="button button-secondary" @click="backToReports">← Back to reports</button></div>
    <div class="detail-layout create-layout"><section class="panel form-panel"><div class="panel-heading"><div><h2>Report details</h2><p>Fields marked with * are required.</p></div><span class="panel-heading-icon">⚑</span></div><form class="form-stack" @submit.prevent="submitReport"><div v-if="formError" class="form-error" role="alert">{{ formError }}</div><label class="field"><span>Problem type <b>*</b></span><select v-model="form.type" required><option value="missed_collection">Missed collection</option><option value="overflowing_garbage">Overflowing garbage</option><option value="illegal_dumping">Illegal dumping</option><option value="damaged_bin">Damaged bin</option><option value="irregular_collection">Irregular collection</option><option value="other">Other</option></select></label><label class="field"><span>Description <b>*</b></span><textarea v-model="form.description" rows="6" maxlength="600" required placeholder="Describe what happened and where in your zone. Please do not include private information."></textarea><small>{{ form.description.length }}/600 characters · At least 10 characters</small></label><label class="field"><span>Priority</span><select v-model="form.priority"><option value="low">Low — minor concern</option><option value="normal">Normal — standard report</option><option value="high">High — needs prompt attention</option><option value="urgent">Urgent — significant issue</option></select></label><div class="form-note"><span>ⓘ</span><p>Your report will be visible to residents in {{ areaName(user?.areaId) }} and to the administrator.</p></div><div class="form-actions"><button type="button" class="button button-secondary" @click="backToReports">Cancel</button><button type="submit" class="button button-primary">Submit report <span>→</span></button></div></form></section><aside class="panel side-info-panel"><div class="illustration-symbol">♻</div><h3>Thank you for helping</h3><p>Reports help organize community concerns and keep track of follow-up actions.</p><div class="mini-step"><span>1</span><div><strong>Submit</strong><small>Share a clear description.</small></div></div><div class="mini-step"><span>2</span><div><strong>Review</strong><small>The admin checks the report.</small></div></div><div class="mini-step"><span>3</span><div><strong>Track</strong><small>Follow status updates in My Reports.</small></div></div></aside></div>
  </template>
  <template v-else-if="canView">
    <div class="page-heading"><div><div class="eyebrow">REPORT DETAILS · {{ report.id }}</div><h1>{{ typeLabels[report.type] }}</h1><p>Submitted {{ formatDateTime(report.createdAt) }}</p></div><button class="button button-secondary" @click="backToReports">← Back to reports</button></div>
    <div class="detail-layout"><div class="detail-main"><section class="panel detail-panel"><div class="detail-status-line"><span>Current status</span><StatusBadge :status="report.status" /></div><div class="detail-description"><h2>Report description</h2><p>{{ report.description }}</p></div><div class="detail-facts"><div><span>Reported by</span><strong>{{ userName(report.userId) }}</strong></div><div><span>Collection zone</span><strong>{{ areaName(report.areaId) }}</strong></div><div><span>Priority</span><StatusBadge :status="report.priority" /></div><div><span>Last updated</span><strong>{{ formatDateTime(report.updatedAt) }}</strong></div></div><div v-if="report.resolutionNotes" class="resolution-box"><strong>Resolution notes</strong><p>{{ report.resolutionNotes }}</p></div></section>
      <section class="panel timeline-panel"><div class="panel-heading"><div><h2>Report history</h2><p>Timeline of recorded status changes and notes.</p></div><span class="panel-heading-icon">◷</span></div><div v-if="history.length" class="timeline"><div v-for="entry in history" :key="entry.id" class="timeline-item"><span class="timeline-point"></span><div class="timeline-content"><div class="timeline-title"><strong>{{ entry.newStatus ? entry.newStatus.replaceAll('_', ' ') : 'Report update' }}</strong><time>{{ formatDateTime(entry.timestamp) }}</time></div><p>{{ entry.note }}</p><small>By {{ userName(entry.actorId) }}</small></div></div></div><EmptyState v-else title="No history available" description="Report updates will appear here." /></section></div>
      <aside v-if="isAdmin" class="panel admin-update-panel"><div class="panel-heading"><div><h2>Update report</h2><p>Admin controls</p></div><span class="panel-heading-icon">⚙</span></div><form class="form-stack" @submit.prevent="saveUpdate"><div v-if="editFormError" class="form-error" role="alert">{{ editFormError }}</div><label class="field"><span>Status</span><select v-model="editForm.status"><option value="pending">Pending</option><option value="reviewing">Reviewing</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="rejected">Rejected</option></select></label><label class="field"><span>Priority</span><select v-model="editForm.priority"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label><label class="field"><span>Resolution notes</span><textarea v-model="editForm.resolutionNotes" rows="4" maxlength="500" placeholder="Add follow-up or resolution details"></textarea></label><label class="field"><span>Update note</span><textarea v-model="editForm.note" rows="3" maxlength="300" placeholder="Optional note for the report history"></textarea></label><button type="submit" class="button button-primary button-full">Save update</button></form></aside>
      <aside v-else class="panel report-help-panel"><div class="help-card-symbol">✳</div><h3>Stay informed</h3><p>Check this page again for the latest status and notes from the administrator.</p><router-link to="/settings" class="text-link">Manage reminders →</router-link></aside></div>
  </template>
  <section v-else class="panel"><EmptyState icon="⌕" title="Report not found or unavailable" description="This report may not exist or may belong to another zone."><button class="button button-primary button-small" @click="backToReports">Back to reports</button></EmptyState></section>
</template>
