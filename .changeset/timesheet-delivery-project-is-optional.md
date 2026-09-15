---
'hotcrm': minor
---

The delivery project on a timesheet is optional (「交付项目 不要必填」), so a
sheet can carry presales hours alone — or attendance alone — the way the
timesheets page has described it since the object shipped ("Delivery Project
*or* Presales Project"; "use the presales project for bid work"). Until now the
metadata refused what the docs promised: the new-timesheet form marked 交付项目
required, and a sheet without one could not be saved.

FROM → TO, and why the two halves are one change: `crm_timesheet`'s
`crm_delivery_project` was a `masterDetail` and the object was
`sharingModel: 'controlled_by_parent'`. An optional master-detail is not a
shape the platform has — `Field.masterDetail()` stamps `required: true` on the
field it returns, so deleting the flag changes nothing, and ADR-0055 derives a
parent-controlled child's access as `crm_delivery_project IN (<projects the
caller can read>)`, which no NULL row matches. The field is therefore a
`lookup` (keeping `deleteBehavior: 'cascade'`, so deleting a project still
takes its sheets with it), and the object is `private`, anchored on its own
`owner_id`: the shape a leave request and a business trip already have.

What changes for people using it:

- **Filing** — 交付项目 no longer carries the red asterisk, and a sheet saves
  with the presales project alone, or with neither project (a month of leave).
- **Visibility** — a timesheet is now the submitter's own record. A
  Sales Representative reads the sheets **they filed** rather than the sheets
  filed on projects they own; the Sales Manager (who decides 工时审批) and the
  System Administrator continue to read all. The admin sharing page, the
  timesheets page and the delivery-project page state the new baseline in all
  three doc languages.
- **Cost rollups are unchanged** — an approved sheet that names a delivery
  project still sums into that project's Labor Actual, and a presales sheet
  into the bid's Presales Labor Actual. A sheet naming no project sums into
  neither.
- **Upgrading an existing install** — the `crm_delivery_project` column on
  `crm_timesheet` drops its NOT NULL constraint; stored sheets are untouched.

`test/timesheet-optional-project.test.ts` measures both halves against the real
enforcement stack: a rep files two sheets with no delivery project, and reads
back their own three sheets and not a colleague's.
