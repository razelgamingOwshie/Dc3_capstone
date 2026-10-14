import { reactive, watch } from 'vue'
import {
  seedAreas, seedUsers, seedSchedules, seedReports,
  seedReportHistory, seedAuditLogs, seedNotifications
} from '../data/seedData.js'

const KEYS = {
  meta: 'cleantrack:meta', users: 'cleantrack:users', areas: 'cleantrack:areas',
  schedules: 'cleantrack:schedules', reports: 'cleantrack:reports',
  history: 'cleantrack:report-history', audit: 'cleantrack:audit-logs',
  notifications: 'cleantrack:notifications', settings: 'cleantrack:settings', session: 'cleantrack:session'
}

const clone = (value) => JSON.parse(JSON.stringify(value))
const makeId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return clone(fallback)
    const parsed = JSON.parse(raw)
    return parsed ?? clone(fallback)
  } catch (error) {
    console.warn(`CleanTrack could not read ${key}. Using a safe fallback.`, error)
    return clone(fallback)
  }
}

// Simple debounce utility
function debounce(fn, delay = 150) {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

function initialData() {
  const meta = readJSON(KEYS.meta, null)
  const firstLaunch = !meta || meta.schemaVersion !== 1
  return {
    meta: { schemaVersion: 1, initializedAt: meta?.initializedAt || new Date().toISOString() },
    users: firstLaunch ? clone(seedUsers) : readJSON(KEYS.users, clone(seedUsers)),
    areas: firstLaunch ? clone(seedAreas) : readJSON(KEYS.areas, clone(seedAreas)),
    schedules: firstLaunch ? clone(seedSchedules) : readJSON(KEYS.schedules, clone(seedSchedules)),
    reports: firstLaunch ? clone(seedReports) : readJSON(KEYS.reports, clone(seedReports)),
    history: firstLaunch ? clone(seedReportHistory) : readJSON(KEYS.history, clone(seedReportHistory)),
    audit: firstLaunch ? clone(seedAuditLogs) : readJSON(KEYS.audit, clone(seedAuditLogs)),
    notifications: firstLaunch ? clone(seedNotifications) : readJSON(KEYS.notifications, clone(seedNotifications)),
    settings: readJSON(KEYS.settings, {}),
    session: readJSON(KEYS.session, null),
    storageError: false,
    toast: null
  }
}

export const state = reactive(initialData())
let toastTimer

function persist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    state.storageError = false
  } catch (error) {
    console.error(`CleanTrack could not save ${key}.`, error)
    state.storageError = true
  }
}

const keyPairs = [
  ['meta', KEYS.meta], ['users', KEYS.users], ['areas', KEYS.areas],
  ['schedules', KEYS.schedules], ['reports', KEYS.reports], ['history', KEYS.history],
  ['audit', KEYS.audit], ['notifications', KEYS.notifications], ['settings', KEYS.settings], ['session', KEYS.session]
]
keyPairs.forEach(([property, key]) => {
  const debouncedPersist = debounce((value) => persist(key, value), 150)
  watch(() => state[property], debouncedPersist, { deep: true })
  // Persist the initialized or recovered state immediately so first-launch seed data survives refresh.
  persist(key, state[property])
})

export function notify(message, type = 'success') {
  state.toast = { id: makeId('toast'), message, type }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { state.toast = null }, 3200)
}

export function logAction(actorId, action, entityType, entityId, details = '') {
  state.audit.unshift({ id: makeId('audit'), actorId: actorId || 'system', action, entityType, entityId, details, timestamp: new Date().toISOString() })
  if (state.audit.length > 500) state.audit.length = 500
}

export function areaName(areaId) {
  return state.areas.find((area) => area.id === areaId)?.name || 'Unknown area'
}

export function userName(userId) {
  return state.users.find((user) => user.id === userId)?.fullName || 'Unknown user'
}

export function getSetting(userId, key, fallback = false) {
  return state.settings[userId]?.[key] ?? fallback
}

export function updateSettings(userId, changes) {
  state.settings[userId] = { ...(state.settings[userId] || {}), ...changes }
}

export function addReport(payload, actor) {
  const report = {
    id: makeId('rep'), userId: actor.id, areaId: actor.areaId,
    type: payload.type, description: payload.description.trim(), priority: payload.priority || 'normal',
    status: 'pending', resolutionNotes: '', createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(), resolvedAt: null
  }
  state.reports.unshift(report)
  state.history.unshift({ id: makeId('hist'), reportId: report.id, actorId: actor.id, oldStatus: null, newStatus: 'pending', note: 'Report submitted.', timestamp: report.createdAt })
  logAction(actor.id, 'REPORT_CREATED', 'report', report.id, `Submitted ${report.type} report in ${areaName(report.areaId)}.`)
  notify('Your garbage report was submitted successfully.')
  return report
}

