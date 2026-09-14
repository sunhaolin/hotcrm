// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineView } from '@objectstack/spec/ui';

export const CostPlanLineViews = defineView({
  list: {
    type: 'grid',
    name: 'all_cost_plan_lines',
    label: 'Cost Plan Lines',
    data: { provider: 'object', object: 'crm_cost_plan_line' },
    columns: [
      { field: 'crm_delivery_project', width: 220 },
      { field: 'category', width: 160, sortable: true },
      { field: 'period_month', width: 120, sortable: true },
      { field: 'description', width: 220 },
      { field: 'quantity', width: 90, align: 'right' },
      { field: 'unit_price', width: 120, align: 'right' },
      { field: 'planned_amount', width: 140, align: 'right' },
    ],
    sort: [{ field: 'period_month', order: 'asc' }],
    pagination: { pageSize: 50 },
  },
  form: {
    type: 'simple',
    sections: [
      { name: 'basic', label: 'Cost Plan Line', columns: 2, fields: [
        { field: 'crm_delivery_project', required: true }, { field: 'category', required: true }, 'period_month',
        { field: 'description', required: true }, 'quantity', 'unit_price', 'planned_amount', 'notes',
      ] },
    ],
  },
});
