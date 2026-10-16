# Changelog

## GitHub review import — 2026-10-16
- Refreshed GitHub and native Sites source; their tips match the continuity report. Imported the prepared current app on a new branch descended from the existing GitHub preview; old branches remain unchanged.
- Preserved the Windows test fixes, locked dependencies, app implementation and Site identity. Archived nine old preview documents under docs/history/v0.1 with historical notices.
- Added an explicit import manifest and source provenance. Excluded generated tsconfig.tsbuildinfo and added its ignore rule; no runtime behavior changed.
- Verification results for this import are recorded in docs/SOURCE-PROVENANCE.md. No deployment or database changes are part of this import.

## Source checkout preparation — 2026-10-16
- Opened the existing Sites source in a separate checkout using supported open mode on 11 October; no push was required. Its fetched tip and published base were both 55c6cbe6d08985518071e2adb93376c698063828, with 16 commits of history. Remote state has not been refreshed on 16 October.
- Prepared reconcile/desktop-v0.11.1 with only the two reviewed Windows test-output fixes, the existing desktop setup changelog and START-HERE.md. Added a handover note distinguishing this Git checkout from the preserved ZIP folder and retaining the sibling Reports destination.
- Validation run on 11 October in this checkout: frozen dependency installation, TypeScript, all ten existing test files and production build passed. Lint failed with the known 42 errors and 25 warnings. Chunk-size and route-classification notices remain. The Sites install helper could not launch its Bash-based command on Windows; direct pnpm frozen installation succeeded without dependency changes.
- On 16 October, verified the carried test files and prior changelog still match the reviewed desktop versions, all other tracked source remains unchanged, and git diff --check passes. No test/build rerun is claimed for 16 October; only documentation changed during finalization.
- Original desktop files and the old GitHub checkout/branches remain intact. No GitHub or Sites push, merge, database change or deployment occurred. Proposed next step: a separate GitHub review branch based on the old preview, importing this current app with provenance, rather than merging unrelated histories.

## Local Windows setup — 2026-10-11 (v0.11.1 source snapshot)
- Installed the frozen lockfile with pnpm 11.25.0 and Node 24.19.0 from the Codex bundled runtime. The lockfile SHA-256 remained BBF85A97D1F43FEED75FBFDF147C97463F5FF461B4BEDA4E5515F4C551679C49. No dependency versions or application features changed.
- Fixed two test-only Windows failures: export and nutrition workbook fixtures now use the operating system temporary directory instead of `/tmp` (which resolved to the missing `C:\tmp`).
- Tested: TypeScript (`node node_modules/typescript/bin/tsc --noEmit --incremental false`), `pnpm build`, and all ten existing test files passed. Database tests used disposable in-memory PGlite only; no live migrations or records were touched.
- Tested: `pnpm dev` started at http://127.0.0.1:5173/; the signed-out browser demo loaded sample summaries/chart, switched to Week, and opened workout and nutrition logbooks. No browser warnings/errors were captured during those checks.
- Existing issues: lint fails with 42 errors and 25 warnings (React effect/ref rules, a handler named `useTemplate` interpreted as a Hook, home-link style, CommonJS test imports and unused/dependency warnings). The build succeeds with a chunk-size warning and an unclassified-route notice. Week workout history shows the correct dates/records but a stale “Year to date” count label; left unchanged for a separate small fix.
- Still unverified here: authenticated save/reload, account preferences, full ingredient nutrition UI, browser export downloads, production-runtime serving and phone acceptance. Signed-out nutrition/sleep/body retain simpler demo flows; full account flows were inspected in source, not exercised against live data.
- This remains a ZIP snapshot without `.git`; GitHub/source reconciliation and deployment connection have not been established. Nothing was deployed.

## 0.11.1 — 2026-10-11 — Missing vegetables
- User reported logging two meals but could not find peas or carrots. Both were missing from the curated selection, rather than a failure to save or search existing records.
- Added 24 sourced vegetable entries, bringing the library to 89: peas (including frozen/raw, boiled and microwaved), carrots, green beans, cauliflower, courgettes, mushrooms, onions, green peppers, sweetcorn and tomatoes. Exact preparation descriptions and per-100-g values come from the same CoFID 2021 source.
- Searching “vegetables” or “veg” now finds the dataset’s vegetable-group entries. Existing raw/cooked filters and personal-label separation remain available.
- Validation: food-library tests cover carrot and frozen-pea search, preparation filters and source nutrient values; TypeScript passed. No saved meals or templates were modified. Phone confirmation of the expanded selection remains pending.

