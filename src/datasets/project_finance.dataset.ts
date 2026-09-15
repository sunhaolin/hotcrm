// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineDataset } from '@objectstack/spec/ui';

/**
 * 项目财务指标 — round 2 (steps 37 / 38 / 40): contract, invoicing,
 * collections, purchases and orders per delivery project. Every measure reads
 * a STORED or ROLLUP column — the analytics SQL cannot read formula columns
 * (measured on the project-cost dataset), so ratios are derived here.
 */
export const ProjectFinanceDataset = defineDataset({
  name: 'project_finance_metrics',
  label: 'Project Finance Metrics',
  description: 'Contract amount, invoiced, collected, purchases and orders per delivery project',
  object: 'crm_delivery_project',
  include: ['crm_presales_project', 'crm_account', 'crm_contract'],
  dimensions: [
    { name: 'project', label: 'Project', field: 'name', type: 'string' },
    { name: 'status', label: 'Status', field: 'status', type: 'string' },
    { name: 'department', label: 'Department', field: 'department', type: 'string' },
    { name: 'account', label: 'Account', field: 'crm_account.name', type: 'string' },
    { name: 'planned_end', label: 'Planned End', field: 'planned_end', type: 'date', dateGranularity: 'month' },
  ],
  measures: [
    { name: 'project_count', label: 'Projects', aggregate: 'count' },
    { name: 'contract_total', label: 'Contract Amount', aggregate: 'sum', field: 'contract_amount', format: '0,0' },
    { name: 'invoiced_total', label: 'Invoiced', aggregate: 'sum', field: 'invoiced_total', format: '0,0' },
    { name: 'collected_total', label: 'Collected', aggregate: 'sum', field: 'collected_total', format: '0,0' },
    { name: 'purchase_total', label: 'Purchase Contracts', aggregate: 'sum', field: 'purchase_total', format: '0,0' },
    { name: 'order_total', label: 'Sales Orders', aggregate: 'sum', field: 'order_total', format: '0,0' },
    { name: 'labor_total', label: 'Labor Actual', aggregate: 'sum', field: 'labor_actual', format: '0,0' },
    { name: 'travel_total', label: 'Travel Actual', aggregate: 'sum', field: 'travel_actual', format: '0,0' },
    { name: 'avg_progress', label: 'Average Progress', aggregate: 'avg', field: 'progress_pct', format: '0' },
    { name: 'invoice_ratio', label: 'Invoiced / Contract', derived: { op: 'ratio', of: ['invoiced_total', 'contract_total'] }, format: '0%' },
    { name: 'collection_ratio', label: 'Collected / Invoiced', derived: { op: 'ratio', of: ['collected_total', 'invoiced_total'] }, format: '0%' },
  ],
});
