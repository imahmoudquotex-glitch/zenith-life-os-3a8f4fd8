# 📋 Zenith Life OS — Product Contract

> **Status:** ✅ FROZEN (Wave 00)
> **Last Updated:** 2026-05-16

---

## Vision Statement

> منصة LifeOS واحدة تجمع التخطيط، المعرفة، التركيز، العادات، والذكاء الاصطناعي — بخصوصية مطلقة وبدون أي paywall.

**One-liner (EN):** A privacy-first, desktop-first Life OS that replaces Notion + Todoist + Obsidian + Habit tracker + Focus app — free forever.

---

## Ideal Customer Profile (ICP)

| Persona | Workflow | Core Pain |
|---------|----------|-----------|
| 🧑‍💻 مهندس / مطور | PKM + Project Management | أدوات كتير ومتفرقة |
| 🎓 طالب جامعي | Notes + Tasks + Calendar | مفيش نظام يومي موحد |
| 🚀 مؤسس / Founder | OKRs + Finance + AI | خصوصية بيانات الشركة |
| 🔬 باحث | Deep Research + Journal | تسريب بيانات للـ AI |
| 📊 Power User | Full Life OS | Notion بطيء ومحدود |

---

## Pains & Jobs to be Done

### Pains
1. **Tool fragmentation:** 5+ أدوات يومياً (Notion, Todoist, Calendar, Habit tracker, Focus app)
2. **Privacy anxiety:** AI providers شايفين كل بياناتك
3. **Feature paywalls:** كل أداة بتحبس features ورا subscription
4. **Slow performance:** Notion لاج مع databases كبيرة
5. **No daily system:** مفيش dashboard يومي يجمع كل حاجة

### Jobs to be Done
1. سجل فكرة/مهمة بأقل friction ممكن
2. شوف يومك كامل في dashboard واحد
3. تابع عاداتك ومصاريفك بدون تطبيق منفصل
4. اكتب ملاحظات حساسة بأمان كامل
5. استخدم AI بدون تسريب بيانات

---

## Differentiators vs Competition

| Feature | Notion | Obsidian | Zenith |
|---------|--------|----------|--------|
| Free tier | محدود (blocks) | Free + plugins | ♾️ كل حاجة مجانية |
| Encryption | Server-side | Local files | Zero-Knowledge Vault (E2EE) |
| AI Privacy | Data used for training | Plugins only | DLP Gateway — no vault leakage |
| Daily System | No native | Daily notes only | Full Daily OS (dashboard+journal+heatmap) |
| Focus Timer | None | Plugin | Server-authoritative + audio mixing |
| Gamification | None | None | Ethical XP + Achievements |
| Desktop PWA | Electron (heavy) | Electron | Native PWA (no bloat) |
| Arabic-first | Weak RTL | Weak RTL | Arabic-first i18n |

---

## MVP Scope (10-15 Features)

### ✅ MVP — Build These
1. **Auth & Workspace** — signup, login, workspace creation, invitations
2. **Dashboard** — daily overview (tasks today, habits, calendar, streaks)
3. **Notes/Pages** — block editor (text, headings, lists, toggle, code, callout)
4. **Tasks** — create, assign, due dates, kanban view, priorities
5. **Habits** — daily check-in, streaks, heatmap
6. **Finance Tracker** — expenses, categories, monthly view
7. **Goals & OKRs** — goal creation, key results, progress tracking
8. **Calendar** — event creation, day/week view, task integration
9. **Search** — full-text search across all content
10. **AI Gateway** — summarize, expand, translate (with DLP)
11. **Vault** — zero-knowledge encrypted items
12. **Settings** — profile, workspace, appearance, AI toggle
13. **PWA** — installable, offline shell, desktop manifest
14. **Daily Notes** — auto-created daily page with rollups

### ⛔ Out of Scope (Post-MVP)
- Mobile app
- Collaborative real-time editing (CRDT)
- Stakes engine (financial commitments)
- Virtual avatar / Tamagotchi
- 3D Insights constellation
- Public API
- Marketplace / templates store
- Voice transcription
- Multi-region deployment
- Advanced analytics

---

## Free Forever Model

```
┌─────────────────────────────────────────────┐
│           ALL FEATURES = FREE               │
│     No tiers. No limits. No paywalls.       │
├─────────────────────────────────────────────┤
│  💚 Optional Donations                      │
│  ├─ One-time or recurring                   │
│  ├─ Badge احتفالي (no permissions)          │
│  ├─ No features gated behind donation       │
│  └─ Anonymous option available              │
└─────────────────────────────────────────────┘
```

---

## Success Metrics

| Metric | Target | Window | Owner |
|--------|--------|--------|-------|
| `activation_d1_pct` | ≥ 45% | daily | product |
| `retention_w1_pct` | ≥ 25% | weekly | product |
| `retention_m1_pct` | ≥ 15% | monthly | product |
| `vault_adoption_pct` | ≥ 30% | weekly | security |
| `ai_vault_leak_count` | 0 | daily | security |
| `p95_api_latency_ms` | ≤ 200 | daily | engineering |
| `rls_test_pass_pct` | 100% | per-deploy | engineering |
| `donations_conversion_pct` | tracked | monthly | business |

---

## Launch Criteria (Gate)

- [ ] 0 P0/P1 bugs
- [ ] RLS pgTAP tests 100% pass
- [ ] DR drill successful
- [ ] Penetration test report clean
- [ ] WCAG 2.2 AA audit pass
- [ ] CSP report-only enforced 2 weeks
- [ ] Uptime SLA 99.9% over 30d staging
- [ ] Lighthouse Performance ≥ 90
- [ ] Zero AI vault leakage in logs