## 0.11.0 — 2026-10-11 — Sourced starter food library
- Added 65 curated foods from Public Health England’s CoFID 2021 dataset. Preserved source food names, preparation methods, edible-part descriptions and per-100-g units, including milk. No guessed ml conversion or raw-to-cooked conversion.
- Added shared search in Ingredients and the meal picker, with My ingredients / Food library filters and explicit raw/dry, cooked/prepared and as-sold filters. Generic values are labelled Typical values; packet-label ingredients remain separate.
- Library foods are read-only, with source code, source link and attribution. Copy & edit creates a new personal ingredient and prompts review against its packet label. Nothing is automatically logged or added to an account ingredient list.
- New ingredient selections now start with a blank amount. The user must enter a positive portion before saving. Reused meals retain the amounts the user originally saved.
- Source metadata is retained in logged meal/template snapshots; changing the bundled library cannot rewrite historical totals. Trace nutrients are explicitly labelled and approximated as zero for arithmetic; missing/unknown data is never zero-filled.
- Added the curated selection manifest, source file SHA-256 and a reproducible standard-library importer. Source: https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid. Contains public sector information licensed under the Open Government Licence v3.0.
- Validation: TypeScript, curated-food/search/source-snapshot tests and existing nutrition calculation/export tests passed. Checked a 200 g cooked basmati portion against source values: 234 kcal and 53 g carbohydrate. Phone UI acceptance remains pending. No database schema changes or live personal-record mutations were needed.

## 0.10.0 — 2026-10-11 — Ingredient-based nutrition
- Added private saved ingredients with packet-label calories, protein, carbs and fat per 100 g or 100 ml. Raw/dry, cooked/prepared and as-sold states are explicit. No raw/cooked yield or weight/volume conversion is guessed.
- Added searchable ingredient selection, adjustable amounts and live calculated meal totals. Meals support dated logging, notes, editing, deletion and unsaved-change confirmation. Blank nutrition values are not silently treated as zero.
- Added reusable Meals with create/edit/delete and Use meal. Logged meals can be saved to Meals. Using a template creates a new draft so portions can be changed before logging.
- Meals and templates retain snapshots of label values. Editing/deleting library ingredients cannot rewrite historical totals. Saved template values can be refreshed by removing and reselecting the ingredient.
- Connected daily nutrition totals, the overview, shared date ranges, recent activity and a daily calorie graph. Nutrition can be selected as the saved default graph. Unlogged days are not counted as zero-intake days.
- Extended CSV exports with nutrition ingredient rows and Excel with a Nutrition sheet, quantity formulas and a native daily-calorie chart. Export loading waits for nutrition records too. Exported files remain snapshots, not a sync/import mechanism.
- Added nutrition_records with explicit authenticated grants, owner-only CRUD policies and database validation of food/meal payloads. Live migration and RLS/grant checks passed; no new security advisor findings. Existing [leaked-password protection advisory](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) remains unchanged.
- Validation: TypeScript, portion/date/snapshot/aggregation tests, PostgreSQL access and validation tests, and existing export tests passed. The generated Nutrition sheet was imported, recalculated, checked for formula errors and visually inspected; changing an amount updated the calorie total. Phone UI, save/reload, reuse and delete acceptance remain pending. No live personal records were created or changed by tests.
- Acceptance update for 0.9: the user downloaded Excel and CSV exports and confirmed the relevant information displayed on their phone. Uploaded exports were inspected and matched. The saved All time default also returned correctly after repeated refreshes.
- Food databases, barcode scanning, calorie targets, recipe batch yields and nutrition advice remain outside this first ingredient-based release.

