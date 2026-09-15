---
'hotcrm': patch
---

Say on the 交付项目 create form that 关联商机 / 所属客户 are carried from the
presales project, and pin the carry that does it.

`delivery_project_defaults` has always filled `crm_opportunity`, `crm_account`
and `budget_baseline` from the presales project a delivery project is opened
against, and `crm_account` / `contract_amount` from an attached sales contract.
Nothing said so where a creator looks: `budget_baseline` and `contract_amount`
carry a description explaining their default, the two lookups carried none, so
they read as two empty pickers the creator is expected to fill by hand. Both now
carry one, in all four locale packs.

The carry lands on save, because a hook is the construct that carries a derived
value. Picking the presales project does NOT fill the pair on screen — the
console form resolves no lookup-driven default, measured on the pinned 17.4.0 by
driving the real create form: the selection issues no default-resolving request
and both fields stay empty, while the record returned by
`POST /api/v1/data/crm_delivery_project` carries them. A form-time fill is a
platform form-runtime capability and is not compensated for here.

`test/hooks-runtime-delivery-project.test.ts` is new and runs the real handler:
the three carried values, a blank string treated as an absent key, and the three
guards that decide when nothing is carried — a typed value, a value already on
the record, and a write naming no presales project.
