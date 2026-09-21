# Test Plan & Quality Assurance Matrix

## Overview
This document outlines the end-to-end verification plan for **TutorConnect** (`DIV-TUTOR-CONNECT`). It encompasses dual-role authorization, collision-free slot reservation, Stripe test checkout, Celery background tasks, and responsive UI checklists.

---

## 1. Dual-Role Authentication & Authorization

- [ ] **Student (Client) Registration & Login**:
  - Registers with `role = "client"`, email, password, and full name.
  - Receives JWT access and refresh token pair.
  - Automatically redirected to Client Dashboard.
- [ ] **Tutor (Provider) Registration & Login**:
  - Registers with `role = "provider"` and creates associated `ProviderProfile`.
  - Automatically redirected to Provider Dashboard.
- [ ] **Route Guard Enforcement**:
  - Non-authenticated requests to `/dashboard/*` redirect to `/auth`.
  - Student attempting to access `/dashboard/tutor` receives HTTP 403 / redirect to client dashboard.
  - Tutor attempting to access client booking features receives appropriate role error.
- [ ] **JWT Token Refresh Interceptor**:
  - Expired access tokens automatically trigger `/api/v1/users/token/refresh/` via Axios interceptor in `services/api.ts` without user logout.

---

## 2. Collision-Free Availability & Scheduling Engine

- [ ] **Availability Slot Creation**:
  - Tutor creates weekly recurring slots (e.g. Monday 10:00 AM – 11:00 AM).
  - Verifies slot displays in `AvailabilityGrid.tsx` and public profile.
- [ ] **Overlap Validation**:
  - Tutor attempts to create an overlapping slot (e.g. Monday 10:30 AM – 11:30 AM).
  - API rejects with HTTP 400: *"Slot overlaps with an existing availability period."*
- [ ] **Concurrent Booking Slot Locking (Race Condition Test)**:
  - Two concurrent requests attempt to book the exact same tutor slot simultaneously.
  - PostgreSQL row-level lock (`select_for_update()`) ensures first transaction succeeds and second is rejected with *"Slot is no longer available"*.
- [ ] **Self-Booking Prevention**:
  - Tutor attempting to book their own service listing receives HTTP 400: *"Providers cannot book sessions with themselves."*

---

## 3. Booking Lifecycle & State Transitions

- [ ] **State Machine Validation**:
  - Reservation creation sets status to `PENDING`.
  - Successful checkout transitions status to `CONFIRMED`.
  - Provider or client completion sets status to `COMPLETED`.
  - Invalid transitions (e.g. `COMPLETED` ➔ `PENDING`) are strictly rejected.
- [ ] **Cancellation Flow**:
  - Client cancels upcoming booking $> 24$ hours in advance: status moves to `CANCELLED` and slot is reopened.
- [ ] **Dispute Filing**:
  - Client files dispute via `DisputeModal.tsx`: booking status moves to `DISPUTED` with logged reason.

---

## 4. Stripe Test-Mode Payments & Invoicing

- [ ] **Checkout Session Generation**:
  - Client clicks "Confirm & Pay": API calls `stripe.checkout.Session.create()` and returns checkout URL.
- [ ] **Webhook Signature Verification**:
  - Webhook listener receives `checkout.session.completed`.
  - Verifies HMAC signature against `STRIPE_WEBHOOK_SECRET`.
  - Malformed or invalid signatures are rejected with HTTP 400.
- [ ] **Digital Receipt Generation**:
  - Booking transitions to `CONFIRMED`.
  - Client opens `ReceiptModal.tsx` and verifies itemized breakdown (tutor fee, platform fee, total paid).

---

## 5. Reviews, Ratings & Verified Badges

- [ ] **Eligibility Restriction**:
  - Client can only submit a review if booking status is `COMPLETED`.
  - Non-booked users receive HTTP 403.
- [ ] **Aggregate Rating Recalculation Signal**:
  - Client submits a 5-star review.
  - Django post-save signal updates `ProviderProfile.average_rating` and `ProviderProfile.total_reviews`.
- [ ] **Verified Badge Trigger**:
  - Tutors meeting verification thresholds display official verified shield badge.

---

## 6. Celery Background Worker & Asynchronous Tasks

- [ ] **Booking Confirmation Dispatch**:
  - Confirming a booking queues an asynchronous task `send_booking_confirmation_email`.
  - Verifies task completes in Celery logs without delaying HTTP response.
- [ ] **In-App Notification Feed**:
  - New booking generates a record in `Notification` table; unread counter updates in `Navbar.tsx`.

---

## 7. Frontend UI & Responsive Checklist

- [ ] **Mobile Viewport (375px)**:
  - Navigation collapses to mobile drawer menu.
  - Tutor cards stack vertically with prominent rating badges and pricing.
  - Calendar availability grid switches to daily scrollable view.
- [ ] **Tablet Viewport (768px)**:
  - Two-column tutor search layout with collapsible filter drawer.
  - Modals (Checkout, Receipt, Dispute) center properly without edge clipping.
- [ ] **Desktop Viewport (1440px+)**:
  - Full marketplace layout: persistent filter sidebar on left, 3-column tutor grid on right.
  - Tutor profile displays bio on left, interactive weekly availability grid on right.
- [ ] **Theme Switching**:
  - Clicking theme toggle switches seamlessly between Slate Light (`#f8fafc`) and Deep Dark (`#0f172a`) modes without page reload.
