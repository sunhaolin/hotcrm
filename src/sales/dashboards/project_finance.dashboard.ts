// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Dashboard } from '@objectstack/spec/ui';

/**
 * 项目财务 — round 2 (steps 37 / 38 / 40): four tiles, contract vs invoiced
 * vs collected per project, and a finance table with the two ratios.
 * Chart axis titles and table headers are the Chinese the page shows.
 */
export const ProjectFinanceDashboard: Dashboard = {
  name: 'project_finance_dashboard',
  label: 'Project Finance',
  description: 'Contract, invoicing, collections, purchases and orders across delivery projects',
  columns: 12,
  gap: 4,
  refreshIntervalSeconds: 180,
  header: { showTitle: true, showDescription: false },
  widgets: [
    {
      id: 'contract_total', title: 'Contract Amount', description: 'Sum of contract amounts',
      type: 'metric', colorVariant: 'blue',
      dataset: 'project_finance_metrics', values: ['contract_total'],
      layout: { x: 0, y: 0, w: 3, h: 1 },
    },
    {
      id: 'invoiced_total', title: 'Invoiced', description: 'Invoices issued, void excluded',
      type: 'metric', colorVariant: 'orange',
      dataset: 'project_finance_metrics', values: ['invoiced_total'],
      layout: { x: 3, y: 0, w: 3, h: 1 },
    },
    {
      id: 'collected_total', title: 'Collected', description: 'Money received',
      type: 'metric', colorVariant: 'success',
      dataset: 'project_finance_metrics', values: ['collected_total'],
      layout: { x: 6, y: 0, w: 3, h: 1 },
    },
    {
      id: 'purchase_total', title: 'Purchase Contracts', description: 'Subcontract and procurement contracts, terminated excluded',
      type: 'metric', colorVariant: 'default',
      dataset: 'project_finance_metrics', values: ['purchase_total'],
      layout: { x: 9, y: 0, w: 3, h: 1 },
    },
    {
      id: 'finance_by_project', title: 'Contract vs Invoiced vs Collected', description: 'Per delivery project',
      type: 'bar', colorVariant: 'blue',
      dataset: 'project_finance_metrics', dimensions: ['project'], values: ['contract_total', 'invoiced_total', 'collected_total'],
      layout: { x: 0, y: 2, w: 12, h: 5 },
      // No `type` / `xAxis` / `yAxis` here: since @objectstack/spec 17.5.0 a
      // dataset-bound widget's `chartConfig` refuses them (ADR-0021 · ADR-0049
      // D2) — the widget's `type`, `dimensions` and `values` above are the
      // binding, and the dataset's own column labels title the axes.
      chartConfig: {
        showLegend: true, showDataLabels: true,
        colors: ['#4169E1', '#F97316', '#10B981'],
      },
    },
    {
      id: 'finance_table', title: 'Project Finance Table', description: 'Contract, invoiced, collected, purchases, orders and the two ratios',
      type: 'table', colorVariant: 'default',
      dataset: 'project_finance_metrics', dimensions: ['project'],
      values: ['contract_total', 'invoiced_total', 'collected_total', 'invoice_ratio', 'collection_ratio', 'purchase_total', 'order_total', 'avg_progress'],
      layout: { x: 0, y: 7, w: 12, h: 4 },
      options: {
        sortBy: 'contract_total', sortOrder: 'desc', limit: 10,
      },
    },
  ],
};
