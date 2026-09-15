---
'hotcrm': patch
---

收款 (`crm_collection`) now carries the sales contract it is collected under,
alongside the delivery project it already hung from.

A collection answers "money in, against what?", and until now it could only
answer half of that: the delivery project (a required master-detail) and,
optionally, the invoice it settles. The contract — the document that says what
the customer owes and on what payment schedule — was reachable only by hopping
through the invoice, and not at all for a collection booked straight against
the project. 开票 (`crm_invoice`) has carried `crm_contract` since it shipped;
收款 now matches it field for field, so both sides of a payment term read the
same way.

`crm_contract` is an optional `Field.lookup('crm_contract')` labelled 销售合同,
exactly the shape and label 开票 uses. Optional is the deliberate half: a
collection can legitimately land before anyone has matched it to a contract
line, and every existing row keeps saving. The delivery project stays the
required parent and the sharing model is unchanged — 收款 is still
*controlled by parent* under the delivery project, and the new lookup adds no
visibility of its own.

What changes for users:

- **Record page and form** — 销售合同 sits between 交付项目 and 关联发票, and
  joins the highlight strip, so the contract is visible without opening the
  form.
- **All Collections list** — a 销售合同 column between the project and invoice
  columns.
- **Seeded demo data** — all seven seeded collections (one in `psa-round2`,
  six in `psa-industry`) now name the contract their invoice was issued under,
  so the demo reads consistently from contract → invoice → collection.

Indexed on `crm_contract`, so filtering or grouping collections by contract
does not table-scan. Labels ship in all four locale packs (en · zh-CN · es-ES
· ja-JP) and the Project Finance docs are updated in all three languages.
