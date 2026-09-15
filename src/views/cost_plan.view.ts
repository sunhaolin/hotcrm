// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineView } from '@objectstack/spec/ui';

// List only: the record layout is derived from the object's fieldGroups, and the
// four line objects and the month ledger render as related lists on the plan.
export const CostPlanViews = defineView({
  list: {
    type: 'grid',
    name: 'all_cost_plans',
    label: 'All Cost Plans',
    data: { provider: 'object', object: 'crm_cost_plan' },
    columns: [
      { field: 'plan_number', width: 110, sortable: true },
      { field: 'name', width: 240, sortable: true },
      { field: 'phase', width: 110 },
      { field: 'version_no', width: 80, align: 'right' },
      { field: 'is_current', width: 90 },
      { field: 'baseline_total', width: 140, align: 'right' },
      { field: 'planned_total', width: 140, align: 'right' },
      { field: 'approval_status', width: 110, sortable: true },
    ],
    sort: [{ field: 'plan_number', order: 'desc' }],
    pagination: { pageSize: 25 },
  },
});
