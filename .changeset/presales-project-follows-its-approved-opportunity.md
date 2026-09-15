---
'hotcrm': patch
---

售前项目「关联商机」now offers only opportunities that cleared 商机立项审批, and
「所属客户」is carried from whichever opportunity is picked.

Spec step 15 reads 「售前立项必须引用客户关系系统中已审批通过的商机数据」, and the
demo script has been claiming 「所属客户跟着带出」 since the object shipped. Neither
was true of a new record: the picker offered every opportunity in the org, and a
form that left 所属客户 empty saved it empty, so the project sat under no customer
at all.

Both halves now exist, and they name the same gate:

- **The picker.** `crm_presales_project.crm_opportunity` declares
  `lookupFilters: [{ field: 'initiation_status', operator: 'eq', value: 'approved' }]`
  — the customer's own 立项 ladder (spec step 11), not the amount-tiered
  `approval_status` that HotCRM's standard Large Deal Approval writes. That one
  reads `not_required` on every deal under the threshold, so filtering on it
  would have hidden legitimate small deals while still offering large ones no
  one has initiated.
- **The write.** A new `presales_project_account_carry` hook fills 所属客户 from
  the linked opportunity's account whenever the write leaves it blank, and
  re-derives it when the opportunity is re-pointed and the stored account was
  the previous opportunity's. An account somebody chose by hand, or one named by
  the write itself, is never overwritten.

This scopes the picker, not the write path: an API insert naming an
un-initiated opportunity is still accepted, as it was before.

Both rules are documented on the Presales Projects page, in all three locales.
