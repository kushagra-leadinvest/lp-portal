# LP Portal — Security Requirements

Last updated: 2026-10-19

---

## Core rule

**An LP must never see another LP's data.** This applies to every table, every storage path, every API route, and every generated PDF.

---

## RLS policy pattern (apply to every table)

Every table has RLS enabled. The standard LP read policy:

    -- LP sees only their own rows
    CREATE POLICY "LP reads own rows"
    ON <table>
    FOR SELECT
    USING (
      investor_id = (
        SELECT id FROM investors WHERE auth_user_id = auth.uid()
      )
    );

Admin read policy (separate):

    CREATE POLICY "Admin reads all rows"
    ON <table>
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM admin_roles WHERE auth_user_id = auth.uid()
      )
    );

Admin write policy:

    CREATE POLICY "Admin writes rows"
    ON <table>
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM admin_roles WHERE auth_user_id = auth.uid()
      )
    );

---

## Tables that need RLS (checklist)

- [ ] `investors` — LP reads only their own row
- [ ] `schemes` — all authenticated users can read (company info is not LP-specific)
- [ ] `investments` — LP reads only their own investment rows
- [ ] `cash_flows` — LP reads only their own rows
- [ ] `capital_calls` — LP reads only their own rows
- [ ] `documents` — LP reads only their own rows
- [ ] `updates` — LP reads updates only for schemes they hold (join check)
- [ ] `audit_log` — LP cannot read; admin can read; no one can UPDATE or DELETE via API
- [ ] `admin_roles` — admin can read their own row only

---

## Storage RLS

All LP documents in Supabase Storage follow this path convention:

    documents/{investor_id}/{filename}

Storage policy: LP can only SELECT (download) objects where the path starts with their own `investor_id`.

---

## is_registered_lp function

Prevents random email addresses from requesting magic links.

    CREATE OR REPLACE FUNCTION is_registered_lp(email text)
    RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM investors WHERE email = $1
      );
    $$;

This must be called in the auth flow before sending a magic link. If the email is not in `investors`, do not send the link and show a generic "if your email is registered you'll receive a link" message (do not confirm whether the email exists).

---

## Cross-LP test (run after every phase)

1. Log in as LP A
2. Confirm LP A sees only their own data on every page
3. Try appending `?lp_id=<LP_B_id>` to every dashboard URL — must show LP A's data, not LP B's
4. Try fetching `/api/*` routes with LP A's session token but LP B's IDs in the body — must be rejected
5. Log in as LP B and repeat
6. Log in as admin and confirm admin sees all LPs

---

## Audit log rules

- Rows are inserted server-side only (service role key)
- No UPDATE or DELETE on `audit_log` via any role
- Logs: every login, every document download, every admin publish, every data change
- Admin can view; LP cannot

---

## PDF generation rules

- Every generated PDF is scoped to one LP's `investor_id`
- Before generating, server-side code confirms the requesting user's `auth.uid()` matches the `investor_id` in the request
- PDF content is never cached in a shared location
- Hard test: after generation, scan the PDF text for any other LP's name or ID — fail the test if found

---

## Things that must not happen

- LP A's name, email, or figures appearing in LP B's view or PDF
- A magic link working for an email not in `investors`
- A document download URL accessible without auth
- `audit_log` rows being deleted or modified
- Any automated email sent without admin manual approval

---

Stop copying here. Paste that into the GitHub editor and commit.
