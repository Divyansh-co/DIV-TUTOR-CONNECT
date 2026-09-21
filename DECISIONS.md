# Architecture Decision Records (ADRs)

## Overview
This document records the foundational technical and architectural decisions made in the engineering of **TutorConnect** (`DIV-TUTOR-CONNECT`).

---

## ADR-001: Django 5.0 & Django REST Framework vs. Node.js / Express

### Decision:
Use Django 5.0 with Django REST Framework (DRF) as the backend API core instead of Node.js / Express.

### Reason:
A marketplace platform involves complex transactional integrity, database relationships (users, providers, availability slots, bookings, payments, reviews), and authentication. Django provides a battle-tested ORM with native transaction management, built-in migration tooling, robust security defaults (CSRF, password hashing, SQL injection prevention), and first-class Celery integration, substantially reducing boilerplate.

---

## ADR-002: PostgreSQL 16 with Row-Level Slot Locking vs. NoSQL / MongoDB

### Decision:
Use PostgreSQL 16 as the primary relational database, leveraging `transaction.atomic()` and `select_for_update()` on booking slot reservations.

### Reason:
Preventing double-booking and schedule collisions requires strict ACID guarantees and row-level pessimistic locking. When two students attempt to book the same tutor slot simultaneously, PostgreSQL locks the candidate slot record during the checkout transaction, guaranteeing zero race conditions. Document stores lack native multi-table transactional locking required for financial and scheduling consistency.

---

## ADR-003: Redis 7 Dual-Role Architecture (Query Cache + Celery Task Broker)

### Decision:
Deploy Redis 7 to serve dual functions: Celery message broker (database index 0) and high-speed API response cache (database index 1).

### Reason:
Consolidates infrastructure requirements into a single lightweight in-memory service. Redis excels at asynchronous task queuing for Celery while simultaneously providing sub-millisecond key-value caching for tutor search queries and session tokens, avoiding the overhead of maintaining RabbitMQ alongside Memcached.

---

## ADR-004: React 18 + Vite + Tailwind CSS vs. Server-Rendered Django Templates

### Decision:
Build a decoupled single-page application (SPA) with React 18, Vite, and Tailwind CSS instead of traditional server-rendered Django HTML templates.

### Reason:
Booking calendars, interactive availability grid slot selection, real-time booking chat, and earnings visualizers require rich, stateful client-side interactivity. A decoupled React SPA communicates cleanly over typed REST endpoints, enables modern UI ergonomics (skeleton loaders, modals, drawer menus), and permits independent frontend edge deployment (e.g. on Vercel).

---

## ADR-005: Stripe Test-Mode Checkout Sessions with Webhook Verification

### Decision:
Utilize hosted Stripe Checkout sessions with server-to-server webhook verification (`stripe.Webhook.construct_event`) rather than custom client-side credit card inputs.

### Reason:
Hosted Checkout sessions offload PCI-DSS compliance requirements and card validation complexity to Stripe. Webhooks provide an idempotent, asynchronous source of truth for payment confirmation, ensuring bookings are only marked `CONFIRMED` upon cryptographic verification of payment capture.

---

## ADR-006: Dual-Role Identity Model with Role-Scoped Permissions

### Decision:
Implement a single unified `User` model with a distinct `role` field (`'client'` vs `'provider'`), supplemented by a `ProviderProfile` relation.

### Reason:
Avoids the anti-pattern of separate `StudentUser` and `TutorUser` authentication tables, simplifying JWT token generation, email uniqueness constraints, and password reset flows. Role-specific permissions are cleanly enforced via custom DRF permission classes (`IsClient`, `IsProvider`).

---

## ADR-007: Docker Compose Multi-Container Orchestration for Dev/CI Parity

### Decision:
Containerize all 5 application tiers (`postgres`, `redis`, `backend`, `celery_worker`, `frontend`) within a unified `docker-compose.yml`.

### Reason:
Ensures zero "works on my machine" discrepancy between local development and CI/CD pipelines. A single `docker-compose up --build` command provisions all databases, cache layers, worker queues, and reverse proxies identically across environments.
