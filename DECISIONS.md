# LP Portal — Architecture & Design Decisions

Last updated: 2026-10-19

---

## Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 14 App Router | SSR for auth, file-based routing, Vercel-native |
| Auth | Supabase Magic Link | No passwords; LP experience is simple |
| Database | Supabase Postgres | RLS built in; co-located with auth |
| Storage | Supabase Storage | RLS on buckets; PDFs stored here |
| Hosting | Vercel | Automatic preview URLs per branch |
| Email | Resend | Transactional; easy sender-domain setup |
| Language | TypeScript (strict) | Catch errors at compile time |

---

## Data model decisions

- **Company = scheme**: each portfolio company is modelled as a scheme; LPs invest into schemes, not companies directly. Table: `schemes`.
- **Per-LP investment row**: each LP's holding in each scheme is one row in `investments` (committed, deployed, current_value, moic, ownership_pct).
- **Valuations**: current_value comes from admin input only. If null → show "Valuation pending". Never interpolate or estimate.
- **Cash flows**: every capital call and distribution is a row in `cash_flows` with direction (call / distribution).
- **Documents**: stored in Supabase Storage under `documents/{lp_id}/{filename}`. RLS ensures LP only reads their own path.
- **Updates**: published by admin; each update row has an array of `scheme_ids` it covers. LP sees only updates for schemes they hold.
- **Audit log**: append-only table; no UPDATE or DELETE allowed via RLS. Admin can read; no one can write via API (server-side only).

---

## Theme

- Background: white (`#FFFFFF`)
- Text: near-black (`#1A1A1A`)
- Accent / brand: crimson (`#8B1A1A` or Lead Invest exact hex — confirm before migration)
- Logo: Lead Invest logo (already in `/public/logo.png`)
- Commitment bars: crimson fill on light grey track (`#F3F3F3`)
- Calm language only: no alarming colours for portfolio performance

---

## Deployment model

- **My accounts (now)**: `portal.kushagrasanwal.com`, Kushagra's personal Supabase + Vercel + GitHub (`kushagra-leadinvest` org)
- **Dummy data only** throughout all development and testing
- **Migration target**: `portal.leadinvest.in`, Lead Invest's own Supabase + Vercel + GitHub org + `@leadinvest.in` Resend sender
- Migration happens only after: all features built → security tests pass → compliance signs off → real LP data loaded

---

## Publishing rules

- No email goes to any LP without manual admin approval (no automated sends)
- No LP document is published without admin preview-and-confirm
- Every publish is logged in `audit_log`

---

## Things that need compliance / CA review before real data

- Fees and expenses paid (item 11)
- Carry accrued (item 11)
- Tax documents section (item 15)
- All LP-facing wording on valuations, disclaimers, statements
- The Capital Account statement footer copy

---

## Branch strategy

- `main` = production (deployed to `portal.kushagrasanwal.com`)
- Feature branches per group: `group-2-analytics`, `group-3-admin`, etc.
- Merge to main only after user tests pass
- Migration files live in `supabase/migrations/` with timestamp prefix
