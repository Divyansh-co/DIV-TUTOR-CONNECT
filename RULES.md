# Development Rules & AI Engineering Guidelines

## Overview
This document outlines the strict engineering rules and guidelines for developing, extending, and maintaining **TutorConnect** (`DIV-TUTOR-CONNECT`). All human developers and AI coding agents must adhere strictly to these principles.

---

## 1. General Rules

- **Strict Type Safety**:
  - Frontend: TypeScript strict mode enabled (`"strict": true` in `tsconfig.json`). Never use `any` when a domain model type exists in `src/types/index.ts`.
  - Backend: Django models, serializers, and service functions must use Python type hints and adhere strictly to PEP8 conventions.
- **Modularity & Layer Separation**:
  - UI components must never make direct database queries or raw unvalidated network calls.
  - All API interactions must route through `services/api.ts` with centralized JWT token management.
  - Complex booking logic belongs in model managers or service layers, not inside DRF views or frontend components.

---

## 2. Before Coding

- **Read Project Specifications**:
  - Review `PRD.md`, `ARCHITECTURE.md`, and `DESIGN.md` before adding endpoints, modifying database models, or building new UI pages.
- **Inspect Existing Models & Serializers**:
  - Cross-check `apps/users/models.py`, `apps/providers/models.py`, and `apps/bookings/models.py` before proposing database migrations.
- **Plan Schema Changes**:
  - When altering database models, always inspect migration dependency chains and verify backward compatibility.

---

## 3. Booking & Scheduling Integrity Rules

- **Atomic Transactions & Slot Locking**:
  - All booking reservations must be wrapped in `django.db.transaction.atomic()`.
  - Availability slots must be locked using `select_for_update()` to prevent concurrent double-booking.
  - Always validate slot overlap: `(start_time < existing_end) and (end_time > existing_start)`.
- **State Machine Transitions**:
  - Enforce valid transitions: `PENDING` ➔ `CONFIRMED` ➔ `COMPLETED`.
  - Cancellations and disputes must specify an explicit reason and timestamp.

---

## 4. UI & Frontend Guidelines

- **Follow `DESIGN.md`**:
  - Use the defined Slate and Indigo palette (`#4f46e5`, `#f8fafc`, `#0f172a`, Emerald `#10b981`).
  - Support both Light and Dark mode through `ThemeContext`.
- **Role-Aware Views**:
  - Ensure client views never expose provider management controls (and vice versa).
  - Protect private routes with `<ProtectedRoute role="provider" />` and `<ProtectedRoute role="client" />`.
- **State Completeness**:
  - All data-driven views must render clean **Loading** (skeleton screens), **Empty**, **Error**, and **Success** states.

---

## 5. Security & Payment Safeguards

- **Zero Secret Exposure**:
  - Never commit or expose `SECRET_KEY`, `DATABASE_URL`, or `STRIPE_SECRET_KEY`.
- **Stripe Webhook Signature Verification**:
  - All incoming webhook events must be validated using `stripe.Webhook.construct_event()` with `STRIPE_WEBHOOK_SECRET`.
  - Reject unverified webhook payloads immediately with HTTP 400.
- **Authorization Enforcement**:
  - Tutors may only modify their own availability slots, service offerings, and profile details.
  - Students may only view bookings they created; tutors may only view bookings where they are the assigned provider.

---

## 6. Testing & Quality Assurance

- **Pre-Commit Verification**:
  - Backend: Run `pytest backend/tests/` to verify auth, booking conflicts, providers, and reviews.
  - Frontend: Run `npm test` in `frontend/` to verify component rendering and state handlers.
- **Test Integrity**:
  - Never disable or bypass booking conflict tests to make tests pass.
  - Maintain mock Stripe services in test suites without invoking live external Stripe endpoints.

---

## 7. Git & Version Control

- **Atomic Commits**:
  - Keep commits modular and self-contained.
  - Use conventional prefixes: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`.

---

## 8. AI Assistant Rulebook (.cursor/rules)

For developers utilizing Cursor or AI IDEs, these rules map directly to the following modular rulesets:

```text
.cursor/
└── rules/
    ├── general.mdc       # General coding standards and type rules
    ├── frontend.mdc      # React 18, Vite, Tailwind, and Design System rules
    ├── backend.mdc       # Django 5.0, DRF, PostgreSQL, and Celery rules
    ├── booking.mdc       # Atomic slot locking and collision-free logic rules
    ├── security.mdc      # JWT auth, Stripe webhook verification, and permissions
    └── testing.mdc       # Pytest backend and Vitest frontend test standards
```
