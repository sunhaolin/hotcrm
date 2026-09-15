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
  form: {
    type: 'simple',
    sections: [
      { name: 'basic', label: 'Timesheet', columns: 2, fields: [
        'timesheet_number', 'crm_delivery_project', 'crm_presales_project', 'owner_id', 'period_month',
        'crm_rate_card', 'standard_hours', 'leave_hours', 'overtime_hours', 'hours', 'hourly_rate', 'cost', 'notes',
      ] },
      { name: 'approval', label: 'Approval', columns: 2, fields: ['approval_status', 'approved_date'] },
    ],
  },
});
