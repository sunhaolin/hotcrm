---
'hotcrm': minor
---

A cost plan under approval now shows every amount against the version the
project is actually executing on, and the difference between the pair.

Approving a cost plan is a decision about a **difference** — 「本次审批数据和当前
执行的成本计划记录的所有金额的对比和差异」 — and the record put in front of the
approver carried only its own totals. Reading the version in force meant leaving
the approval, finding the current version and subtracting by hand, per category.

`crm_cost_plan` gains a **与当前版本对比 / Comparison with the Current Version**
group. Submitting a plan for approval records the version currently in force for
the same project (`compare_plan`) and snapshots its amounts onto the submitted
row — frozen baseline, planned total, the four category totals and *of which
travel*. Each `delta_*` beside them is a formula over that pair, so a difference
can never disagree with the two figures it is drawn from; the planned total also
carries the gap as a percentage. Positive is an increase, negative a reduction.

The snapshot is taken at the submit transition and nowhere else — the same
transition that freezes the plan's lines and months — so the two sides of the
comparison are the two versions the approver is deciding between, and the row
stays the audit record of what was shown. A project with no version in force at
all leaves `compare_plan` empty and the snapshot at zero, which makes the whole
amount the increase, and the percentage reads 0 rather than dividing by it.

The platform has no cross-record formula (ADR-0055: a field path is a single
column), so the other version's figures are carried on this row to be subtracted
rather than traversed at read time.

**Cost Plans Awaiting Approval** (待审批的成本计划) is the same comparison as a
queue — the plans in flight, every category's difference on the row — so an
approver can rank a stack of them before opening any. The full list view gains
the planned-total difference as a column.
