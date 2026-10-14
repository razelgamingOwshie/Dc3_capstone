import { computed } from 'vue'
import { state, addNotification, markNotificationRead, getSetting } from '../services/store.js'
import { getTodayString, getDateOffset } from '../utils/date.js'

export function useNotifications(userId) {
  const notifications = computed(() => state.notifications.filter((item) => item.userId === userId.value).sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  const unreadCount = computed(() => notifications.value.filter((item) => !item.read).length)
  function markRead(id) { markNotificationRead(id, userId.value) }
  function generateReminders() {
    if (!userId.value || !getSetting(userId.value, 'remindersEnabled', true)) return
    const user = state.users.find((item) => item.id === userId.value)
    if (!user) return
    const todayString = getTodayString()
    const tomorrowString = getDateOffset(1)
    const dates = getSetting(user.id, 'reminderLead', '1') === '0' ? [todayString] : [todayString, tomorrowString]
    state.schedules.filter((item) => item.areaId === user.areaId && item.status === 'scheduled' && dates.includes(item.date)).forEach((schedule) => {
      const key = `schedule:${schedule.id}:${user.id}`
      const exists = state.notifications.some((note) => note.userId === user.id && note.relatedId === key)
      if (!exists) addNotification(user.id, 'Upcoming collection', `${schedule.wasteType.replaceAll('_', ' ')} collection is scheduled for ${schedule.date} at ${schedule.startTime}.`, 'collection_reminder', key)
    })
  }
  return { notifications, unreadCount, markRead, generateReminders }
}
