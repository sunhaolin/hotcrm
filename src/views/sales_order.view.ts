// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineView } from '@objectstack/spec/ui';

export const SalesOrderViews = defineView({
  list: {
    type: 'grid',
    name: 'all_sales_orders',
    label: 'All Sales Orders',
    data: { provider: 'object', object: 'crm_sales_order' },
    columns: [
      { field: 'order_code', width: 110, sortable: true },
      { field: 'name', width: 240 },
      { field: 'crm_delivery_project', width: 220 },
      { field: 'crm_account', width: 180 },
      { field: 'order_date', width: 120, sortable: true },
      { field: 'amount', width: 130, align: 'right' },
      { field: 'delivery_status', width: 110, sortable: true },
      { field: 'acceptance_date', width: 120 },
    ],
    sort: [{ field: 'order_date', order: 'desc' }],
    rowColor: {
      field: 'delivery_status',
      colors: { accepted: '#16a34a', delivered: '#f97316', in_progress: '#2563eb', pending: '#94a3b8' },
    },
    pagination: { pageSize: 50 },
  },
  form: {
    type: 'simple',
    sections: [
      { name: 'basic', label: '订单信息', columns: 2, fields: [
        'order_code', { field: 'name', required: true }, { field: 'crm_delivery_project', required: true }, 'crm_contract', 'crm_account',
        'order_date', { field: 'amount', required: true }, 'delivery_status', 'acceptance_date', 'owner_id', { field: 'description', span: 'full' },
      ] },
    ],
  },
});
