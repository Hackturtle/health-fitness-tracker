# Fitness OS

A personal health and fitness tracking application designed to replace a collection of long-running Excel trackers with one coherent system for training, nutrition, sleep, body data and long-term progress.

> **Current state: v0.1 interactive preview.** The UI is functional, but data is still local/demo data and resets on refresh. Supabase is intentionally not connected yet.

## Product idea

Fitness OS should answer a simple question: **what is actually working over time?**

The app is being built for one user first. It is not being shaped around hypothetical commercial users. The priority is accurate logging, understandable trends and a pleasant interface that makes daily use easy.

## Current preview

The v0.1 preview includes:

- Responsive React + TypeScript dashboard.
- Bright, minimal visual system with frosted surfaces, lifted cards and a scroll-reactive ambient 3D/wireframe background.
- Overview cards for workouts, nutrition, sleep and body progress.
- Sample long-view progress visualization and recent logbook activity.
- Interactive workout builder.
- Searchable exercise registry with Machine, Cable, Dumbbell, Barbell, Smith and Bodyweight filters.
- Add/remove exercises and keep a user-defined exercise order.
- Warm-up and working sets.
- Manual weight and rep controls.
- Mobile responsive layout.

The exercise list is a **starter registry, not an exhaustive final catalogue**. The data structure is designed to expand without rewriting the workout UI.

## Stack

- React
- TypeScript
- Vite
- Supabase (planned next persistence layer)
- PostgreSQL via Supabase
- Supabase Auth / Storage (planned)
- Git / GitHub
- Responsive PWA target

## Run locally

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
npm run preview
```

## Important boundary

**v0.1 is intentionally a demo.** No health or workout data is persisted. The next major vertical slice is:

`Authentication → Start Workout → Add Exercise → Log Sets → Finish Workout → Reload → Data is still there`

Only once that loop is reliable should analytics start making claims about performance.

## Documentation

- [`CHANGELOG.md`](./CHANGELOG.md) — chronological product changes.
- [`docs/PROJECT_STATUS.md`](./docs/PROJECT_STATUS.md) — what is real, mocked, planned or deliberately deferred.
- [`docs/ROADMAP.md`](./docs/ROADMAP.md) — staged path forward.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — current and intended technical shape.
- [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md) — proposed Supabase/PostgreSQL entities.
- [`docs/REVIEW_NOTES.md`](./docs/REVIEW_NOTES.md) — what to inspect in this preview.
- [`docs/DECISIONS.md`](./docs/DECISIONS.md) — product and engineering decisions worth preserving.
- [`docs/EXERCISE_CATALOGUE.md`](./docs/EXERCISE_CATALOGUE.md) — how the exercise library should grow without becoming messy.

## Design principle

Build vertically and one useful feature at a time. Keep the interface simple, preserve the user's ability to understand the code, and do not hide unfinished systems behind polished-looking fake data.
