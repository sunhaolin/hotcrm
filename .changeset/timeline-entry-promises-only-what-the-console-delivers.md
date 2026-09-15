---
'hotcrm': patch
---

**Logging a call writes the timeline entry it always did — the docs now say what
the console then does with it, which is less than they promised.**

Two things go wrong after you press **Confirm** on **Log a Call** (and on **Log a
Meeting**, **Schedule a Meeting** and **Send Email**, which write the same kind of
entry):

- the record's **Activity** tab does not show the new entry until you reload the
  page — it reads the timeline once, when you open the record, and is not re-read
  when an action succeeds;
- the entry's **View source →** link does not open the call it points at. It
  addresses `/objects/<object>/<id>`, which the console serves no page for, so it
  answers with a `Not found` error page.

Both are defects in the console's own timeline renderer, measured on platform
17.4.0, and neither is something this app can set, declare or work around: the
action already asks for a refresh, the timeline component takes no prop that
would change either behaviour, and the pointer the entry carries is correct —
every query, view and report reads the same call record it names.

So nothing about what HotCRM writes changes here. What changes is that
**Meetings & Calls** and **Email & Calendar** stopped promising a drill-through
that does not open, in all three languages, and now tell you what to do
meanwhile: reload the record to see the entry, and open the call itself from
**Activity › Events**. The two action files carry the same finding beside the
lines it concerns, so the next author does not try to fix a renderer from here.
