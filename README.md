# CleanTrack — Garbage Collection Schedule and Reporting System

A Vue 3 + Vite student capstone project demonstrating a garbage collection schedule and community reporting system with role-based access control, localStorage persistence, and a modern environmental dashboard UI.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server runs at `http://localhost:5173` by default.

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Resident** | `resident@cleantrack.demo` | `Resident123!` |
| **Administrator** | `admin@cleantrack.demo` | `Admin123!` |

> **Note:** These are simulated demo accounts stored in localStorage. Passwords are stored in plain text for demonstration purposes only. Do not use real credentials.

## ✨ Features

### Resident Features
- **Dashboard** — View upcoming collections, zone-specific reports, and personal statistics
- **Collection Schedule** — Browse schedules in list or calendar view with search/filter
- **Submit Reports** — Report missed collections, overflowing garbage, illegal dumping, damaged bins, irregular collections, and other issues
- **My Reports** — Track status of submitted reports with history timeline
- **Profile & Settings** — Manage personal info, theme (light/dark), and collection reminders

### Administrator Features
- **Admin Dashboard** — System-wide statistics, recent activity, and quick actions
- **Schedule Management** — Create, edit, cancel, and delete collection schedules with conflict detection
- **Report Management** — View all reports across zones, filter by status/type/priority, update statuses, add resolution notes
- **Activity Log** — Audit trail of all system actions with CSV export
- **Demo Data Reset** — Restore sample data with confirmation

### Shared Features
- **Role-based routing** — Residents and admins see different navigation and pages
- **Zone-based visibility** — Residents only see reports/schedules from their assigned zone
- **LocalStorage persistence** — All data survives browser refresh
- **Dark/Light theme** — Persisted per user
- **In-app notifications** — Collection reminders and report updates
- **CSV export** — Reports and activity log with proper escaping
- **Responsive design** — Works on mobile and desktop

## 🛠 Tech Stack

- **Vue 3** (Composition API, `<script setup>`)
- **Vite** (fast dev server, optimized build)
- **Vue Router 4** (SPA routing with guards)
- **localStorage** (client-side persistence)
- **Vanilla CSS** (custom properties, responsive grid/flex, dark mode)

## 📁 Project Structure

```
cleantrack/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js                 # App entry point
│   ├── App.vue                 # Root component with layout/toast
│   ├── router/index.js         # Route definitions + guards
│   ├── services/
│   │   └── store.js            # Reactive state + localStorage persistence
│   ├── composables/
│   │   ├── useAuth.js          # Authentication helpers
│   │   └── useNotifications.js # Notification & reminder logic
│   ├── utils/
│   │   └── date.js             # Shared date/time utilities
│   ├── data/
│   │   └── seedData.js         # Sample zones, users, schedules, reports
│   ├── layouts/
│   │   └── DashboardLayout.vue # Sidebar, topbar, notifications
│   ├── components/
│   │   ├── StatCard.vue        # Dashboard stat display
│   │   ├── StatusBadge.vue     # Status/priority badges
│   │   └── EmptyState.vue      # Reusable empty state
│   └── views/
│       ├── LoginView.vue
│       ├── RegisterView.vue
│       ├── DashboardView.vue   # Resident & Admin dashboards
│       ├── ScheduleView.vue    # List/calendar with filters
│       ├── ReportsView.vue     # Filterable report table + CSV export
│       ├── ReportDetailView.vue# Create/view/edit reports + history
│       ├── ActivityView.vue    # Admin audit log + CSV export
│       ├── ProfileView.vue
│       ├── SettingsView.vue    # Theme, reminders, demo reset
│       └── NotFoundView.vue    # 404 / 403 pages
└── assets/styles/
    └── main.css                # Global styles, variables, responsive
```

## 🔒 Security & Privacy Notes

- **Client-side only** — No backend, no network requests
- **localStorage is editable** — Not suitable for production authentication or confidential data
- **Passwords stored in plain text** — `passwordDemo` field for demo purposes only
- **Audit logs are not tamper-proof** — Stored in browser localStorage
- **No external dependencies** — No CDN, analytics, or third-party services

## 🧪 Testing the Demo Workflow

1. Open `http://localhost:5173` in a clean browser (incognito recommended)
2. **Resident flow:**
   - Sign in as `resident@cleantrack.demo` / `Resident123!`
   - Check dashboard → upcoming collections for Zone 1
   - View schedule → switch between list/calendar
   - Submit a "Missed collection" report
   - Verify it appears in "My Reports"
3. **Admin flow:**
   - Sign out, sign in as `admin@cleantrack.demo` / `Admin123!`
   - Dashboard shows new report in statistics
   - Open report → change status: Pending → Reviewing → In Progress → Resolved
   - Add resolution note at each step
   - Check Activity Log → export CSV
4. **Persistence check:**
   - Sign out, sign back in as resident
   - Verify report shows "Resolved" with full history
   - Refresh browser → all data persists
5. **Zone isolation:**
   - As resident, confirm you cannot see Zone 2 reports
   - As admin, confirm you can see all zones

## 📋 Acceptance Checklist

- [x] Application starts (`npm run dev`)
- [x] Production build succeeds (`npm run build`)
- [x] Demo login works for both roles
- [x] Role-based redirects (resident → `/resident/dashboard`, admin → `/admin/dashboard`)
- [x] Route guards block unauthorized access (403 page)
- [x] Resident dashboard shows zone-specific stats & schedules
- [x] Schedule list & calendar views work with filters
- [x] Report submission validates required fields (10-600 chars)
- [x] Reports persist after refresh
- [x] Admin can view all reports, filter by status/type/priority/zone
- [x] Status transitions: pending → reviewing → in_progress → resolved
- [x] Invalid transitions blocked (e.g., rejected → resolved)
- [x] Report history tracks all status changes with timestamps
- [x] Audit log records all actions (schedules, reports, settings, login)
- [x] Collection reminders generate for scheduled events in user's zone
- [x] Theme toggle (light/dark) persists per user
- [x] CSV export works for reports & activity log (proper escaping)
- [x] Demo data reset restores seed accounts & sample data
- [x] Responsive UI (mobile sidebar, table scrolling, readable text)
- [x] No console errors in production build

## 🐛 Known Limitations

1. **No real authentication** — localStorage passwords are readable/modifiable
2. **No background notifications** — Reminders only work while app is open
3. **Single-tab persistence** — Concurrent tabs may overwrite each other's changes
4. **No file uploads** — Reports are text-only (no photos of garbage)
5. **Fixed zone assignment** — Residents cannot change zone after registration
6. **No real-time sync** — Changes only visible after refresh in other tabs
7. **Demo data only** — All schedules, zones, and users are fictional

## 📝 License

Student capstone project — Educational use only.

---

**Built for a school capstone presentation. CleanTrack demonstrates core Vue 3 patterns: reactive state management, composable logic, route guards, localStorage persistence, and responsive component design — all in ~2,000 lines of beginner-friendly code.**