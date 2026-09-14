---
---

`docs/requirements/` only — this PR releases nothing to HotCRM users, so the frontmatter
above is deliberately empty (the sanctioned "releases nothing" declaration that
`.github/workflows/changeset-check.yml` documents, on par with the `skip-changeset`
label). No `src/` metadata changed: no object, field, view, label, flow or hook.

Adds REQ-0002, the intake and triage of a customer's 40-step process spreadsheet, and
indexes it in the requirements README. The record triages each step into the A/B/C/D
disposition framework and records the scope boundary the spec's own `系统路径` column
draws between CRM steps and the separate PSA system.
