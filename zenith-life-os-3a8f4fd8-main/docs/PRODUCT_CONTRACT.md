# Product Contract — Zenith Life OS

> This document defines what Zenith Life OS IS and IS NOT.

## What Zenith IS

- **A personal life operating system** — productivity + knowledge + planning
- **Open Source** — MIT license, full transparency
- **Donations-funded** — no subscriptions, no paywalls, no feature gating
- **Privacy-first** — zero-knowledge vault for sensitive data
- **Offline-capable** — PWA with outbox queue for mutations
- **Multilingual** — Arabic (RTL) and English from day 1
- **AI-augmented** — AI as assistant, never as gatekeeper

## What Zenith IS NOT

- Not a SaaS with billing tiers
- Not a social network
- Not a platform for third-party apps
- Not a real-time collaboration tool (single-user, multiple devices)
- Not dependent on any single AI provider

## Monetization Model

- **100% donations** — Stripe, LemonSqueezy, PayPal
- **Supporter badge** — cosmetic only, no feature unlocks
- **No premium features** — every feature is available to every user
- **No data monetization** — user data is never sold or shared

## Technical North Star

- **Multi-tenant workspace isolation** — RLS FORCE everywhere
- **Security-first** — zero-trust, server-side auth, CSP, CSRF
- **Progressive enhancement** — works without JS, enhanced with JS
- **Accessible** — WCAG 2.1 AA, axe-core green, RTL-native
- **Deterministic** — Clock abstraction, Result pattern, no side effects in business logic
