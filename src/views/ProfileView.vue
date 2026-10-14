<script setup>
import { computed, ref, watch } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { state, areaName, logAction, notify } from '../services/store.js'
import { formatDateOnly } from '../utils/date.js'
const { user, isAdmin } = useAuth()
const form = ref({ fullName: '', areaId: '' })
const error = ref('')
watch(user, (value) => { if (value) form.value = { fullName: value.fullName, areaId: value.areaId } }, { immediate: true })
const initials = computed(() => form.value.fullName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase())
function save() {
  error.value = ''
  if (form.value.fullName.trim().length < 2) { error.value = 'Please enter your full name.'; return }
  if (!isAdmin.value && !state.areas.some((area) => area.id === form.value.areaId && area.active)) { error.value = 'Please select an available zone.'; return }
  user.value.fullName = form.value.fullName.trim()
  // The assigned zone is fixed after registration in this student demo.
  logAction(user.value.id, 'PROFILE_UPDATED', 'user', user.value.id, 'Updated profile details.')
  notify('Profile updated successfully.')
}
</script>
<template>
  <div class="page-heading"><div><div class="eyebrow">YOUR ACCOUNT</div><h1>My profile</h1><p>Manage your local CleanTrack demo profile.</p></div></div>
  <div class="profile-layout"><section class="panel profile-card"><div class="profile-cover"><span class="cover-symbol">♻</span></div><div class="profile-avatar">{{ initials || 'CT' }}</div><div class="profile-name"><h2>{{ user?.fullName }}</h2><span class="role-pill" :class="{ 'role-admin': isAdmin }">{{ isAdmin ? 'Administrator' : 'Resident' }}</span></div><p class="profile-email">{{ user?.email }}</p><div class="profile-meta"><div><span>Assigned area</span><strong>{{ isAdmin ? 'All zones' : areaName(user?.areaId) }}</strong></div><div><span>Member since</span><strong>{{ formatDateOnly(user?.createdAt) }}</strong></div></div></section>
  <section class="panel profile-edit-panel"><div class="panel-heading"><div><h2>Personal information</h2><p>Changes are saved in this browser.</p></div></div><form class="form-stack" @submit.prevent="save"><div v-if="error" class="form-error" role="alert">{{ error }}</div><label class="field"><span>Full name <b>*</b></span><input v-model="form.fullName" required maxlength="80" /></label><label class="field"><span>Email address</span><input :value="user?.email" disabled /><small>Email cannot be changed in this demo.</small></label><label v-if="!isAdmin" class="field"><span>Assigned zone <b>*</b></span><select v-model="form.areaId" disabled><option v-for="area in state.areas" :key="area.id" :value="area.id">{{ area.name }} — {{ area.description }}</option></select><small>Your zone is assigned during registration and cannot be changed in this demo.</small></label><div class="form-note"><span>ⓘ</span><p>CleanTrack uses simulated local accounts. Do not enter personal or sensitive information.</p></div><button class="button button-primary" type="submit">Save profile</button></form></section></div>
</template>
