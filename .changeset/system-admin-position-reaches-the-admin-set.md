---
'hotcrm': patch
---

Declare the `system_admin` position, so the administrator profile reaches an
actual person — including the export rights it has carried all along.

HotCRM authors `allowExport` on all five exportable objects in its
`system_admin` permission set. It has to: the platform deliberately keeps
`allowExport` off the `admin_full_access` wildcard (segregation of duties —
full administrative access is not by itself bulk egress, objectstack#8681), and
that ruling's stated remedy is to grant the bit per object in an app permission
set, which this app does.

Nobody could hold that set. A pure-metadata app ships no position↔permission-set
junction rows and no boot-time binder, so it has exactly one spelling for
binding a set to a position: declare a position of the same name. Five of the
six app sets had theirs (`sales_rep`, `sales_manager`, `service_agent`,
`service_manager`, `marketing_user`) and `guest_portal` binds to the platform
`guest` anchor — `system_admin` had neither, so the admin persona was declared
and unreachable. Assigning it in **Setup → Users** now works, and an
administrator holding it can export Accounts, Contacts, Leads, Opportunities and
Cases from the list toolbar.

The position roster goes 12 → 13, and the docs say so in all three locales.
`HOTCRM_COMPOSITION=saas` swaps the row to `tenant_admin` alongside the set it
already swaps, so neither shape is left with a position no set names or a set no
position reaches; `test/saas-composition.test.ts` pins both directions.

Declaring a position does not staff it: no user holds any position until an
administrator assigns one.
