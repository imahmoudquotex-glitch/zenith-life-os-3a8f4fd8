# Wave 06 — Preflight Checklist

**Date:** 2026-05-17  
**Status:** ✅ COMPLETE

## Mandatory Items

| Item | Status | Notes |
|---|---|---|
| `w05-frozen` exists | ✅ | Confirmed |
| Supabase keys same | ✅ | Using existing project |
| Storage bucket `blocks-media` | ✅ | Created via migration 0612 + `request_file_upload` RPC |

## Optional Items (STUB MODE)

| Item | Status | Notes |
|---|---|---|
| CSP allowlist for img-src/media-src | ✅ | Defaults: Supabase CDN + YouTube/Vimeo/Twitter/Figma |
| oEmbed providers allowlist | ✅ STUB | Server proxy deferred to W07+ |
| Thumbnail service URL | ✅ STUB | Variants worker deferred |
| File size limits per type | ✅ | image≤10MB, video≤100MB, audio≤50MB, file≤25MB |
| Virus scan provider | ✅ STUB | `requestVirusScan()` = async worker ready |

## Execution Decision

All mandatory items confirmed ✅.  
Optional items in STUB MODE (oEmbed, virus scan, variants) — documented in ADR-0097.

**Result: PROCEED with Wave 06 execution.**
