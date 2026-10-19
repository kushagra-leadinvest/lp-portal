# LP Portal — Claude Session Instructions

Read **PLAN.md**, **DECISIONS.md**, and **SECURITY.md** at the start of every session before writing any code.  
Update those files after every phase is merged.

## Project in one line
LP investor portal for Lead Invest NxtGen — built on Kushagra's personal accounts with dummy data only.  
Domain: `portal.kushagrasanwal.com` (migrates to `portal.leadinvest.in` at end).

## Stack
Next.js 14 App Router · Supabase (auth + DB + storage) · Vercel · Resend (email)

## Hard rules
- RLS on every table and every storage path — an LP must never see another LP's data
- No destructive commands without asking
- Never ask the user to paste secrets or passwords
- Flag anything uncertain instead of guessing
- Unknown valuations → "Valuation pending", never a made-up number
- Manual publish only for any LP-facing email
- Anything touching fees, carry, tax or LP-facing wording → flag for compliance/CA review before real data goes in
- Dummy data only until migration checklist is complete and compliance signs off

## Working method
- One group at a time; stop after each for the user to test
- Every group ends with a test checklist (LP A vs LP B vs admin, including document access)
- Migration files go in `supabase/migrations/`
- New work goes on a feature branch; merge to main only after tests pass

## Session start checklist
1. Read PLAN.md — note which group is in progress
2. Read DECISIONS.md — confirm stack and constraints
3. Read SECURITY.md — confirm RLS posture before touching any schema
4. Ask the user what they want to do today if it isn't clear
