---
'hotcrm': patch
---

A cost plan that is ITSELF the current version now compares with itself, so
every difference in 与当前版本对比 reads 0 instead of the whole amount.

Submitting a plan read the version in force as "the current version of this
project, other than this row". On a project whose plan is already marked 当前
版本 — the usual shape of a first version, and of any version that has been
approved into force — that left `compare_plan` empty and every `current_*` at
zero, so the deltas read the entire plan as new spend: a plan of 1,566,320 that
changed nothing showed a 1,566,320 increase over a version that does not exist.

`is_current: true` is now taken as the data declares it, with no exception for
the row being submitted. Such a plan snapshots its own amounts and every
`delta_*` is 0 — nothing is being changed, and that is what the group says.
Only a project with no current version at all (every version superseded) leaves
`compare_plan` empty; there the whole amount really is the increase.

The group now also states how to read it: it compares against the version marked
Current Version **at submit time**, it stays on the record after the decision as
the audit record of what was put in front of the approver, and it reads 0 when
the record is itself the current version. The hint sits on the field group, so
the record page carries it above the pairs in all four locales.
