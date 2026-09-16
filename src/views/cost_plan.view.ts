// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineView } from '@objectstack/spec/ui';

// List only: the record layout is derived from the object's fieldGroups, and the
// four line objects and the month ledger render as related lists on the plan.
export const CostPlanViews = defineView({
  list: {
    type: 'grid',
    name: 'all_cost_plans',
    label: 'All Cost Plans',
    data: { provider: 'object', object: 'crm_cost_plan' },
    columns: [
      { field: 'plan_number', width: 110, sortable: true },
      { field: 'name', width: 240, sortable: true },
      { field: 'phase', width: 110 },
      { field: 'version_no', width: 80, align: 'right' },
      { field: 'is_current', width: 90 },
      { field: 'baseline_total', width: 140, align: 'right' },
      { field: 'planned_total', width: 140, align: 'right' },
      { field: 'delta_planned_total', width: 140, align: 'right' },
      { field: 'approval_status', width: 110, sortable: true },
    ],
    sort: [{ field: 'plan_number', order: 'desc' }],
    pagination: { pageSize: 25 },
  },

  listViews: {
    /**
     * The approver's queue. A cost plan approval is a decision about a
     * DIFFERENCE — 「本次审批数据和当前执行的成本计划记录的所有金额的对比和差异」
     * — so this view puts every amount's delta against the version in force on
     * the row, ahead of the plan's own totals. The record page carries the same
     * comparison in full (the object's `comparison` group); this is the list
     * that lets one approver rank a queue of them without opening each.
     *
     * `submitted` and `pending` are the two in-flight states the one-tier flow
     * (`cost_plan_approval`) passes through — `submitted` is the stamp the
     * 发起审批 button writes, `pending` the one the approval node sets while it
     * waits on a decision — so a plan is on this queue for exactly as long as
     * somebody owes it an answer.
     */
    pending_cost_plan_approvals: {
      name: 'pending_cost_plan_approvals',
      type: 'grid',
      label: 'Cost Plans Awaiting Approval',
      data: { provider: 'object', object: 'crm_cost_plan' },
      columns: [
        { field: 'plan_number', width: 110, sortable: true },
        { field: 'name', width: 220, sortable: true },
        { field: 'version_no', width: 80, align: 'right' },
        { field: 'compare_plan', width: 200 },
        { field: 'planned_total', width: 140, align: 'right' },
        { field: 'current_planned_total', width: 140, align: 'right' },
        { field: 'delta_planned_total', width: 140, align: 'right' },
        { field: 'delta_planned_pct', width: 110, align: 'right' },
        { field: 'delta_baseline_total', width: 130, align: 'right' },
        { field: 'delta_labor_total', width: 130, align: 'right' },
        { field: 'delta_service_total', width: 130, align: 'right' },
        { field: 'delta_procurement_total', width: 130, align: 'right' },
        { field: 'delta_expense_total', width: 130, align: 'right' },
        { field: 'delta_travel_total', width: 120, align: 'right' },
        { field: 'approval_status', width: 110, sortable: true },
      ],
      filter: [{ field: 'approval_status', operator: 'in', value: ['submitted', 'pending'] }],
      sort: [{ field: 'plan_number', order: 'desc' }],
      pagination: { pageSize: 25 },
    },
  },
});
