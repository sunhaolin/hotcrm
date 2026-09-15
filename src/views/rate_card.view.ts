// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineView } from '@objectstack/spec/ui';

export const RateCardViews = defineView({
  list: {
    type: 'grid',
    name: 'all_rate_cards',
    label: '全部费率卡',
    data: { provider: 'object', object: 'crm_rate_card' },
    columns: [
      { field: 'name', width: 180, sortable: true },
      { field: 'grade_code', width: 110 },
      { field: 'hourly_rate', width: 120, align: 'right' },
      { field: 'daily_rate', width: 120, align: 'right' },
      { field: 'effective_from', width: 120 },
      { field: 'effective_to', width: 120 },
      { field: 'is_active', width: 90 },
    ],
    sort: [{ field: 'hourly_rate', order: 'desc' }],
    pagination: { pageSize: 50 },
  },
  form: {
    type: 'simple',
    sections: [
      { name: 'basic', label: '费率卡', columns: 2, fields: [
        { field: 'name', required: true }, 'grade_code', { field: 'hourly_rate', required: true }, 'daily_rate',
        'effective_from', 'effective_to', 'is_active', { field: 'notes', span: 'full' },
      ] },
    ],
  },
});
