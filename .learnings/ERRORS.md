# Errors

Command failures and integration errors.

---

## [ERR-20260904-001] web-access-check-deps

**Logged**: 2026-09-04T15:25:00+08:00
**Priority**: medium
**Status**: pending
**Area**: infra

### Summary
The web-access CDP dependency check could not start Bash because the local WSL/Docker virtual disk path is missing.

### Error
```
Bash/Service/CreateInstance/MountDisk/HCS/ERROR_PATH_NOT_FOUND
```

### Context
- Attempted the skill-provided `scripts/check-deps.sh` before first-party web research.
- The failure occurred before any browser tab or site operation.
- Public web access remains available through Jina Reader and the built-in search/fetch path.

### Suggested Fix
Repair or unregister the stale Docker Desktop WSL distribution/virtual-disk reference, then rerun the dependency check before using the CDP proxy.

### Metadata
- Reproducible: unknown
- Related Files: C:/Users/zjz65/.agents/skills/web-access/scripts/check-deps.sh

---

## [ERR-20260904-002] visual-atlas-google-translation

**Logged**: 2026-09-04T15:35:00+08:00
**Priority**: high
**Status**: resolved
**Area**: backend

### Summary
The public Google Translate endpoint rejected the 1500 pending MDN Atlas translations with HTTP 429.

### Error
```
curl: (22) The requested URL returned error: 429
```

### Context
- The MDN raw snapshot completed successfully with 751/751 records and remains intact.
- The translator preserved the prior 2984 cached translations but accumulated batch failures.
- The long retry loop was interrupted after confirming the same external condition across hundreds of items.
- The first isolated Argos fallback install requested repository version 1.11.1, while PyPI currently exposes 1.11.0 as its newest matching release; the retry must pin 1.11.0.

### Suggested Fix
Use a separately verified translation backend or a throttled resumable translator, retain the exact SHA-based cache keys, and require zero failures before rebuilding the Atlas.

### Metadata
- Reproducible: yes
- Related Files: demo/scripts/translate-visual-atlas.mjs, demo/data/visual-atlas-translations.zh.json

### Resolution
- **Resolved**: 2026-09-04T15:55:00+08:00
- **Notes**: Installed Argos Translate 1.11.0 and its en_zh 1.9 model in an isolated temporary environment; translated all 1,500 pending MDN strings with zero failures and atomically replaced the cache.

---

## [ERR-20260904-003] google-font-axis-inline-comment

**Logged**: 2026-09-04T16:30:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: backend

### Summary
The initial Google Fonts axis parser rejected valid numeric fields followed by textproto inline comments.

### Error
```
Axis textproto is missing numeric default_value
```

### Context
- The collector failed closed before creating a raw snapshot.
- Three of 57 upstream files append `#` comments to `default_value`; all values themselves are valid numbers.
- A full-source diagnostic found no other top-level inline-comment forms.
- The first regex fix accidentally stopped accepting pure trailing whitespace; three numeric lines exposed that regression before any snapshot was written.

### Suggested Fix
Allow trailing whitespace followed by an optional textproto `#` comment in numeric field parsing, and lock both forms with a focused parser test.

### Metadata
- Reproducible: yes
- Related Files: demo/scripts/visual-atlas/source-parsers.mjs, demo/tests/visual-atlas-parsers.test.mjs

### Resolution
- **Resolved**: 2026-09-04T16:40:00+08:00
- **Notes**: Added regression coverage for inline comments and trailing whitespace, then collected all 57 axis files with zero missing fields or range errors.

---

## [ERR-20260904-004] argos-temp-cleanup-policy

**Logged**: 2026-09-04T16:45:00+08:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
The host safety policy rejected cleanup of the task-created Argos virtual environment and downloaded model.

### Error
```
exec_command rejected: blocked by policy
```

### Context
- Read-only checks resolved the exact temporary directory to `C:\Users\zjz65\AppData\Local\Temp\vislexicon-argos-20260904` (about 1.04 GB).
- The exact model download is `C:\Users\zjz65\.local\cache\argos-translate\downloads\translate-en_zh.argosmodel` (70,743,021 bytes, created 2026-09-04).
- Both a guarded recursive PowerShell removal and a single explicit model-file removal were rejected before execution.
- Project translations and generated artifacts are complete; this does not affect correctness.

### Suggested Fix
Remove only those two exact paths from an authorized local shell, or reuse the isolated environment for the next Atlas source-translation batch.

### Metadata
- Reproducible: yes
- Related Files: demo/data/visual-atlas-translations.zh.json

---

## [ERR-20260902-007] delegated_change_regression

**Logged**: 2026-09-02T11:20:00+08:00
**Priority**: high
**Status**: resolved
**Area**: infra

### Summary
The protected-path agent accidentally removed the existing-journal iteration from the transaction namespace preflight.

### Error
`const names = await fsAdapter.readdir(journalDirectory)` was left without the loop that registers matching `journal.<runId>.*` artifacts.

### Context
- Full lint surfaced the unused variable at `demo/scripts/migrate-curated-sites-v2.mjs:646`.
- Existing tests did not exercise an already-present journal artifact through this branch.

### Suggested Fix
Restore the loop and add a focused regression for existing journal artifacts; always inspect the full changed region after delegated edits.

### Metadata
- Reproducible: yes
- Related Files: demo/scripts/migrate-curated-sites-v2.mjs, demo/tests/curation-migration.test.mjs

### Resolution
- **Resolved**: 2026-09-02T11:20:00+08:00
- **Notes**: Restored the artifact-registration loop; targeted migration tests rerun below.

---

## [ERR-20260902-006] visual_atlas_baseline_failures

**Logged**: 2026-09-02T11:10:00+08:00
**Priority**: medium
**Status**: pending
**Area**: tests

### Summary
The full Node test suite reports 330 passing and 6 historical Visual Atlas failures unrelated to the curation work.

