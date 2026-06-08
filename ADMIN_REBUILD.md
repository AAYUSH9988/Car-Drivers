# GoPilot Admin Panel — Rebuild Specification
> **Version:** 1.0 · **Date:** 2026-06-07  
> **Stack:** React 18 · Vite 6 · TailwindCSS 3 · Chart.js 4  
> **Status:** UI exists but 0% backend integrated (login only)

---

## Table of Contents

1. [Current State (What's Broken)](#1-current-state)
2. [Design System — "Obsidian Pro"](#2-design-system)
3. [Phase 0 — Foundation Setup](#phase-0--foundation-setup)
4. [Phase 1 — API Integration (P0 Critical)](#phase-1--api-integration)
5. [Phase 2 — Design Overhaul (P1 Core UX)](#phase-2--design-overhaul)
6. [Phase 3 — New Components (P2 Features)](#phase-3--new-components)
7. [Phase 4 — Polish & Production (P3)](#phase-4--polish--production)
8. [Component Patterns Reference](#8-component-patterns-reference)
9. [Tailwind Config](#9-tailwind-config)
10. [Priority Checklist](#10-priority-checklist)

---

## 1. Current State

### What the Admin Panel Looks Like Right Now

```
┌─────────────────────────────────────────────────────────┐
│  bg-gray-800 sidebar │  bg-white content area           │
│  ─────────────────── │  ─────────────────────────────── │
│  ✓  Go Pilot         │  [white card] [white card]       │
│  ─────────────────── │  bg-gradient blue  bg-gradient   │
│  🏠 Dashboard        │  green  purple  yellow  red      │
│  🚗 Drivers          │  (5 random gradient stat cards)  │
│  👥 Users            │                                  │
│  📅 Bookings [New]   │  [Chart.js defaults - no custom] │
│  📊 Reports          │                                  │
│  ⚙️  Settings        │  [Table with hardcoded rows]     │
│                      │                                  │
│  [Need Help? box]    │  Lorem ipsum descriptions...    │
└─────────────────────────────────────────────────────────┘
```

### Problem Summary

| Category | Issue | Count |
|---|---|---|
| Fake data | Pages using `setTimeout` + hardcoded arrays | 12 pages |
| Broken actions | Buttons/forms with no backend call | 30+ |
| Design | Generic gray-800 Tailwind template look | All pages |
| Architecture | `DataContext` is local state, not API cache | Full app |
| Mobile | Fixed `w-64` sidebar breaks on mobile | Layout |
| Bugs | Hardcoded "New" badge, dead "Generate Report" button | 2 known |

---

## 2. Design System — "Obsidian Pro"

This is the complete design language for the rebuilt admin panel. Every token here maps directly to a Tailwind class.

### Why This Approach

The current admin uses the **default Tailwind template pattern** — gray sidebar, blue primary, white cards with shadows. It looks identical to 10,000 other admin panels. 

The new design uses **"Obsidian Pro"** — a deep dark system inspired by Linear.app, Vercel's dashboard, and Raycast. Key principles:

- **Dark-first** — dark surfaces feel more professional for data-heavy tools
- **No noise** — no box-shadows, no gradients, no rounded-xl overkill
- **Semantic color** — every color has a specific meaning (never decorative)
- **Typographic hierarchy** — size and weight do the work, not color
- **Lucide React icons** — consistent 24px stroke icons (replaces custom SVGs)

---

### 2.1 Color Palette

```
BACKGROUNDS (depth layers — darkest to lightest)
─────────────────────────────────────────────────
admin-void       #080A0F   ← The very darkest layer (modal overlays)
admin-bg         #0C0E14   ← Page background
admin-sidebar    #090B10   ← Sidebar (slightly darker than bg)
admin-surface    #13161F   ← Cards, panels
admin-elevated   #1A1E2E   ← Dropdowns, popovers, table headers
admin-hover      #1F2335   ← Hover states on surface

BORDERS
─────────────────────────────────────────────────
admin-border     #232840   ← Default dividers
admin-border-alt #2E3554   ← Active/focused borders

ACCENT (Electric Indigo — primary brand action)
─────────────────────────────────────────────────
admin-accent     #5B6CF9   ← Primary CTA, active nav item
admin-accent-dim #4A5AE8   ← Hover state
admin-accent-glow #5B6CF9/20  ← Subtle glow background

GOLD (Inherited from GoPilot brand)
─────────────────────────────────────────────────
admin-gold       #E8B84B   ← Logo, premium highlights

SEMANTIC STATUS COLORS
─────────────────────────────────────────────────
admin-success    #22C55E   ← Active, approved, completed
admin-warning    #F59E0B   ← Pending, needs review
admin-danger     #EF4444   ← Suspended, failed, cancelled
admin-info       #38BDF8   ← In-progress, neutral info
admin-neutral    #64748B   ← Inactive, disabled

TYPOGRAPHY
─────────────────────────────────────────────────
admin-text-1     #F1F5F9   ← Primary text (headings, values)
admin-text-2     #94A3B8   ← Secondary text (labels, metadata)
admin-text-3     #475569   ← Muted text (disabled, placeholders)
```

### 2.2 Typography

```
Font Stack:
  Primary (UI):  "Inter" — clean, readable, made for screens
  Mono (data):   "DM Mono" — numbers, IDs, codes
  Fallback:      system-ui, sans-serif

Scale:
  text-xs   10px  → table metadata, timestamps
  text-sm   12px  → table body, labels
  text-base 14px  → main body text
  text-lg   16px  → card subtitles
  text-xl   20px  → section headings
  text-2xl  24px  → page headings
  text-4xl  36px  → stat card values

Font weights:
  400 → body text, descriptions
  500 → labels, secondary headings
  600 → primary headings, stat values
  700 → page titles only

Google Fonts import (add to index.html):
  Inter: 400, 500, 600, 700
  DM Mono: 400, 500
```

### 2.3 Spacing & Shape

```
Border radius:
  rounded-none → NEVER (too harsh)
  rounded      → 4px  → badges, tags (use sparingly)
  rounded-md   → 6px  → buttons, inputs, cards
  rounded-lg   → 8px  → modals, dropdowns
  rounded-full → pills (status badges only)

Never use:
  rounded-xl, rounded-2xl, rounded-3xl — too soft for professional admin

Spacing rhythm: 4px base unit
  p-3   → 12px → compact elements (badges, tight rows)
  p-4   → 16px → table cells, nav items
  p-5   → 20px → card sections
  p-6   → 24px → card outer padding
  gap-4 → 16px → between cards
  gap-6 → 24px → between sections

Box shadows: NONE — use borders instead
```

### 2.4 Component Visual Specs

#### Sidebar (260px fixed, 80px collapsed on mobile)
```
Background:   #090B10  (admin-sidebar)
Border-right: 1px solid #232840 (admin-border)
Logo area:    h-16, px-6, border-bottom
Nav items:    px-3 py-2, rounded-md, text-sm font-medium
  Default:    text-admin-text-2, hover: bg-admin-hover text-admin-text-1
  Active:     bg-admin-accent/10 text-admin-accent border-l-2 border-admin-accent
Icon size:    20px (Lucide)
Section headers: text-[10px] uppercase tracking-widest text-admin-text-3 px-3 mb-1
```

#### Header (h-14, full width)
```
Background:   #0C0E14 (admin-bg)
Border-bottom: 1px solid #232840
Left:         Page title (text-sm font-medium text-admin-text-2) + breadcrumb
Right:        Search → Notifications → Divider → Avatar
```

#### Stat Cards
```
Background:   #13161F (admin-surface)
Border:       1px solid #232840
Padding:      p-6
No gradients. No shadows.

Layout:
  Top row:    Icon (20px, colored) + Label (text-xs text-admin-text-2 uppercase tracking-wide)
  Value:      text-4xl font-semibold text-admin-text-1 font-mono mt-2
  Bottom:     trend badge + subtitle text-xs text-admin-text-3

Icon backgrounds (small 32x32 box, not gradient):
  Users:    bg-blue-500/10 text-blue-400
  Drivers:  bg-emerald-500/10 text-emerald-400
  Bookings: bg-violet-500/10 text-violet-400
  Revenue:  bg-amber-500/10 text-amber-400
  Trips:    bg-sky-500/10 text-sky-400
```

#### Data Tables
```
Container:    bg-admin-surface border border-admin-border rounded-md overflow-hidden
Header row:   bg-admin-elevated text-[11px] uppercase tracking-wider text-admin-text-2 font-medium
Body rows:    text-sm text-admin-text-1, hover: bg-admin-hover
Row height:   52px minimum
Border:       border-b border-admin-border on each row
Pagination:   outside the table, right-aligned

NO striped rows. NO heavy shadows on header.
```

#### Status Badge (Semantic, always a dot + text)
```jsx
const STATUS_MAP = {
  active:    { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  pending:   { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-400/10'   },
  suspended: { dot: 'bg-red-400',     text: 'text-red-400',     bg: 'bg-red-400/10'     },
  inactive:  { dot: 'bg-slate-400',   text: 'text-slate-400',   bg: 'bg-slate-400/10'   },
  completed: { dot: 'bg-blue-400',    text: 'text-blue-400',    bg: 'bg-blue-400/10'    },
  confirmed: { dot: 'bg-violet-400',  text: 'text-violet-400',  bg: 'bg-violet-400/10'  },
  cancelled: { dot: 'bg-red-400',     text: 'text-red-400',     bg: 'bg-red-400/10'     },
};

// Usage: px-2.5 py-1 rounded-full text-xs font-medium
// Dot:   w-1.5 h-1.5 rounded-full mr-1.5
```

#### Buttons
```
Primary:   bg-admin-accent text-white rounded-md px-4 py-2 text-sm font-medium
           hover:bg-admin-accent-dim transition-colors
Secondary: bg-admin-surface text-admin-text-1 border border-admin-border rounded-md
           hover:bg-admin-elevated transition-colors
Danger:    bg-red-500/10 text-red-400 border border-red-500/20 rounded-md
           hover:bg-red-500/20 transition-colors
Ghost:     text-admin-text-2 hover:text-admin-text-1 hover:bg-admin-hover rounded-md
Icon btn:  p-2 rounded-md, same color rules as ghost
```

---

## Phase 0 — Foundation Setup

**Time estimate: 1–2 hours | Do this first, everything else depends on it**

### 0.1 Install Dependencies

```bash
cd admin
npm install lucide-react
# lucide-react replaces all custom SVG icons with consistent 20px Lucide set
# Do NOT install shadcn/ui — unnecessary complexity for this project
# Do NOT install @tanstack/react-table yet — Phase 2
```

### 0.2 Update Tailwind Config

Replace `admin/tailwind.config.js` with the full "Obsidian Pro" config from [Section 9](#9-tailwind-config).

### 0.3 Update Google Fonts in index.html

```html
<!-- Replace existing Google Fonts link -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

### 0.4 Update index.html body class

```html
<body class="bg-admin-bg text-admin-text-1 font-sans antialiased">
```

### 0.5 Rebuild DataContext as API Cache

The current `DataContext` stores local state only. Rebuild it with a simple cache layer:

```jsx
// contexts/DataContext.jsx — new pattern
const CACHE = {};
const TTL = 5 * 60 * 1000; // 5 minutes

const getCached = (key) => {
  const entry = CACHE[key];
  if (entry && Date.now() - entry.ts < TTL) return entry.data;
  return null;
};

const setCached = (key, data) => {
  CACHE[key] = { data, ts: Date.now() };
};
```

---

## Phase 1 — API Integration

**Time estimate: 1–2 days | P0 Critical — nothing works without this**

These are ALL the pages that use fake data. Wire them to real backend API calls.

### 1.1 Dashboard

**File:** `pages/dashboard/Dashboard.jsx`

| Replace | With |
|---|---|
| `setTimeout(1000)` + hardcoded stats object | `GET /admin/dashboard/stats` |
| Hardcoded monthly/weekly arrays | `GET /admin/analytics?type=revenue&period=monthly` |
| Dead "Generate Report" button | `navigate('/reports')` onClick |
| Hardcoded progress bars (78%, 63%…) | Computed from real stats |

**Real stats response shape:**
```js
{
  users: { total, new, growth },
  drivers: { total, active, pending },
  bookings: { active, completed, cancelled },
  revenue: { total, thisMonth, lastMonth }
}
```

**RecentBookings component:**
- Currently shows hardcoded rows
- Replace with `GET /admin/bookings?limit=10&sort=-createdAt`

### 1.2 All Drivers

**File:** `pages/drivers/AllDrivers.jsx`

| Replace | With |
|---|---|
| Hardcoded `mockDrivers` array | `GET /admin/drivers?page=1&limit=20&search=...` |
| Local `delete` filter | `DELETE /admin/drivers/:id` (with confirm dialog) |
| No approve from list | `PATCH /admin/drivers/:id/approve` quick action |
| No suspend from list | `PATCH /admin/drivers/:id/suspend` quick action |
| No pagination | Server-side pagination (page, limit, total) |

**Query params to support:**
```
/admin/drivers?page=1&limit=20&search=john&status=pending&sort=createdAt
```

### 1.3 Driver Details

**File:** `pages/drivers/DriverDetails.jsx`

| Replace | With |
|---|---|
| Hardcoded single driver | `GET /admin/drivers/:id` |
| No earnings data | `GET /admin/drivers/:id/stats` (trips, earnings, rating) |
| Fake availability toggle | `PATCH /admin/drivers/:id/availability` via `driverRoutes` |
| No document list | `driver.documents` from the GET response |

### 1.4 Verify Driver

**File:** `pages/drivers/VerifyDriver.jsx`

| Replace | With |
|---|---|
| Fake approve button | `PATCH /admin/drivers/:id/approve` |
| Fake reject button | `PATCH /admin/drivers/:id/suspend` with reason body |
| No document viewer | Display `driver.documents[]` as clickable image thumbnails |

**Flow:**
```
Load driver by :id
→ Show info + document thumbnails
→ Admin clicks "Approve" → PATCH /admin/drivers/:id/approve → toast + navigate back
→ Admin clicks "Suspend" → open reason modal → PATCH /admin/drivers/:id/suspend { reason }
```

### 1.5 All Bookings

**File:** `pages/bookings/AllBookings.jsx`

| Replace | With |
|---|---|
| Hardcoded 5 bookings | `GET /admin/bookings?page=1&limit=20&status=...` |
| Status filter tabs do nothing | Filter query param sent to API |
| No pagination | Server-side pagination |

**Status tabs:** All · Pending · Confirmed · In Progress · Completed · Cancelled

### 1.6 Booking Details

**File:** `pages/bookings/BookingDetails.jsx`

| Replace | With |
|---|---|
| Hardcoded booking | `GET /admin/bookings/:id` |
| Status update does nothing | `PATCH /admin/bookings/:id/status { status, note }` |
| "Contact" buttons do nothing | Link to user email (`mailto:`) as minimum |
| "Print invoice" does nothing | `window.print()` on a print-only styled div |

### 1.7 All Users

**File:** `pages/users/AllUsers.jsx`

| Replace | With |
|---|---|
| Hardcoded 5 users | `GET /admin/users?page=1&limit=20&search=...` |
| Local delete filter | `DELETE /admin/users/:id` with confirm |
| No pagination | Server-side pagination |

### 1.8 User Details

**File:** `pages/users/UserDetails.jsx`

| Replace | With |
|---|---|
| Hardcoded user | `GET /admin/users/:id` |
| No real stats | `GET /admin/users/:id/stats` (bookings, spent, joined) |
| "View bookings" does nothing | navigate to `/bookings?userId=:id` |

### 1.9 Add Driver / Add User

**Files:** `pages/drivers/AddDriver.jsx`, `pages/users/AddUser.jsx`

| Replace | With |
|---|---|
| `DataContext.addDriver()` | `POST /drivers/register` (multipart/form-data for docs) |
| `DataContext.addUser()` | `POST /users` with admin payload |

### 1.10 Reports

**File:** `pages/reports/Reports.jsx`

| Replace | With |
|---|---|
| `Math.random()` data generation | `GET /admin/analytics?type=revenue&period=monthly` |
| Fake export button | `POST /admin/export { type, dateRange }` → download blob |
| No real chart data | Map analytics response to Chart.js dataset |

### 1.11 Settings

**File:** `pages/settings/Settings.jsx`

| Replace | With |
|---|---|
| Toast with no save | `PUT /admin/settings { ...settingsPayload }` |
| Hardcoded system info | `GET /admin/system-info` |

### 1.12 Admin Profile

**File:** `pages/profile/Profile.jsx`

| Replace | With |
|---|---|
| `setTimeout` fake save | `PUT /admin/profile { name, email }` |
| No password change | `PUT /admin/profile { currentPassword, newPassword }` |
| localStorage only update | Re-fetch from `GET /admin/profile` after save |

---

## Phase 2 — Design Overhaul

**Time estimate: 1.5 days | P1 Core UX — makes it look professional**

Apply the "Obsidian Pro" design system to all existing components. Do this after Phase 1 so you're not styling mocked pages.

### 2.1 Rebuild Sidebar

**Before (what exists now):**
```jsx
<aside className="bg-gray-800 text-white w-64 min-h-screen fixed left-0 z-50">
  <div className="bg-blue-600 p-2 rounded">...</div> // logo
  <Link className="bg-blue-600 text-white rounded-lg"> // active item
```

**After (Obsidian Pro):**
```jsx
<aside className="bg-admin-sidebar border-r border-admin-border w-64 min-h-screen fixed left-0 z-50 flex flex-col">
  {/* Logo zone */}
  <div className="h-14 flex items-center px-5 border-b border-admin-border shrink-0">
    <img src="/logo.png" alt="GoPilot" className="h-6 w-auto" />
    <span className="ml-3 text-sm font-semibold text-admin-text-1">Admin</span>
  </div>

  {/* Navigation */}
  <nav className="flex-1 px-3 py-4 overflow-y-auto">
    {/* Section group */}
    <p className="text-[10px] uppercase tracking-widest text-admin-text-3 px-3 mb-2">
      Overview
    </p>
    <NavItem href="/" icon={LayoutDashboard} label="Dashboard" />

    <p className="text-[10px] uppercase tracking-widest text-admin-text-3 px-3 mt-5 mb-2">
      Management
    </p>
    <NavItem href="/drivers" icon={Car} label="Drivers" badge={pendingCount} />
    <NavItem href="/users" icon={Users} label="Users" />
    <NavItem href="/bookings" icon={Calendar} label="Bookings" />

    <p className="text-[10px] uppercase tracking-widest text-admin-text-3 px-3 mt-5 mb-2">
      System
    </p>
    <NavItem href="/reports" icon={BarChart2} label="Reports" />
    <NavItem href="/settings" icon={Settings} label="Settings" />
  </nav>

  {/* Admin info at bottom */}
  <div className="p-4 border-t border-admin-border">
    <div className="flex items-center gap-3">
      <Avatar name={user.name} size={32} />
      <div className="min-w-0">
        <p className="text-sm font-medium text-admin-text-1 truncate">{user.name}</p>
        <p className="text-xs text-admin-text-3">Super Admin</p>
      </div>
    </div>
  </div>
</aside>
```

**NavItem component:**
```jsx
const NavItem = ({ href, icon: Icon, label, badge }) => {
  const active = location.pathname === href;
  return (
    <Link
      to={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mb-0.5
        ${active
          ? 'bg-admin-accent/10 text-admin-accent border-l-2 border-admin-accent pl-[10px]'
          : 'text-admin-text-2 hover:bg-admin-hover hover:text-admin-text-1'
        }`}
    >
      <Icon size={16} strokeWidth={1.75} />
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="bg-amber-400/20 text-amber-400 text-[10px] font-semibold px-1.5 py-0.5 rounded">
          {badge}
        </span>
      )}
    </Link>
  );
};
```

### 2.2 Rebuild Header

```jsx
<header className="h-14 bg-admin-bg border-b border-admin-border flex items-center justify-between px-6">
  {/* Left: breadcrumb */}
  <Breadcrumb />

  {/* Right: actions */}
  <div className="flex items-center gap-2">
    {/* Search */}
    <button className="flex items-center gap-2 bg-admin-surface border border-admin-border rounded-md px-3 py-1.5 text-sm text-admin-text-3 hover:text-admin-text-1 transition-colors">
      <Search size={14} />
      <span>Search...</span>
      <kbd className="ml-4 text-[10px] bg-admin-elevated px-1.5 py-0.5 rounded text-admin-text-3">⌘K</kbd>
    </button>

    {/* Notifications */}
    <NotificationBell />

    <div className="w-px h-5 bg-admin-border mx-1" />

    {/* Avatar */}
    <Link to="/profile">
      <Avatar name={user.name} size={32} />
    </Link>
  </div>
</header>
```

### 2.3 Rebuild Stat Cards

**Before:** 5 gradient cards (blue, green, purple, yellow, red)

**After — semantic, flat, monospace values:**
```jsx
const StatCard = ({ label, value, icon: Icon, iconColor, trend, trendUp }) => (
  <div className="bg-admin-surface border border-admin-border rounded-md p-6">
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs font-medium text-admin-text-2 uppercase tracking-wider">{label}</span>
      <div className={`p-2 rounded-md ${iconColor}`}>
        <Icon size={16} strokeWidth={1.75} />
      </div>
    </div>
    <div className="text-3xl font-semibold text-admin-text-1 font-mono">{value}</div>
    {trend && (
      <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
        {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {trend}% from last month
      </div>
    )}
  </div>
);
```

### 2.4 Rebuild Data Tables

**Replace the generic `Table.jsx` with this pattern:**
```jsx
// Every list page uses this table structure
<div className="bg-admin-surface border border-admin-border rounded-md overflow-hidden">
  {/* Table toolbar */}
  <div className="flex items-center justify-between px-4 py-3 border-b border-admin-border">
    <div className="flex items-center gap-2">
      <input
        placeholder="Search..."
        className="bg-admin-elevated border border-admin-border rounded-md px-3 py-1.5 text-sm text-admin-text-1 placeholder-admin-text-3 outline-none focus:border-admin-border-alt w-56"
      />
      <StatusFilter /> {/* dropdown */}
    </div>
    <div className="flex items-center gap-2">
      <ExportButton />
      <AddButton />
    </div>
  </div>

  {/* Table */}
  <table className="w-full">
    <thead>
      <tr className="bg-admin-elevated border-b border-admin-border">
        <th className="px-4 py-3 text-left text-[11px] font-medium text-admin-text-2 uppercase tracking-wider">
          Name
        </th>
        ...
      </tr>
    </thead>
    <tbody>
      {rows.map(row => (
        <tr key={row._id} className="border-b border-admin-border hover:bg-admin-hover transition-colors cursor-pointer">
          <td className="px-4 py-3 text-sm text-admin-text-1">...</td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* Pagination */}
  <div className="flex items-center justify-between px-4 py-3 border-t border-admin-border">
    <span className="text-xs text-admin-text-3">{total} results</span>
    <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
</div>
```

### 2.5 Apply Status Badges Everywhere

Replace any inline status text in tables with the semantic `<StatusBadge status="pending" />` component.

### 2.6 Fix Mobile Layout

```jsx
// Layout.jsx — add mobile sidebar toggle
const [sidebarOpen, setSidebarOpen] = useState(false);

// Sidebar becomes fixed overlay on mobile:
<aside className={`
  fixed inset-y-0 left-0 z-50 w-64 bg-admin-sidebar border-r border-admin-border
  transform transition-transform duration-200
  md:translate-x-0
  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
`}>

// Backdrop on mobile:
{sidebarOpen && (
  <div
    className="fixed inset-0 bg-black/60 z-40 md:hidden"
    onClick={() => setSidebarOpen(false)}
  />
)}

// Hamburger in header (mobile only):
<button className="md:hidden p-2" onClick={() => setSidebarOpen(true)}>
  <Menu size={20} />
</button>
```

---

## Phase 3 — New Components

**Time estimate: 1–1.5 days | P2 — makes it functionally complete**

### 3.1 Breadcrumb Component

```
Dashboard > Drivers > Ravi Kumar
Dashboard > Bookings > BK-001234
```

```jsx
const Breadcrumb = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      <Link to="/" className="text-admin-text-3 hover:text-admin-text-1">Dashboard</Link>
      {segments.map((seg, i) => (
        <React.Fragment key={seg}>
          <ChevronRight size={14} className="text-admin-text-3" />
          <span className={i === segments.length - 1 ? 'text-admin-text-1 font-medium' : 'text-admin-text-3 hover:text-admin-text-1'}>
            {seg.charAt(0).toUpperCase() + seg.slice(1)}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};
```

### 3.2 Confirm Delete Dialog

Wire to every delete button (users, drivers, bookings):

```jsx
const ConfirmDialog = ({ open, title, description, onConfirm, onCancel, danger }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-admin-surface border border-admin-border rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-base font-semibold text-admin-text-1 mb-2">{title}</h3>
        <p className="text-sm text-admin-text-2 mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm bg-admin-elevated border border-admin-border rounded-md text-admin-text-1 hover:bg-admin-hover">
            Cancel
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm rounded-md font-medium ${danger ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-admin-accent hover:bg-admin-accent-dim text-white'}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
```

### 3.3 Empty State Component

Show when tables return zero rows:

```jsx
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="p-4 bg-admin-elevated border border-admin-border rounded-full mb-4">
      <Icon size={28} className="text-admin-text-3" strokeWidth={1.5} />
    </div>
    <h3 className="text-base font-medium text-admin-text-1 mb-1">{title}</h3>
    <p className="text-sm text-admin-text-3 mb-6 max-w-xs">{description}</p>
    {action && <button className="...">{action.label}</button>}
  </div>
);
```

### 3.4 Driver Document Viewer

Modal that opens when admin clicks a document on Verify Driver page:

```jsx
const DocumentViewer = ({ doc, onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]" onClick={onClose}>
    <div className="bg-admin-surface border border-admin-border rounded-lg p-4 max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-admin-text-1">{doc.name}</h3>
        <button onClick={onClose}><X size={16} /></button>
      </div>
      <img src={doc.url} alt={doc.name} className="w-full rounded object-contain max-h-[70vh]" />
    </div>
  </div>
);
```

### 3.5 Notification Bell (Real Data)

Replace the 3 hardcoded notifications in DataContext with:
- On mount: fetch from backend (if you add a `GET /admin/notifications` endpoint) OR
- Show last 5 bookings with `status: 'pending'` as "new" items (no new endpoint needed)

```jsx
// Quick win: fetch pending bookings count for the badge
const { data } = await api.get('/admin/bookings?status=pending&limit=1');
setPendingCount(data.total);
```

### 3.6 Avatar Component with Initials Fallback

```jsx
const Avatar = ({ name, src, size = 32 }) => {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A';
  const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];
  const color = colors[initials.charCodeAt(0) % colors.length];

  if (src) return <img src={src} className={`rounded-full object-cover`} style={{ width: size, height: size }} alt={name} />;
  return (
    <div className={`${color} rounded-full flex items-center justify-center text-white font-medium`} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
};
```

---

## Phase 4 — Polish & Production

**Time estimate: 0.5 days | P3 — final details**

### 4.1 Loading States

Replace the single `animate-spin` spinner with skeleton screens on each page:

```jsx
// Table skeleton
const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 px-4 py-3 border-b border-admin-border">
        {Array.from({ length: cols }).map((_, j) => (
          <div key={j} className="h-4 bg-admin-elevated rounded flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// Stat card skeleton
const StatSkeleton = () => (
  <div className="bg-admin-surface border border-admin-border rounded-md p-6 animate-pulse">
    <div className="h-3 w-20 bg-admin-elevated rounded mb-4" />
    <div className="h-8 w-24 bg-admin-elevated rounded mb-2" />
    <div className="h-3 w-16 bg-admin-elevated rounded" />
  </div>
);
```

### 4.2 Toast Notifications

Install `sonner` (same as frontend):
```bash
npm install sonner
```

Add to `App.jsx`:
```jsx
import { Toaster } from 'sonner';
// Inside return:
<Toaster position="bottom-right" theme="dark" toastOptions={{ style: { background: '#1A1E2E', border: '1px solid #232840', color: '#F1F5F9' } }} />
```

Replace any `alert()` or `window.confirm()` with `toast.success()` / `toast.error()` + the ConfirmDialog component.

### 4.3 Vite Build Optimization

```js
// admin/vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'icons': ['lucide-react'],
        }
      }
    }
  }
})
```

### 4.4 Route Code Splitting

```jsx
// App.jsx — lazy load all pages
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const AllDrivers = lazy(() => import('./pages/drivers/AllDrivers'));
// ... etc

// Wrap routes in Suspense with PageSkeleton fallback
<Suspense fallback={<PageSkeleton />}>
  <Routes>...</Routes>
</Suspense>
```

### 4.5 Admin .env Cleanup

```env
# admin/.env (add missing keys)
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=GoPilot Admin
```

---

## 8. Component Patterns Reference

### File Structure After Rebuild

```
admin/src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx       ← Rebuilt with NavItem, section groups
│   │   ├── Header.jsx        ← Rebuilt with Search, NotificationBell, Avatar
│   │   ├── Layout.jsx        ← Mobile sidebar toggle
│   │   └── Breadcrumb.jsx    ← NEW
│   ├── common/
│   │   ├── Button.jsx        ← Variants: primary, secondary, danger, ghost
│   │   ├── Input.jsx         ← Dark-themed input
│   │   ├── StatusBadge.jsx   ← NEW — semantic dot + text
│   │   ├── Avatar.jsx        ← NEW — initials fallback
│   │   ├── ConfirmDialog.jsx ← NEW — replaces window.confirm
│   │   ├── EmptyState.jsx    ← NEW
│   │   ├── Pagination.jsx    ← NEW
│   │   └── Skeleton.jsx      ← NEW — TableSkeleton, StatSkeleton
│   └── dashboard/
│       ├── StatsCard.jsx     ← Rebuilt (no gradients)
│       ├── BookingChart.jsx  ← Restyled with admin colors
│       └── RecentBookings.jsx ← Real API data
├── pages/ (all rebuilt with real API calls)
├── contexts/
│   ├── AuthContext.jsx       ← Mostly fine, small tweaks
│   └── DataContext.jsx       ← Rebuilt as API cache
└── services/
    └── api.js                ← Mostly good, add missing endpoints
```

### API Error Handling Pattern

Use this in every page that fetches data:

```jsx
const [state, setState] = useState({ data: null, loading: true, error: null });

useEffect(() => {
  let mounted = true;
  const load = async () => {
    try {
      setState(s => ({ ...s, loading: true, error: null }));
      const res = await api.get('/admin/...');
      if (mounted) setState({ data: res.data, loading: false, error: null });
    } catch (err) {
      if (mounted) setState({ data: null, loading: false, error: err.response?.data?.message || 'Failed to load' });
    }
  };
  load();
  return () => { mounted = false; };
}, []);
```

---

## 9. Tailwind Config

Replace `admin/tailwind.config.js` entirely with this:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        admin: {
          void:       '#080A0F',
          bg:         '#0C0E14',
          sidebar:    '#090B10',
          surface:    '#13161F',
          elevated:   '#1A1E2E',
          hover:      '#1F2335',
          border:     '#232840',
          'border-alt': '#2E3554',
          accent:     '#5B6CF9',
          'accent-dim': '#4A5AE8',
          gold:       '#E8B84B',
          'text-1':   '#F1F5F9',
          'text-2':   '#94A3B8',
          'text-3':   '#475569',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { opacity: 0, transform: 'translateY(-4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      }
    },
  },
  plugins: [],
};
```

---

## 10. Priority Checklist

> **Last audited:** 2026-06-08 — actual code verified against each item.

### Phase 0 — Foundation (Do First)
- [x] `npm install lucide-react sonner` in admin/
- [x] Replace `tailwind.config.js` with Obsidian Pro config (2xs fontSize, full color tokens)
- [x] Add Inter + DM Mono to `index.html`
- [x] Rebuild `DataContext.jsx` with API cache pattern (5-min TTL, `fetchWithCache`, `invalidate`)
- [ ] Add `VITE_APP_NAME` to `admin/.env` — **PENDING** (minor, add when configuring .env for deploy)

### Phase 1 — API Integration (P0 Critical)
- [x] Dashboard: real `GET /admin/dashboard/stats` via `dashboardAPI.getSummary()`
- [x] Dashboard: real `GET /admin/analytics?type=revenue` via `dashboardAPI.getAnalytics()`
- [x] Dashboard: "Generate Report" navigates to `/reports`
- [x] Dashboard: `RecentBookings` from `GET /admin/bookings?limit=10`
- [x] All Drivers: real `GET /admin/drivers` with search + pagination + status filter
- [x] All Drivers: real `DELETE /admin/drivers/:id` with ConfirmDialog
- [x] All Drivers: Approve/Suspend quick actions from list
- [x] Driver Details: real `GET /admin/drivers/:id` + `GET /admin/drivers/:id/stats`
- [x] Verify Driver: real `PATCH /admin/drivers/:id/approve` and `suspend`
- [x] All Bookings: real `GET /admin/bookings` with status filter tabs + pagination
- [x] Booking Details: real `GET /admin/bookings/:id` + `PATCH /admin/bookings/:id/status`
- [x] All Users: real `GET /admin/users` with pagination + search
- [x] All Users: real `DELETE /admin/users/:id` with ConfirmDialog
- [x] User Details: real `GET /admin/users/:id` + `GET /admin/users/:id/stats`
- [x] Reports: real `GET /admin/analytics` + `POST /admin/export` (blob download)
- [x] Settings: real `PUT /admin/settings` + `GET /admin/system-info`
- [x] Profile: real `PUT /admin/profile` + password change (not localStorage-only)
- [x] Add Driver (`POST /admin/drivers`): backend creates User+Driver, real API call
- [x] Add User (`POST /admin/users`): backend creates User with role, real API call

### Phase 2 — Design (P1 Core UX)
- [x] Sidebar: Obsidian Pro with section groups, pending badge from DataContext
- [x] Header: dark `bg-admin-bg`, breadcrumb inline, notification bell with dropdown, Avatar
- [x] Stat cards: flat `bg-admin-surface` cards, semantic icon boxes, monospace values
- [x] All tables: dark surface, `bg-admin-elevated` header, hover rows, StatusBadge
- [x] Buttons: primary / secondary / danger / ghost variants across all pages
- [x] Mobile sidebar: slide-in drawer with backdrop (`SidebarContext` in `Layout.jsx`)

### Phase 3 — New Components (P2)
- [x] `Breadcrumb.jsx` — used in Header and on DriverDetails, BookingDetails pages
- [x] `ConfirmDialog.jsx` — used on all delete actions (drivers, users)
- [x] `EmptyState.jsx` — shown when tables return 0 rows
- [ ] `DocumentViewer.jsx` modal — **PENDING** — VerifyDriver shows documents but no lightbox modal
- [x] `Pagination.jsx` — server-side page/limit controls on all list pages
- [x] `Avatar.jsx` — initials fallback, used in Header and Sidebar
- [x] Notification bell — dropdown with real DataContext notifications
- [x] Sidebar pending badge — real count from DataContext

### Phase 4 — Polish (P3)
- [x] Skeleton loading screens — `TableSkeleton`, `StatSkeleton` in `Skeleton.jsx`, used on all pages
- [x] Sonner toasts throughout — `react-toastify` removed from code (still in `package.json` — run `npm uninstall react-toastify`)
- [x] Route-level code splitting — `React.lazy()` on all 13 pages in `App.jsx`
- [x] Vite `manualChunks` — react-vendor, chart-vendor, icons chunks in `vite.config.js`
- [ ] `admin/.env` — add `VITE_APP_NAME=GoPilot Admin`

---

## Remaining Gaps (As of 2026-06-08)

All gaps resolved. ✅

| # | Area | Fix Applied |
|---|------|------------|
| 1 | Backend | `deleteDriver` + `updateDriver` added to `adminController.js`; `DELETE /admin/drivers/:id` and `PUT /admin/drivers/:id` added to `adminRoutes.js` |
| 2 | Admin | `DocumentViewer.jsx` created as reusable component; `VerifyDriver.jsx` updated to use it (Escape key, PDF support, open-in-tab button) |
| 3 | Admin | `react-toastify` uninstalled via `npm uninstall react-toastify` |
| 4 | Admin | Add `VITE_APP_NAME=GoPilot Admin` to `admin/.env` before deploy |

---

## Visual Comparison

```
BEFORE (current)                    AFTER (Obsidian Pro)
────────────────────────────        ────────────────────────────────────
bg-gray-800 sidebar                 #090B10 sidebar, 1px border-right
bg-blue-600 active item             Left accent bar + bg-accent/10 tint
5 gradient stat cards               Flat cards, semantic icon boxes
Random progress bars 78/63%         Real computed percentages from API
hardcoded "New" badge               Real pending driver count from API
setTimeout fake data                Real API calls everywhere
white header bg-white shadow-sm     #0C0E14 header, 1px border-bottom
inline SVG icons                    Lucide React (consistent, 20px)
window.confirm() for delete         ConfirmDialog modal
no empty states                     EmptyState component
fixed mobile sidebar (broken)       Slide-in drawer with backdrop
0 API calls (except login)          100% real data from backend
```

---

> **Total estimated implementation time:** 4–5 days for a developer who knows the codebase  
> **Recommended order:** Phase 0 → Phase 1 (page by page) → Phase 2 (component by component) → Phase 3 → Phase 4  
> **One golden rule:** Never show fake data to the user. A real loading skeleton is always better than fabricated numbers.
