// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineView } from '@objectstack/spec/ui';

export const LeaveRequestViews = defineView({
  list: {
    type: 'grid',
    name: 'all_leave_requests',
    label: 'All Leave Requests',
    data: { provider: 'object', object: 'crm_leave_request' },
    columns: [
      { field: 'leave_code', width: 110, sortable: true },
      { field: 'owner_id', width: 110 },
      { field: 'leave_type', width: 100 },
      { field: 'start_date', width: 110, sortable: true },
      { field: 'end_date', width: 110 },
      { field: 'days', width: 90, align: 'right' },
      { field: 'hours', width: 90, align: 'right' },
      { field: 'crm_delivery_project', width: 200 },
      { field: 'approval_status', width: 110, sortable: true },
    ],
    sort: [{ field: 'start_date', order: 'desc' }],
    rowColor: {
      field: 'approval_status',
      colors: { approved: '#16a34a', pending: '#f97316', rejected: '#dc2626', submitted: '#2563eb', draft: '#94a3b8' },
    },
    pagination: { pageSize: 50 },
  },
  form: {
    type: 'simple',
    sections: [
      { name: 'basic', label: '请假信息', columns: 2, fields: [
        'leave_code', 'owner_id', { field: 'leave_type', required: true }, 'crm_delivery_project',
        { field: 'start_date', required: true }, { field: 'end_date', required: true }, 'days', 'hours', { field: 'reason', required: true, span: 'full' },
      ] },
      { name: 'approval', label: '审批', columns: 2, fields: ['approval_status', 'approved_date', { field: 'notes', span: 'full' }] },
    ],
  },
});
