# 🗺️ Zenith Life OS — Phase Map (Canonical Reference)

> **آخر تحديث:** 2026-05-16
> **الغرض:** خريطة رسمية تربط بين اسم الملف، رقم المرحلة الداخلي، الـ Wave، ونطاق الـ Migrations.
> **القاعدة:** في حالة التعارض، هذا الملف هو المرجع النهائي لترتيب التنفيذ.

---

## 📌 قاعدة الترقيم

- **اسم الملف** (`مرحله_XX.md`): رقم تسلسلي للملفات (0–60)
- **رقم المرحلة الداخلي**: الرقم الأصلي من الخطة القديمة (قد يختلف عن اسم الملف)
- **Wave Tag**: الـ tag المعتمد في Git (`wXX-frozen`)
- **Migration Range**: نطاق أرقام الـ SQL migrations

---

## Wave 00 — Foundation & Architecture

| الملف | المرحلة الداخلية | الموضوع | Wave Tag | Migrations |
|-------|-----------------|---------|----------|------------|
| `مرحله_00.md` | Phase 00 | Architecture Contracts & Invariants | `w00-frozen` | — |
| `مرحله_01.md` | Phase 01 | Kernel: Workspace/Auth/Permissions | `w01-frozen` | 0001–0050 |
| `مرحله_02.md` | Phase 02 | Database Core: Repository Pattern | `w02-frozen` | 0051–0099 |

## Wave 01 — Page System & Editor

| الملف | المرحلة الداخلية | الموضوع | Wave Tag | Migrations |
|-------|-----------------|---------|----------|------------|
| `مرحله_03.md` | Phase 03 | HYPER-UPGRADE Pack + Block Editor | `w03-frozen` | 0100–0149 |
| `مرحله_04.md` | Phase 04 | Page Tree & Navigation | `w04-frozen` | 0150–0174 |
| `مرحله_05.md` | Phase 05 | Database Views & Properties | `w05-frozen` | 0175–0199 |
| `مرحله_06.md` | Phase 06 | Templates & Duplication | `w06-frozen` | 0200–0219 |
| `مرحله_07.md` | Phase 07 | Relations & Rollups | `w07-frozen` | 0220–0239 |
| `مرحله_08.md` | Phase 08 | Formulas & Computed Fields | `w08-frozen` | 0240–0259 |

## Wave 02 — Feature Layer (Productivity)

| الملف | المرحلة الداخلية | الموضوع | Wave Tag | Migrations |
|-------|-----------------|---------|----------|------------|
| `مرحله_09.md` | Phase 09 | Tasks & Kanban | `w09-frozen` | 0260–0269 |
| `مرحله_10.md` | Phase 10 | Habits & Tracking | `w10-frozen` | 0300–0349 |
| `مرحله_11.md` | Phase 11 | Goals & OKRs | `w11-frozen` | 0350–0399 |
| `مرحله_12.md` | Phase 12 | Expenses & Budgets | `w12-frozen` | 0400–0449 |
| `مرحله_13.md` | Phase 13 | Calendar & Events | `w13-frozen` | 0450–0499 |
| `مرحله_14.md` | Phase 14 | Linked Mentions & Backlinks | `w14-frozen` | 0500–0549 |
| `مرحله_15.md` | Phase 15 | Daily Notes + Journal + Heatmap | `w15-frozen` | 0270–0299 |
| `مرحله_16.md` | Phase 16 | Notifications | `w16-frozen` | 0550–0599 |
| `مرحله_17.md` | Phase 17 | Search & Filtering | `w17-frozen` | 0600–0649 |
| `مرحله_18.md` | Phase 18 | Keyboard Shortcuts | `w18-frozen` | — |
| `مرحله_19.md` | Phase 19 | Settings & Preferences | `w19-frozen` | 0650–0699 |
| `مرحله_20.md` | Phase 20 | Data Portability & GDPR | `w20-frozen` | 1800–1899 |

## Wave 03 — AI & Intelligence

| الملف | المرحلة الداخلية | الموضوع | Wave Tag | Migrations |
|-------|-----------------|---------|----------|------------|
| `مرحله_21.md` | Phase 21 | AI Smart Linking | `w21-frozen` | 1900–1949 |
| `مرحله_22.md` | Phase 22 | AI Gateway Production Pack | `w22-frozen` | 2000–2049 |
| `مرحله_23.md` | Phase 23 | Voice Transcription (Whisper) | `w23-frozen` | 2050–2099 |
| `مرحله_24.md` | Phase 24 | AI Summarization | `w24-frozen` | 2100–2149 |

## Wave 04 — Engagement & Gamification

| الملف | المرحلة الداخلية | الموضوع | Wave Tag | Migrations |
|-------|-----------------|---------|----------|------------|
| `مرحله_25.md` | Phase 25 | Ethical Gamification (XP/Achievements) | `w25-frozen` | 2500–2599 |
| `مرحله_26.md` | Phase 26 | Challenges & Quests | `w26-frozen` | 2600–2649 |
| `مرحله_27.md` | Phase 27 | Sharing & Collaboration Profiles | `w27-frozen` | 2650–2699 |

## Wave 05 — Public & Marketing

