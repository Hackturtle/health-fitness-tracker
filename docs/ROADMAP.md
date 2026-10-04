# Roadmap

The roadmap grows around proven workflows rather than widening scope all at once.

## Phase 0 — Preview foundation
**Status: current**

Goal: establish the visual system and prove that logging a session feels good.

- Dashboard layout.
- Major health domains represented.
- Workout-builder interaction.
- Exercise search/filter system.
- Manual weight/reps entry.
- Demo data clearly labelled.

Exit condition: the workout flow feels understandable enough to persist without redesigning its basic interaction.

## Phase 1 — Persistence vertical slice

Goal: make one complete workout real.

`Login → Start workout → Add exercises → Add sets → Finish workout → Reload → Re-open history`

Work:
- Supabase connection.
- Auth.
- Database migrations.
- Profiles.
- Exercises.
- Workout sessions.
- Workout exercises.
- Sets.
- Row-level security.
- Loading/error states.

Exit condition: a completed workout survives logout/reload and only the owner can access it.

## Phase 2 — Training becomes useful

- Previous performance beside each exercise.
- Set notes.
- Rest timer.
- Reorder movements.
- User-created exercises.
- Reusable workout templates.
- Personal records.
- Session duration.
- Exercise history.

Exit condition: Fitness OS is preferable to the current workout spreadsheet for daily logging.

## Phase 3 — Nutrition, recovery and body data

Add one vertical slice at a time:
1. Body weight and measurements.
2. Sleep/recovery.
3. Nutrition/macros.
4. Supplements.
5. Bloodwork.
6. Progress photos.

Each domain gets persistence, history and review before cross-domain analytics.

## Phase 4 — Meaningful analytics

Potential analysis:
- Exercise strength/repetition trends.
- Volume and frequency trends.
- Body-weight trend versus training performance.
- Recovery versus session performance.
- Nutrition adherence versus body-weight trend.
- Exercise-level response over time.
- Programme/block comparisons.

Correlations should be shown as evidence, not treated as proof of causation.

## Phase 5 — PWA and quality

- Installable PWA.
- Offline-friendly workout logging.
- Sync-conflict handling.
- Automated tests.
- Accessibility pass.
- Error monitoring.
- Export/backup.
- Data deletion tools.
- Performance budget.

## Later ideas — deliberately not current scope
- Coaching features.
- Multi-user social features.
- Commercial subscriptions.
- Public profiles.

The application is a personal system first.