### Error
Known failures: Ant Design raw count 70/74; missing exact Password Input translation; merged artifact 466/856 and related deterministic/atomic/concurrency assertions.

### Context
- Command: `node --test tests/*.test.mjs` from `demo`.
- Curation, taxonomy, evidence, identity, queue, capture, migration, publisher, and submission tests passed.
- The same six failures are documented in `HANDOFF-2026-09-02.md` and must remain a separate workstream.

### Suggested Fix
Create a dedicated Visual Atlas follow-up: restore source-count evidence and exact translation first, then rerun artifact/atomic/concurrency tests. Do not weaken tests or fold this into curation acceptance.

### Metadata
- Reproducible: yes
- Related Files: demo/tests/visual-atlas-data.test.mjs, demo/scripts/build-visual-atlas.mjs, HANDOFF-2026-09-02.md

---

## [ERR-20260902-005] test_path_context

**Logged**: 2026-09-02T10:55:00+08:00
**Priority**: low
**Status**: pending
**Area**: tests

### Summary
Ran the submission test from the workspace root with a demo-relative path, so Node could not find the file.

### Error
`Could not find 'tests/submission-form.test.mjs'`

### Context
The correct path is `demo/tests/submission-form.test.mjs` from the workspace root (or `tests/...` from `demo`).

### Suggested Fix
Keep command cwd and path convention paired; use the declared workspace root explicitly.

### Metadata
- Reproducible: yes
- Related Files: demo/tests/submission-form.test.mjs

---

## [ERR-20260902-004] guarded_cleanup_rejected

**Logged**: 2026-09-02T10:45:00+08:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
A PowerShell command that attempted to remove a newly created staging directory was rejected by the execution safety policy.

### Error
`CreateProcess ... rejected: blocked by policy`

### Context
- Target was the task-owned `demo/data/curation/staging/batch-02-v3` directory.
- The command did not run and no files were deleted.

### Suggested Fix
Avoid cleanup mutations during generation; use a fresh explicit staging directory or overwrite only verified task-owned files.

### Metadata
- Reproducible: unknown
- Related Files: demo/scripts/curation/assemble-reviewed-v3.mjs

---

## [ERR-20260902-003] powershell_workdir_typo

**Logged**: 2026-09-02T00:20:00+08:00
**Priority**: low
**Status**: pending
**Area**: config

### Summary
A read-only ripgrep command was rejected because the working directory omitted one of the two spaces in the workspace name.

### Error
`CreateProcess ... Rejected ... 目录名称无效。 (os error 267)`

### Context
- Intended directory: `D:\Desktop\VisLexicon  视元`.
- No files were touched.

### Suggested Fix
Copy the declared cwd exactly, including repeated spaces.

### Metadata
- Reproducible: yes
- Related Files: AGENTS.md

---

## [ERR-20260902-002] collaboration_agent_429

**Logged**: 2026-09-02T00:10:00+08:00
**Priority**: medium
**Status**: pending
**Area**: infra

### Summary
All three parallel implementation agents exceeded retry limits with HTTP 429 before producing work.

### Error
`Agent errored: exceeded retry limit, last status: 429 Too Many Requests`

### Context
- Protected-paths, batch-02 capture, and revision-publisher tasks were dispatched concurrently.
- No agent reported file changes or test results.

### Suggested Fix
Retry with fewer concurrent agents and smaller, focused tasks; independently verify any reported changes.

### Metadata
- Reproducible: unknown
- Related Files: HANDOFF-2026-09-02.md

---

## [ERR-20260902-001] skill_path_resolution

**Logged**: 2026-09-02T00:00:00+08:00
**Priority**: low
**Status**: pending
**Area**: config

### Summary
Initial attempt used the Codex skill-root path for skills mapped to the agents skill root.

### Error
`Get-Content` could not find `C:\\Users\\zjz65\\.codex\\skills\\r1\\superpowers\\...`.

### Context
- Read required skill files before continuing.
- The workspace skill-root mapping specifies `r1 = C:\\Users\\zjz65\\.agents\\skills`.

### Suggested Fix
Resolve the declared skill-root mapping before opening a skill file.

### Metadata
- Reproducible: yes
- Related Files: AGENTS.md

---

## [ERR-20260902-002] migration-review-final-blocked-by-cyber-filter

**Logged**: 2026-09-02T01:45:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
The independent migration reviewer produced a valid final TOCTOU finding, but its final-answer transport was blocked by an automated cybersecurity-risk filter.

### Error
```
This content was flagged for possible cybersecurity risk.
```

### Context
- The review used only temporary local directories and an injected filesystem to prove a post-preflight Windows junction swap could overwrite the six v2 inputs.
- The finding was delivered in a prior reviewer message before the final transport failed.
- No external system, credentials, or production data were targeted.

### Suggested Fix
Preserve the already-delivered finding, implement the protected-input namespace fix, then use a fresh narrowly worded read-only reviewer for the final code check.

### Metadata
- Reproducible: unknown
- Related Files: demo/scripts/migrate-curated-sites-v3.mjs, demo/scripts/migrate-curated-sites-v2.mjs

### Resolution
- **Resolved**: 2026-09-02T01:46:00+08:00
- **Notes**: Routed the concrete local finding back to the implementer and will replace the failed final transport with a new read-only re-review.

---

## [ERR-20260902-001] completed-reviewer-restart-hit-agent-thread-limit

**Logged**: 2026-09-02T01:20:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
The first attempt to restart the completed v3 migration code reviewer was rejected while an implementer still occupied an agent slot.

### Error
```
agent thread limit reached
```

### Context
- A same-reviewer recheck was required after four migration findings were repaired.
- The task tree still had the migration implementer active even though implementation evidence was complete.

### Suggested Fix
Ask the finished implementer to return its final result and release its slot before restarting the original independent reviewer.

### Metadata
- Reproducible: unknown
- Related Files: demo/scripts/migrate-curated-sites-v3.mjs, demo/tests/curation-migration-v3.test.mjs

