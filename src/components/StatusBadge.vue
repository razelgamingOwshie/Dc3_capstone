<script setup>
const props = defineProps({ status: { type: String, required: true } })
const labels = { pending: 'Pending', reviewing: 'Reviewing', in_progress: 'In Progress', resolved: 'Resolved', rejected: 'Rejected', scheduled: 'Scheduled', completed: 'Completed', cancelled: 'Cancelled', low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent' }
</script>
<template><span class="status-badge" :class="`status-${props.status}`"><span class="status-dot"></span>{{ labels[props.status] || props.status?.replaceAll('_', ' ') }}</span></template>
