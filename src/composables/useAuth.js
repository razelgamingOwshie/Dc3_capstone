import { computed } from 'vue'
import { state, getCurrentUser, login as storeLogin, logout as storeLogout, createResident } from '../services/store.js'

export function useAuth() {
  const user = computed(() => getCurrentUser())
  const isAuthenticated = computed(() => Boolean(user.value))
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isResident = computed(() => user.value?.role === 'resident')
  return {
    user, isAuthenticated, isAdmin, isResident,
    login: storeLogin, logout: storeLogout, register: createResident,
    state
  }
}
