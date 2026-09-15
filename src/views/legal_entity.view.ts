// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineView } from '@objectstack/spec/ui';

export const LegalEntityViews = defineView({
  list: {
    type: 'grid',
    name: 'all_legal_entities',
    label: 'All Contracting Entities',
    data: { provider: 'object', object: 'crm_legal_entity' },
    columns: [
      { field: 'name', width: 260, sortable: true },
      { field: 'short_name', width: 120 },
      { field: 'registration_number', width: 200 },
      { field: 'legal_representative', width: 120 },
      { field: 'is_active', width: 90 },
    ],
    sort: [{ field: 'name', order: 'asc' }],
    pagination: { pageSize: 50 },
  },
  form: {
    type: 'simple',
    sections: [
      { name: 'basic', label: '主体信息', columns: 2, fields: [
        { field: 'name', required: true, span: 'full' }, 'short_name', 'registration_number', 'legal_representative', 'is_active', { field: 'address', span: 'full' },
      ] },
      { name: 'bank', label: '银行信息', columns: 2, fields: ['bank_name', 'bank_account', { field: 'notes', span: 'full' }] },
    ],
  },
});
