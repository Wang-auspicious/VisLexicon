# VisLexicon Agent Instructions

## Workspace

- This workspace is not a Git repository. Verify with tests, hashes, file inventories, lint, build, and browser evidence; do not use Git reset/checkout workflows.
- Page layout is currently user-owned and frozen. Backend curation, identity, classification, tagging, evidence, screenshots, descriptions, and source-link correctness may change; do not redesign the UI unless the user explicitly resumes layout work.

## Site Curation

- Read `docs/superpowers/specs/2026-09-01-site-entry-taxonomy-v3-design.md` before changing site classification or evidence schemas.
- Classify a Site Entry or Content Unit, never an entire Source Entity. AI, Agent, frameworks, devices, ecommerce, and ordinary recruitment context are facets rather than privileged categories.
- Persist every raw Source Observation before normalization or deduplication. Enforce raw-hit count conservation and never silently discard duplicate observations.
- Only strong identity signals may auto-merge. Same-origin paths, same names, descriptions, logos, or screenshots require an auditable merge/split decision.
- A published entry requires real exploration, identity/breadth/proof evidence, three valid screenshots, a human-written Chinese description, direct fact sources, and independent review.

## PowerShell

- Do not pipe directly from `for` or `foreach` statements. Collect loop output in a task-specific variable, then pipe that variable.
- Resolve paths relative to the declared command working directory, and use `rg --files` before opening an uncertain filename.
