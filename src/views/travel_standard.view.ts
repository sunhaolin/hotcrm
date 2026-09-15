// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineView } from '@objectstack/spec/ui';

export const TravelStandardViews = defineView({
  list: {
    type: 'grid',
    name: 'all_travel_standards',
    label: 'All Travel Standards',
    data: { provider: 'object', object: 'crm_travel_standard' },
    columns: [
      { field: 'name', width: 200, sortable: true },
      { field: 'city_tier', width: 120 },
      { field: 'lodging_per_day', width: 120, align: 'right' },
      { field: 'meal_per_day', width: 120, align: 'right' },
      { field: 'local_transport_per_day', width: 120, align: 'right' },
      { field: 'fare_per_trip', width: 120, align: 'right' },
      { field: 'is_active', width: 80 },
    ],
    sort: [{ field: 'city_tier', order: 'asc' }],
    pagination: { pageSize: 50 },
  },
});
