---
'hotcrm': patch
---

Say — on the 交付项目 create form, and in its docs page — that 关联商机 /
所属客户 are carried from the presales project.

`delivery_project_defaults` has always filled `crm_opportunity` and
`crm_account` alongside `budget_baseline`, but only the baseline half was ever
stated. The two lookups carried no `description` (unlike `budget_baseline` and
`contract_amount` next to them), so on the create form they read as two empty
pickers a creator is expected to fill by hand; and the page's "On create —
defaults from the Bizcase" section named the baseline and the contract amount
and stopped there. Both now say it: a field description in all four locale
packs, and a paragraph on `delivery-projects.mdx` in all three doc locales.

The docs paragraph also states the part that surprises people: the pair is
filled when the record is SAVED, not when the presales project is picked, so
both stay empty on screen until the record is created. Measured on the pinned
17.4.0 by driving the real console create form — the selection issues no
default-resolving request, and the record returned by
`POST /api/v1/data/crm_delivery_project` carries both. A form-time fill would
be a platform form-runtime capability (no field key, action location or flow
trigger expresses one), so it is not compensated for here.

`test/hooks-runtime-psa.test.ts` gains the four cases that half of the carry
has of its own — the keys omitted entirely as the console posts them, a blank
string treated as an absent key, a picked value and a value already on the
record both left alone, and the pair still carried from an uncosted Bizcase.
Ablating either carry line turns four cases red.
