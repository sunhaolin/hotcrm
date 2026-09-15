// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineView } from '@objectstack/spec/ui';

export const TravelCostViews = defineView({
  list: {
    type: 'grid',
    name: 'all_travel_costs',
    label: 'All Travel Costs',
    data: { provider: 'object', object: 'crm_travel_cost' },
    columns: [
      { field: 'travel_number', width: 110, sortable: true },
      { field: 'crm_delivery_project', width: 220 },
      { field: 'crm_business_trip', width: 200 },
      { field: 'owner_id', width: 140 },
      { field: 'expense_date', width: 120, sortable: true },
      { field: 'amount', width: 130, align: 'right' },
      { field: 'receipt_number', width: 140 },
      { field: 'description', width: 220 },
    ],
    sort: [{ field: 'expense_date', order: 'desc' }],
    pagination: { pageSize: 50 },
  },
  form: {
    type: 'simple',
    sections: [
      { name: 'basic', label: 'Travel Cost', columns: 2, fields: [
        'travel_number', 'crm_business_trip', { field: 'crm_delivery_project', required: true }, 'owner_id', 'expense_date', { field: 'amount', required: true }, 'receipt_number', 'description',
      ] },
    ],
  },
});
