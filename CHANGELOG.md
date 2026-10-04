# Changelog

All notable project changes are documented here.

The project is pre-release, so version numbers describe review checkpoints rather than production releases.

## [0.1.0-preview] — 2026-10-04

### Added
- First repository-ready Fitness OS preview.
- React + TypeScript + Vite project foundation.
- Responsive dashboard matching the approved clean visual direction.
- Frosted/sticky navigation treatment.
- Raised cards that lift slightly on hover.
- Scroll-reactive ambient geometric wireframe background.
- Dashboard sections for workouts, nutrition, sleep, body progress, long-view progress and recent activity.
- Interactive workout builder.
- Searchable starter exercise registry.
- Equipment filters for Machine, Cable, Dumbbell, Barbell, Smith and Bodyweight.
- User-controlled exercise selection and session order.
- Warm-up and working sets.
- Manual weight and rep steppers.
- Explicit demo-mode messaging so sample data is not mistaken for persisted data.
- Initial architecture, roadmap, proposed database model and review documentation.
- `.env.example` reserving future Supabase environment variables.

### Clarified
- Supabase is **not connected** in this version.
- Demo changes reset on refresh.
- The exercise registry is extensible but is not yet an exhaustive catalogue of every commercial machine or movement variation.
- Progress charts are illustrative until persisted data exists.

### Next
- Connect Supabase.
- Add authentication.
- Persist workout sessions, exercises and sets.
- Store custom exercises per user.
- Show previous performance while logging.
- Add reusable workout templates.
- Replace illustrative trends with calculated historical data.

## [0.0.2-design] — 2026-10-04

### Added
- Approved cleaner visual language inspired by a bright editorial/product site rather than a conventional dark gym dashboard.
- Cards given more physical lift and depth.
- Subtle three-dimensional background shape reacting to scrolling.

## [0.0.1-concept] — 2026-09-05

### Added
- Fitness OS concept established as a personal learning project.
- Core stack selected: React, TypeScript, Supabase and PostgreSQL.
- Goal defined: replace existing Excel fitness trackers with one long-term system for workouts, nutrition, sleep and body progress.
- Development approach defined: small vertical slices, learning-oriented changes and review before replacement.
