---
'hotcrm': patch
---

Move the **Contracts** sidebar entry out of **Sales** and into **Project
Finance**, at the head of that group.

Every number a project is judged on is measured against the signed agreement:
`crm_delivery_project` looks its sales contract up (`crm_contract`), and the
group's own rows — invoicing, collections, purchase contracts, sales orders and
the project-finance dashboard — all read from that contract's value. The entry
is unchanged otherwise: same object, same label in all four locale packs, and
still the app's only sidebar route to a contract.

Docs that named the old location follow it: the sales index (eight Sales
entries now, six of them object entries, with a re-point to the new home), the
revenue index, the quick tour's left-nav table and the PSA demo script's click
path, each in every locale it ships in.

The quick tour's table also gains the three groups the PSA demo round added —
**Projects**, **Project Finance** and **Master Data** — which it had never
listed, together with the collapse note that goes with them; its guard
(`test/docs-quick-tour-navigation.test.ts`) was red on that drift and is green
again.
