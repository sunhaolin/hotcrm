// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineView } from '@objectstack/spec/ui';

export const BusinessTripViews = defineView({
  list: {
    type: 'grid',
    name: 'all_business_trips',
    label: '全部出差申请',
    data: { provider: 'object', object: 'crm_business_trip' },
    columns: [
      { field: 'trip_code', width: 110, sortable: true },
      { field: 'subject', width: 220 },
      { field: 'owner_id', width: 110 },
      { field: 'destination', width: 120 },
      { field: 'start_date', width: 110, sortable: true },
      { field: 'end_date', width: 110 },
      { field: 'days', width: 80, align: 'right' },
      { field: 'crm_delivery_project', width: 200 },
      { field: 'estimated_cost', width: 120, align: 'right' },
      { field: 'actual_cost', width: 120, align: 'right' },
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
      { name: 'basic', label: '出差信息', columns: 2, fields: [
        'trip_code', { field: 'subject', required: true }, 'owner_id', 'crm_delivery_project', 'crm_presales_project', { field: 'destination', required: true },
        { field: 'start_date', required: true }, { field: 'end_date', required: true }, 'days', 'transport', { field: 'purpose', required: true, span: 'full' },
      ] },
      { name: 'cost', label: '费用', columns: 2, fields: ['estimated_cost', 'actual_cost'] },
      { name: 'approval', label: '审批', columns: 2, fields: ['approval_status', 'approved_date', { field: 'notes', span: 'full' }] },
    ],
  },
});
