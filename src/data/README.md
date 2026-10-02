# Sample data in the browser design kit

The following two reference datasets are deliberately reduced, truthful samples.

- `visual-atlas.json` contains all 170 term IDs claimed by the nine stage manifests, plus 50 unrouted examples. The production source contains 1,932 entries.
- `site-catalog.json` contains 12 independently reviewed v3 entries. The larger production candidate corpus contains 8,684 entries.

The samples exist so the uploaded frontend remains understandable and the Atlas stage index remains valid without forcing a browser model to ingest roughly 17 MB of generated JSON. Do not replace production totals with sample counts in proposed copy.

`creative-resources.json` is a separate starter directory for the Skills, Presentations, and Scientific Figures channels. Records have `status: seed`, direct source URLs, and collection provenance. They are not reviewed Site Entries and must not be added to published site totals. Raw research and observations are retained in the workspace-level `docs/research/2026-09-20-resource-library/` directory.