## 0.9.0 — 2026-10-10 — Account settings and exports
- Added account-saved default overview period, default progress graph and reduced motion. Existing Body units/height settings are also accessible from Account. Device reduced-motion preferences remain respected.
- Added Excel workbook downloads for the selected date range or all records, with Overview, Workouts, Sleep and Body sheets, native editable charts, dated records and BMI formulas when height is supplied. Body follows the preferred unit; workout loads remain kg as recorded.
- Added a CSV ZIP with separate workout, Sleep and Body files. Downloads are snapshots; re-export for newly logged records. Templates are excluded. Exports wait for all logs and Body preferences to load and are generated locally in the browser.
- Added owner-only account_preferences policies and explicit authenticated grants. Local PostgreSQL tests cover owner CRUD, invalid preferences and cross-account isolation. Live migration applied; no new security advisor findings. Existing [leaked-password protection advisory](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) remains unchanged.
- Validation: TypeScript, export fixtures and preference access tests passed. Generated Excel sheets were imported, recalculated and visually reviewed; native charts, empty ranges, expanded ranges, units, quoted/multiline notes and formula-like text were checked. Native Excel/mobile download and Account phone acceptance remain pending. No personal records were changed by tests.
- User acceptance of 0.8: additional records dated 10 October 2020 persisted after refresh and appeared correctly in the All time graphs for workouts, Sleep and Body.

## 0.8.0 — 2026-10-10 — Shared date navigation
- Added Day, Week, Month, Year and All time controls, previous/next navigation and return to current period. Weeks start Monday; current periods stop today and past periods cover their complete calendar range. Future navigation is disabled.
- Dashboard cards, progress graphs, recent activity and workout/Sleep/Body histories share the exact same inclusive date range. All time starts at the earliest available entry. Dates include years for older records.
- Graph positions use calendar-day distances so daylight-saving changes do not shift day spacing. The current date refreshes on focus and every minute.
- Added date tests covering leap years, month/year rollover, Monday weeks, all-time bounds and DST spacing. TypeScript and date tests passed. Phone acceptance remains pending.
- User confirmed BMI changes correctly when editing the same weigh-in. Account settings expansion and formatted Excel/CSV export remain the following stages.

## 0.7.2 — 2026-10-10 — Body settings discovery
- User screenshot showed the Body summary/history without the top settings control. Moved Body settings alongside Log weight and added a height prompt when BMI is hidden.
- Body panel now explicitly focuses its scroll container and opens at the top, with non-shrinking content. Deployment was verified; the screenshot alone does not establish a stale-cache cause. Phone confirmation remains pending.

## 0.7.1 — 2026-10-10 — Weight units and optional BMI
- Added Body settings with account-saved kg/lbs preference and optional height in cm or feet/inches. Blank height hides BMI.
- Body input, history, summaries, chart labels, recent activity and deletion confirmation follow the selected unit. Stored measurements use kg with conversion precision; note-only edits preserve the original measurement.
- Added a small neutral rounded BMI badge beside each weigh-in. Tapping opens an explanation of usefulness, limitations, muscle mass and the current-height calculation, with NHS guidance. No red/green scoring.
- Height changes recalculate historical badges and this is explained in settings. No height is inferred from conversation history.
- Added owner-only body_preferences storage and tests for conversion, BMI, optional height and account isolation. TypeScript and local Body/PostgreSQL tests pass. Phone UI and persistence acceptance remain pending.
- The user confirmed the preceding Body layout looks good and logs weight.

## 0.7.0 — 2026-10-10 — Body progress
- Added weight in kg, date and optional notes, with creation, editing, deletion and unsaved-entry confirmation. One weigh-in per day; invalid/future dates and invalid weights are rejected in the form.
- Added a teal summary and dated trend inside Body progress, including empty and single-entry states. Latest weight and first-to-latest change use the selected Today / month-to-date / year-to-date period. Changes use neutral styling.
- Connected private `body_entries` storage with owner-only CRUD policies, explicit authenticated grants, database weight precision/range checks and a unique account/date constraint. Retries reuse entry IDs and failed saves preserve the draft.
- Connected Body to the dashboard, progress selector and recent activity. Nutrition remains pending. Measurements, photos and the additional user idea are outside this release.
- Validation: TypeScript and Body, workout, Sleep and RLS tests passed. Body tests cover invalid dates/weights, REST mapping, duplicate dates, owner CRUD and cross-account isolation. Live migration and permission checks passed; no personal entries were created by the tests. Automated browser/phone UI verification remains pending.
- Sleep acceptance update: user confirmed logging and deletion/replacement; database reads verified the replacement overnight entry. Editing an existing Sleep entry and its separate sign-out/sign-in check are still not claimed.
- Known project advisory unchanged: [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) is disabled. No Body table security findings.