| الملف | المرحلة الداخلية | الموضوع | Wave Tag | Migrations |
|-------|-----------------|---------|----------|------------|
| `مرحله_28.md` | Phase 28 | Automation & Workflows | `w28-frozen` | 2700–2799 |
| `مرحله_29.md` | Phase 29 | Integrations (Zapier/APIs) | `w29-frozen` | 2800–2849 |
| `مرحله_30.md` | Phase 30 | Realtime CRDT Engine | `w30-frozen` | 3000–3099 |
| `مرحله_31.md` | Phase 31 | Offline Mode & Sync | `w31-frozen` | 3100–3149 |
| `مرحله_32.md` | Phase 32 | Mobile Responsive PWA | `w32-frozen` | — |
| `مرحله_33.md` | Phase 33 | Onboarding Flow | `w33-frozen` | 3200–3249 |
| `مرحله_34.md` | Phase 34 | Feedback & Feature Requests | `w34-frozen` | 3250–3299 |
| `مرحله_35.md` | **Phase 26 ⚠️** | Marketing + Legal + Public Site | `w35-frozen` | 3300–3399 |
| `مرحله_36.md` | Phase 36 | Email System (Transactional) | `w36-frozen` | 3400–3449 |

## Wave 06 — Focus & Productivity

| الملف | المرحلة الداخلية | الموضوع | Wave Tag | Migrations |
|-------|-----------------|---------|----------|------------|
| `مرحله_37.md` | Phase 37 | Pomodoro & Focus Timer | `w37-frozen` | 3500–3549 |
| `مرحله_38.md` | Phase 38 | Learning & Flashcards | `w38-frozen` | 3550–3599 |
| `مرحله_39.md` | Phase 39 | Reading List & Bookmarks | `w39-frozen` | 3600–3649 |
| `مرحله_40.md` | Phase 40 | Focus Sessions (Server-Auth) | `w40-frozen` | 3700–3799 |
| `مرحله_41.md` | Phase 41 | Audio Ambiance & Mixing | `w41-frozen` | 3800–3849 |
| `مرحله_42.md` | Phase 42 | Time Tracking & Reports | `w42-frozen` | 3850–3899 |
| `مرحله_43.md` | Phase 43 | Review Templates (Weekly/Monthly) | `w43-frozen` | 3900–3949 |
| `مرحله_44.md` | Phase 44 | Mood & Energy Tracking | `w44-frozen` | 3950–3999 |

## Wave 07 — Advanced Features

| الملف | المرحلة الداخلية | الموضوع | Wave Tag | Migrations |
|-------|-----------------|---------|----------|------------|
| `مرحله_45.md` | Phase 45 | Stakes Engine (Stripe) | `w45-frozen` | 4400–4499 |
| `مرحله_46.md` | Phase 46 | Social Features | `w46-frozen` | 4500–4549 |
| `مرحله_47.md` | Phase 47 | Advanced Search (AI) | `w47-frozen` | 4550–4599 |
| `مرحله_48.md` | Phase 48 | Virtual Avatar (Tamagotchi) | `w48-frozen` | 4600–4699 |
| `مرحله_49.md` | Phase 49 | Insights Constellation (3D) | `w49-frozen` | 4700–4799 |

## Wave 08 — Infrastructure & Operations

| الملف | المرحلة الداخلية | الموضوع | Wave Tag | Migrations |
|-------|-----------------|---------|----------|------------|
| `مرحله_50.md` | **Phase 41 ⚠️** | Performance & Scale | `w50-frozen` | — |
| `مرحله_51.md` | Phase 28 | Privacy-First Analytics | `w51-frozen` | 4800–4849 |
| `مرحله_52.md` | Phase 29 | Performance & SEO | `w52-frozen` | — |
| `مرحله_53.md` | **Phase 30 ⚠️** | i18n + a11y (Arabic-First) | `w53-frozen` | 4850–4899 |
| `مرحله_54.md` | **Phase 34+35 ⚠️** | Monitoring & Error Tracking | `w54-frozen` | 4900–4949 |
| `مرحله_55.md` | Phase 31 | Security Hardening | `w55-frozen` | 4950–4999 |

## Wave 09 — Launch & DR

| الملف | المرحلة الداخلية | الموضوع | Wave Tag | Migrations |
|-------|-----------------|---------|----------|------------|
| `مرحله_56.md` | Phase 32 | Encrypted Backups + E2E Tests | `w56-frozen` | — |
| `مرحله_57.md` | **Phase 40+41 ⚠️** | CI/CD & Deployment | `w57-frozen` | — |
| `مرحله_58.md` | Phase 34 | Launch Readiness & Chaos Eng | `w58-frozen` | — |
| `مرحله_59.md` | **Phase 35 ⚠️** | Scaling & Growth | `w59-frozen` | — |
| `مرحله_60.md` | **Phase 36 ⚠️** | DR + Local Dev Parity | `w60-frozen` | — |

---

## ⚠️ ملاحظة على الترقيم المزدوج

الملفات المعلّمة بـ ⚠️ فيها تعارض بين رقم الملف والرقم الداخلي.
**القاعدة:** في كل الأحوال، **اسم الملف (مرحله_XX)** هو المرجع لترتيب التنفيذ.
الرقم الداخلي محفوظ للمرجعية التاريخية فقط.

---

## 🔢 Migration Ranges Summary

| Range | Owner |
|-------|-------|
| 0001–0099 | Kernel + DB Core (Phases 01–02) |
| 0100–0299 | Page System + Daily Notes (Phases 03–15) |
| 0300–0699 | Feature Layer (Phases 10–17) |
| 1800–1899 | Data Portability (Phase 20) |
| 1900–2149 | AI Layer (Phases 21–24) |
| 2500–2699 | Engagement + Sharing (Phases 25–27) |
| 2700–2899 | Automation + Integrations (Phases 28–29) |
| 3000–3999 | Collaboration + Focus (Phases 30–44) |
| 4400–4999 | Advanced + Infrastructure (Phases 45–55) |
