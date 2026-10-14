/**
 * Shared date/time utilities for CleanTrack
 * Handles date parsing and formatting consistently to avoid timezone issues
 */

/**
 * Parse a date string in YYYY-MM-DD format to a Date object at local midnight
 * Avoids timezone shift issues from ISO string parsing
 */
export function parseLocalDate(dateString) {
  if (!dateString) return null
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Format a date string (YYYY-MM-DD) for display
 */
export function formatDate(dateString, options = {}) {
  const date = parseLocalDate(dateString)
  if (!date) return '—'
  const defaultOptions = { month: 'short', day: 'numeric', year: 'numeric', ...options }
  return date.toLocaleDateString('en-PH', defaultOptions)
}

/**
 * Format a date string for short display (e.g., "Jan 15")
 */
export function formatDateShort(dateString) {
  const date = parseLocalDate(dateString)
  if (!date) return '—'
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

/**
 * Format a date string for day number only
 */
export function formatDateDay(dateString) {
  const date = parseLocalDate(dateString)
  if (!date) return '—'
  return String(date.getDate())
}

/**
 * Format a date string for month name only
 */
export function formatDateMonth(dateString) {
  const date = parseLocalDate(dateString)
  if (!date) return '—'
  return date.toLocaleDateString('en-PH', { month: 'short' })
}

/**
 * Format a time string (HH:MM) for display
 */
export function formatTime(timeString) {
  if (!timeString) return '—'
  const [hours, minutes] = timeString.split(':').map(Number)
  const date = new Date(2000, 0, 1, hours, minutes)
  return date.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })
}

/**
 * Format a full ISO timestamp for display
 */
export function formatDateTime(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
}

/**
 * Format a full ISO timestamp for date only
 */
export function formatDateOnly(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Get today's date in YYYY-MM-DD format (local)
 */
export function getTodayString() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * Get a date string offset by days from today
 */
export function getDateOffset(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * Check if a date string is today or in the future
 */
export function isDateCurrentOrFuture(dateString) {
  const today = getTodayString()
  return dateString >= today
}

/**
 * Check if a date string is in the past
 */
export function isDatePast(dateString) {
  const today = getTodayString()
  return dateString < today
}

/**
 * Compare two date strings (YYYY-MM-DD)
 */
export function compareDates(a, b) {
  return a.localeCompare(b)
}

/**
 * Sort schedules by date then time
 */
export function sortSchedules(schedules) {
  return [...schedules].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
}

/**
 * Sort reports by createdAt descending (newest first)
 */
export function sortReportsNewestFirst(reports) {
  return [...reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/**
 * Sort history by timestamp descending (newest first)
 */
export function sortHistoryNewestFirst(history) {
  return [...history].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

/**
 * Sort audit logs by timestamp descending (newest first)
 */
export function sortAuditNewestFirst(audit) {
  return [...audit].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}