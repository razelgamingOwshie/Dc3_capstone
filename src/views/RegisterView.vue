<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
const fullName = ref(''); const email = ref(''); const areaId = ref('area-001'); const password = ref(''); const confirmPassword = ref(''); const error = ref('')
const { register, login, state } = useAuth(); const router = useRouter()
function submit() {
  error.value = ''
  if (fullName.value.trim().length < 2) { error.value = 'Enter your full name.'; return }
  if (!email.value.includes('@') || !email.value.includes('.')) { error.value = 'Enter a valid email address.'; return }
  if (password.value.length < 8) { error.value = 'Password must be at least 8 characters.'; return }
  if (password.value !== confirmPassword.value) { error.value = 'Passwords do not match.'; return }
  const result = register({ fullName: fullName.value, email: email.value, password: password.value, areaId: areaId.value })
  if (result.error) { error.value = result.error; return }
  login(email.value, password.value)
  router.push('/resident/dashboard')
}
</script>
<template>
  <main class="auth-page auth-page-register"><div class="auth-left"><router-link to="/login" class="brand auth-brand"><span class="brand-mark">♻</span><span class="brand-copy"><strong>CleanTrack</strong><small>Community care, organized.</small></span></router-link><div class="auth-promo"><div class="auth-eyebrow"><span class="promo-dot"></span> JOIN YOUR COMMUNITY</div><h1>Good habits make a <em>lasting impact.</em></h1><p>Create a demo resident account to view schedules and follow community reports in your assigned zone.</p><div class="promo-feature-list"><span>✓ Local collection schedules</span><span>✓ Community report tracking</span><span>✓ Zone-specific information</span></div><div class="auth-orbit orbit-one"></div><div class="auth-leaf">✳</div></div><div class="auth-left-footer">A student capstone prototype · Fictional sample data</div></div><div class="auth-right"><div class="auth-card-wrap"><div class="auth-mobile-brand"><span class="brand-mark">♻</span><strong>CleanTrack</strong></div><div class="auth-card"><div class="auth-card-heading"><div class="eyebrow">GET STARTED</div><h2>Create a resident account</h2><p>Fill in your details to get started.</p></div><form class="form-stack" @submit.prevent="submit"><div v-if="error" class="form-error" role="alert">{{ error }}</div><label class="field"><span>Full name <b>*</b></span><input v-model="fullName" required maxlength="80" autocomplete="name" placeholder="e.g. Alex Santos" /></label><label class="field"><span>Email address <b>*</b></span><input v-model="email" type="email" required autocomplete="email" placeholder="you@example.com" /></label><label class="field"><span>Assigned zone <b>*</b></span><select v-model="areaId" required><option v-for="area in state.areas.filter(a => a.active)" :key="area.id" :value="area.id">{{ area.name }} — {{ area.description }}</option></select></label><label class="field"><span>Password <b>*</b></span><input v-model="password" type="password" required minlength="8" autocomplete="new-password" placeholder="At least 8 characters" /></label><label class="field"><span>Confirm password <b>*</b></span><input v-model="confirmPassword" type="password" required minlength="8" autocomplete="new-password" placeholder="Enter password again" /></label><div class="form-note"><span>ⓘ</span><p>New accounts are always residents. Admin access is available only through the seeded demo account.</p></div><button class="button button-primary button-full auth-submit" type="submit">Create account <span>→</span></button></form><div class="auth-register-line">Already have an account? <router-link to="/login">Sign in</router-link></div></div><div class="auth-legal">This demo stores account data in this browser. Do not enter real or sensitive information.</div></div></div></main>
</template>
