# Project Tasks & Execution Roadmap

## Overview
This document tracks the phased implementation roadmap of **TutorConnect** (`DIV-TUTOR-CONNECT`). Each task follows the strict execution workflow:
`Task ID` ➔ `Implementation` ➔ `Automated Test` ➔ `Code Review` ➔ `Mark Complete`.

---

## Phase 1: Environment & Multi-Container Infrastructure

- [x] **TASK-201**: Initialize repository structure (`backend/`, `frontend/`, `.github/`).
- [x] **TASK-202**: Configure multi-container `docker-compose.yml` (`postgres`, `redis`, `backend`, `celery_worker`, `frontend`).
- [x] **TASK-203**: Set up Django 5.0 project with modular settings (`core.settings.base`, `dev`, `prod`).
- [x] **TASK-204**: Configure Celery 5.3+ with Redis message broker.
- [x] **TASK-205**: Create root and backend `.env.example` templates.

---

## Phase 2: Dual-Role Authentication & User Management

- [x] **TASK-206**: Implement custom `User` model with `role` field (`client` vs. `provider`).
- [x] **TASK-207**: Configure SimpleJWT for access and refresh token generation and rotation.
- [x] **TASK-208**: Implement registration, login, and profile detail REST endpoints (`apps/users`).
- [x] **TASK-209**: Build custom DRF permission classes (`IsClient`, `IsProvider`, `IsOwner`).
- [x] **TASK-210**: Implement frontend `AuthContext` with JWT storage and auto-refresh interceptors.

---

## Phase 3: Provider Profiles, Subjects & Availability Engine

- [x] **TASK-211**: Create `ProviderProfile` model with biography, hourly rate, and experience years.
- [x] **TASK-212**: Implement `SubjectOffering` model with categories (Math, CS, Science, Languages).
- [x] **TASK-213**: Build `AvailabilitySlot` model supporting day of week, start time, and end time.
- [x] **TASK-214**: Implement collision-free availability slot generator ensuring non-overlapping schedules.
- [x] **TASK-215**: Build provider service listing and availability management REST endpoints (`apps/providers`).

---

## Phase 4: Collision-Free Booking System & State Machine

- [x] **TASK-216**: Create `Booking` model with status choices (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `DISPUTED`).
- [x] **TASK-217**: Implement atomic reservation logic with PostgreSQL `select_for_update()` slot locking.
- [x] **TASK-218**: Build booking creation endpoint with conflict detection and student authorization.
- [x] **TASK-219**: Implement booking status transition handlers (confirm, cancel, complete).
- [x] **TASK-220**: Build contextual booking messaging and chat endpoints (`apps/bookings`).

---

## Phase 5: Stripe Test-Mode Payments & Invoicing

- [x] **TASK-221**: Integrate Stripe SDK for Checkout Session creation (`apps/payments`).
- [x] **TASK-222**: Implement Stripe webhook receiver with HMAC-SHA256 signature verification.
- [x] **TASK-223**: Implement automated payment status synchronization (`payment_intent.succeeded` ➔ `CONFIRMED`).
- [x] **TASK-224**: Build digital receipt generation with fee breakdown and itemized payouts.
- [x] **TASK-225**: Build frontend `StripeTestCheckoutModal` and `ReceiptModal`.

---

## Phase 6: Celery Background Tasks & Notifications

- [x] **TASK-226**: Configure Celery tasks for asynchronous booking confirmation emails.
- [x] **TASK-227**: Create in-app `Notification` model with read/unread status (`apps/notifications`).
- [x] **TASK-228**: Build notification slide-out drawer component (`NotificationDrawer.tsx`).
- [x] **TASK-229**: Implement mock payout settlement calculation background job.

---

## Phase 7: Reviews, Ratings & Verified Credentials

- [x] **TASK-230**: Create `Review` model linking student, tutor, booking, and 1–5 star rating.
- [x] **TASK-231**: Implement Django post-save signal to recalculate tutor average rating and review count.
- [x] **TASK-232**: Restrict review creation strictly to students with completed sessions.
- [x] **TASK-233**: Build `VerifiedBadgeModal` and profile trust indicators (`StarRating.tsx`, `Badge.tsx`).

---

## Phase 8: React Frontend Dashboard & Marketplace UI

- [x] **TASK-234**: Configure Vite, React 18, Tailwind CSS, and global theme provider (`ThemeContext.tsx`).
- [x] **TASK-235**: Build public landing page (`HomePage.tsx`) and faceted tutor search (`BrowseTutorsPage.tsx`).
- [x] **TASK-236**: Build comprehensive tutor profile page with availability calendar (`TutorProfilePage.tsx`).
- [x] **TASK-237**: Build student dashboard with upcoming sessions, receipts, and dispute filing (`ClientDashboardPage.tsx`).
- [x] **TASK-238**: Build tutor dashboard with earnings analytics, slot editor, and listings manager (`ProviderDashboardPage.tsx`).
- [x] **TASK-239**: Build responsive navigation bar (`Navbar.tsx`) with role badges and theme switcher.

---

## Phase 9: Testing, Verification & Governance

- [x] **TASK-240**: Write backend unit and integration tests (`test_auth.py`, `test_bookings.py`, `test_providers.py`, `test_reviews.py`).
- [x] **TASK-241**: Write frontend UI component tests (`Button.test.tsx`, `Badge.test.tsx`).
- [x] **TASK-242**: Author complete project specifications: `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `RULES.md`, `TASKS.md`, `DECISIONS.md`, `MEMORY.md`, `TEST_PLAN.md`, `SECURITY.md`, `.env.example`.
- [ ] **TASK-243**: Commit all specification artifacts and push cleanly to GitHub remote repository.
