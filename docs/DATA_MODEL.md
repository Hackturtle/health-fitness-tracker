# Proposed Supabase / PostgreSQL data model

This is a design draft, not a migration file. Review it before implementation.

## profiles
- `id uuid` — matches Supabase auth user ID.
- `display_name text`.
- `created_at timestamptz`.

## exercises
Canonical/global movements.
- `id uuid`.
- `name text`.
- `equipment text`.
- `primary_muscle text`.
- `secondary_muscles text[]`.
- `is_active boolean`.
- `created_at timestamptz`.

## user_exercises
User-specific custom movements and aliases.
- `id uuid`.
- `user_id uuid`.
- `name text`.
- `equipment text`.
- `primary_muscle text`.
- `secondary_muscles text[]`.
- `is_archived boolean`.

## workout_sessions
- `id uuid`.
- `user_id uuid`.
- `started_at timestamptz`.
- `finished_at timestamptz nullable`.
- `name text nullable`.
- `notes text nullable`.

## workout_exercises
Ordered movements in one session.
- `id uuid`.
- `workout_session_id uuid`.
- `exercise_id uuid nullable`.
- `user_exercise_id uuid nullable`.
- `position integer`.
- `notes text nullable`.

Constraint: exactly one of `exercise_id` or `user_exercise_id` identifies the movement.

## workout_sets
- `id uuid`.
- `workout_exercise_id uuid`.
- `position integer`.
- `set_type text` — e.g. `warmup`, `working`.
- `weight_kg numeric nullable`.
- `reps integer nullable`.
- `rir numeric nullable`.
- `completed_at timestamptz nullable`.

## Later domain tables
Do not create these until their feature slice begins:
- `body_measurements`.
- `sleep_entries`.
- `nutrition_days`.
- `nutrition_entries`.
- `supplement_logs`.
- `bloodwork_panels` / `bloodwork_results`.
- `progress_photos`.

## Security rule
Every user-owned table should use Supabase Row Level Security so the authenticated user's ID must match the row owner, directly or through its parent session.

RLS should be tested before real personal health data is entered.
