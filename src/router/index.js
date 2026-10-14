import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from '../services/store.js'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import ScheduleView from '../views/ScheduleView.vue'
import ReportsView from '../views/ReportsView.vue'
import ReportDetailView from '../views/ReportDetailView.vue'
import ActivityView from '../views/ActivityView.vue'
import ProfileView from '../views/ProfileView.vue'
import SettingsView from '../views/SettingsView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const routes = [
  { path: '/', redirect: () => { const user = getCurrentUser(); return user ? (user.role === 'admin' ? '/admin/dashboard' : '/resident/dashboard') : '/login' } },
  { path: '/login', component: LoginView, meta: { guestOnly: true } },
  { path: '/register', component: RegisterView, meta: { guestOnly: true } },
  { path: '/resident/dashboard', component: DashboardView, meta: { requiresAuth: true, role: 'resident', title: 'Dashboard' } },
  { path: '/admin/dashboard', component: DashboardView, meta: { requiresAuth: true, role: 'admin', title: 'Dashboard' } },
  { path: '/resident/schedule', component: ScheduleView, meta: { requiresAuth: true, role: 'resident', title: 'Collection Schedule' } },
  { path: '/admin/schedules', component: ScheduleView, meta: { requiresAuth: true, role: 'admin', title: 'Schedule Management' } },
  { path: '/resident/reports', component: ReportsView, meta: { requiresAuth: true, role: 'resident', title: 'Community Reports' } },
  { path: '/resident/reports/new', component: ReportDetailView, meta: { requiresAuth: true, role: 'resident', title: 'Submit a Report', create: true } },
  { path: '/resident/reports/:id', component: ReportDetailView, meta: { requiresAuth: true, role: 'resident', title: 'Report Details' } },
  { path: '/admin/reports', component: ReportsView, meta: { requiresAuth: true, role: 'admin', title: 'Report Management' } },
  { path: '/admin/reports/:id', component: ReportDetailView, meta: { requiresAuth: true, role: 'admin', title: 'Manage Report' } },
  { path: '/admin/activity', component: ActivityView, meta: { requiresAuth: true, role: 'admin', title: 'Activity Log' } },
  { path: '/profile', component: ProfileView, meta: { requiresAuth: true, title: 'My Profile' } },
  { path: '/settings', component: SettingsView, meta: { requiresAuth: true, title: 'Settings' } },
  { path: '/403', component: NotFoundView, meta: { title: 'Access denied', forbidden: true } },
  { path: '/:pathMatch(.*)*', component: NotFoundView, meta: { title: 'Page not found' } }
]

const router = createRouter({ history: createWebHistory(), routes, scrollBehavior: () => ({ top: 0 }) })
router.beforeEach((to) => {
  const user = getCurrentUser()
  if (to.meta.guestOnly && user) return user.role === 'admin' ? '/admin/dashboard' : '/resident/dashboard'
  if (to.meta.requiresAuth && !user) return { path: '/login', query: { redirect: to.fullPath } }
  if (to.meta.role && user && user.role !== to.meta.role) return '/403'
  if (to.path === '/403' && !user) return '/login'
  return true
})
export default router
