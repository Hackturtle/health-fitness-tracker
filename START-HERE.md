> Current development checkout (16 October 2026): use `FitnessOS/fitness-os-development` on `review/current-fitness-os-v0.11.1`. This imports the prepared Sites app for GitHub review. The older checkout notes below are historical. Native Sites history remains in sibling `fitness-os-source`; do not independently edit both checkouts. All reports go in sibling `../Reports/`. Publishing is a separate authorized Sites workflow; a GitHub push does not deploy the Site. See `docs/SOURCE-PROVENANCE.md` for exact commits and import verification.

> Checkout preparation, 11 October 2026: this folder is now a native Sites Git checkout on `reconcile/desktop-v0.11.1`, based on published commit `55c6cbe6d08985518071e2adb93376c698063828`. The desktop snapshot remains untouched in sibling `../fitness-os/`. Statements below describing a ZIP without Git apply to that original folder. Reports belong in sibling `../Reports/`; the earlier setup report is retained there rather than duplicated in this checkout. The existing GitHub repository is https://github.com/Hackturtle/health-fitness-tracker.git. No GitHub push, merge or deployment has been performed.

# Start here — Fitness OS desktop handoff

Source snapshot: v0.11.1, 11 October 2026.
Commit: 55c6cbe6d08985518071e2adb93376c698063828
Live site: https://fitness-os-billy.billygass.chatgpt.site

Open this extracted folder (the one containing package.json) in Codex desktop.
Read this document and CHANGELOG.md first. README.md contains historical rollout notes that are superseded by the latest changelog.

Current features: account-backed workouts, custom exercises and templates; sleep; bodyweight, kg/lbs and optional BMI; shared date controls; account preferences; Excel/CSV exports; manual nutrition, meal templates and a curated 89-entry CoFID ingredient library. v0.11.1 adds missing vegetables including peas and carrots, plus vegetable search aliases. Never infer ingredients or scan meals.

Local setup
- Requires Node >=22.13.0 and the pnpm version declared in package.json.
- Install dependencies with pnpm install --frozen-lockfile, then pnpm dev.
- Follow the terminal's local URL (portable dev script requests port 5173).
- This snapshot was built and checked in hosted Linux; Windows installation and browser preview have not been verified. Inspect any errors before changing dependencies or lockfiles.
- Start with the signed-out demo. lib/supabase.ts points to the existing LIVE project using its public client configuration. Signing in and editing records affects live account data.
- Supabase migrations are history, not a request to rerun them. Do not reset the database.

Continuity
This is a source snapshot, not a synced Git checkout. It includes application source, assets, tests, migrations, changelog and hosting configuration. It excludes installed dependencies, build output, Git credentials/history and local environment files. Your logged records remain in Supabase; no personal records are exported here.
Desktop edits do not automatically update the hosted site or the separate Hackturtle GitHub repository. Establish an explicit source/deployment workflow before publishing. Preserve the existing Site project identity when updating it.

Working agreement
Keep the clean clinical UI and build in small vertical slices. Review the user's own edits before replacing them. Update the changelog for feature changes. Do not add social features, leaderboard or unrelated health modules without a request.
Save every report in the user's sibling `../Reports/` folder (`C:\Users\billy\OneDrive\Desktop\FitnessOS\Reports`), not in the application root. This is the user's report export location as of 11 October 2026.

First task for Codex
Read START-HERE.md and CHANGELOG.md. Inspect the existing project, install its locked dependencies, and help me run a local preview. Preserve the app and existing data. Explain any required changes before making them; do not deploy or run database migrations as part of this local setup.

Windows setup verified — 11 October 2026
- Node 24.19.0 and pnpm 11.25.0 are available in the Codex bundled runtime, but are not on the ordinary shell PATH. No system-wide installation was made.
- In PowerShell, from this project folder, the following starts the preview using the installed bundled tools:

```powershell
$runtime = 'C:\Users\billy\.cache\codex-runtimes\codex-primary-runtime\dependencies'
$env:PATH = "$runtime\node\bin;$runtime\bin\fallback;" + $env:PATH
pnpm dev
```

- Follow the actual terminal URL; this session used http://127.0.0.1:5173/. Use Ctrl+C in the server terminal to stop it. A normal Node >=22.13.0 / pnpm 11.25.0 installation can also run the project without the bundled PATH setup.
- Frozen installation, TypeScript, production build and all ten test files passed; lint remains failing. See the local setup changelog entry for limitations and actual findings. In this shell `pnpm exec tsc` failed to locate the executable; invoking `node node_modules/typescript/bin/tsc --noEmit --incremental false` worked.
- To run the existing tests locally: `Get-ChildItem tests -File | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { throw "Failed: $($_.Name)" } }`. PGlite tests execute SQL only inside disposable local memory.

Source/deployment handoff still needed
- Obtain the exact existing Hackturtle GitHub repository URL and intended branch. Clone it separately, compare against snapshot commit 55c6cbe6d08985518071e2adb93376c698063828 and this folder, and review differences before transferring edits. Do not overwrite unreviewed user changes or assume that commit exists in the separate repository.
- Confirm which source is authoritative and how the current live Site is published. Preserve `.openai/hosting.json` project identity `appgprj_6ac2832a07748191881261a739ae7c69`; agree a review/build/publish workflow before any deployment. Merely adding a Git remote does not connect deployment.
- Use a separate test Supabase project for later authenticated write tests, or explicitly agree any live-account acceptance work. Local confirmation/recovery redirects will need checking before those auth flows are tested. Initial signed-out preview requires no new environment secrets.
