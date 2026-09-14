// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Dashboard } from '@objectstack/spec/ui';

/**
 * 项目成本 — steps 37–39 in one page (epic #2 / T8): three tiles, budget vs
 * actual per project, and a burn table. Widget titles stay English in every
 * locale (AGENTS.md doc rule 6).
 */
export const ProjectCostDashboard: Dashboard = {
  name: 'project_cost_dashboard',
  label: 'Project Cost',
  description: 'Budget baseline vs planned vs actual cost across delivery projects',
  columns: 12,
  gap: 4,
  refreshIntervalSeconds: 180,
  header: { showTitle: true, showDescription: false },
  widgets: [
    {
      id: 'total_budget', title: 'Total Budget', description: 'Sum of approved budget baselines',
      type: 'metric', colorVariant: 'blue',
      dataset: 'project_cost_metrics', values: ['baseline_total'],
      layout: { x: 0, y: 0, w: 3, h: 2 }, options: { icon: 'Wallet', format: '0,0' },
    },
    {
      id: 'total_labor_actual', title: 'Labor Actual', description: 'Approved timesheet cost',
      type: 'metric', colorVariant: 'success',
      dataset: 'project_cost_metrics', values: ['labor_total'],
      layout: { x: 3, y: 0, w: 3, h: 2 }, options: { icon: 'Clock', format: '0,0' },
    },
    {
      id: 'total_travel_actual', title: 'Travel Actual', description: 'Travel cost booked to projects',
      type: 'metric', colorVariant: 'default',
      dataset: 'project_cost_metrics', values: ['travel_total'],
      layout: { x: 6, y: 0, w: 3, h: 2 }, options: { icon: 'Plane', format: '0,0' },
    },
    {
      id: 'active_projects', title: 'Active Projects', description: 'Delivery projects currently in flight',
      type: 'metric', colorVariant: 'orange',
      dataset: 'project_cost_metrics', values: ['active_count'],
      layout: { x: 9, y: 0, w: 3, h: 2 }, options: { icon: 'AlertTriangle', format: '0' },
    },
    {
      id: 'plan_vs_actual_by_project', title: 'Budget vs Actual by Project', description: 'Baseline, planned and labor actual per delivery project',
      type: 'bar', colorVariant: 'blue',
      dataset: 'project_cost_metrics', dimensions: ['project'], values: ['baseline_total', 'planned_total', 'labor_total'],
      layout: { x: 0, y: 2, w: 12, h: 5 },
      chartConfig: {
        type: 'bar', showLegend: true, showDataLabels: true,
        colors: ['#4169E1', '#10B981', '#F97316'],
        xAxis: { field: 'project', title: '项目', showGridLines: false, logarithmic: false },
        yAxis: [
          { field: 'baseline_total', title: '预算基线', showGridLines: true, logarithmic: false },
          { field: 'planned_total', title: '计划总额', showGridLines: true, logarithmic: false },
          { field: 'labor_total', title: '人工实际', showGridLines: true, logarithmic: false },
        ],
      },
    },
    {
      id: 'burn_by_project', title: 'Budget Burn by Project', description: 'Baseline, actuals and burn % per project',
      type: 'table', colorVariant: 'default',
      dataset: 'project_cost_metrics', dimensions: ['project'], values: ['baseline_total', 'labor_total', 'travel_total', 'burn_ratio'],
      layout: { x: 0, y: 7, w: 12, h: 4 },
      options: {
        columns: [
          { header: '项目', accessorKey: 'project' },
          { header: '预算基线', accessorKey: 'baseline_total', format: '0,0' },
          { header: '人工实际', accessorKey: 'labor_total', format: '0,0' },
          { header: '差旅实际', accessorKey: 'travel_total', format: '0,0' },
          { header: '人工消耗率', accessorKey: 'burn_ratio', format: '0%' },
        ],
        sortBy: 'burn_ratio', sortOrder: 'desc', limit: 10,
      },
    },
  ],
};
