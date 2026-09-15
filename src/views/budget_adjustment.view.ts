// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineView } from '@objectstack/spec/ui';

export const BudgetAdjustmentViews = defineView({
  list: {
    type: 'grid',
    name: 'all_budget_adjustments',
    label: '全部预算调整',
    data: { provider: 'object', object: 'crm_budget_adjustment' },
    columns: [
      { field: 'adjustment_number', width: 110, sortable: true },
      { field: 'crm_delivery_project', width: 240 },
      { field: 'amount', width: 130, align: 'right' },
      { field: 'reason', width: 120 },
      { field: 'owner_id', width: 120 },
      { field: 'approval_status', width: 110, sortable: true },
      { field: 'approved_date', width: 160 },
    ],
    sort: [{ field: 'created_at', order: 'desc' }],
    rowColor: {
      field: 'approval_status',
      colors: { approved: '#16a34a', pending: '#f97316', rejected: '#dc2626', submitted: '#2563eb', draft: '#94a3b8' },
    },
    pagination: { pageSize: 50 },
  },
  form: {
    type: 'simple',
    sections: [
      { name: 'basic', label: '调整申请', columns: 2, fields: [
        'adjustment_number', { field: 'crm_delivery_project', required: true }, { field: 'amount', required: true }, { field: 'reason', required: true },
        'owner_id', { field: 'analysis', required: true, span: 'full' }, { field: 'notes', span: 'full' },
      ] },
      { name: 'approval', label: '审批', columns: 2, fields: ['approval_status', 'approved_date'] },
    ],
  },
});