## 0.6.0 — 2026-10-06 — Sleep logging
- Completed the remaining workout custom-exercise check: the user reopened the app successfully, and a database read confirmed the custom pullover and template contain the same exercise identity, weight convention and four sets.
- Added Sleep entry creation, history, editing, deletion and discard confirmation within the existing clinical layout. Optional quality and notes accompany bedtime and wake time.
- Calculated duration is explicitly labelled **time in bed**, not measured time asleep. Overnight dates and daylight-saving changes are handled as elapsed time; non-existent local clock times and future wake times are rejected.
- Entries belong to the wake-up date. One main sleep entry is allowed per date; duplicate-date saves are rejected in both the UI and database.
- Added private `sleep_entries` storage, independent of existing workout records, with owner-only RLS, explicit grants and database-generated duration. Save failures preserve input; stable entry IDs support retries. Demo entries remain separate.
- Connected Sleep to today/month/year dashboard summaries, progress chart and recent activity. Nutrition and body progress remain pending for signed-in accounts.
- Validation: type checking, existing workout data tests and local PostgreSQL Sleep tests passed. Sleep tests cover overnight/DST duration, invalid values, duplicate dates, owner CRUD and cross-account isolation. Live migration and permission checks completed; no live personal sleep entries were created by these tests.
- Pending: user phone acceptance for Sleep save/refresh, edit, sign-out/sign-in and deletion. Automated browser UI checks and live cross-account tests are not claimed.
- The latest Supabase advisor flags disabled leaked-password protection in Auth; no Sleep table access findings were returned. This account setting is separate from the Sleep migration and remains unchanged.

## 0.5.1 — 2026-10-06 — Live workout persistence verified

### Database and account setup
- Applied `fitness_records_v1` to the live Supabase project on 5 October. Workouts, templates and custom exercises use account-owned records with ordered exercises and sets stored together.
- Verified row-level security, all four owner-only access policies, explicit authenticated grants and denial of anonymous API reads.
- Applied `restrict_auto_rls_helper` to revoke browser-role execution of the platform's automatic-RLS event-trigger helper. The subsequent Supabase security advisor returned no findings.
- The user configured the authentication URL and created an account; its email confirmation and successful authenticated requests were verified.

### Completed acceptance checks
- **Save and reload:** the user saved a workout and refreshed; database contents and successful save/read API responses independently confirmed persistence on 5 October.
- **Edit:** the user removed an exercise, saved, refreshed and confirmed the change remained.
- **Sign out and sign back in:** the user confirmed the edited workout remained associated with their account.
- **Templates:** the user saved and reused a template; movements, weights and repetitions carried into the new session.
- **Delete and reload:** the user created and deleted both test workouts, refreshing between steps. A read-only database check on 6 October confirmed zero workouts and two retained templates for the tested account. Deleting a session correctly leaves reusable templates intact.
- These checks establish the tested personal workout flow; they are not a claim that every browser, failure case or multi-account scenario has been tested live.

### Pending checks and usability notes
- **Custom exercise persistence:** awaiting the user's refresh-and-search test. Do not mark complete until confirmed.
- The Templates tab / “Use template” action was initially hard to find. Reuse worked once located; clearer discovery is a recorded improvement, not yet implemented.
- Full gym-session use, interrupted-network recovery, password recovery, wider browser/accessibility checks and live cross-account isolation testing remain outside the completed acceptance checks. Local PostgreSQL tests already cover owner isolation and atomic rollback.

### Agreed next stage
- Build Sleep next, then connect and test it as a complete section. Proposed scope: bedtime, wake time, calculated duration, optional quality and notes, and month/year summaries.
- Nutrition remains a separate later stage; food search, portions, reusable meals and macro calculations require their own scope. Sleep and nutrition changes have not been implemented in this documentation update.
- Earlier entries below describe the state at their original dates; this entry supersedes their pending Supabase setup and workout verification notes.

