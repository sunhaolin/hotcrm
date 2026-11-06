// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineView } from '@objectstack/spec/ui';

export const PresalesProjectViews = defineView({
  list: {
    type: 'grid',
    userActions: { editInline: true },
    name: 'all_presales_projects',
    label: 'All Presales Projects',
    data: { provider: 'object', object: 'crm_presales_project' },
    columns: [
      { field: 'project_number', width: 120, sortable: true },
      { field: 'name', width: 240, sortable: true },
      { field: 'crm_opportunity', width: 200 },
      { field: 'crm_account', width: 180 },
      { field: 'quote_amount', width: 140, align: 'right' },
      { field: 'gross_margin_pct', width: 120, align: 'right' },
      { field: 'approval_status', width: 120, sortable: true },
      { field: 'owner_id', width: 140 },
    ],
    sort: [{ field: 'project_number', order: 'desc' }],
    rowColor: {
      field: 'approval_status',
      colors: { approved: 'green', pending: 'orange', rejected: 'red', submitted: 'blue', draft: 'gray' },
    },
    pagination: { pageSize: 25 },
  },
  form: {
    type: 'simple',
    sections: [
      { name: 'basic', label: 'Project Information', columns: 2, fields: [
        'project_number', { field: 'name', required: true }, 'alias', { field: 'crm_opportunity', required: true }, 'crm_account',
        'project_type', 'business_category', 'planned_start', 'planned_end', 'expected_contract_amount', 'owner_id',
      ] },
      { name: 'project_team', label: 'Project Team', columns: 2, fields: ['account_manager', 'project_manager', 'project_director', 'project_qa', 'pricing_manager'] },
      { name: 'cost_estimate', label: 'Cost Estimate & Quote', columns: 2, fields: ['labor_cost', 'third_party_service_cost', 'procurement_cost', 'project_expense', 'total_cost', 'quote_amount', 'gross_margin_pct', 'presales_hours', 'presales_labor_actual'] },
      { name: 'security', label: 'Information Security', columns: 2, fields: ['security_class', 'security_note'] },
      { name: 'approval', label: 'Approval', columns: 2, fields: ['approval_status', 'approved_date'] },
      { name: 'notes', label: 'Background', columns: 1, fields: ['description'] },
    ],
  },
});
