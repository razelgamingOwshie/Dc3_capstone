import { getDateOffset, getTodayString } from '../utils/date.js'

const todayString = getTodayString()
const dateOffset = (days) => getDateOffset(days)

export const seedAreas = [
  { id: 'area-001', name: 'Zone 1', description: 'Residential North', active: true, createdAt: new Date().toISOString() },
  { id: 'area-002', name: 'Zone 2', description: 'Residential Central', active: true, createdAt: new Date().toISOString() },
  { id: 'area-003', name: 'Zone 3', description: 'Residential South', active: true, createdAt: new Date().toISOString() },
  { id: 'area-004', name: 'Zone 4', description: 'Community Market', active: true, createdAt: new Date().toISOString() }
]

export const seedUsers = [
  { id: 'user-admin', fullName: 'CleanTrack Administrator', email: 'admin@cleantrack.demo', passwordDemo: 'Admin123!', role: 'admin', areaId: 'area-001', active: true, createdAt: new Date().toISOString() },
  { id: 'user-resident', fullName: 'Alex Santos', email: 'resident@cleantrack.demo', passwordDemo: 'Resident123!', role: 'resident', areaId: 'area-001', active: true, createdAt: new Date().toISOString() },
  { id: 'user-resident-2', fullName: 'Jamie Reyes', email: 'jamie@cleantrack.demo', passwordDemo: 'Resident123!', role: 'resident', areaId: 'area-002', active: true, createdAt: new Date().toISOString() },
  { id: 'user-resident-3', fullName: 'Taylor Cruz', email: 'taylor@cleantrack.demo', passwordDemo: 'Resident123!', role: 'resident', areaId: 'area-001', active: true, createdAt: new Date().toISOString() }
]

export const seedSchedules = [
  { id: 'sch-001', areaId: 'area-001', wasteType: 'household', date: dateOffset(0), startTime: '07:00', endTime: '10:00', status: 'scheduled', notes: 'Please place sealed waste outside before collection.', createdBy: 'user-admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sch-002', areaId: 'area-002', wasteType: 'recyclable', date: dateOffset(1), startTime: '08:00', endTime: '11:00', status: 'scheduled', notes: 'Separate clean recyclables from other waste.', createdBy: 'user-admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sch-003', areaId: 'area-003', wasteType: 'household', date: dateOffset(2), startTime: '07:00', endTime: '10:00', status: 'scheduled', notes: '', createdBy: 'user-admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sch-004', areaId: 'area-004', wasteType: 'organic', date: dateOffset(3), startTime: '07:30', endTime: '10:30', status: 'scheduled', notes: 'Use a covered container where possible.', createdBy: 'user-admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sch-005', areaId: 'area-001', wasteType: 'recyclable', date: dateOffset(4), startTime: '08:00', endTime: '11:00', status: 'scheduled', notes: '', createdBy: 'user-admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sch-006', areaId: 'area-002', wasteType: 'household', date: dateOffset(5), startTime: '07:00', endTime: '10:00', status: 'scheduled', notes: '', createdBy: 'user-admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sch-007', areaId: 'area-003', wasteType: 'organic', date: dateOffset(6), startTime: '07:30', endTime: '10:30', status: 'scheduled', notes: '', createdBy: 'user-admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sch-008', areaId: 'area-004', wasteType: 'household', date: dateOffset(7), startTime: '07:00', endTime: '10:00', status: 'scheduled', notes: '', createdBy: 'user-admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sch-009', areaId: 'area-001', wasteType: 'special', date: dateOffset(9), startTime: '09:00', endTime: '12:00', status: 'scheduled', notes: 'Please ask the barangay desk about accepted items.', createdBy: 'user-admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sch-010', areaId: 'area-002', wasteType: 'organic', date: dateOffset(10), startTime: '07:30', endTime: '10:30', status: 'scheduled', notes: '', createdBy: 'user-admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sch-011', areaId: 'area-003', wasteType: 'recyclable', date: dateOffset(12), startTime: '08:00', endTime: '11:00', status: 'scheduled', notes: '', createdBy: 'user-admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sch-012', areaId: 'area-004', wasteType: 'household', date: dateOffset(14), startTime: '07:00', endTime: '10:00', status: 'scheduled', notes: '', createdBy: 'user-admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
]

export const seedReports = [
  { id: 'rep-001', userId: 'user-resident', areaId: 'area-001', type: 'missed_collection', description: 'The household waste collection did not arrive during the scheduled time.', priority: 'normal', status: 'pending', resolutionNotes: '', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(), resolvedAt: null },
  { id: 'rep-002', userId: 'user-resident', areaId: 'area-001', type: 'overflowing_garbage', description: 'The public bin near the community waiting shed is almost full.', priority: 'high', status: 'in_progress', resolutionNotes: 'Collection team has been notified.', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(), resolvedAt: null },
  { id: 'rep-003', userId: 'user-resident-2', areaId: 'area-002', type: 'damaged_bin', description: 'One of the shared bins has a broken lid.', priority: 'low', status: 'resolved', resolutionNotes: 'The bin lid was replaced.', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString(), resolvedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'rep-004', userId: 'user-resident-2', areaId: 'area-002', type: 'irregular_collection', description: 'The last collection arrived later than the posted time.', priority: 'normal', status: 'reviewing', resolutionNotes: '', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString(), resolvedAt: null },
  { id: 'rep-005', userId: 'user-resident', areaId: 'area-001', type: 'other', description: 'Requesting a reminder about the next recyclable collection.', priority: 'low', status: 'rejected', resolutionNotes: 'This is a request rather than a garbage incident. Please use collection reminders in Settings.', createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(), resolvedAt: null },
  { id: 'rep-006', userId: 'user-resident-2', areaId: 'area-002', type: 'illegal_dumping', description: 'Bags were left beside the road after dark.', priority: 'urgent', status: 'pending', resolutionNotes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), resolvedAt: null },
  { id: 'rep-007', userId: 'user-resident-3', areaId: 'area-001', type: 'overflowing_garbage', description: 'A shared bin near the corner is overflowing and needs attention.', priority: 'high', status: 'reviewing', resolutionNotes: '', createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(), resolvedAt: null }
]

export const seedReportHistory = seedReports.map((report) => ({
  id: `hist-${report.id}`,
  reportId: report.id,
  actorId: report.userId,
  oldStatus: null,
  newStatus: report.status,
  note: 'Report submitted.',
  timestamp: report.createdAt
}))

export const seedAuditLogs = [
  { id: 'audit-001', actorId: 'user-admin', action: 'INITIALIZED_DEMO', entityType: 'system', entityId: 'cleantrack', details: 'Sample schedules, users and reports initialized.', timestamp: new Date().toISOString() }
]

export const seedNotifications = []
