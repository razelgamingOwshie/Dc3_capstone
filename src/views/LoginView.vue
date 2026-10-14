<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const email = ref('resident@cleantrack.demo')
const password = ref('Resident123!')
const error = ref('')
const { login } = useAuth()
const route = useRoute(); const router = useRouter()
function fillResident() { email.value = 'resident@cleantrack.demo'; password.value = 'Resident123!'; error.value = '' }
function fillAdmin() { email.value = 'admin@cleantrack.demo'; password.value = 'Admin123!'; error.value = '' }
function submit() {
  error.value = ''
  if (!email.value.trim() || !password.value) { error.value = 'Enter your email and password to continue.'; return }
  const result = login(email.value, password.value)
  if (result.error) { error.value = result.error; return }
  const fallback = result.user.role === 'admin' ? '/admin/dashboard' : '/resident/dashboard'
  const requested = typeof route.query.redirect === 'string' ? route.query.redirect : fallback
  const safeRedirect = requested.startsWith('/') && !requested.startsWith('//') ? requested : fallback
  router.push(safeRedirect)
}
</script>
<template>
  <main class="auth-page"><div class="auth-left"><router-link to="/login" class="brand auth-brand"><span class="brand-mark">♻</span><span class="brand-copy"><strong>CleanTrack</strong><small>Community care, organized.</small></span></router-link><div class="auth-promo"><div class="auth-eyebrow"><span class="promo-dot"></span> SMARTER COMMUNITY SERVICES</div><h1>A cleaner community starts with <em>you.</em></h1><p>Know your collection schedule, report waste concerns, and stay informed about your neighborhood.</p><div class="promo-stats"><div><strong>01</strong><span>Check schedules</span></div><div><strong>02</strong><span>Report concerns</span></div><div><strong>03</strong><span>Track progress</span></div></div><div class="auth-orbit orbit-one"></div><div class="auth-orbit orbit-two"></div><div class="auth-leaf">♻</div></div><div class="auth-left-footer">A student capstone prototype · Fictional sample data</div></div>
  <div class="auth-right"><div class="auth-card-wrap"><div class="auth-mobile-brand"><span class="brand-mark">♻</span><strong>CleanTrack</strong></div><div class="auth-card"><div class="auth-card-heading"><div class="eyebrow">WELCOME BACK</div><h2>Sign in to CleanTrack</h2><p>Enter your demo account details to continue.</p></div><form class="form-stack" @submit.prevent="submit"><div v-if="error" class="form-error" role="alert">{{ error }}</div><label class="field"><span>Email address</span><div class="input-with-icon"><span>✉</span><input v-model="email" type="email" autocomplete="username" required placeholder="you@example.com" /></div></label><label class="field"><span>Password</span><div class="input-with-icon"><span>⌑</span><input v-model="password" type="password" autocomplete="current-password" required placeholder="Enter your password" /></div></label><button class="button button-primary button-full auth-submit" type="submit">Sign in <span>→</span></button></form><div class="demo-accounts"><div class="demo-accounts-heading"><strong>Quick demo access</strong><span>For presentation</span></div><button class="demo-account" type="button" @click="fillResident"><span class="demo-account-avatar resident-avatar">R</span><span><strong>Resident account</strong><small>resident@cleantrack.demo</small></span><span class="demo-use">Use →</span></button><button class="demo-account" type="button" @click="fillAdmin"><span class="demo-account-avatar admin-avatar">A</span><span><strong>Administrator account</strong><small>admin@cleantrack.demo</small></span><span class="demo-use">Use →</span></button></div><div class="auth-register-line">New to CleanTrack? <router-link to="/register">Create a resident account</router-link></div></div><div class="auth-legal">By signing in, you acknowledge this is a local demonstration app. Do not use real or sensitive information.</div></div></div></main>
</template>
