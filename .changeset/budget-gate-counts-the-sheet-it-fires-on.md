---
'hotcrm': patch
---

Check the budget when a timesheet is CREATED. `timesheet_budget_gate` fires on
`beforeInsert` and counted every sheet on the project except the one being
inserted, so the sheet that blew the budget was always accepted and only the
next one was refused. Reported off the console's 新建工时表 form: 「新建 工时表
记录时，未校验 预算」.

### What was measured

A delivery project budgeted 200,000 with nothing booked against it yet. A first
timesheet of 1,000 hours × 900 — 900,000, four and a half times the whole budget
— saved without a word, because the gate's sum ran over stored rows and the row
under write has no id yet. The refusal only appeared on the NEXT create, by
which point the overrun was already in the project's actual cost.

### The gate now refuses two ways

1. **The project is already at or past its budget** — unchanged, and the
   sentence is the one the demo and the docs quote:
   *项目「…」成本已超预算（实际 … ≥ 预算 …），工时填报已限制*.
2. **The project has budget left, but less than this sheet costs** — new:
   *项目「…」预算剩余 …，本次工时成本 … 已超出剩余预算，工时填报已限制；请调减工时，
   或先提交预算调整并审批通过*.

Both are `VALIDATION_FAILED` / 400, as before. A sheet that spends the budget to
the last yuan still saves — (2) is `>`, not `>=`.

### The control line is the CURRENT budget, not the bare baseline

FROM `budget_baseline` TO `budget_baseline` + every APPROVED
`crm_budget_adjustment` — the same figure `crm_delivery_project.budget_current`
and the burn/variance formulas already read (spec step 32). The gate compared
against the baseline alone, so approving a budget adjustment moved every number
on the project record and changed nothing about what could be booked to it —
while the timesheets page documented exactly that as the way out:
「项目要先有一条审批通过的预算调整，才能再往上记工时」. A project on a 1,200,000
baseline with an approved +100,000 adjustment now books against 1,300,000.

A project with **no** budget at all (baseline 0, no approved adjustment) has no
control line and is not gated — unchanged. A **system** write is not gated
either: seed replay writes with `isSystem: true`, and 试点交付 is seeded
deliberately over its budget as the fixture interception ② is demonstrated on.

### The figures in the sentence are grouped on the shipped path too

`toLocaleString()` groups nothing inside the hook sandbox (no ICU in QuickJS),
so a user read *实际 264000* while the docs, the runbook and every test on a Node
runtime said *264,000*. The grouping is written out in the body now, and pinned
by a test that runs the LOWERED body rather than the closure, which is where the
gap was invisible.

Documentation for both refusals, in all three locales, on the Delivery Projects
and Timesheets & Leave pages.
