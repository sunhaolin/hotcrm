---
'hotcrm': patch
---

`pnpm demo:staff` no longer aborts when an approval holds a row locked.

Step 3 of the staffing run re-stamps `owner_id` on every opportunity, lead,
task and event sitting on the dev admin or on nobody. `opportunity_approval`
declares `lockRecord: true`, so an open deal at or above `LARGE_DEAL_AMOUNT`
whose request is still pending answers `409 RECORD_LOCKED` to any write — and
the re-stamp is itself an update that can push such a deal into approval, which
is how a converged demo org comes to hold those rows at all.

That refusal was fatal. Measured on a fresh database: `pnpm demo:reset` →
`pnpm dev` → `pnpm demo:staff` succeeds and leaves nine seeded deals pending
manager review; opening one $100K+ opportunity as the dev admin and rerunning
then died on the first locked row with
`PATCH crm_opportunity/<id> → 409: record '<id>' … is locked while an approval
is in progress` and exit 1. Steps 4 and 5 — the sharing-rule re-evaluation and
the verification plus ownership census — never ran, so the org was left
half-staffed with no census to read, and the file's own "rerun it any time,
including against a half-staffed org" was false for every org that had used the
approval it ships.

A locked row is now reported and stepped over: it keeps its current owner, it
is not counted as settled (the census judges where a row was *sent*, and a row
nobody could write was never sent anywhere), and the run prints how many there
were, which object they are on, and that deciding them in the Approvals Inbox
and rerunning is what routes them. Verified: after the approver takes the
decision, the next run re-stamps the row. Every other non-2xx still throws —
`Api.patchOk` is unchanged and `patchUnlessLocked` narrows to exactly
`409` + `RECORD_LOCKED`.

Nothing in the app changes: this is the dev-only demo path, which ships in no
artifact.
