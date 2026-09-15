// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineView } from '@objectstack/spec/ui';

export const CollectionViews = defineView({
  list: {
    type: 'grid',
    name: 'all_collections',
    label: 'All Collections',
    data: { provider: 'object', object: 'crm_collection' },
    columns: [
      { field: 'collection_code', width: 110, sortable: true },
      { field: 'crm_delivery_project', width: 220 },
      { field: 'crm_invoice', width: 120 },
      { field: 'crm_account', width: 180 },
      { field: 'received_date', width: 120, sortable: true },
      { field: 'amount', width: 130, align: 'right' },
      { field: 'method', width: 110 },
      { field: 'bank_reference', width: 160 },
    ],
    sort: [{ field: 'received_date', order: 'desc' }],
    pagination: { pageSize: 50 },
  },
  form: {
    type: 'simple',
    sections: [
      { name: 'basic', label: '收款信息', columns: 2, fields: [
        'collection_code', { field: 'crm_delivery_project', required: true }, 'crm_invoice', 'crm_account',
        { field: 'received_date', required: true }, { field: 'amount', required: true }, 'method', 'bank_reference', 'owner_id',
        { field: 'description', span: 'full' },
      ] },
    ],
  },
});
