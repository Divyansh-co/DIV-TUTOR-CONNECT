# System Architecture

## Overview
**TutorConnect** (`DIV-TUTOR-CONNECT`) is architected as an enterprise-grade, decoupled full-stack SaaS platform. It leverages a modern single-page React frontend, an asynchronous Django REST Framework backend, PostgreSQL 16 for ACID-compliant transactional persistence, and Redis 7 as both a high-throughput cache and Celery task broker.

---

## Technology Stack

### Frontend Client
- **Framework**: React 18 (Strict Mode) + TypeScript
- **Build Tool & Dev Server**: Vite
- **Styling & Design System**: Tailwind CSS 3.4 + PostCSS + Autoprefixer
- **State Management**: React Context API (`AuthContext`, `ThemeContext`)
- **Icons & Visuals**: Lucide React + Heroicons + SVG charts
- **Testing**: Vitest + React Testing Library

### Backend Core & API
- **Framework**: Django 5.0 + Django REST Framework (DRF)
- **Authentication**: JWT (JSON Web Tokens via `djangorestframework-simplejwt`)
- **WSGI / ASGI**: Gunicorn (WSGI) + Uvicorn / Django ASGI
- **Settings Hierarchy**: Modular environments (`core.settings.base`, `dev`, `prod`)
- **API Serializers & Permissions**: DRF ModelSerializers with custom permission classes (`IsProvider`, `IsClient`, `IsBookingOwner`)

### Database & Caching Layer
- **Primary Database**: PostgreSQL 16
  - Enforces foreign key integrity, cascade rules, and `select_for_update()` row-level locks on booking slot reservations.
- **Cache & Message Broker**: Redis 7
  - Database index 0: Celery asynchronous task message broker (`redis://redis:6379/0`).
  - Database index 1: High-speed API query and session cache (`redis://redis:6379/1`).

### Background Workers & Tasks
- **Task Queue**: Celery 5.3+
- **Asynchronous Workflows**:
  - Email notification dispatch (booking confirmation, cancellation, dispute alerts).
  - Review aggregation recalculation on tutor profiles.
  - Tutor mock payout scheduling.

### Payment Gateway
- **Provider**: Stripe (Test Mode)
- **Integration**: Stripe Checkout Sessions + Webhook Signature Verification (`STRIPE_WEBHOOK_SECRET`).

### Infrastructure & Deployment
- **Local Multi-Container**: Docker Compose (`docker-compose.yml`) orchestrating 5 services:
  `postgres`, `redis`, `backend` (Django), `celery_worker`, and `frontend` (Nginx/Vite).
- **Edge Deployment**: Frontend pre-configured for Vercel deployment (`vercel.json`), backend for containerized PaaS.

---

## Architectural Data Flow

```text
Student / Client                      Tutor / Provider
       │                                     │
       ▼                                     ▼
React 18 + Vite Frontend (Port 5173 / Vercel Edge)
       │
       ├── [JWT Bearer Authentication: /api/v1/users/token/]
       │
       ▼
Django 5.0 REST Framework Gateway (Port 8000 / Gunicorn)
       │
       ├── Role Authorization (IsClient vs. IsProvider)
       │
       ├── Apps & Service Modules:
       │     ├── apps.users         --> Authentication, Profiles, Dual-Role Accounts
       │     ├── apps.providers     --> Availability Slots, Subjects, Hourly Rates
       │     ├── apps.bookings      --> Collision-Free Booking & Status State Machine
       │     ├── apps.payments      --> Stripe Checkout Sessions & Webhooks
       │     ├── apps.reviews       --> Star Ratings & Aggregation Signals
       │     ├── apps.notifications --> Alerts, Drawer Feed, & Real-Time Events
       │     └── apps.search        --> Faceted Tutor Discovery & Filters
       │
       ├── [ACID Transactions & Row-Level Slot Locking]
       │     ▼
       ├── PostgreSQL 16 Database
       │
       ├── [Query Caching (DB 1)]
       │     ▼
       ├── Redis 7 In-Memory Cache
       │
       └── [Async Job Enqueue (DB 0)]
             ▼
       Celery Background Worker
             ├── Email Dispatcher
             ├── Payout Calculations
             └── Rating Recalculation
```

---

## Project Directory Structure