export function updateReport(reportId, changes, actor) {
  const report = state.reports.find((item) => item.id === reportId)
  if (!report) return false
  const oldStatus = report.status
  const nextStatus = changes.status ?? oldStatus
  
  // Validate status transitions
  const validTransitions = {
    pending: ['reviewing', 'in_progress', 'resolved', 'rejected'],
    reviewing: ['pending', 'in_progress', 'resolved', 'rejected'],
    in_progress: ['pending', 'reviewing', 'resolved', 'rejected'],
    resolved: ['pending', 'reviewing', 'in_progress'], // Can reopen
    rejected: ['pending', 'reviewing'] // Can reconsider
  }
  if (oldStatus !== nextStatus && validTransitions[oldStatus] && !validTransitions[oldStatus].includes(nextStatus)) {
    notify(`Invalid status transition: ${oldStatus} → ${nextStatus}`, 'error')
    return false
  }
  
  const note = (changes.note ?? '').trim()
  Object.assign(report, { priority: changes.priority ?? report.priority, resolutionNotes: changes.resolutionNotes ?? report.resolutionNotes, status: nextStatus, updatedAt: new Date().toISOString() })
  if (nextStatus === 'resolved') report.resolvedAt = new Date().toISOString()
  else if (oldStatus === 'resolved' && nextStatus !== 'resolved') report.resolvedAt = null
  if (oldStatus !== nextStatus || note) {
    state.history.unshift({ id: makeId('hist'), reportId, actorId: actor.id, oldStatus, newStatus: nextStatus, note: note || (oldStatus !== nextStatus ? `Status changed to ${nextStatus.replaceAll('_', ' ')}.` : 'Report updated.'), timestamp: new Date().toISOString() })
  }
  logAction(actor.id, oldStatus !== nextStatus ? 'REPORT_STATUS_CHANGED' : 'REPORT_UPDATED', 'report', reportId, `${oldStatus} → ${nextStatus}; ${note || 'No additional note.'}`)
  const reportOwner = state.users.find((user) => user.id === report.userId)
  if (reportOwner) state.notifications.unshift({ id: makeId('note'), userId: reportOwner.id, title: 'Report updated', message: `Your ${report.type.replaceAll('_', ' ')} report is now ${nextStatus.replaceAll('_', ' ')}.`, type: 'report_update', read: false, createdAt: new Date().toISOString(), relatedId: reportId })
  notify('Report updated successfully.')
  return true
}

export function saveSchedule(payload, actor, scheduleId = null) {
  const now = new Date().toISOString()
  if (scheduleId) {
    const item = state.schedules.find((schedule) => schedule.id === scheduleId)
    if (!item) return false
    Object.assign(item, payload, { updatedAt: now })
    logAction(actor.id, 'SCHEDULE_UPDATED', 'schedule', scheduleId, `${areaName(item.areaId)} on ${item.date}.`)
    notify('Collection schedule updated.')
    return item
  }
  const item = { ...payload, id: makeId('sch'), createdBy: actor.id, createdAt: now, updatedAt: now }
  state.schedules.unshift(item)
  logAction(actor.id, 'SCHEDULE_CREATED', 'schedule', item.id, `${areaName(item.areaId)} on ${item.date}.`)
  notify('Collection schedule created.')
  return item
}

export function deleteSchedule(scheduleId, actor) {
  const item = state.schedules.find((schedule) => schedule.id === scheduleId)
  if (!item) return false
  state.schedules = state.schedules.filter((schedule) => schedule.id !== scheduleId)
  logAction(actor.id, 'SCHEDULE_DELETED', 'schedule', scheduleId, `${areaName(item.areaId)} on ${item.date}.`)
  notify('Schedule deleted.')
  return true
}

export function addNotification(userId, title, message, type = 'system', relatedId = null) {
  state.notifications.unshift({ id: makeId('note'), userId, title, message, type, read: false, createdAt: new Date().toISOString(), relatedId })
}

export function markNotificationRead(notificationId, actorId) {
  const item = state.notifications.find((note) => note.id === notificationId && note.userId === actorId)
  if (item) item.read = true
}

export function resetDemoData() {
  state.meta = { schemaVersion: 1, initializedAt: new Date().toISOString() }
  state.users = clone(seedUsers)
  state.areas = clone(seedAreas)
  state.schedules = clone(seedSchedules)
  state.reports = clone(seedReports)
  state.history = clone(seedReportHistory)
  state.audit = clone(seedAuditLogs)
  state.notifications = clone(seedNotifications)
  state.settings = {}
  state.session = null
  notify('Demo data has been reset. Sign in again to continue.')
}

export function getCurrentUser() {
  if (!state.session?.userId) return null
  return state.users.find((user) => user.id === state.session.userId && user.active) || null
}

export function createResident({ fullName, email, password, areaId }) {
  const normalizedEmail = email.trim().toLowerCase()
  if (state.users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    return { error: 'An account with this email already exists.' }
  }
  if (!state.areas.some((area) => area.id === areaId && area.active)) return { error: 'Please choose an available zone.' }
  const user = { id: makeId('user'), fullName: fullName.trim(), email: normalizedEmail, passwordDemo: password, role: 'resident', areaId, active: true, registeredAt: new Date().toISOString(), createdAt: new Date().toISOString() }
  state.users.push(user)
  logAction(user.id, 'RESIDENT_REGISTERED', 'user', user.id, 'New resident account created.')
  return { user }
}

export function login(email, password) {
  const normalizedEmail = email.trim().toLowerCase()
  
  // Prevent login if no registered users exist (accounts must be created first)
  const registeredUsers = state.users.filter((u) => u.registeredAt)
  if (registeredUsers.length === 0) {
    return { error: 'No accounts have been created yet. Please register a resident account first.', code: 'NO_ACCOUNTS' }
  }
  
  const user = state.users.find((item) => item.email.toLowerCase() === normalizedEmail && item.passwordDemo === password && item.active)
  if (!user) return { error: 'Email or password is incorrect.' }
  state.session = { userId: user.id, loggedInAt: new Date().toISOString() }
  logAction(user.id, 'LOGIN', 'session', user.id, 'Signed in to CleanTrack.')
  return { user }
}

export function logout() {
  const user = getCurrentUser()
  if (user) logAction(user.id, 'LOGOUT', 'session', user.id, 'Signed out of CleanTrack.')
  state.session = null
}
