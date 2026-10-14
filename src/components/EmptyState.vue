<script setup>
defineProps({ icon: { type: String, default: '⌕' }, title: { type: String, default: 'Nothing here yet' }, description: { type: String, default: 'Try changing your filters or come back later.' } })
</script>
<template><div class="empty-state"><div class="empty-state-icon">{{ icon }}</div><strong>{{ title }}</strong><p>{{ description }}</p><slot /></div></template>
