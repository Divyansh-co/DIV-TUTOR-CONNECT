# Product Requirements Document (PRD)

## Product
**TutorConnect** (`DIV-TUTOR-CONNECT`)  
*Full-Stack Gig Marketplace & Academic Tutoring Platform*  
*Engineered by Divyansh Mishra*

---

## Problem
Online tutoring and freelance academic services often suffer from severe operational friction:
1. **Double-Booking & Slot Collisions**: Tutors and students struggle with manual coordination, leading to overlapping sessions and scheduling race conditions.
2. **Fragmented Workflows**: Booking, chat, payments, and reviews are typically scattered across different apps (e.g. Google Calendar, WhatsApp, PayPal).
3. **Delayed Processing & Request Freezing**: Heavy backend operations (payout calculations, email notifications, review aggregation) block user requests if handled synchronously.
4. **Lack of Verified Trust Signals**: Students cannot easily verify tutor credentials, ratings, or subject expertise, while tutors lack clear analytics on earnings and client retention.

---

## Target Users
- **Students & Learners**: Seeking qualified academic tutors, flexible slot booking, transparent pricing, and secure payment processing.
- **Tutors & Academic Mentors**: Managing multi-subject service listings, dynamic weekly availability schedules, client communications, and earnings dashboards.
- **Platform Administrators**: Overseeing dispute management, verified tutor credential reviews, and platform audit trails.

---

## Goal
Create an enterprise-grade, full-stack marketplace web application connecting tutors with students. The platform delivers collision-free calendar scheduling, dual-role JWT authentication, asynchronous background workers (Celery + Redis), integrated Stripe test-mode payments with automated receipts, and a clean, responsive SaaS dashboard.

---

## Core Features

1. **Dual-Role Identity & Access Management (IAM)**
   - Unified authentication supporting distinct Client (Student) and Provider (Tutor) account roles.
   - Dedicated role-specific routing, dashboards, and profile configurations.

2. **Collision-Free Availability & Scheduling Engine**
   - Interactive weekly availability grid where tutors configure recurring and custom time slots.
   - Atomic database slot locking preventing race conditions and double-booking during checkout.
   - Automated booking status state machine (`PENDING` ➔ `CONFIRMED` ➔ `COMPLETED` / `CANCELLED` / `DISPUTED`).

3. **Multi-Subject Service Listing Manager**
   - Tutors can create, edit, activate, or archive subject offerings with hourly rates, duration, and curriculum descriptions.
   - Real-time search and filtering by subject category, pricing range, availability, and minimum star rating.

4. **Stripe Test-Mode Payments & Automated Invoicing**
   - Seamless checkout simulation via Stripe Checkout sessions.
   - Webhook listener verifying payment signatures (`checkout.session.completed`, `payment_intent.succeeded`).
   - Digital receipt generation with itemized service fees, tutor payouts, and PDF download modals.

5. **Asynchronous Background Processing (Celery + Redis)**
   - Offloads email notifications, booking confirmation alerts, and review score recalculations from the HTTP request cycle.
   - Redis 7 functioning dual-purpose as high-speed query cache and Celery task broker.

6. **Trust, Verified Badges & Review Ecosystem**
   - Verified student reviews with 1-to-5 star ratings and detailed feedback text.
   - Automatic aggregate rating and review count synchronization via Django post-save signals.
   - Official "Verified Tutor" badge modal with credential validation indicators.

7. **In-App Booking Communication & Dispute Resolution**
   - Contextual booking chat modal enabling direct client-tutor messaging for active reservations.
   - Structured dispute filing modal enabling students and tutors to request administrative mediation.

---

## MVP (Minimum Viable Product)

- Dual-role registration and login (Student / Tutor) with JWT tokens.
- Tutor profile page with availability calendar and active service listings.
- Collision-free booking checkout flow.
- Simulated Stripe test-mode checkout and receipt display.
- Tutor and student dashboard views with active, upcoming, and past bookings.
- Review and rating submission on completed sessions.
- In-memory/Redis background notification dispatch.

---

## Out of Scope
- Production Stripe Connect live merchant payouts with automated bank transfers (Stripe test-mode utilized for MVP).
- Real-time WebRTC peer-to-peer video classrooms (sessions provide external Zoom/Google Meet links).
- Native iOS/Android app store packages (responsive PWA layout provided).
- AI-automated homework grading or autonomous chatbot tutoring.

---

## Success Criteria

A user should be able to:
1. Spin up the complete environment (PostgreSQL, Redis, Django API, Celery worker, React frontend) with a single command: `docker-compose up --build`.
2. Register as a Tutor, configure weekly availability slots, and publish a tutoring subject listing.
3. Register as a Student, browse tutors with faceted search, and select an open time slot.
4. Complete the checkout flow with zero slot overlap collisions.
5. Receive immediate asynchronous confirmation notifications.
6. Access interactive booking chat, download digital receipts, and submit a 5-star review upon session completion.
7. Pass all backend unit/integration tests (`pytest backend/tests/`) and frontend component tests (`npm test`).
