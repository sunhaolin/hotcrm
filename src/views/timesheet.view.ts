// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineView } from '@objectstack/spec/ui';

export const TimesheetViews = defineView({
  list: {
    type: 'grid',
    name: 'all_timesheets',
    label: 'All Timesheets',
    data: { provider: 'object', object: 'crm_timesheet' },
    columns: [
      { field: 'timesheet_number', width: 110, sortable: true },
      { field: 'crm_delivery_project', width: 220 },
      { field: 'owner_id', width: 140 },
      { field: 'period_month', width: 120, sortable: true },
      { field: 'leave_hours', width: 90, align: 'right' },
      { field: 'hours', width: 90, align: 'right' },
      { field: 'hourly_rate', width: 110, align: 'right' },
      { field: 'cost', width: 130, align: 'right' },
      { field: 'approval_status', width: 120, sortable: true },
    ],
    sort: [{ field: 'period_month', order: 'desc' }],
    rowColor: {
      field: 'approval_status',
      colors: { approved: '#16a34a', pending: '#f97316', rejected: '#dc2626', submitted: '#2563eb', draft: '#94a3b8' },
    },
    pagination: { pageSize: 50 },
  },
  /**
   * The CREATE form — and the EDIT form: the console resolves one `form` for
   * both, so a field on it is a field a person types at intake AND on every
   * later edit. (`src/views/case.view.ts` carries the long form of that
   * measurement; the same reading governs here.)
   *
   * ## What is deliberately NOT on it
   *
   * Pricing is derived, so it is not authored — customer ruling: 「人工成本
   * 字段在新建和编辑时不显示，费率标准也不显示。计算人工成本时使用的费率从选择的
   * 岗位级别 / 费率卡中获取。」 Both columns left this form and neither lost a
   * surface (both directions pinned in
   * `test/timesheet-derived-price-surface.test.ts`):
   *
   *   hourly_rate  the rate card's rate, copied by `timesheet_rate_fill`;
   *                list column + the record's own detail section
   *   cost         hours × rate, written by `timesheet_cost_fill` and summed
   *                into the delivery project's Labor Actual; list column +
   *                the record's own detail section
   *
   * ⛔ Do not "fix" a blank rate by putting the column back: an empty input on
   * this form is what USED to submit `hourly_rate: 0` and price a sheet at
   * zero. Both are `readonly: true` on the object now, so the engine strips a
   * caller's value either way — putting them back would only show a person a
   * box whose contents are discarded.
   *
   * `timesheet_number` and the two approval columns stay for the opposite
   * reason: they are `readonly: true`, so the renderer disables them — shown,
   * never authored.
   */
  form: {
    type: 'simple',
    sections: [
      { name: 'basic', label: 'Timesheet', columns: 2, fields: [
        'timesheet_number', { field: 'crm_delivery_project', required: true }, 'crm_presales_project', 'owner_id', 'period_month',
        'crm_rate_card', 'standard_hours', 'leave_hours', 'overtime_hours', 'hours', 'notes',
      ] },
      { name: 'approval', label: 'Approval', columns: 2, fields: ['approval_status', 'approved_date'] },
    ],
  },
});
