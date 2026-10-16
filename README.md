# Fitness OS

## Latest status — 6 October 2026

Workouts are connected to live Supabase and user-tested for save/reload, editing, sign-out/sign-in, template reuse and deletion. Custom exercise persistence is also confirmed. Sleep is now implemented and connected, awaiting the user's phone acceptance test. Earlier setup notes below reflect the original rollout and are superseded by this status and the latest changelog.

Sleep records one main entry per wake-up date. It calculates **time in bed** from bedtime and wake time, with optional quality and notes; it does not estimate actual sleep or subtract awakenings. `lib/sleep.ts` handles dates and validation, `components/sleep-log.tsx` provides the UI, and `hooks/use-sleep-store.ts` handles private persistence in the separate `sleep_entries` table. The migration enforces one entry per owner/date and generates duration in the database. Device timezone is recorded with each entry; history displays saved timezone, while editing uses the current device timezone.

Run `node tests/sleep.test.mjs` for overnight/DST calculations and local PostgreSQL constraints/RLS checks. The dashboard includes only logged sleep entries in averages. Nutrition and body progress remain demo-only and unavailable in signed-in accounts until their own stages.

A personal React + TypeScript fitness dashboard prototype. Design follows a mobile two-column topic-card grid, with four columns on desktop. Sections: workouts, nutrition, sleep, body progress. Today, month-to-date and year-to-date filters use the browser's local calendar dates.

## Current version

The signed-out experience is an interactive **demo** with sample records that reset on refresh. Sign-in uses Supabase Auth. The client is wired to store workouts, templates and custom exercises in the user's account. **Live database setup and authenticated end-to-end testing are still pending.** Until setup is complete, signed-in users see a setup message instead of being told a save succeeded. Demo history is never imported.

Nutrition, sleep and body remain demo features when signed out; they show “Coming next” in an account. Authentication session tokens use the Supabase SDK's browser storage; workout records use PostgreSQL, not local storage. Unfinished drafts are in memory and warn before leaving.

## Stack and current slice

React, TypeScript, Vinext, accessible Radix/Shadcn primitives, Supabase JS. Hosted privately with Sites. The public URL and publishable key are in `lib/supabase.ts`; no administrator or service-role key is used. Do not add public profiles or a leaderboard until requested.

### Database setup (pending)

1. Confirm the target is `health-fitness-tracker`, project `xooikuvxmwbqdtijaxls`.
2. Inspect existing tables before applying `supabase/migrations/202610040001_fitness_records.sql`. It creates only `fitness_records` and its access rules; it intentionally fails rather than replacing an existing table with the same name.
3. Set Supabase Auth Site URL to `https://fitness-os-billy.billygass.chatgpt.site` and allow redirect `https://fitness-os-billy.billygass.chatgpt.site/` for confirmation and password recovery.
4. Sign up/sign in through the app, then run the acceptance check below. Account email/password are entered by the user, never shared in chat.

One row represents a workout, template or custom exercise. Ordered movements and sets remain a JSONB aggregate. A workout and its optional template are saved in one atomic upsert statement. Stable workout/template IDs make retries replace the same records. RLS ties every row to `auth.uid()`; only authenticated owners can select, insert, update or delete. Anonymous access is revoked, and explicit authenticated grants cover projects with automatic table exposure disabled. Future SQL analytics can expand ordered JSON arrays or introduce normalized tables in a later migration.

The storage hook paginates reads, validates incoming records and clears private state when identity changes. Failed writes keep the editor open. Existing demo templates/custom exercises remain separate from account records.

The user is learning to code: keep changes small, explain concepts, and review their edits before replacing them. Design reference concerns navigation and layout only.

## Source map

- `app/page.tsx`: dashboard, logbooks and entry forms.
- `app/globals.css`: design tokens and responsive layouts.
- `lib/fitness.ts`: typed demo records and date/summary functions.

## Verification

TypeScript check and production build. `node tests/supabase-policy.test.mjs` executes the migration in local PostgreSQL (PGlite), covering owner CRUD, cross-user isolation, anonymous denial, ownership transfer denial, shape checks and atomic rollback. This does not certify the live Supabase configuration. Date boundaries and per-day nutrition aggregation checked with Node assertions. Browser interaction QA and WebMCP runtime validation were unavailable in this environment; optional read-only WebMCP registration is feature-detected.

## Workout builder (0.4)

Open Workouts -> Start a workout -> Add exercise. Search and filter the catalogue or create a custom exercise. Choose a weight convention, add working/warm-up sets, and reorder movements. Weight values are entered in kg under that convention; they are not automatically converted to total volume. On review, optionally create a named template. Templates are independent snapshots. Demo templates last for the current page session; account templates use Supabase once database setup is complete. Existing sessions support editing, deletion and conversion to templates.

`components/workout-builder.tsx` owns the workout UI and demo templates/custom catalogue. `hooks/use-workout-store.ts` manages account records; `components/account-panel.tsx` handles authentication. `lib/exercises.ts` is the built-in catalogue; `lib/workouts.ts` owns workout types, validation, legacy demo conversion and comparable-history lookup. `tests/workouts.test.cjs` verifies the data rules with `node tests/workouts.test.cjs`.

Exercise aliases, social features, efficacy rankings and external exercise APIs are outside this slice. The catalogue covers strength movements logged by reps, not timed cardio/isometric activities. A custom equipment-specific name can separate otherwise similar machines. Previous results in demo mode use sample data; signed-in results use that account's saved history only.

## Agreed implementation sequence (2026-10-04)

The user has tested and approved the workout demo's basic phone flow, including copying the previous set. Preserve the approved UI while completing workout persistence first. Build and test each section, connect it to Supabase, verify it end to end, then move to the next section. Workouts are the next integration target; the order of nutrition, sleep and body progress is not yet decided.

The workout persistence acceptance check is: sign in -> create a session with ordered exercises and warm-up/working sets -> save -> close/reopen -> reload exactly -> edit/delete -> verify the changes. Templates and custom exercises must also survive sign-out/sign-in; user access must be isolated through database policies. Do not silently import demo history as real data. Keep failed saves recoverable and preserve input. A full real-world gym session and wider browser checks remain pending.
