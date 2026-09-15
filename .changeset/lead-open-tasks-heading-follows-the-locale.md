---
'hotcrm': patch
---

**The lead page's open-tasks panel is no longer English on a Chinese screen.**

Open a lead, click **Related**, and the tasks panel heading read **Open Tasks**
— in every language. The panel around it was already translated (任务 on a
Chinese console, タスク on a Japanese one), so the English sat inside a screen
that had otherwise switched languages, on the one card a rep opens to see what
is still owed on the lead.

The heading now follows the viewer: **Open Tasks** · **待办任务** ·
**Tareas Abiertas** · **オープンタスク**. The wording is the locale packs' own,
taken from the `crm_task` view row those packs already translate
(`⏰ Open Tasks · Most Overdue First`), so the panel and the view tab name the
same thing rather than coining a second term for it.

It was not a missing translation row — there was nowhere to put one. The
console's page-translation walk reaches a region's components and a container's
declared `properties.children`; it does not descend a `page:tabs` item's
children or a `page:accordion` item's, which is exactly where this list sits. A
`pages.lead_detail_page.components.related_tasks.title` entry would have been
copy no locale could make reach a screen.

So the heading is authored as an **inline locale map** —
`{ en, 'zh-CN', 'es-ES', 'ja-JP' }` — the second of the two forms
`I18nLabelSchema` authorizes, which `record:related_list` takes for `title` and
the console resolves against the active language. The duplicate-management
banners on the same page already carry their copy this way, and the dashboard
filters do too; this is that same route, on the one component that still needed
it.

Nothing else moves. The list still shows the same tasks in the same order — the
filter, columns, sort, limit and actions are untouched — and the equivalent
panels on the opportunity and case pages were already translated by a different
mechanism (the console's own dictionary for accordion and tab labels), so they
are unchanged.
