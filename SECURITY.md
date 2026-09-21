# Security Policy & Architecture Guide

## Overview
**TutorConnect** (`DIV-TUTOR-CONNECT`) processes user identities, tutor schedules, and financial transactions. This document details the application's security architecture, threat model, data protection policies, and vulnerability disclosure guidelines.

---

## 1. Threat Model & Security Controls

| Threat Vector | Risk Description | Mitigation Strategy |
|---|---|---|
| **Booking Race Conditions / Overlaps** | Concurrent requests double-booking the same availability slot | PostgreSQL ACID transactions with `select_for_update()` row-level locks |
| **Spoofed Payment Confirmations** | Attacker forging Stripe webhook events to confirm unpaid bookings | HMAC-SHA256 signature verification via `stripe.Webhook.construct_event()` with secret |
| **Privilege Escalation** | Student attempting to edit tutor rates or access other users' receipts | Custom DRF permissions (`IsProvider`, `IsClient`, `IsBookingOwner`) enforced server-side |
| **Credential Theft & Brute Force** | Dictionary attacks against login endpoints | Django password validators, PBKDF2 hashing, and Redis-backed request rate limiting |
| **Token Hijacking** | Long-lived JWT access tokens compromised on client machines | Short-lived access tokens (15 minutes) with rotating refresh tokens |
| **Cross-Origin API Abuse** | Malicious third-party websites invoking authenticated endpoints | Strict `CORS_ALLOWED_ORIGINS` checking and `SameSite` cookie policies |
| **SQL Injection & ORM Leaks** | Unsanitized queries compromising database tables | Standard Django ORM parameterized queries; raw SQL queries are strictly prohibited |

---

## 2. Authentication & Authorization Architecture

- **Dual-Role IAM**:
  - Every `User` record possesses a validated `role` (`'client'` or `'provider'`).
  - Access to management endpoints is gated by explicit DRF permission classes:
    ```python
    class IsProvider(permissions.BasePermission):
        def has_permission(self, request, view):
            return bool(request.user and request.user.is_authenticated and request.user.role == 'provider')
    ```
- **Object-Level Permissions**:
  - Users can only view or modify bookings where `booking.client == request.user` or `booking.provider.user == request.user`.

---

## 3. Stripe Webhook Signature Verification

Incoming Stripe webhooks are processed through strict cryptographic signature checks before touching the database:

```python
# apps/payments/views.py
payload = request.body
sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

try:
    event = stripe.Webhook.construct_event(
        payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
    )
except ValueError:
    return HttpResponse(status=400) # Invalid payload
except stripe.error.SignatureVerificationError:
    return HttpResponse(status=400) # Invalid signature
```

---

## 4. Secrets & Environment Management

- **Zero Hardcoded Secrets**:
  - `SECRET_KEY`, `DATABASE_URL`, and `STRIPE_SECRET_KEY` are never checked into version control.
  - Development environments use `.env` files explicitly listed in `.gitignore`.
- **Stripe Test Mode Isolation**:
  - Test mode keys (`pk_test_...`, `sk_test_...`) prevent real financial transactions during testing and development.

---

## 5. Network & Infrastructure Defenses

- **Redis Rate Limiting**:
  - Sensitive endpoints (`/api/v1/users/login/`, `/api/v1/users/register/`) are rate-limited via Redis cache to prevent credential stuffing.
- **Docker Network Isolation**:
  - The PostgreSQL database and Redis cache are attached to an internal Docker bridge network, unreachable directly from public host interfaces.

---

## 6. Reporting Security Vulnerabilities

If you discover a security vulnerability in TutorConnect, please report it privately:

- **Lead Engineer**: Divyansh Mishra
- **Repository**: [https://github.com/Divyansh-co/DIV-TUTOR-CONNECT.git](https://github.com/Divyansh-co/DIV-TUTOR-CONNECT.git)
- **Response SLA**: Security reports are triaged and addressed within 24 hours.
