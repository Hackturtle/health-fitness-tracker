# v0.1 review notes

Use this while reviewing the preview branch.

## What this review is for
This checkpoint is mainly about **direction**, not backend completeness.

Review whether:
- The interface matches the clean/light aesthetic.
- Cards have enough depth without looking heavy.
- The ambient 3D object feels subtle rather than distracting.
- Information density is comfortable on mobile.
- Starting a workout is obvious.
- Exercise search is faster than hunting through a spreadsheet.
- Equipment filters make sense.
- Manual weight and rep controls feel natural.
- Warm-up versus working sets are understandable.
- The app still feels like a personal training tool rather than generic fitness SaaS.

## What not to judge yet
Deliberately unfinished:
- Database performance.
- Supabase schema implementation.
- Authentication UX.
- Real charts.
- Algorithmic workout recommendations.
- “Best performing workout” conclusions.
- Complete exercise catalogue coverage.

## Known limitations
1. All state resets on refresh.
2. Dashboard numbers are sample data.
3. The graph is illustrative.
4. The starter exercise registry is not exhaustive.
5. Sets currently use steppers; direct numeric entry can be tested later.
6. There is no completed-session action because there is nowhere durable to save it.

## Recommended next change
Do not add another major screen yet.

Next vertical slice:
1. Create Supabase client configuration.
2. Add authentication.
3. Create the minimum workout schema.
4. Save a session.
5. Reload it.
6. Add ownership/RLS tests.
