// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineDataset } from '@objectstack/spec/ui';

/** Semantic layer for the demo's 项目成本 dashboard — budget vs actual per delivery project (epic #2 / T8). */
export const ProjectCostDataset = defineDataset({
  name: 'project_cost_metrics',
  label: 'Project Cost Metrics',
  description: 'Budget baseline, planned and actual cost per delivery project',
  object: 'crm_delivery_project',
  include: ['crm_presales_project', 'crm_account'],
  dimensions: [
    { name: 'project', label: 'Project', field: 'name', type: 'string' },
    { name: 'status', label: 'Status', field: 'status', type: 'string' },
    { name: 'impl_cost_center', label: 'Implementation Cost Centre', field: 'impl_cost_center', type: 'string' },
    { name: 'department', label: 'Department', field: 'department', type: 'string' },
    { name: 'account', label: 'Account', field: 'crm_account.name', type: 'string' },
    { name: 'planned_end', label: 'Planned End', field: 'planned_end', type: 'date', dateGranularity: 'month' },
  ],
  measures: [
    { name: 'project_count', label: 'Projects', aggregate: 'count' },
    { name: 'baseline_total', label: 'Budget Baseline', aggregate: 'sum', field: 'budget_baseline', format: '0,0' },
    { name: 'planned_total', label: 'Planned Total', aggregate: 'sum', field: 'planned_total', format: '0,0' },
    { name: 'labor_total', label: 'Labor Actual', aggregate: 'sum', field: 'labor_actual', format: '0,0' },
    { name: 'travel_total', label: 'Travel Actual', aggregate: 'sum', field: 'travel_actual', format: '0,0' },
    { name: 'active_count', label: 'Active Projects', aggregate: 'count', filter: { status: 'active' } },
    // Formula columns are not queryable by the analytics SQL (measured: 500),
    // so burn is a ratio of the two rollup sums — the same shape as win_rate.
    { name: 'burn_ratio', label: 'Budget Burn', derived: { op: 'ratio', of: ['labor_total', 'baseline_total'] }, format: '0%' },
  ],
});
