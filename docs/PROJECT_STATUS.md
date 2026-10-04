# Project status — 4 October 2026

This file prevents a polished screen from making an unfinished system look more complete than it really is.

## Current stage

**Interactive front-end preview.**

The design language and basic interaction model can be reviewed. Persistence, authentication and trustworthy analytics are not implemented yet.

## Implemented now

### UI foundation
- Responsive React/TypeScript application.
- Clean, bright interface.
- Frosted header and rounded cards.
- Raised/hovering card motion.
- Faint geometric 3D background that moves with page scroll.
- Desktop and mobile layout rules.

### Dashboard
The preview represents:
- Training.
- Nutrition.
- Sleep/recovery.
- Body progress.
- Long-term trends.
- Activity/logbook.

Sample values are explicitly demo data.

### Workout builder
Implemented in memory:
- Search exercises by movement or muscle.
- Filter by equipment family.
- Add/remove exercises.
- Preserve user-selected order.
- Add warm-up and working sets.
- Increase/decrease weight.
- Increase/decrease reps.

## Demo / mocked behaviour
The following looks functional but is not persistent:
- Dashboard totals.
- Recent activity.
- Progress graph.
- Workout session being built.
- Set values.

Refreshing the browser resets the preview.

## Not implemented yet
- Supabase connection.
- Authentication.
- PostgreSQL migrations.
- Row-level security policies.
- Saving or finishing a workout.
- Previous-session comparisons.
- Custom user-created exercises.
- Workout templates.
- Nutrition logging.
- MyFitnessPal import/sync.
- Sleep source integration.
- Body measurement history.
- Supplement tracking.
- Bloodwork tracking.
- Photo progress storage.
- True analytics.
- PWA manifest/offline strategy.
- Automated tests.

## Exercise library status

The long-term target is a broad library covering machine, free-weight and cable movements, while still allowing gym-specific custom exercises.

v0.1 ships a structured starter registry to validate search/filter interaction. It is deliberately **not labelled exhaustive** because gyms use many different commercial machine names and movement variants.

## Product rule

Do not calculate “what workout works best” from thin or inconsistent data. Performance analytics should arrive only after workout data is persistent and the schema reliably distinguishes exercises, working sets, warm-ups and time periods.