## 0.1.0 — 2026-10-04
- Initial responsive card dashboard for workouts, nutrition, sleep and body progress.
- Today, month-to-date and year-to-date summaries, chart selector and exact chart values.
- Demo entry forms including multi-set workouts and filtered logbooks.
- Explicit demo notices; records reset on refresh.
- Supabase login and durable records remain the next implementation slice.

## 0.2.0 — 2026-10-04
- Visual-only refinement based on the user's screen recording: white translucent surfaces, geometric typography, centred pastel icon cards, a frosted sticky header, teal controls and faint animated network geometry.
- Font assets are served locally. Reduced-motion preference disables background movement.
- Existing demo data, logging forms, date filters and chart behavior preserved. Supabase remains disconnected.

## 0.3.0 — 2026-10-04
- Cards lift and gain soft depth as they enter the viewport, with larger desktop hover lift and touch press feedback.
- Added a faint projected 3D wireframe that rotates smoothly with scrolling. Decorative canvas does not capture input; animation stops when settled or hidden.
- Reduced-motion preference retains static geometry and card shadows without movement.

## 0.4.0 — 2026-10-04
- Added a searchable strength-exercise library with equipment and muscle filters, plus custom movements.
- Workouts now group sets under ordered exercises. Added reorder controls, warm-up/working classifications, adjustable weight increments, manual input and plus/minus controls.
- Explicit weight conventions distinguish total, per dumbbell, per side, stack, bodyweight, added weight and assistance.
- Previous performance matches exercise identity and weight convention, excludes the workout being edited and future dates.
- Added session review, edit/delete, discard confirmation, reusable demo templates and independent copies when starting a template.
- Dashboard working-set totals exclude warm-ups. No Supabase connection or permanent storage; all demo changes reset on refresh.
- Type checks and targeted data tests cover validation, independent copies, previous-performance matching and warm-up exclusion. Browser/device interaction testing remains outstanding.

## Milestone review — 2026-10-04

### Confirmed by the user
- The workout demo works well in the user's phone test. The simple interface and copying the previous set's values were specifically approved.
- The workout flow is accepted as the starting point for Supabase integration. This is a usability milestone, not a claim that every edge case or a full gym session has been tested.
- The clinical visual design, raised cards and scroll-driven wireframe are approved; preserve them while adding persistence.

### Agreed delivery approach
- Complete one section end to end: build its interaction flow, test it, connect it to Supabase, then move to the next section.
- Workouts are first. Other sections remain demo-only until their own integration is completed.
- Keep the present workout feature scope steady during integration. Future analysis and leaderboards remain deferred.

### Next milestone — planned, not implemented
- Supabase authentication and private PostgreSQL records for workouts, ordered exercises, sets, custom exercises and templates.
- Save, reload, edit and delete a workout across sessions; compare against actual saved history.
- Keep sample data clearly separated from real records. Preserve unsaved input and show recoverable save/load errors.
- Verify owner-only access, sign-out/sign-in behaviour and persistence after closing and reopening the app.
- Continue with one remaining topic at a time after workouts pass these checks; the order of those topics has not yet been chosen.

### Remaining validation
- User phone feedback is positive. A full gym-session test, keyboard/long-form edge cases and automated browser interaction testing remain outstanding.
- Supabase is still disconnected. All current demo records and templates reset on refresh.

## 0.5.0 — 2026-10-04 — Supabase client prepared
- Configured the supplied Supabase project URL and browser publishable key; the project's Auth settings endpoint responds successfully.
- Added email/password sign-in, signup, sign-out and password recovery. Kept the approved visual design.
- Connected workout, template and custom exercise operations to account-scoped records. Workout plus optional template save atomically; failed saves preserve the draft, and retries use stable IDs.
- Separated sample data from account records. Other sections are marked “Coming next” for signed-in users. Account changes clear private in-memory state.
- Prepared the transactional database migration with explicit grants and owner-only RLS. Local PostgreSQL tests cover isolation, anonymous denial and atomic rollback; existing workout data tests and type checking pass.
- **Pending:** apply migration in the live project, configure Auth redirects, and verify sign-in/save/reload/edit/delete plus templates and custom exercises on the user's phone. Live storage is not yet verified; the app reports setup errors honestly. Supabase plugin installation/connection has been requested for project administration.
