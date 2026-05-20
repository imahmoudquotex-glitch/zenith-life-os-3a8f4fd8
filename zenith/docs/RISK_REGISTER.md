# ⚠️ Zenith Life OS — Risk Register

> **Status:** ✅ FROZEN (Wave 00)
> **Review Cadence:** Every 4 weeks

---

## 🔴 Critical Risks

### R-001: RLS Bypass via Raw SQL or Function Escalation
- **Category:** Security
- **Probability:** Medium
- **Impact:** Critical — full tenant data exposure
- **Mitigation:**
  - pgTAP cross-tenant tests on every migration
  - Canary tenants with synthetic data
  - ESLint rule: no raw SQL outside repository layer
  - `FORCE ROW LEVEL SECURITY` on every table
  - Quarterly chaos engineering drills
- **Owner:** Security Lead

### R-002: AI Prompt Injection / Vault Data Leak
- **Category:** Security
- **Probability:** Medium
- **Impact:** Critical — encrypted data sent to AI
- **Mitigation:**
  - `runAIWithQuota` as sole AI entrypoint
  - Sensitivity levels: `none|low|medium|high`
  - `high` = AI completely blocked (vault, journals, moods, financial PII)
  - Context scrubbing (regex + PII model) before prompt
  - `<user_input>` containment tags
  - ESLint blocks direct AI SDK imports outside `packages/ai/`
  - Whisper Mode toggle disables AI entirely
- **Owner:** AI Team

### R-003: Supply Chain Attack (npm typosquatting / dependency confusion)
- **Category:** Security
- **Probability:** Low
- **Impact:** Critical — code execution in build
- **Mitigation:**
  - SBOM (CycloneDX) in every release
  - OSSF Scorecard ≥ 7.0
  - Sigstore signing for artifacts
  - Dependabot + Renovate
  - gitleaks + Semgrep + OWASP ZAP in CI
  - Pinned versions with lockfile
- **Owner:** DevOps

---

## 🟡 High Risks

### R-004: Feature Creep Beyond MVP
- **Category:** Product
- **Probability:** High
- **Impact:** High — delayed launch
- **Mitigation:**
  - `check-mvp-scope.ts` enforces MVP_ALLOWED set
  - Scope review every 4 weeks
  - Phase 00 Product Contract defines explicit out-of-scope
- **Owner:** Product

### R-005: Performance Regression
- **Category:** Engineering
- **Probability:** Medium
- **Impact:** High — user churn
- **Mitigation:**
  - Performance budgets in CI: TTI<2s, FCP<1.2s, main chunk<200KB
  - DB query p95<50ms enforced
  - Lighthouse CI gate ≥ 90
  - k6 load testing on critical paths
- **Owner:** Engineering

### R-006: AI Vendor Lock-in (OpenAI/Anthropic outage)
- **Category:** Operations
- **Probability:** Medium
- **Impact:** High — AI features down
- **Mitigation:**
  - Provider abstraction layer in `packages/ai/src/providers/`
  - Minimum 2 fallback providers
  - Offline rule-based fallbacks for critical features
- **Owner:** AI Team

---

## 🟢 Medium Risks

### R-007: Regulatory Compliance (GDPR/CCPA/Egyptian PDPL)
- **Category:** Legal
- **Probability:** Medium
- **Impact:** Medium — legal liability
- **Mitigation:**
  - Tenant deletion job (GDPR erasure)
  - DPO process documented
  - Immutable audit access logs
  - Export bundle encrypted and available
- **Owner:** Legal

### R-008: Onboarding Friction
- **Category:** Product
- **Probability:** Medium
- **Impact:** Medium — low activation
- **Mitigation:**
  - activation_d1_pct metric tracked
  - Onboarding wizard with template selection
  - Sample workspace with pre-populated data
- **Owner:** Product

### R-009: Crypto Downgrade Attack
- **Category:** Security
- **Probability:** Low
- **Impact:** Medium — weakened encryption
- **Mitigation:**
  - TLS 1.3 only
  - HSTS preload
  - Cipher suite whitelist
  - `check-encryption-primitives.ts` CI gate
- **Owner:** Security

### R-010: Backups Untested
- **Category:** Operations
- **Probability:** Medium
- **Impact:** Medium — data loss in disaster
- **Mitigation:**
  - Quarterly restore drills (documented)
  - PITR 7d hot / 30d warm / 1y cold
  - Multi-region encrypted S3 Glacier
- **Owner:** DevOps
