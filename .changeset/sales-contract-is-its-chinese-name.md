---
'hotcrm': patch
---

Rename `crm_contract` to **销售合同** in the Chinese UI.

The zh-CN pack called the object 合同 while its buy-side counterpart
`crm_purchase_contract` is 采购合同, so the two sat next to each other in the
**Project Finance** group as 合同 and 采购合同 — the sales side readable as
"contracts in general" rather than as the sell-side half of a pair. The pack's
`label` and `pluralLabel` now say 销售合同, which is the wording the PSA lookup
fields (`fields.crm_contract.label` on delivery projects, invoices and sales
orders) already used, and the sidebar entry follows so the row and the record
page agree.

zh-CN only: `label`/`pluralLabel` plus the `nav_contract` navigation label. The
object name, the English/日本語/español packs, the view labels (全部合同,
合同条款, 合同时间线) and every field label are untouched, and 合同 stays the
generic business noun in the Chinese docs.
