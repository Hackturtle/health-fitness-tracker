# Architecture

## Current v0.1 shape

```text
Browser
  ↓
React UI
  ├─ Dashboard/sample metrics
  ├─ Exercise registry (static TypeScript data)
  └─ Workout builder state (React memory only)
```

There is deliberately no backend in the preview.

## Intended near-term shape

```text
React + TypeScript PWA
        ↓
Supabase client
        ↓
Supabase
  ├─ Auth
  ├─ PostgreSQL
  ├─ Storage
  └─ Row Level Security
```

## Front-end principles

### Keep domain data separate from components
Exercises live in `src/data/exercises.ts` instead of being hard-coded inside the workout UI. This creates a clean path to PostgreSQL later.

### Build feature slices
Avoid building the entire database before one workflow is usable. The first server-backed slice should contain only the tables needed to complete and retrieve a workout.

### Prefer explicit states
Screens should distinguish Loading, Empty, Ready, Saving, Saved and Error. A failed save must never look identical to a successful one.

### Preserve history
Exercises referenced by old workouts should not disappear if an exercise is renamed or archived. Historical records should point to stable IDs.

## Suggested structure after Supabase

```text
src/
  app/
  components/
  features/
    workouts/
    nutrition/
    recovery/
    body/
  data/
  lib/
    supabase.ts
  routes/
  types/
```

Do not split into this structure prematurely. v0.1 stays small on purpose.
