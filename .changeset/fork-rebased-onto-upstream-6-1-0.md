---
"hotcrm": minor
---

Clause-②: no
Metadata-protocol: none

**The fork catches up with upstream HotCRM v6.1.0 and runs on ObjectStack 18.3.0; everything the fork added (the PSA objects, cost plans, approvals and dashboards) carries over into upstream's per-package layout.**

**Upstream merged (v3.0.0 → v6.1.0).** `upstream/main` is merged in one commit. All `@objectstack/*` dependencies move from 17.4.0 to 18.3.0 together, pinned exact, and `specVersion` and `engines.protocol` follow to `^18.3.0`. The app is now the four-package artifact upstream ships (`src/sales` app, `src/service`, `src/revenue`, `src/marketing` modules, plus the empty `src/o2c`); the fork's PSA objects, hooks, flows, views, dashboards, actions and translations move into `src/sales`, its seed families fold into upstream's nested seed union, and the SaaS composition keeps the fork's position roster. Upstream's own release notes for 3.x → 6.1.0 apply unchanged (queues and Claim, the Help books, module switches, printed quotes and contracts, price books, the Order to Cash package).

**What 18.x changed on the fork's own metadata.**

- The nine PSA approval flows (`lead_approval`, `opportunity_initiation`, `presales_project_approval`, `delivery_project_approval`, `timesheet_approval`, `budget_adjustment_approval`, `business_trip_approval`, `leave_request_approval`, `cost_plan_approval`) are written in the CEL flow dialect and registered individually.
- `scale` is refused on currency fields: the 36 keys are dropped, the stored precision is the platform's.
- Dataset-bound dashboard widgets no longer carry their own axis keys (17.5.0), and the metric and table tiles on the Project Cost and Project Finance dashboards carry only the options the schema admits (`sortBy`, `sortOrder`, `limit`).
- Every seed dataset but `forecasts` is insert-once (`mode: 'ignore'`): a reload no longer overwrites a record a person has edited.

**What `objectstack lint --strict` asked for on the merged tree.**

- Two cost-plan hooks run elevated, and say why beside their declaration: `cost_plan_defaults` retires a project's other plan versions on `approval_status` (readonly, the approval flow's field) and `budget_adjustment_version_flip` stamps the plan version an approved adjustment names. Both are readonly writes to *another* record, which a user-triggered hook cannot land. The run-as roster now holds READERS and WRITERS apart: a writer may only `update`, every call addressed to one record by id.
- The Project Team field group on presales and delivery projects is keyed `project_team` (it was `roles`, a word the security vocabulary reserves), in all four languages.
- List row colours are named colours (`green`, `orange`, `red`, `blue`, `gray`) rather than hex.
- The presales project's *Presales Hours* and *Presales Labor Actual* roll-ups are no longer hidden: they sit in the Cost Estimate section of the form.
- Chinese, Japanese and Spanish gain the `system_admin` position and the nine PSA approval flows (labels and the approver step).
- `CrmPosition` names the roster row type explicitly.

**Tests.** The app-navigation suite lists the two PSA dashboard entries, each gated on its own object; a new runtime suite (`test/flow-psa-approvals.test.ts`) submits a record of each of the nine PSA objects through the real engine and finds the run parked at the approval node with one request open and the record locked `pending`; the two `src/sales` token ceilings are re-anchored on the merged tree (109,000 / 177,000) in a separate commit.
