---
'hotcrm': patch
---

Run `timesheet_budget_gate` elevated, so it fires for the person it was written
for. The gate reads the delivery project and sums its booked cost through
`ctx.api`, which under the default `runAs: 'inherit'` is the CALLER's context —
and since the delivery project stopped being mandatory on a timesheet,
`crm_timesheet` is `private` and `sales_rep` carries `readScope: 'own'` on it
**and on `crm_delivery_project`**.

### Measured, as a rep rather than as an admin

Same fixture both ways — the pilot project, 200,000 budgeted, 264,000 already
booked — driven against a real server as a user holding `sales_rep` who owns
none of it (their own read of the project returns 0 rows, and of its timesheets
0 rows):

| gate runs as | result |
| --- | --- |
| `inherit` (before) | **HTTP 201** — the sheet is created on a project 32% over budget |
| `system` (this change) | **HTTP 400** — *项目「…」成本已超预算（实际 264,000 ≥ 预算 200,000），工时填报已限制* |

The failure is not a miscount, it is silence: the project `findOne` comes back
null, so the gate's own "no budget, no control line" early return fires and the
body never reaches a comparison. Every hand-test of this gate had been run as
the dev admin, who reads every row — which is exactly why it measured green.

### Why elevation, and why this is the small one

`AGENTS.md` rule 9 is "elevate as little as possible", so this is a deliberate
deviation, written down twice as rule 11 requires: the argument sits beside the
declaration, and `test/hook-run-as-roster.test.ts` is the roster that would
otherwise tidy it away. That guard pins the two properties the argument rests
on, and each was ablated to prove it is not vacuous:

- **The elevated body writes nothing.** No `insert` / `update` / `delete`, no
  key set on `ctx.input` — it reads four collections and either throws or
  returns, so elevation cannot produce an elevated write, which is what rule 9
  is about.
- **It scans nothing.** Every read is pinned to one parent record
  (`id: projectId`, `crm_delivery_project: projectId`), so rule 10's
  organization predicate has nothing to bite on: a row of another organization
  cannot carry this project's id.

Measured on 17.4.0: `installRunAsApi` swaps `ctx.api` alone for the duration of
the handler, while `ctx.session` is built separately off the triggering write.
So the gate's seed-replay exemption still reads the caller's own `isSystem`
flag and is not self-satisfied by this declaration.

The alternatives were rejected for changing the product rather than fixing the
gate: widening `sales_rep`'s read of `crm_timesheet` would undo the privacy
model that made the sheet a person's own record, and "the budget is checked
against what you can see" is not a gate.

One consequence worth stating: the refusal now shows a scope-limited person two
aggregates they cannot read directly — the project's booked cost and its
budget. Both are about the project they just picked, not about anybody's
individual sheet, and a refusal that withholds why it fired is a support ticket.
