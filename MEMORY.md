# Project Memory & Active State

## Overview
This document serves as the persistent operational memory of **TutorConnect** (`DIV-TUTOR-CONNECT`). It records the current development state, completed milestones, active tasks, known issues, and immediate next steps.

---

## Current Status
- **System State**: Fully functional full-stack tutoring marketplace application with dual-role IAM, collision-free scheduling, Stripe test payments, Celery background worker, and React 18 SPA.
- **Backend API**: Django 5.0 REST Framework running on port 8000, connected to PostgreSQL 16 and Redis 7.
- **Frontend Client**: React 18 + Vite + Tailwind CSS running on port 5173 with full light/dark theme support.
- **Asynchronous Processing**: Celery worker operational with Redis message broker handling notification dispatch.
- **Docker Compose**: 5-container architecture configured and tested (`docker-compose.yml`).

---

## Completed Milestones

- [x] Multi-container Docker Compose infrastructure with PostgreSQL 16 and Redis 7.
- [x] Django 5.0 project setup with modular settings (`base`, `dev`, `prod`).
- [x] Dual-role authentication (`client` / `provider`) with SimpleJWT token refresh.
- [x] Provider profile management, subject offerings, and weekly availability slots.
- [x] Collision-free booking reservation engine with PostgreSQL row-level locking (`select_for_update`).
- [x] Stripe test-mode checkout sessions, webhook handlers, and digital receipt generation.
- [x] Celery background task worker for asynchronous email alerts and mock payouts.
- [x] Review and rating system with Django post-save signals for tutor score aggregation.
- [x] Modern React 18 frontend dashboard with role-specific navigation, availability grid, earnings chart, and modals.
- [x] Comprehensive backend unit tests (`test_auth.py`, `test_bookings.py`, `test_providers.py`, `test_reviews.py`) and frontend tests (`Button.test.tsx`, `Badge.test.tsx`).

---

## Current Task
- **TASK-243**: Commit all newly authored specification and documentation files (`PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `RULES.md`, `TASKS.md`, `DECISIONS.md`, `MEMORY.md`, `TEST_PLAN.md`, `SECURITY.md`, `.env.example`) and push cleanly to GitHub remote repository (`https://github.com/Divyansh-co/DIV-TUTOR-CONNECT.git`).

---

## Known Issues & Polish Backlog

1. **Stripe Test Mode Simulation**:
   - Payments are currently wired to Stripe's test environment (`pk_test_...`, `sk_test_...`); production Stripe Connect onboarding for direct bank disbursements is planned for v2.0.
2. **Email Delivery Provider**:
   - Currently utilizes Django's console email backend in development; SendGrid or AWS SES SMTP integration needed for production mail delivery.
3. **Admin Dispute Mediation Portal**:
   - Disputes can be filed via the client modal; dedicated administrative dashboard for managing disputes and issuing refunds is on the enhancement roadmap.

---

## Immediate Next Steps

1. Author and finalize `TEST_PLAN.md`, `SECURITY.md`, and enhance the root `.env.example`.
2. Verify git staging status across all modified and untracked files.
3. Commit and push cleanly to origin main on GitHub.
