// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineView } from '@objectstack/spec/ui';

export const DeliveryProjectViews = defineView({
  list: {
    type: 'grid',
    name: 'all_delivery_projects',
    label: 'Delivery Projects',
    data: { provider: 'object', object: 'crm_delivery_project' },
    columns: [
      { field: 'project_number', width: 120, sortable: true },
      { field: 'name', width: 240, sortable: true },
      { field: 'crm_presales_project', width: 200 },
      { field: 'status', width: 110, sortable: true },
      { field: 'budget_baseline', width: 140, align: 'right' },
      { field: 'actual_cost', width: 140, align: 'right' },
      { field: 'budget_burn_pct', width: 120, align: 'right' },
      { field: 'approval_status', width: 120, sortable: true },
    ],
    sort: [{ field: 'project_number', order: 'desc' }],
    rowColor: {
      field: 'status',
      colors: { active: '#16a34a', planning: '#2563eb', closed: '#94a3b8' },
    },
    pagination: { pageSize: 25 },
  },
  listViews: {
    // Round 2 (step 37): the all-dimension query the customer asked for —
    // progress, budget, cost, revenue, invoicing and collections in one grid.
    project_overview: {
      type: 'grid',
      name: 'project_overview',
      label: '项目综合查询',
      data: { provider: 'object', object: 'crm_delivery_project' },
      columns: [
        { field: 'project_number', width: 110, sortable: true },
        { field: 'name', width: 220, sortable: true },
        { field: 'status', width: 100, sortable: true },
        { field: 'progress_pct', width: 90, align: 'right' },
        { field: 'budget_current', width: 130, align: 'right' },
        { field: 'actual_cost', width: 130, align: 'right' },
        { field: 'budget_burn_pct', width: 110, align: 'right' },
        { field: 'contract_amount', width: 130, align: 'right' },
        { field: 'revenue_recognized', width: 130, align: 'right' },
        { field: 'invoiced_total', width: 130, align: 'right' },
        { field: 'collected_total', width: 130, align: 'right' },
        { field: 'receivable_balance', width: 130, align: 'right' },
        { field: 'project_margin_pct', width: 110, align: 'right' },
      ],
      sort: [{ field: 'project_number', order: 'desc' }],
      pagination: { pageSize: 25 },
    },
  },
  form: {
    type: 'simple',
    sections: [
      { name: 'basic', label: 'Project Information', columns: 2, fields: [
        'project_number', { field: 'name', required: true }, 'alias', { field: 'crm_presales_project', required: true }, 'crm_opportunity', 'crm_account',
        'project_type', 'business_category', 'planned_start', 'planned_end', 'status', 'owner_id',
      ] },
      { name: 'org', label: 'Cost Centre & Department', columns: 3, fields: ['impl_cost_center', 'accounting_cost_center', 'department'] },
      { name: 'roles', label: 'Project Roles', columns: 2, fields: ['project_manager', 'project_director', 'pricing_owner', 'subcontract_ts_owner', 'qa_lead'] },
      { name: 'budget', label: 'Budget & Actuals', columns: 2, fields: ['budget_baseline', 'budget_adjustment_total', 'budget_current', 'planned_total', 'labor_actual', 'travel_actual', 'actual_cost', 'budget_burn_pct', 'budget_variance'] },
      { name: 'finance', label: 'Contract & Finance', columns: 2, fields: ['crm_contract', 'contract_amount', 'progress_pct', 'revenue_recognized', 'invoiced_total', 'collected_total', 'receivable_balance', 'purchase_total', 'order_total', 'project_margin_pct'] },
      { name: 'security', label: 'Information Security', columns: 2, fields: ['security_class', 'security_note'] },
      { name: 'approval', label: 'Approval', columns: 2, fields: ['approval_status', 'approved_date'] },
    ],
  },
});
