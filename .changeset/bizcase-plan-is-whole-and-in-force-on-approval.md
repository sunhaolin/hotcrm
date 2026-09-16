---
'hotcrm': minor
---

A Bizcase (售前) cost plan is no longer split by month, and approving it is what
puts it in force on the presales project.

Two things the customer read off one screen (2026-09-16):
「成本计划的阶段是售前不需要进行按月拆分，并且此成本计划审批通过后需要将数值显示在此售前计划的成本测算与报价中」.

**Not split by month — and no month rows at all.** The Bizcase is the
whole-range estimate the executive approves; a month split is the delivery
plan's job once the Bizcase is imported (steps 28–31). A Bizcase line now
carries its figure itself: `cost_line_estimate` prices the line's factors
exactly as the delivery split would (a labor line still resolves the rate card
month by month and sums) and writes `estimate_amount` on the line, and
`cost_line_decompose` writes nothing on a Bizcase — it only removes rows a line
still has from before the rule. The ledger stays a delivery plan's, split month
by month as before.

Since a parent summary can only read a stored column and a formula is virtual,
every amount is now a **pair of stored rollups plus a visible formula**: a
line's `planned_amount` = `estimate_amount` (Bizcase) + `allocated_amount` (the
sum of its month rows, delivery); each plan total = `*_month_total` (the ledger)
+ `*_line_total` (the lines' estimates), exactly one side non-zero on any plan.
The presales project's four figures roll up the `*_line_total` columns, the
delivery project's Planned Total rolls up `planned_month_total`, and
`cost_plan_compare`, `budget_adjustment_amount` and **Import Bizcase Budget**
read the stored parts. Values are unchanged where a figure existed before; a
Bizcase's month-based reports simply have nothing to read.

**FROM** a Bizcase line splitting into one ledger row per month **TO** a
Bizcase line with no ledger rows and its figure on the line.

**In force on approval.** The presales project's Labor / Third-party /
Procurement / Expense figures roll up the *current* Bizcase, and nothing ever
made an approved Bizcase current — the version flip belonged to the step-32
budget adjustment, which a presales project does not have — so an approved
Bizcase showed as 0 on the project. `cost_plan_defaults` now marks a Bizcase
current as the approval flow stamps it `approved`, retiring the Bizcase it
replaces (已作废); a delivery version is still put in force by the adjustment
that names it. A write that sets `is_current` itself is left alone.

Help text on `phase`, `is_current`, the ledger's month and the presales
project's four figures says so in the zh-CN pack, and the cost plan, presales
project, delivery project and automation docs are re-worded on their Chinese
pages (zh-Hans, zh-Hant) — this project ships in Chinese only
(「本次项目只设计中文版」), so the other packs and the English pages keep their
wording. `test/hooks-runtime-cost-plan.test.ts` pins the whole-range row per
category, the fold of a line that had been split before the rule, and the flip.

Existing Bizcase plans keep the month rows they already have until a line is
re-saved or **Re-split**, which now removes them; an approved one is frozen and
keeps its rows, so the way to see the rule on old data is a new version.
