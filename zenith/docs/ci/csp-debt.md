# CSP Debt

This document tracks intentional deviations from strict CSP (Content Security Policy) principles.

## Current Debt
- **`style-src 'unsafe-inline'`**: Permitted temporarily. Next.js and Tailwind inject inline styles heavily during development and production routing. This degrades our strict CSP down to "Strict-ish CSP", as it opens vector possibilities if HTML injection is present.
- **`trusted-types nextjs default;`**: Permitted as an initial safeguard.

## Resolution Plan
- As part of Phase 04 or later UI hardening, we will evaluate generating inline CSS nonce hashes or migrating styling approaches that allow dropping `'unsafe-inline'` completely, upgrading to a true locked-down CSP.
