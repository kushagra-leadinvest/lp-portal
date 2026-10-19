# LP Portal — Feature Plan & Status

Last updated: 2026-10-19  
Current phase: Phase 2 (Supabase schema + RLS) — in progress

---

## GROUP 1 — Core LP dashboard (dummy data)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Commitment bar per company row + detail page | PARTLY DONE | Overall drawdown bar on portfolio; per-company slim bar with "Fully deployed / Speak to RM" copy needs verification on detail page |
| 2 | Cash flows page: ledger + timeline chart | DONE | Ledger with date/amount/company, bar chart by quarter, upcoming capital calls section |
| 3 | Value-over-time chart (quarterly) | DONE | Line chart on portfolio overview, quarterly FY labels |
| 4 | Upcoming capital calls on dashboard + own section | DONE | Shows on portfolio page and cash flows page |
| 5 | Capital account statement — downloadable PDF | PARTLY DONE | Page exists with full data; Download PDF button is a placeholder — no actual PDF generation yet |
| 6 | Documents and Updates pages | DONE | Documents: list with download stubs, "placeholder" notice. Updates: per-company text updates by quarter |
| 7 | Sidebar + top bar | DONE | Portfolio, Cash Flows, Documents, Updates, Capital Account, Profile (greyed), Support, Sign out. Top bar: "as of" date, profile avatar. Notifications bell: not yet |

**Group 1 missing / to fix before closing:**
- PDF generation on Capital Account (actual file, not just a button)
- Notifications bell in top bar
- Profile page (currently greyed out placeholder)
- Email sender domain: hardcoded as `noreply@kushagrasanwal.com` — change before any real sends

---

## GROUP 2 — Portfolio analytics

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 8 | Exposure by sector and stage (donut charts) | NOT STARTED | |
| 9 | Per-company detail: entry date, entry valuation, current valuation, ownership %, latest round, status | NOT STARTED | |
| 10 | Realised vs unrealised gains breakdown | NOT STARTED | Dashboard shows total unrealised gain; split view not built |
| 11 | Fees and expenses paid, carry accrued | NOT STARTED | Needs compliance/CA review before any real numbers |

---

## GROUP 3 — Admin: quarterly update publishing

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 12 | Upload one consolidated quarterly update; backend splits per LP (only companies that LP holds) | NOT STARTED | |
| 13 | Per-LP PDF with LP name + their own figures (invested, current value, MOIC, DPI) for their companies only | NOT STARTED | |
| 14 | Preview-and-approve list, manual Publish only, hard test no PDF contains another LP's data, PDFs to LP's Documents with RLS, email alert scoped to that LP, all logged | NOT STARTED | |

---

## GROUP 4 — LP self-service + communication

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 15 | Tax documents section | NOT STARTED | Needs compliance/CA review |
| 16 | Quarterly company updates (per LP, scoped) | NOT STARTED | Depends on Group 3 admin flow |
| 17 | Email alert on new update/document (manual publish, recipient-scoped) | NOT STARTED | Resend integration |
| 18 | "Ask a question" form | NOT STARTED | |
| 19 | Glossary for DPI, MOIC, XIRR | NOT STARTED | |
| 20 | Notification preferences, mobile-first | NOT STARTED | |

---

## GROUP 5 — Audit, admin roles, advanced

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 21 | Audit log (who changed/published/downloaded what) — admin-viewable, not editable | NOT STARTED | |
| 22 | Admin roles: edit data / publish updates / view only (4 admins) | NOT STARTED | |
| 23 | Import history with undo and preview-and-confirm | NOT STARTED | |
| 24 | Optional LP 2FA + "last login" on profile; no new-device alert emails | NOT STARTED | |

---

## Migration checklist (end of project)

Run this only after all features are built, security tests pass, and compliance signs off:

- [ ] Create Lead Invest GitHub org and transfer repo
- [ ] Create Lead Invest Supabase project; run all migrations; populate with real LP data
- [ ] Create Lead Invest Vercel account/project; set env vars; connect `portal.leadinvest.in`
- [ ] Configure Resend with a `@leadinvest.in` sender domain and verify DNS
- [ ] Update all hardcoded email addresses (currently `kushagra@leadinvest.in` as contact)
- [ ] Update Supabase Site URL + Redirect URLs to `portal.leadinvest.in`
- [ ] Run full LP A vs LP B vs admin test suite on production data
- [ ] Compliance/CA sign-off on all LP-facing wording (fees, carry, tax, valuation disclaimers)
- [ ] Remove all dummy data
- [ ] Invite real LP users one at a time; verify each login and data scope
