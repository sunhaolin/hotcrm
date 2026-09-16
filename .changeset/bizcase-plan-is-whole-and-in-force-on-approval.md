---
'hotcrm': minor
---

A Bizcase (售前) cost plan is no longer split by month, and approving it is what
puts it in force on the presales project.

Two things the customer read off one screen (2026-09-16):
「成本计划的阶段是售前不需要进行按月拆分，并且此成本计划审批通过后需要将数值显示在此售前计划的成本测算与报价中」.

**Not split by month.** The Bizcase is the whole-range estimate the executive
approves; a month split is the delivery plan's job once the Bizcase is imported
(steps 28–31). `cost_line_decompose` now reads the plan's phase: on a Bizcase a
line lands in the ledger as **one whole-range row**, dated the line's start month,
priced exactly as the split would have priced it — a labor line still resolves
the rate card month by month and sums — with the per-month quantity (hours,
person-months) multiplied out and the month range spelled out in the row's
description. The ledger stays the one source every total reads, so the line's
planned amount, the plan totals and the presales project's four figures are
unchanged in value. A delivery plan is split month by month as before.
**Import Bizcase Budget** therefore clones the Bizcase's lines only and lets the
delivery copy split them; it no longer re-applies the source's 手工调整 rows,
which on a Bizcase would be a whole amount landing on one month.

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
re-saved or **Re-split**; an approved one is frozen and keeps its split.
