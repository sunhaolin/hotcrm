// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineView } from '@objectstack/spec/ui';

export const PurchaseContractViews = defineView({
  list: {
    type: 'grid',
    name: 'all_purchase_contracts',
    label: '全部采购合同',
    data: { provider: 'object', object: 'crm_purchase_contract' },
    columns: [
      { field: 'contract_code', width: 110, sortable: true },
      { field: 'name', width: 240 },
      { field: 'crm_delivery_project', width: 220 },
      { field: 'vendor_name', width: 180 },
      { field: 'category', width: 110 },
      { field: 'amount', width: 130, align: 'right' },
      { field: 'paid_amount', width: 130, align: 'right' },
      { field: 'unpaid_amount', width: 130, align: 'right' },
      { field: 'status', width: 100, sortable: true },
    ],
    sort: [{ field: 'signed_date', order: 'desc' }],
    rowColor: {
      field: 'status',
      colors: { active: '#16a34a', completed: '#2563eb', terminated: '#9ca3af', draft: '#94a3b8' },
    },
    pagination: { pageSize: 50 },
  },
  form: {
    type: 'simple',
    sections: [
      { name: 'basic', label: '合同信息', columns: 2, fields: [
        'contract_code', { field: 'name', required: true }, { field: 'crm_delivery_project', required: true }, { field: 'vendor_name', required: true },
        'category', { field: 'amount', required: true }, 'signed_date', 'start_date', 'end_date', 'status', 'owner_id',
        { field: 'description', span: 'full' },
      ] },
      { name: 'payment', label: '付款情况', columns: 2, fields: ['paid_amount', 'unpaid_amount'] },
    ],
  },
});
