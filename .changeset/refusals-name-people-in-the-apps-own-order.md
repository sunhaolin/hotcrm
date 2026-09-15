---
"hotcrm": patch
---

Name a person in a refusal the way the app's own title formula names them — surname first, no separator.

`crm_lead.display_title` / `full_name` and `crm_contact.full_name` compose a person as
`joinNonEmpty([record.last_name, record.first_name], '')`, so the record page, the breadcrumb, the
list views and the lookup picker all title the demo lead `韩雪 - 北方重工集团有限公司`. Four hook
messages still composed the name the other way round, `first last` joined with a space, and were
left that way when those formulas moved to the Chinese order. On the demo's own data a rep who
tried to edit a converted lead read

    Cannot edit converted lead 雪 韩 - 北方重工集团有限公司 (attempted: status).

— a name that appears on no lead surface in the app, in the one sentence whose whole job is to send
the reader to the record that refused.

Fixed at all four sites, each now carrying its object's own composition:

- **Converted-lead lock** (`crm_lead`) — `Cannot edit converted lead 韩雪 - 北方重工集团有限公司 …`.
- **Follow-up task on a qualified lead** (`crm_lead`) — `Follow up with qualified lead: 韩雪 - 北方重工集团有限公司`, the title a rep triages **All Tasks** by.
- **Duplicate-email refusal** (`crm_contact`) — names the contact that already holds the address.
- **Delete refusal on a referenced contact** (`crm_contact`), which a caller also reads when deleting the contact's account.

Nothing else about the refusals changes: same codes, same statuses, same fields listed, and the
record id still stays out of the prose. The order is now pinned by a Chinese-name case on the
converted-lead guard, because a Western fixture cannot catch it — `first last` and `last first`
differ only where the order carries meaning.
