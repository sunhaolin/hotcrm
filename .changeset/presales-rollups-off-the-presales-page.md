---
'hotcrm': patch
---

Take 售前工时（已审批）/ 售前人工成本（已审批） off the 售前项目 record page and
form. The two `crm_presales_project` roll-ups — `presales_hours` and
`presales_labor_actual` — are now `hidden: true` and no longer enumerated in the
view's `cost_estimate` form section.

They read `0` on every presales project, and a column that is always zero reads
as broken rather than as empty. The roll-ups themselves are sound: both sum
`crm_timesheet` over the `crm_presales_project` FK under
`filter: { approval_status: 'approved' }`, and the engine maintains a summary
over a `lookup` exactly as it does over a `master_detail` one — measured against
a real `ObjectQL` engine on the three shipped schemas, an approved timesheet
carrying `crm_presales_project` lands on the parent's two fields immediately.

What is missing is anything to sum. No seeded timesheet sets
`crm_presales_project` — all 31 rows across `psa.seed.ts` and
`psa-industry.seed.ts` name only a delivery project — and booking one by hand is
not the small gesture it looks like: `crm_timesheet.crm_delivery_project` is a
REQUIRED master-detail, so presales hours cannot be recorded until a delivery
project exists, and once they are, that hour's cost also lands in the delivery
project's `labor_actual`, moving its burn and margin. `docs/demo/psa-presales/REPORT.md`
§9.3 already recorded the first half of this as a deliberate simplification
(「演示种子未放售前工时」).

Hiding is the reversible half of 「enforce-or-remove」 (#1182): the fields stay
declared, the platform keeps maintaining them, and dropping `hidden` brings them
back with no backfill. `objectstack validate` now reports both as carrier-only —
the same advisory class `crm_forecast.seed_key` and
`crm_article_feedback.comment` already sit in — and names the three locale packs
(zh-CN, ja-JP, es-ES) a later removal would have to clean. Their labels stay for
that reason.

Nothing else on the page moves: 人工服务成本 / 第三方服务成本 / 第三方软硬件采购成本 /
项目费用 / 总成本 / 报价金额 / 毛利率 render as before, verified in the console
against a seeded record.
