# Source provenance and review import

Refreshed 16 October 2026. This is a GitHub review import, not a deployment.

## Exact source references

- Existing Site: `appgprj_6ac2832a07748191881261a739ae7c69`; custom audience retained.
- Native Sites published/fetched tip: `55c6cbe6d08985518071e2adb93376c698063828` (16 commits in its branch history).
- Windows test-fix commit: `0acf1f54470d15b56e511c6f4f909d8ae3d74c5c`.
- Prepared reconciliation commit imported: `b18c5e6a045e9f664c370e610182d06eb2c20358`.
- GitHub preview parent: `7167ec8fbd8b61347819ddf67262a7671c17cfae`.
- GitHub main at refresh: `0927741f33b1d8ef0c2c3486f62ce50aa7f90bb2`.
- New review branch: `review/current-fitness-os-v0.11.1`. Neither old GitHub branch was changed.

GitHub and Sites tips had not advanced since the previous report. Native Sites history remains preserved in the separate source checkout/repository; this import does not fabricate shared ancestry. The new branch descends from the old preview, which already descends from main. No unrelated-history merge is involved.

## Manifest and intentional differences

`IMPORT-MANIFEST.json` enumerates 175 imported paths and SHA-256 hashes of their exact Git blob bytes. All must match the reconciliation commit except the three documented overrides below. No broad directory copy was used.

- `.gitignore`: added `*.tsbuildinfo` to exclude generated incremental caches.
- `START-HERE.md`: added the current development checkout and explicit publishing boundary; original handover retained as history.
- `CHANGELOG.md`: added this review-import record.
- `tsconfig.tsbuildinfo`: excluded even though tracked in Sites, because it is generated cache output.
- Added this provenance file, the manifest and nine labelled historical documents. Historical original bodies remain intact after their banners; original hashes are in the manifest.
- The old standalone demo entry points, build configuration and empty environment placeholder were replaced, not retained as a competing runnable app. They remain recoverable in the old GitHub preview history.

The locked package files, two Windows test fixes, app implementation, SQL history, public assets and `.openai/hosting.json` are unchanged. Public Supabase client configuration is retained; no private credentials, installed dependencies, runtime caches or generated build output are imported. Tests use disposable local PGlite, not live Supabase.

## Verification on this imported checkout

- Frozen install with pnpm 11.25.0 / Node 24.19.0: passed; lockfile unchanged. Direct frozen install was used because the Sites installer routes through Bash on Windows.
- TypeScript (`node node_modules/typescript/bin/tsc --noEmit --incremental false`): passed.
- All ten existing test files: passed, including in-memory database tests and export fixture checks.
- Production build (`pnpm build`): passed; existing chunk-size warning and unclassified-route notice remain.
- Lint (`pnpm lint`): **failed, 42 errors and 25 warnings**. Existing React effect/ref rules, handler naming, link style, CommonJS test imports and warnings are retained. These checks are not entirely green.
- Import integrity: 172 files match the prepared Git blobs byte-for-byte; three documentation/ignore overrides are documented above. All nine archived original document bodies match their recorded hashes.
- No browser, authenticated acceptance or production serving check was run for this import. No deployment or live database operation occurred.

Local logs: `.sites-runtime/import-typescript.log`, `import-build.log` and `import-lint.log` (ignored, not published).

## Development and publication

Use `C:/Users/billy/OneDrive/Desktop/FitnessOS/fitness-os-development` for future app development on the review branch. Keep reports in sibling `Reports`. Other checkouts are retained for history/recovery and should not receive parallel app edits.

After review and a separately authorized merge/release, refresh native Sites source and reconcile any newer changes. Transfer the exact reviewed app state into the existing Site's source history, run the supported build/package workflow, push that verified source to Sites, save its matching version/archive, then deploy that saved version with the existing audience. Record both GitHub and Sites commit IDs. Do not run the Sites source helper in publishing mode merely to inspect source: it can commit and push. No automatic GitHub-to-Sites deployment has been configured.
