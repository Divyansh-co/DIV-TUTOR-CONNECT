# Design System & UI/UX Guidelines

## Overview
**TutorConnect** (`DIV-TUTOR-CONNECT`) features a modern, clean, and trustworthy marketplace design system engineered to inspire confidence among students and professional pride among academic tutors. The interface balances high-clarity data displays with approachable ergonomics, supporting both sleek Light and Dark mode themes.

---

## Visual Style & Principles

- **Clarity & Trust**: Academic marketplace interactions demand immediate transparency in pricing, credentials, slot availability, and refund policies.
- **Role-Aware Ergonomics**: Distinct visual contexts for Students (discovery, calendar booking, receipt downloads) and Tutors (availability grid management, earnings charts, service listings).
- **Subtle Modern Polish**: Crisp 1px slate borders, gentle 8px/12px border radiuses, soft ambient drop-shadows, and smooth micro-interactions.

---

## Typography

- **Primary Typeface**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`
  - High legibility across desktop calendars, dense pricing badges, and mobile booking drawers.
- **Monospace Accent**: `ui-monospace`, `SFMono-Regular`, `Menlo`, `monospace`
  - Utilized for transaction IDs, receipt numbers, Stripe test tokens, and currency figures.

### Typographic Hierarchy
| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| Hero Display | 32px–40px | Bold (700) | 1.2 | Landing page hero, major dashboard headings |
| Section Title | 20px–24px | SemiBold (600) | 1.3 | Tutor profile names, dashboard cards, modal titles |
| Card Subtitle | 15px–16px | Medium (500) | 1.4 | Subject names, slot headers, filter groups |
| Body Text | 14px–15px | Regular (400) | 1.5 | Tutor biographies, reviews, chat messages |
| Caption / Meta | 12px–13px | Regular (400) | 1.4 | Timestamps, hourly rate labels, review dates |
| Badge / Micro | 11px–12px | SemiBold (600) | 1.0 | Status pills, verified badges, rating counters |

---

## Color Palette

### Surfaces & Backgrounds
- **Light Theme Background**: `#f8fafc` (Slate 50)
- **Light Surface Card**: `#ffffff` (Pure White)
- **Light Border**: `#e2e8f0` (Slate 200)
- **Dark Theme Background**: `#0f172a` (Deep Slate 900)
- **Dark Surface Card**: `#1e293b` (Elevated Slate 800)
- **Dark Border**: `#334155` (Slate 700)

### Brand & Accent Colors
- **Primary Brand**: `#4f46e5` (Indigo 600)
- **Primary Hover**: `#4338ca` (Indigo 700)
- **Secondary Accent**: `#06b6d4` (Cyan 500)
- **Success & Earnings**: `#10b981` (Emerald 500)

### Status & Booking Indicators
| Status | Hex Color | Background Tint | Border Tint | Usage |
|---|---|---|---|---|
| **Confirmed** | `#10b981` (Emerald) | `rgba(16, 185, 129, 0.10)` | `rgba(16, 185, 129, 0.30)` | Paid & confirmed tutoring session |
| **Pending** | `#f59e0b` (Amber) | `rgba(245, 158, 11, 0.10)` | `rgba(245, 158, 11, 0.30)` | Awaiting tutor confirmation or payment |
| **Completed** | `#3b82f6` (Blue) | `rgba(59, 130, 246, 0.10)` | `rgba(59, 130, 246, 0.30)` | Finished session ready for student review |
| **Cancelled** | `#94a3b8` (Slate) | `rgba(148, 163, 184, 0.10)` | `rgba(148, 163, 184, 0.30)` | Cancelled booking by student or tutor |
| **Disputed** | `#ef4444` (Rose) | `rgba(239, 68, 68, 0.10)` | `rgba(239, 68, 68, 0.30)` | Active mediation or refund requested |

---

## Component Specifications

### 1. Buttons
- **Primary Button**:
  - Background: Solid Indigo `#4f46e5` with white text.
  - Hover: Background `#4338ca`, slight scale (1.02), soft drop-shadow.
- **Secondary / Outline Button**:
  - Border: 1px solid slate-300 (dark: slate-700).
  - Background: Transparent (dark: slate-800/40).
- **Success Button**:
  - Background: Emerald `#10b981` (used for Checkout and Confirm Booking).
- **Destructive Button**:
  - Background: Rose `#ef4444` with white text.

### 2. Cards & Containers
- **Border Radius**: `12px` (`rounded-xl`).
- **Tutor Profile Card**:
  - Displays tutor avatar, verified credential badge, subjects pill tags, star rating with review count, and dynamic "From $X/hr" tag.
  - Quick action: "Book Session" button launching the calendar modal.

### 3. Interactive Availability Calendar Grid
- **Time Block Columns**: 7-day horizontal scroll with 30-minute / 60-minute time intervals.
- **Slot States**:
  - *Available*: Crisp outline with soft green hover state.
  - *Selected*: Solid Indigo background with white checkmark.
  - *Booked / Unavailable*: Diagonal muted pattern with disabled pointer.

### 4. Earnings & Analytics Visualizer
- **Visuals**: Responsive SVG / Bar charts showing weekly revenue and completed sessions.
- **Metrics Cards**: Total Revenue, Completed Sessions, Average Rating, and Client Retention Rate.

### 5. Verified Credentials Badge Modal
- Displays official verification indicators: ID Verification, Degree / Academic Credential Verification, and Background Check status.

---

## UX Requirements & States

- **Loading State**:
  - Pulsing animated skeleton cards for tutor browsing grids.
  - Spinner overlay on payment processing buttons.
- **Empty State**:
  - Illustrative empty states with friendly guidance: "No upcoming sessions. Browse tutors to schedule your next session."
- **Error State**:
  - Contextual error banners with clear remediation steps (e.g. "Selected time slot was just booked by another user. Please choose an alternate slot.").
- **Responsive Layout**:
  - **Mobile (375px)**: Stacked single-column tutor cards, bottom fixed booking bar, full-screen slide-over calendar modal.
  - **Tablet (768px)**: Balanced two-column tutor grid, collapsible filter sidebar.
  - **Desktop (1440px+)**: Multi-column browse layout with persistent filter controls, side-by-side availability calendar, and profile bio.
