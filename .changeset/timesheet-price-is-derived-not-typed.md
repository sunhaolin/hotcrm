---
"hotcrm": patch
---

A timesheet's rate and labor cost are derived, so they are no longer typed — and a sheet
that names a grade is now actually priced by it.

Creating a timesheet used to show two empty currency boxes, **费率标准** (Hourly Rate) and
**人工成本** (Cost), for figures nobody is supposed to fill in. Worse, they did not stay
empty on the wire: the form posted `hourly_rate: 0`, and the rate-fill hook read that zero
as a rate the author had chosen and declined to price the sheet from its rate card. A sheet
with a grade picked and 160 hours booked saved a cost of `0.00`, and the delivery project's
Labor Actual summed it as such.

Both columns have left the create/edit form and are declared read-only on the object, so a
value on the payload is dropped whichever way it arrives. The hourly rate now comes from the
selected 岗位级别 / 费率卡 and nowhere else: it is read from the card when a sheet picks one
and when a sheet carries no rate yet, while a sheet that already priced itself keeps its
rate — so editing a rate card still reaches new sheets and leaves approved history alone.

Both figures keep every read surface they had: the timesheet list still shows rate and cost
columns, and the record page still shows them in its Timesheet section.

The three attendance labels now name their unit in Chinese, matching 工时（小时）:
**标准工时（小时）**, **请假工时（小时）**, **加班工时（小时）**.
