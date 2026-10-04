# Product and engineering decisions

This file records decisions that should survive individual chat sessions and design iterations.

## Personal-first product
Fitness OS is being built for the owner's own training and health tracking first. Do not optimise around hypothetical commercial users unless that goal changes explicitly.

## Replace spreadsheets gradually
Eventually replace existing Excel trackers, but do not recreate every spreadsheet at once. Move one domain at a time after its workflow is proven.

## Vertical slices over broad scaffolding
Prefer a complete small workflow over many half-built screens.

First persistent slice:

`Login → Start Workout → Add Exercise → Log Sets → Finish Workout → Reload → History`

## Demo data must look like demo data
Do not make sample values look like real stored history.

## Manual weight/reps first
Weight and reps remain directly controllable. Steppers are used in v0.1 because they are quick to test on mobile. A wheel/scroller should replace them only if it proves faster in actual use.

## Broad exercise library + custom movements
Maintain a broad canonical catalogue while allowing gym-specific/custom movements. Historical logs must remain valid when an exercise is renamed or archived.

## Analytics come after trustworthy data
Do not build “what works best” analysis on sample data or inconsistent logging.

## Supabase after interaction review
Test the workout interaction layer before persistence so schema decisions do not lock in an awkward flow.

## Review-friendly Git workflow
For substantial changes:
1. Dedicated feature/preview branch.
2. Clear commits.
3. Updated changelog/status notes.
4. Draft pull request into `main`.
5. Review before merge.