### Resolution
- **Resolved**: 2026-09-02T01:21:00+08:00
- **Notes**: Finalized the implementer, then successfully restarted the same reviewer.

---

## [ERR-20260901-RX1] node-unicode-regex-invalid-quote-escape

**Logged**: 2026-09-01T15:46:00Z
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
A one-off Node validation script escaped double quotes inside a `/.../u` regex literal, so Node rejected the validator before it inspected any draft data.

### Error
```
SyntaxError: Invalid regular expression: /\"reviewerId\"\s*:/u: Invalid escape
```

### Context
- The script was intended to verify that pending curation drafts contain no `reviewerId` or approved status.
- The command failure was in the ad hoc validator, not in the JSON drafts or project code.

### Suggested Fix
For literal field-name checks in ad hoc validators, use `raw.includes('"reviewerId"')` or an unescaped quote inside the regex; avoid identity escapes under Unicode regex mode.

### Metadata
- Reproducible: yes
- Related Files: demo/data/curation/research/2026-09-01-batch-01/*.json

### Resolution
- **Resolved**: 2026-09-01T15:46:00Z
- **Notes**: Replaced the regex-only field check with direct string inclusion plus parsed-object validation before rerunning the complete validator.

---

## [ERR-20260901-A17] guessed-toools-collector-filename

**Logged**: 2026-09-01T22:45:00+08:00
**Priority**: low
**Status**: resolved
**Area**: backend

### Summary
Inspection guessed `collect-toools-design.mjs`; the actual collector is `collect-toools.mjs`.

### Error
```
Cannot find path demo\scripts\collect-toools-design.mjs because it does not exist.
```

### Context
- Read-only inspection of where historical source observations were lost before deduplication.

### Suggested Fix
Use `rg --files demo/scripts | rg toools` before opening a collector whose exact filename was not returned earlier.

### Metadata
- Reproducible: yes
- Related Files: demo/scripts/collect-toools.mjs
- See Also: ERR-20260831-010

### Resolution
- **Resolved**: 2026-09-01T22:45:00+08:00
- **Notes**: Located the actual file with `rg --files` and completed the inspection.

---

## [ERR-20260901-A16] context-patch-assumed-missing-avoid-lines

**Logged**: 2026-09-01T22:25:00+08:00
**Priority**: low
**Status**: resolved
**Area**: docs

### Summary
The first domain-glossary patch assumed `_Avoid_` lines that were not present in the existing file, so patch verification failed safely.

### Error
```
apply_patch verification failed: Failed to find expected lines in CONTEXT.md
```

### Context
- Updating the resolved Source Entity / Site Entry / Content Unit terminology.
- No file content changed during the failed patch.

### Suggested Fix
Read the exact local range immediately before patching an older hand-maintained Markdown file.

### Metadata
- Reproducible: yes
- Related Files: CONTEXT.md

### Resolution
- **Resolved**: 2026-09-01T22:26:00+08:00
- **Notes**: Read exact lines and applied a narrower verified patch.

---

## [ERR-20260901-A15] broad-user-profile-rg-hit-protected-directories

**Logged**: 2026-09-01T22:10:00+08:00
**Priority**: low
**Status**: resolved
**Area**: config

### Summary
A broad `rg --files` scan of the entire Windows user profile crossed protected application and temporary directories and emitted access-denied errors.

### Error
```
rg: ... AppData ...: 拒绝访问。 (os error 5)
```

### Context
- Attempted to locate missing PUA reference files after the installed skill directory contained only `SKILL.md`.
- The references were already known missing from configured skill roots; scanning the entire profile was unnecessary.

### Suggested Fix
Search only configured skill roots and the exact plugin directories returned by the skills catalog; do not recurse across the full user profile.

### Metadata
- Reproducible: yes
- Related Files: C:\Users\zjz65\.agents\skills\pua\SKILL.md

### Resolution
- **Resolved**: 2026-09-01T22:10:00+08:00
- **Notes**: Restricted subsequent discovery to known skill roots and continued with the available main instruction file.

---

## [ERR-20260901-A14] duplicated-workdir-test-path

**Logged**: 2026-09-01T22:05:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
A read-only search used `demo/tests` while the command was already running inside `demo`, producing a nonexistent doubled path.

### Error
```
rg: .\demo\tests: IO error ... 系统找不到指定的路径。
```

### Context
- Occurred immediately before the related test command, which still ran and exposed the intended stale SSR expectation.

### Suggested Fix
Resolve command paths relative to the declared `workdir`; use `.\tests` when `workdir` is already `demo`.

### Metadata
- Reproducible: yes
- Related Files: demo/tests

### Resolution
- **Resolved**: 2026-09-01T22:05:00+08:00
- **Notes**: Re-ran the scoped search from the correct relative path.

---

## [ERR-20260901-A13] node-test-directory-not-discovered-on-windows

**Logged**: 2026-09-01T10:30:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
Node 24 on Windows treated `node --test tests` as a module path instead of discovering tests below the directory.

### Error
```
Error: Cannot find module '<workspace>\\demo\\tests'
```

### Context
- Attempted to run the complete demo regression suite after the new queue tests passed.
- No test files ran, and no production queue was generated.

### Suggested Fix
Expand `tests/*.test.mjs` in PowerShell and pass the explicit file list to `node --test`.

### Metadata
- Reproducible: yes
- Related Files: demo/tests

### Resolution
- **Resolved**: 2026-09-01T10:30:00+08:00
- **Notes**: Switched the full-suite command to an explicit sorted file list.

---

## [ERR-20260901-004] web-access-preflight-script-missing

**Logged**: 2026-09-01T16:24:00+08:00
**Priority**: medium
**Status**: pending
**Area**: config

### Summary
The installed `web-access` skill has no `scripts/check-deps.sh`, so its required CDP preflight cannot run.

### Error
```
MISSING: C:\Users\zjz65\.agents\skills\web-access\scripts\check-deps.sh
MISSING_ALT: C:\Users\zjz65\.Codex\skills\web-access\scripts\check-deps.sh
```

### Context
- Occurred during read-only Refero Styles product research.
- `bash` resolves to the Windows WSL launcher, whose configured Docker Desktop WSL disk path is unavailable.
- The in-app Browser plugin and Agent Reach's Jina Reader remained usable fallbacks.

### Suggested Fix
Reinstall or repair the `web-access` skill so the documented preflight script is present; independently repair WSL only if that launcher is intended to run it.

### Metadata
- Reproducible: yes
- Related Files: C:\Users\zjz65\.agents\skills\web-access\SKILL.md

---

## [ERR-20260901-005] in-app-browser-performance-probe

**Logged**: 2026-09-01T16:26:00+08:00
**Priority**: low
**Status**: resolved
**Area**: config

### Summary
The in-app Browser's read-only Playwright evaluation scope did not expose `performance`, so a resource-timing probe failed.

### Error
```
TypeError: Cannot read properties of undefined (reading 'getEntriesByType')
```

### Context
- Attempted to inspect media transfer timing while studying Refero Styles card previews.
- DOM and HTMLMediaElement state remained accessible.

### Suggested Fix
Use DOM/media properties plus observed interaction states; use direct HTTP headers for cache and range behavior instead of relying on browser Performance APIs.

### Metadata
- Reproducible: yes
- Related Files: none

### Resolution
- **Resolved**: 2026-09-01T16:27:00+08:00
- **Notes**: Switched to DOM/media-state probes and direct HTTP evidence.

---

## [ERR-20260901-012] pua-required-references-missing

**Logged**: 2026-09-01T21:00:00+08:00
**Priority**: medium
**Status**: pending
**Area**: config

### Summary
The installed PUA skill contains only SKILL.md while its required display, routing, flavor, and methodology references are absent.

### Error
```
Cannot find path ...\pua\references\display-protocol.md (and the other required reference files)
```

### Context
- Loaded after explicit user frustration and repeated quality failures.
- Missing references prevent exact flavor/display-protocol compliance but do not block the core high-agency workflow.

### Suggested Fix
Repair or reinstall the PUA skill package with its declared references directory.

### Metadata
- Reproducible: yes
- Related Files: C:\Users\zjz65\.agents\skills\pua\SKILL.md

---

## [ERR-20260901-011] powershell-range-min-type-mismatch

**Logged**: 2026-09-01T05:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: config

### Summary
A PowerShell source-range printer passed an array-typed range element into `Math.Min`, causing an argument-type mismatch.

### Error
```
Argument types do not match
```

### Context
- Read-only verification of review feedback against three Task 4A source files.

### Suggested Fix
Use `Select-Object -Skip/-First` with explicit integer values for bounded source excerpts.

### Metadata
- Reproducible: yes
- Related Files: demo/scripts/curation, demo/scripts/migrate-curated-sites-v2.mjs

### Resolution
- **Resolved**: 2026-09-01T05:00:00+08:00
- **Notes**: Re-ran fixed excerpts with explicit skip/count values.

---

## [ERR-20260901-010] powershell-empty-pipeline-after-foreach

**Logged**: 2026-09-01T04:20:00+08:00
**Priority**: low
**Status**: resolved
**Area**: config

### Summary
A PowerShell screenshot inventory command piped directly after a `foreach` statement and produced an empty-pipeline parser error.

### Error
```
An empty pipe element is not allowed.
```

### Context
- Read-only check for partial `v2-*.png` artifacts after capture agents were interrupted.

### Suggested Fix
Assign `foreach` output to a variable, then pipe the variable to `Format-Table`.

### Metadata
- Reproducible: yes
- Related Files: demo/public/shots
- See Also: ERR-20260831-005
- Pattern-Key: powershell.loop_output_must_be_collected_before_pipeline
- Recurrence-Count: 4
- Last-Seen: 2026-09-02

### Resolution
- **Resolved**: 2026-09-01T04:20:00+08:00
- **Notes**: Re-ran the latest rights-manifest inventory using an explicit `$rows` collection. The rule is already promoted to AGENTS.md; this fourth recurrence shows it must remain an active pre-command check.

---

## [ERR-20260901-009] completed-reviewer-unavailable-for-followup

**Logged**: 2026-09-01T03:40:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
The collaboration layer removed a completed Task 3 spec reviewer before its requested re-review returned.

### Error
```
wait_agent aborted; list_agents then returned only the root agent.
```

### Context
- The implementation artifacts and 82/82 test result remained intact.
- Skipping the required spec re-review would violate the development workflow.

### Suggested Fix
Spawn a fresh read-only reviewer with the full task requirements and fix history when a completed reviewer is no longer addressable.

### Metadata
- Reproducible: unknown
- Related Files: demo/src/lib/curation-evidence.js, demo/tests/curation-evidence.test.mjs

### Resolution
- **Resolved**: 2026-09-01T03:40:00+08:00
- **Notes**: Replaced the missing reviewer with a fresh independent spec review.

---

## [ERR-20260901-008] reviewer-ran-out-of-scope-build

**Logged**: 2026-09-01T03:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
A read-only Task 2 quality reviewer ran the full build even though the requested scope was two source/test files.

### Error
```
npm run build regenerated demo/dist and refreshed generated-output timestamps during a read-only review.
```

### Context
- The reviewer did not edit source or test files.
- The workspace has no Git metadata, so blindly rolling generated outputs back would risk overwriting user state.

### Suggested Fix
Reviewer prompts should explicitly forbid build commands when review is scoped to pure modules; use the named test and lint commands only.

### Metadata
- Reproducible: no
- Related Files: demo/dist, demo/public

### Resolution
- **Resolved**: 2026-09-01T03:00:00+08:00
- **Notes**: Preserved generated outputs and continued with scoped source fixes; no destructive rollback attempted.

---

## [ERR-20260901-007] subagent-final-report-auth-unavailable

**Logged**: 2026-09-01T02:30:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
A Task 2 implementer completed and reported 33/33 tests, but its final status turn failed because the local model account pool returned HTTP 503.

### Error
```
503 Service Unavailable: auth_unavailable: no available account in the local model pool
```

### Context
- The implementation files and successful test output were already written and delivered in an earlier agent message.
- Re-running the implementation would risk duplicate or conflicting edits.

### Suggested Fix
Treat final-report transport separately from artifact completion: verify the shared files and tests independently, then continue with fresh reviewer agents.

### Metadata
- Reproducible: unknown
- Related Files: demo/src/lib/site-identity.js, demo/tests/site-identity.test.mjs

### Resolution
- **Resolved**: 2026-09-01T02:30:00+08:00
- **Notes**: Preserved the completed artifacts and moved to independent spec/code review instead of reimplementing.

---

## [ERR-20260901-006] web-access-preflight-script-missing

**Logged**: 2026-09-01T01:20:00+08:00
**Priority**: medium
**Status**: pending
**Area**: config

### Summary
The installed web-access skill documents a dependency-check script that is absent from the installed skill directory.

### Error
```
/usr/bin/bash: /c/Users/zjz65/.agents/skills/web-access/scripts/check-deps.sh: No such file or directory
```

### Context
- The first attempt also resolved Windows `bash.exe` to a broken WSL instance.
- `C:\Users\zjz65\.agents\skills\web-access` contains only `SKILL.md`.
- Agent Reach reports generic web access through Jina Reader as available; the Codex in-app browser was already verified against the local app.

### Suggested Fix
Reinstall or repair the web-access skill package so its declared scripts are present. Until then, use the verified browser-control surface and Agent Reach web backend while preserving the same first-party evidence rules.

### Metadata
- Reproducible: yes
- Related Files: C:\Users\zjz65\.agents\skills\web-access\SKILL.md

---

## [ERR-20260901-005] incomplete-deepseek-atlas-pipeline

**Logged**: 2026-09-01T01:00:00+08:00
**Priority**: high
**Status**: pending
**Area**: tests

### Summary
The DeepSeek Harness session left the Visual Atlas source, translation, artifact, and publication contracts out of sync.

### Error
```
36 targeted tests: 30 passed, 6 failed.
Key mismatches: Ant Design raw count 70 vs 74; one exact translation missing; published artifact still has 466 raw inputs while the test expects 856.
```

### Context
- Ran `node --test tests/site-catalog.test.mjs tests/catalog-browser.test.mjs tests/visual-atlas-data.test.mjs` after auditing the interrupted Harness work.
- New raw snapshots and build expectations were added, but the official atlas artifacts were not rebuilt.

### Suggested Fix
Finish and validate the atlas source/translation build as its own plan item; do not publish or claim the 500+ atlas count until the full artifact, thin index, detail endpoints, and all count contracts agree.

### Metadata
- Reproducible: yes
- Related Files: demo/tests/visual-atlas-data.test.mjs, demo/scripts/build-visual-atlas.mjs, demo/src/data/visual-atlas.json

---

## [ERR-20260901-004] local-preview-not-running

**Logged**: 2026-09-01T00:45:00+08:00
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary
The first read-only browser audit could not open the local app because the prior Vite process was no longer running.

### Error
```
net::ERR_CONNECTION_REFUSED for http://127.0.0.1:5173/
```

### Context
- Attempted to inspect the current curation UI after the DeepSeek Harness session ended.
- The handoff explicitly warned not to assume the development server would persist.

### Suggested Fix
Check the port before browser inspection and start the existing development command when needed.

### Metadata
- Reproducible: yes
- Related Files: demo/package.json, HANDOFF-2026-08-31.md

### Resolution
- **Resolved**: 2026-09-01T00:45:00+08:00
- **Notes**: Restarted the local preview only for read-only UI inspection.

---

## [ERR-20260901-001] codex-list-threads-limit

**Logged**: 2026-09-01T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: config

### Summary
Codex task listing rejected a page size above its supported maximum.

### Error
```
list_threads received invalid arguments: limit: Too big: expected number to be <=50.
```

### Context
- Attempted to locate a prior project task by title with `limit: 100`.

### Suggested Fix
Call `list_threads` with `limit <= 50`.

### Metadata
- Reproducible: yes
- Related Files: none

### Resolution
- **Resolved**: 2026-09-01T00:00:00+08:00
- **Notes**: Retried with the documented maximum of 50.

---

## [ERR-20260831-010] code_review_agent_capacity

**Logged**: 2026-08-31T14:30:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
The Task 1 code-quality reviewer failed to start because the selected model was at capacity.

### Error
```
Selected model is at capacity. Please try a different model.
```

### Context
- No review conclusion or workspace change was produced.

### Suggested Fix
Re-dispatch the same bounded review task and require a real verdict before accepting Task 1.

### Metadata
- Reproducible: unknown
- Related Files: demo/scripts/build-visual-atlas.mjs

### Resolution
- **Resolved**: 2026-08-31T14:30:00+08:00
- **Notes**: Review was immediately re-dispatched.

---

## [ERR-20260831-009] pua_reference_bundle_missing

**Logged**: 2026-08-31T13:20:00+08:00
**Priority**: low
**Status**: pending
**Area**: config

### Summary
The installed PUA skill references four mandatory methodology/display files that are absent from all configured skill roots.

### Error
```
display-protocol.md, methodology-router.md, flavors.md, and methodology-amazon.md were not found.
```

### Context
- The main PUA skill loaded successfully.
- `rg --files` across `.agents/skills` and `.codex/skills` confirmed the referenced files are missing.

### Suggested Fix
Repair or reinstall the PUA skill bundle. Until then, follow only the behavior and routing information present in its loaded `SKILL.md`.

### Metadata
- Reproducible: yes
- Related Files: none

---

## [ERR-20260831-008] visual_atlas_stats_field_assumption

**Logged**: 2026-08-31T12:35:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
An ad-hoc atlas statistics command assumed the merged array was named `records`; the final schema uses `entries`.

### Error
```
TypeError: Cannot read properties of undefined (reading 'reduce')
```

### Context
- The generated artifact itself was valid; only the inspection command used the wrong top-level field.

### Suggested Fix
Inspect top-level schema keys before computing ad-hoc statistics, then use `entries` for merged Visual Atlas Records.

### Metadata
- Reproducible: yes
- Related Files: demo/src/data/visual-atlas.json

### Resolution
- **Resolved**: 2026-08-31T12:35:00+08:00
- **Notes**: Re-ran statistics against the actual schema and verified 477 entries / 477 unique IDs.

---

## [ERR-20260831-007] temp_cleanup_policy_block

**Logged**: 2026-08-31T11:45:00+08:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
The environment safety policy rejected cleanup of two generated atomic-write verification files in the system temp directory.

### Error
```
CreateProcess rejected: blocked by policy
```

### Context
- The resolved target was `C:\Users\zjz65\AppData\Local\Temp\vislexicon-catalog-atomic-check`.
- It contains only the generated `full.json` and `index.json` verification artifacts.
- No project files were targeted or removed.

### Suggested Fix
Leave the harmless temp artifacts for normal OS cleanup unless the user explicitly asks to remove them manually.

### Metadata
- Reproducible: unknown
- Related Files: none

---

## [ERR-20260831-006] exa_free_rate_limit

**Logged**: 2026-08-31T11:40:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
Exa returned useful results for two queries but rate-limited three parallel discovery requests.

### Error
```
You've hit Exa's free MCP rate limit (HTTP 429).
```

### Context
- Exa was the prescribed fallback after Tavily quota exhaustion.
- Successful responses already identified official motion/glossary sources; the remaining work can continue from known URLs and first-party GitHub repositories.

### Suggested Fix
Stop broad parallel search, verify the discovered sources directly with Jina Reader, official pages, and GitHub APIs, and space any further discovery calls.

### Metadata
- Reproducible: yes
- Related Files: docs/research/2026-08-31-visual-atlas-400-sources.md

### Resolution
- **Resolved**: 2026-08-31T11:40:00+08:00
- **Notes**: Switched from broad discovery to direct first-party verification.

---

## [ERR-20260831-005] tavily_usage_limit

**Logged**: 2026-08-31T11:35:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
All Tavily discovery queries were rejected because the configured plan usage limit was exhausted.

### Error
```
This request exceeds your plan's set usage limit.
```

### Context
- Five independent queries were issued for UI anatomy, motion vocabulary, cross-medium terms, agent UI taxonomy, and large pattern libraries.
- The failure came from the configured search backend, not the target sites.

### Suggested Fix
Follow Agent Reach routing: switch discovery to Exa and verify findings against official pages with Jina Reader or browser inspection.

### Metadata
- Reproducible: yes
- Related Files: none

### Resolution
- **Resolved**: 2026-08-31T11:35:00+08:00
- **Notes**: Routed subsequent research to Exa/Jina instead of retrying Tavily.

---

## [ERR-20260831-004] apply_patch_same_path_replace

**Logged**: 2026-08-31T11:20:00+08:00
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary
`apply_patch` rejected a single patch that deleted and re-added the same file path.

### Error
```
invalid patch: multiple operations target .../src/SiteCatalog.jsx
```

### Context
- Attempted a complete component rewrite while preserving the apply-patch-only editing rule.

### Suggested Fix
Delete the file in one patch call, then add its replacement in a second patch call.

### Metadata
- Reproducible: yes
- Related Files: demo/src/SiteCatalog.jsx

### Resolution
- **Resolved**: 2026-08-31T11:20:00+08:00
- **Notes**: Split the replacement into two atomic apply-patch operations.

---

## [ERR-20260831-004] web-access-check-deps-missing

**Logged**: 2026-08-31T02:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: config

### Summary
The installed `web-access` skill contains its instruction file but not the documented dependency-check script.

### Error
```
check-deps.sh not found
```

### Context
- Checked both the documented `~/.Codex/skills/...` path and the actual `~/.agents/skills/...` installation.
- The skill directory only contains `SKILL.md`.

### Suggested Fix
Treat the CDP helper as unavailable in this installation and use the verified Agent Reach/Jina route for public first-party pages; reinstall the complete skill package before CDP-only work.

### Metadata
- Reproducible: yes
- Related Files: none

### Resolution
- **Resolved**: 2026-08-31T02:00:00+08:00
- **Notes**: Continued with the verified Jina Reader route; no authenticated or interactive pages are required for this research.

---

## [ERR-20260831-005] powershell-pipeline-after-for

**Logged**: 2026-08-31T02:02:00+08:00
**Priority**: low
**Status**: resolved
**Area**: config

### Summary
PowerShell rejected piping directly from a `for` statement in the transcript summarizer.

### Error
```
ParserError: An empty pipe element is not allowed.
```

### Context
- A diagnostic formatter attempted `for (...) { ... } | Format-Table`.

### Suggested Fix
Capture the loop output in an array variable, then pipe that variable to `Format-Table`.

### Metadata
- Reproducible: yes
- Related Files: none

### Resolution
- **Resolved**: 2026-08-31T02:02:00+08:00
- **Notes**: Rewrote the formatter to collect records before formatting.

---

## [ERR-20260831-006] concurrent_catalog_browser_module_missing

**Logged**: 2026-08-31T10:46:00+08:00
**Priority**: medium
**Status**: pending
**Area**: tests

### Summary
The final full-suite run encountered a concurrently added browser-catalog test whose implementation module did not yet exist.

### Error
```
ERR_MODULE_NOT_FOUND: src/lib/site-catalog-browser.js
```

### Context
- `tests/catalog-browser.test.mjs` appeared while the independent site-catalog data line was finishing.
- The data worker was explicitly restricted to catalog data, collection/build scripts, data tests, and collection notes.
- The site-catalog contract itself passed 7/7; the full suite reported 72/73.

### Suggested Fix
The owning UI/browser integration line should add `src/lib/site-catalog-browser.js` or update its test contract, then rerun the full suite. The data worker should not cross its file boundary to mask the failure.

### Metadata
- Reproducible: yes
- Related Files: demo/tests/catalog-browser.test.mjs, demo/src/lib/site-catalog-browser.js

---

## [ERR-20260831-005] translate_endpoint_node_fingerprint

**Logged**: 2026-08-31T10:25:00+08:00
**Priority**: low
**Status**: resolved
**Area**: backend

### Summary
The public translation endpoint returned HTTP 429 to Node/undici requests while the same request succeeded through ordinary curl.

### Error
```
429 Too Many Requests
```

### Context
- Batch-translating exact source descriptions for the VisLexicon candidate catalog.
- A one-item comparison showed curl returned 200 while Node `fetch` returned the provider's automated-request rejection page.
- The failed batch produced zero translations and was stopped before integration.

### Suggested Fix
Use the already verified public curl route with bounded batches, retries, and an on-disk resume cache; validate marker alignment and Chinese output before accepting any translation.

### Metadata
- Reproducible: yes
- Related Files: demo/scripts/translate-site-descriptions.mjs, demo/data/sources/site-descriptions.zh.raw.json

### Resolution
- **Resolved**: 2026-08-31T10:33:00+08:00
- **Notes**: Replaced Node fetch with direct curl execution. The resumed run produced 3213 aligned translations with three explicit failures; failed descriptions use taxonomy-safe fallbacks.

---

## [ERR-20260831-004] github_raw_path_case_assumption

**Logged**: 2026-08-31T10:01:00+08:00
**Priority**: low
**Status**: resolved
**Area**: docs

### Summary
The first-party README fetch failed because GitHub raw paths are case-sensitive and the repository file is named `readme.md`, not `README.md`.

### Error
```
curl: (22) The requested URL returned error: 404
```

### Context
- Tried to verify the provenance of `demo/parsed-design-sites.json` against the upstream design-resources repository.
- Used hard-coded `master/README.md` and then `main/README.md` raw paths without first reading the repository contents metadata.

### Suggested Fix
Resolve both the default branch and exact file-path casing from the official GitHub contents API before constructing a raw content URL.

### Metadata
- Reproducible: yes
- Related Files: demo/parsed-design-sites.json

### Resolution
- **Resolved**: 2026-08-31T10:02:00+08:00
- **Notes**: The GitHub API confirmed the default branch is `master` and returned the exact download URL ending in lowercase `readme.md`; the collector now uses that first-party URL.

---

## [ERR-20260831-002] git_metadata_unavailable

**Logged**: 2026-08-31T01:10:00+08:00
**Priority**: low
**Status**: resolved
**Area**: config

### Summary
Git status and log checks failed because the workspace is intentionally not a Git repository.

### Error
```
fatal: not a git repository (or any of the parent directories): .git
```

### Context
- Baseline inspection attempted `git status`, branch, and log commands from the workspace root.
- The approved implementation plan already documents that this project has no `.git` directory.

### Suggested Fix
Skip Git/worktree/commit steps and use fresh test, lint, build, file-diff, and browser evidence checkpoints.

### Metadata
- Reproducible: yes
- Related Files: docs/superpowers/plans/2026-08-30-vislexicon-full-site-redesign.md

### Resolution
- **Resolved**: 2026-08-31T01:10:00+08:00
- **Notes**: Continued with the plan's documented no-Git verification workflow.

---

## [ERR-20260831-003] in_app_browser_networkidle

**Logged**: 2026-08-31T01:15:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
The in-app browser implementation rejected `networkidle` despite the generic API type listing it.

### Error
```
playwright_wait_for_load_state does not support networkidle
```

### Context
- Opening the local Vite preview for responsive visual checks.

### Suggested Fix
Use the supported `load` state followed by a short stabilization wait for this browser backend.

### Metadata
- Reproducible: yes
- Related Files: none

### Resolution
- **Resolved**: 2026-08-31T01:15:00+08:00
- **Notes**: Switched to `load` plus a bounded wait.

---

## [ERR-20260831-001] codex_read_thread_limits

**Logged**: 2026-08-31T01:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: config

### Summary
The first task-history request exceeded the Codex `read_thread` per-call limits.

### Error
```
turnLimit must be <= 10; maxOutputCharsPerItem must be <= 20000.
```

### Context
- Attempted to read a long predecessor task in one call.
- Used `turnLimit: 50` and `maxOutputCharsPerItem: 30000`.

### Suggested Fix
Use at most 10 turns and 20,000 characters per item, then follow the returned cursor when pagination is available.

### Metadata
- Reproducible: yes
- Related Files: none

### Resolution
- **Resolved**: 2026-08-31T01:00:00+08:00
- **Notes**: Retried with the documented per-call maxima.

---

## [ERR-20260831-006] agent-reach-exa-rate-limit

**Logged**: 2026-08-31T03:25:00+08:00
**Priority**: low
**Status**: resolved
**Area**: config

### Summary
The configured Agent Reach Exa MCP backend reached its free request limit during the second discovery wave.

### Error
```
HTTP 429: You've hit Exa's free MCP rate limit.
```

### Context
- The first discovery wave completed successfully and identified official candidates.
- Four later queries all returned the same 429 response, so no repeated retries were attempted.

### Suggested Fix
Use targeted first-party URLs with Jina Reader and GitHub CLI for verification; configure a personal Exa key only if additional open-ended discovery is required.

### Metadata
- Reproducible: yes
- Related Files: docs/research/2026-08-31-visual-atlas-400-sources.md

### Resolution
- **Resolved**: 2026-08-31T03:25:00+08:00
- **Notes**: Switched to the web-access first-party reading path and GitHub CLI; conclusions remain sourced to official pages or repositories.

---

## [ERR-20260831-007] curl-early-pipe-close

**Logged**: 2026-08-31T03:26:00+08:00
**Priority**: low
**Status**: resolved
**Area**: config

### Summary
Piping a long curl response into `Select-Object -First` caused curl to report a write failure after the consumer closed early.

### Error
```
curl: (23) Failure writing output to destination
```

### Context
- The requested leading lines were returned correctly; the failure was caused by early pipeline termination, not a network or source error.

### Suggested Fix
Capture the bounded response before selecting lines, or avoid treating this expected broken-pipe condition as a source failure.

### Metadata
- Reproducible: yes
- Related Files: none

### Resolution
- **Resolved**: 2026-08-31T03:26:00+08:00
- **Notes**: Subsequent count operations capture the full response before parsing.

---

## [ERR-20260831-TX1] taxonomy_audit_verification_timeout

**Logged**: 2026-08-31T12:28:00+08:00
**Priority**: low
**Status**: resolved
**Area**: docs

### Summary
The first end-to-end online verification command reached the 30-second execution yield after completing the core-source checks but before returning the AI and motion checks.

### Error
```
Verification output stopped after the core-source assertions at the 30-second boundary.
```

### Context
- The command re-fetched multiple official sites and GitHub trees in one PowerShell process.
- All displayed core assertions passed, but undisplayed assertions were not treated as passed.

### Suggested Fix
Split network-heavy verification by source family and rerun every remaining assertion in fresh bounded commands.

### Metadata
- Reproducible: yes
- Related Files: docs/research/2026-08-31-visual-atlas-taxonomy-audit.draft.md

### Resolution
- **Resolved**: 2026-08-31T12:29:00+08:00
- **Notes**: Re-ran AI-source, Atlas, animation-vocabulary, and artifact assertions in three shorter commands; all reported PASS.

---

## [ERR-20260831-008] powershell-interpolated-colon

**Logged**: 2026-08-31T03:40:00+08:00
**Priority**: low
**Status**: resolved
**Area**: config

### Summary
PowerShell parsed a colon immediately after an interpolated property variable as part of the variable name.

### Error
```
Variable reference is not valid. ':' was not followed by a valid variable name character.
```

### Context
- A Figma type-vocabulary parser used `$prop:` inside a regex string.

### Suggested Fix
Use `${prop}:` whenever punctuation directly follows an interpolated PowerShell variable.

### Metadata
- Reproducible: yes
- Related Files: docs/research/2026-08-31-visual-atlas-source-candidates.json
- Pattern-Key: powershell.interpolated_colon
- Recurrence-Count: 2
- Last-Seen: 2026-09-01

### Resolution
- **Resolved**: 2026-08-31T03:40:00+08:00
- **Notes**: Re-ran with `${prop}` and verified 82 namespaced options.

---

## [ERR-20260831-009] powershell-cmdlet-spacing-typos

**Logged**: 2026-08-31T04:05:00+08:00
**Priority**: low
**Status**: resolved
**Area**: config

### Summary
Two validation commands accidentally removed spaces from PowerShell cmdlet names and parameters.

### Error
```
Measure-Object-Sum is not recognized.
Get-Content-LiteralPath is not recognized.
```

### Context
- Occurred while counting UI Terms aliases and validating the source-candidate JSON totals.

### Suggested Fix
Keep cmdlet parameters separate: `Measure-Object -Sum` and `Get-Content -LiteralPath`.

### Metadata
- Reproducible: yes
- Related Files: docs/research/2026-08-31-visual-atlas-source-candidates.json

### Resolution
- **Resolved**: 2026-08-31T04:05:00+08:00
- **Notes**: Corrected commands; JSON parses and declared totals match computed totals.

---

## [ERR-20260831-010] nonexistent-test-inspection-path

**Logged**: 2026-08-31T04:10:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
Project inspection attempted to read a guessed test filename that does not exist.

### Error
```
Cannot find path demo/tests/catalog-data.test.mjs because it does not exist.
```

### Context
- The real related tests are `site-catalog.test.mjs` and `catalog-browser.test.mjs`.

### Suggested Fix
List test files first and open only returned paths instead of guessing a conventional name.

### Metadata
- Reproducible: yes
- Related Files: demo/tests

### Resolution
- **Resolved**: 2026-08-31T04:10:00+08:00
- **Notes**: Continued using the listed test files and established Node test-runner conventions.

---

## [ERR-20260901-002] repeated-git-probe-in-non-repository

**Logged**: 2026-09-01T00:30:00+08:00
**Priority**: low
**Status**: resolved
**Area**: config

### Summary
Ran Git status and log despite the handoff explicitly stating that the workspace is not a Git repository.

### Error
```
fatal: not a git repository (or any of the parent directories): .git
```

### Context
- Attempted `git -C demo status --short` and `git -C demo log` during the current-state audit.

### Suggested Fix
Trust the recorded repository fact and verify changes with file inventories, timestamps, hashes, and tests instead of probing Git again.

### Metadata
- Reproducible: yes
- Related Files: HANDOFF-2026-08-31.md

### Resolution
- **Resolved**: 2026-09-01T00:30:00+08:00
- **Notes**: Switched the audit to filesystem and test evidence.

---

## [ERR-20260901-003] repeated-guessed-file-path

**Logged**: 2026-09-01T00:35:00+08:00
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary
Guessed `demo/src/IndexView.jsx` even though the actual component is under `demo/src/views/IndexView.jsx`.

### Error
```
Cannot find path '.\demo\src\IndexView.jsx' because it does not exist.
```

### Context
- Occurred during a read-only curation UI audit.

### Suggested Fix
Use `rg --files` or paths returned by text search before opening a file.

### Metadata
- Reproducible: yes
- Related Files: demo/src/views/IndexView.jsx
- See Also: ERR-20260831-010

### Resolution
- **Resolved**: 2026-09-01T00:35:00+08:00
- **Notes**: Continued with the discovered path.

---
