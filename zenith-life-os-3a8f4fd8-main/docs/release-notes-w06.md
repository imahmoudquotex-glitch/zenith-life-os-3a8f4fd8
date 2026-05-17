# Wave 06 — Release Notes

**Tag:** `w06-frozen`  
**Date:** 2026-05-17  
**Status:** ✅ PRODUCTION READY

---

## ✨ What's New

### Block Editor Core
- **25+ Block Types** — paragraph, headings (1-3), bulleted/numbered/todo lists, toggle, quote, callout, divider, code, image, video, audio, file, embed, bookmark, column layout, database inline (placeholder), synced blocks, template button, table of contents, page link, vault inline.
- **Slash Menu** — opens in <100ms, 30+ commands, fuzzy Arabic/English search, full keyboard navigation.
- **Drag & Drop** — @dnd-kit powered, atomic `reorder_block` RPC, optimistic UI with rollback.
- **Nested Blocks** — unlimited nesting up to max depth 50, Tab/Shift+Tab for indent/outdent.
- **Virtual Scroll** — @tanstack/react-virtual enabled for pages with >200 blocks, maintains 16ms keystroke target.
- **Floating Toolbar** — bold, italic, strikethrough, underline, code, link, color.

### Fractional Indexing
- Position stored as `DOUBLE PRECISION` — supports billions of inserts before renormalize.
- Auto-renormalize via `reorder_block` RPC when gap <0.001.

### Block Versioning
- Every content change creates a version snapshot.
- Auto-prune at 50 versions/block.
- UI: History drawer with preview + restore (with snapshot before restore).

### Synced Blocks
- Cycle detection via DB trigger (`assert_no_synced_cycle`) + client DFS.
- Read-through sync: source update reflects in all references.

### Offline-First Mutations
- IndexedDB outbox queues all mutations during offline.
- ConnectivityIndicator shows live online/offline/queued status.
- Dead-letter UI for mutations failed 5+ times (retry/export/discard).

### Block Permissions
- Per-block permission grants (view/comment/edit/none).
- `inherit_from_page` flag (default: true).
- `get_block_effective_permission` RPC for permission resolution.
- Permission dialog in block menu (⋯ → Permissions).

### Files & Media Pipeline
- Signed URL upload direct to Supabase Storage (blocks-media bucket).
- MIME whitelist enforced (images, video, audio, PDF, docs, zip).
- Per-workspace storage quota (5GB default).
- Quota checked via `request_file_upload` RPC before allowing upload.
- Hard delete from bucket + soft delete in DB.
- Virus scan: STUB (async worker ready).
- Image variants: STUB (async worker ready).

### Page Header
- Editable title (contenteditable, debounced 500ms save).
- Icon picker (emoji + custom).
- Cover image upload with drag zone.

### Security
- DOMPurify server-side on all content_json.
- Vault blocks excluded from AI context and search.
- Embed blocks: sandboxed iframe, oEmbed allowlist (YouTube, Vimeo, Twitter, Figma, CodeSandbox).
- No `dangerouslySetInnerHTML` without sanitization (CI lint rule).
- All mutations require `Idempotency-Key` header.

---

## 📋 Migrations Applied

| Migration | Name |
|---|---|
| 0600 | block_types_enum |
| 0601 | blocks table + RLS + indexes |
| 0602 | block_versions + prune trigger |
| 0603 | reorder_block_rpc |
| 0604 | soft_delete_block_rpc |
| 0605 | synced_block_refs + cycle trigger |
| 0606 | block_search_tsv |
| 0607 | blocks_audit_trigger |
| 0608 | page_links |
| 0609 | block_attachments |
| 0610 | rls_pack_w06 |
| 0611 | block_permissions + version restore |
| 0612 | files pipeline + quotas |

---

## 📁 New Files

```
src/
  api/blocks.ts                          — 7 block API handlers
  api/files.ts                           — 3 files API handlers
  components/editor/
    BlockPermissionDialog.tsx            — permission + version history UI
    PageHeader.tsx                       — title + icon + cover
    SaveStatus.tsx                       — autosave state machine
  lib/
    block-engine/
      block-service.ts                   — business logic
      hooks/
        use-block-mutation.ts            — optimistic mutations
        use-block-permissions.ts         — permissions + version hooks
    files/
      files-service.ts                   — upload/delete/quota
      __tests__/files-service.test.ts
supabase/migrations/0612_files_pipeline.sql
docs/
  conventions/blocks.md
  conventions/fractional-index.md
  conventions/synced-blocks.md
  conventions/block-versioning.md
  conventions/editor-sanitization.md
  glossary.md
  adr/ADR-0086-0095-wave06.md
```

---

## 🔒 Security Review

- [x] All block types reviewed for XSS
- [x] Embed iframe sandbox attrs verified
- [x] Image/video src validated against CSP allowlist
- [x] Markdown import passes through sanitizer
- [x] Outbox does not store secrets (only content_json + metadata)
- [x] Vault blocks: zero leakage to AI context

---

## 🔮 Deferred to Later Waves

| Feature | Wave |
|---|---|
| CRDT / Yjs real-time collab | W23 |
| oEmbed full server proxy | STUB — W07+ |
| Virus scan (real) | STUB — W07+ |
| Image variant generation (real) | STUB — W07+ |
| Formula blocks | W08 |
| AI inline suggestions | W20 |
| Public sharing | W20 |

---

## 🚀 Next Wave

**Wave 07 — Settings & Workspace Management** starts after this freeze.

CRDT decision needed before W07: Yjs vs. Automerge.
`database_inline` placeholder open for W07 DB Engine UI.
Formula block placeholder open for W08.
