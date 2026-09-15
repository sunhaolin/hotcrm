// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineView } from '@objectstack/spec/ui';

export const InvoiceViews = defineView({
  list: {
    type: 'grid',
    name: 'all_invoices',
    label: '全部开票',
    data: { provider: 'object', object: 'crm_invoice' },
    columns: [
      { field: 'invoice_code', width: 110, sortable: true },
      { field: 'crm_delivery_project', width: 220 },
      { field: 'crm_account', width: 180 },
      { field: 'invoice_number', width: 140 },
      { field: 'invoice_date', width: 120, sortable: true },
      { field: 'amount', width: 130, align: 'right' },
      { field: 'collected_amount', width: 130, align: 'right' },
      { field: 'outstanding_amount', width: 130, align: 'right' },
      { field: 'status', width: 100, sortable: true },
    ],
    sort: [{ field: 'invoice_date', order: 'desc' }],
    rowColor: {
      field: 'status',
      colors: { paid: '#16a34a', sent: '#f97316', issued: '#2563eb', draft: '#94a3b8', void: '#9ca3af' },
    },
    pagination: { pageSize: 50 },
  },
  form: {
    type: 'simple',
    sections: [
      { name: 'basic', label: '开票信息', columns: 2, fields: [
        'invoice_code', { field: 'crm_delivery_project', required: true }, 'crm_contract', 'crm_account',
        'invoice_type', 'invoice_number', { field: 'invoice_date', required: true }, { field: 'amount', required: true },
        'tax_rate', 'due_date', 'status', 'owner_id', { field: 'description', span: 'full' },
      ] },
      { name: 'settlement', label: '收款情况', columns: 2, fields: ['collected_amount', 'outstanding_amount'] },
    ],
  },
});
