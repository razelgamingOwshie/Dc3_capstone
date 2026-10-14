<script setup>
defineProps({ label: String, value: [String, Number], detail: String, icon: String, tone: { type: String, default: 'green' } })
</script>
<template>
  <article class="stat-card">
    <div class="stat-top"><span class="stat-label">{{ label }}</span><span class="stat-icon" :class="`tone-${tone}`">{{ icon }}</span></div>
    <div class="stat-value">{{ value }}</div>
    <div class="stat-detail">{{ detail }}</div>
  </article>
</template>