```text
DIV-TUTOR-CONNECT/
├── .env.example                      # Root environment configuration template
├── .gitignore                        # Git exclusions for Python, Node, and containers
├── docker-compose.yml                # 5-service container orchestration manifest
├── package.json                      # Root workspace scripts
├── README.md                         # Executive project documentation
├── PRD.md                            # Product Requirements Document
├── ARCHITECTURE.md                   # System architecture and technical contracts
├── DESIGN.md                         # Visual design system, palette, and UX rules
├── RULES.md                          # Engineering rules and coding standards
├── TASKS.md                          # Phased task roadmap with Task IDs
├── DECISIONS.md                      # Architecture Decision Records (ADRs)
├── MEMORY.md                         # Active project state and changelog
├── TEST_PLAN.md                      # Exhaustive test matrix and verification plan
├── SECURITY.md                       # Security policy and data protection standards
├── setup_github_repo.bat             # Automation script for GitHub setup
├── setup_github_repo.sh              # Unix automation script for GitHub setup
├── vercel.json                       # Vercel deployment configuration
│
├── backend/                          # Django 5.0 REST API Core
│   ├── Dockerfile                    # Container definition for Django & Celery
│   ├── requirements.txt              # Python production dependencies
│   ├── manage.py                     # Django CLI manager
│   ├── core/
│   │   ├── __init__.py
│   │   ├── asgi.py                   # ASGI entry point for asynchronous features
│   │   ├── celery.py                 # Celery app and broker configuration
│   │   ├── urls.py                   # Global API URL router
│   │   ├── wsgi.py                   # WSGI web server entry point
│   │   └── settings/
│   │       ├── __init__.py
│   │       ├── base.py               # Shared settings, apps, middleware, JWT config
│   │       ├── dev.py                # Development overrides (SQLite/console email)
│   │       └── prod.py               # Production settings (Postgres/Redis/Strict CORS)
│   ├── apps/
│   │   ├── users/                    # Custom User model, dual-role IAM, JWT serializers
│   │   ├── providers/                # ProviderProfile, SubjectOfferings, AvailabilitySlots
│   │   ├── bookings/                 # Booking model, slot conflict check, status lifecycle
│   │   ├── payments/                 # Stripe checkout, webhook handler, mock payouts
│   │   ├── reviews/                  # Reviews, ratings, signals, verified badge triggers
│   │   ├── notifications/            # In-app notifications & Celery dispatch
│   │   └── search/                   # Faceted query builder for tutors & subjects
│   └── tests/
│       ├── conftest.py               # Pytest fixtures and mock factories
│       ├── test_auth.py              # Authentication and JWT token unit tests
│       ├── test_bookings.py          # Collision-free slot reservation and race condition tests
│       ├── test_providers.py         # Provider profile and availability schedule tests
│       └── test_reviews.py           # Review signals and aggregate rating tests
│
└── frontend/                         # React 18 + TypeScript + Vite Client
    ├── Dockerfile                    # Production Nginx container
    ├── nginx.conf                    # Nginx reverse proxy and SPA fallback routing
    ├── package.json                  # NPM dependencies and build scripts
    ├── postcss.config.js             # PostCSS Tailwind processor
    ├── tailwind.config.js            # Custom design tokens, theme colors, and radius
    ├── tsconfig.json                 # TypeScript strict configuration
    ├── tsconfig.node.json
    ├── vercel.json                   # Frontend edge rewrites
    ├── vite.config.ts                # Vite build configuration and test environment
    ├── public/
    │   └── favicon.svg               # Graduation cap and brand shield icon
    └── src/
        ├── App.tsx                   # Master routing and role-protected route guards
        ├── index.css                 # Tailwind utilities and global animations
        ├── main.tsx                  # React DOM mount point
        ├── test-setup.ts             # Vitest test setup
        ├── types/                    # TypeScript domain interfaces
        ├── context/
        │   ├── AuthContext.tsx       # JWT authentication and user session state
        │   └── ThemeContext.tsx      # Dark / light theme provider
        ├── services/
        │   └── api.ts                # Axios HTTP client with automatic JWT token refresh
        ├── components/
        │   ├── booking/              # Booking modals, calendar grid, checkout, receipts
        │   ├── dashboard/            # Availability manager, earnings chart, service manager
        │   ├── layout/               # Navbar, footer, notification slide-over drawer
        │   └── ui/                   # Reusable Button, Card, Badge, Avatar, Modal, Rating
        ├── pages/
        │   ├── HomePage.tsx          # Landing hero, featured tutors, value propositions
        │   ├── BrowseTutorsPage.tsx  # Faceted search, price filters, subject selector
        │   ├── TutorProfilePage.tsx  # Profile hero, credentials, availability calendar
        │   ├── ClientDashboardPage.tsx # Student upcoming sessions and receipts
        │   ├── ProviderDashboardPage.tsx # Tutor schedule, earnings charts, listing controls
        │   ├── AuthPage.tsx          # Dual-role tabbed Login / Register form
        │   ├── VerifyEmailPage.tsx   # Email confirmation handler
        │   └── NotFoundPage.tsx      # 404 error page
        └── tests/
            ├── Badge.test.tsx        # UI Badge component tests
            └── Button.test.tsx       # UI Button component tests
```

---

## Architectural Rules

1. **Atomic Booking Slot Reservations**:
   - Booking reservations must execute within an atomic transaction (`transaction.atomic()`) using PostgreSQL row-level locks (`select_for_update()`).
   - Conflicting overlaps must be detected at the database layer before creating booking records.

2. **Decoupled Asynchronous Processing**:
   - The HTTP request cycle must never perform blocking external API calls (e.g. sending emails or processing Stripe refunds).
   - All side effects must be dispatched as Celery background tasks through Redis.

3. **Strict Dual-Role Authorization**:
   - Tutors cannot book sessions with themselves.
   - Only users with `role == 'provider'` may create service listings or publish availability slots.
   - Access to client or provider dashboards must be enforced both frontend (route guards) and backend (DRF permission classes).

4. **Idempotent Webhook Processing**:
   - Stripe webhooks must verify the HMAC-SHA256 signature against `STRIPE_WEBHOOK_SECRET`.
   - Webhook event IDs must be recorded in the database to prevent duplicate payment processing.

5. **Token Rotation & Security**:
   - JWT access tokens must have short expiration periods (e.g. 15 minutes), with refresh tokens rotated upon exchange.
