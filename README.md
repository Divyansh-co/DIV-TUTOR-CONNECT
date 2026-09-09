# TutorConnect

A full-stack gig marketplace app that connects tutors with students — built to actually feel like a production SaaS product instead of another CRUD tutorial project.

Built by Divyansh Mishra.

## Overview

TutorConnect lets tutors list their availability and students book sessions with them, with real scheduling logic behind it (not just a static calendar). Both sides get their own dashboard/role in the app. I wanted to go past "just build a form and save it to a DB" and actually deal with things like conflicting time slots, background jobs, caching, and payments — even if the payments part is running in Stripe's test mode for now.

## Tech stack

**Backend**
- Django 5.0 + Django REST Framework
- PostgreSQL 16
- Redis 7 — used both as a cache layer and as the Celery broker
- Celery for async/background jobs (things like sending notifications, processing payouts, etc. don't block the request)

**Frontend**
- React 18 + TypeScript, built with Vite
- Tailwind CSS for styling

**Payments**
- Stripe, running in test mode — simulates the checkout + payout flow for tutors without touching real money

**Infra**
- Dockerized with Docker Compose so the whole thing (API, DB, Redis, worker) spins up together
- Deployed on Vercel
- CI/CD pipeline set up so pushes get tested/built automatically

## Key features

- Dual-role accounts — tutor and student have different dashboards/permissions
- Real-time-ish availability scheduling with collision-free slot calculation (so you can't double-book a tutor)
- Async background workflows via Celery instead of blocking the main request cycle
- Multi-level Redis caching + basic rate limiting on the API
- Stripe test-mode checkout with simulated payouts to tutors

## Running it locally

```bash
git clone https://github.com/Divyansh-co/DIV-TUTOR-CONNECT.git
cd DIV-TUTOR-CONNECT
docker-compose up --build
```

You'll need a `.env` file for both the backend and frontend with your DB credentials, Redis URL, and Stripe test keys — check `.env.example` for what's needed.

Backend runs the Django/DRF API, frontend is served separately via Vite's dev server during development.

## Why I built this

Wanted a project that goes deep on backend architecture (queues, caching, race conditions on bookings) instead of just being another portfolio to-do app. This is also the project I use to show how I think about system design when I talk about it in interviews/portfolio reviews.

## Known limitations / things I'd still improve

- Stripe is test-mode only, no real payouts wired up
- Notification system could use more polish (email/SMS hooks aren't fully fleshed out)
- Admin-side tooling for disputes/refunds is minimal right now
- Test coverage on the scheduling logic could be higher given how central it is

## Contributing

This started as a solo portfolio/learning project, so it's not really set up for outside contributions right now, but feel free to open an issue if you spot a bug or have feedback.
