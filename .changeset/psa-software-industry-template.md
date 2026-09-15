---
'hotcrm': minor
---

Project-type sales for a software company: the PSA family (presales and
delivery projects, cost plan lines, timesheets, travel costs, business trips,
leave requests, budget adjustments, invoices, collections, purchase contracts,
sales orders, rate cards and contracting entities), nine one-tier approval
flows driven by a **发起审批** record-header button, four cross-object gates
(bidding-agency and EAR-confirmed accounts cannot open an opportunity, an
over-budget project refuses new timesheets, an unapproved trip refuses travel
costs), two project dashboards, and a Chinese demo data set for a
software-company target customer. The demo documents, screenshots and the
customer deck live under `docs/demo/psa-presales/`.

The two lead duplicate banners (`record:alert`) are now spelled as the bare comparison the console evaluates — `record.duplicate_status == "suspected"` / `"confirmed"` — because `@objectstack/console` 17.4.0 cannot evaluate `has()` or `in` in a record-page predicate and, the surface being fail-soft, showed both banners on every clean lead. Measured and pinned in `test/lead-duplicate-visibility.test.ts`; the conversion flow's edges keep their `has()` guards.
