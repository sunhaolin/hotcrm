// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Field } from '@objectstack/spec/data';

/**
 * The part of a cost-plan line every category shares (steps 28–31): the plan
 * it belongs to, a description, the month range the system decomposes it
 * over, and the planned amount — a rollup of that line's month rows, so the
 * line total and the monthly split cannot drift apart. Everything that
 * differs by category (rate card, unit price, headcount, quantity, travel
 * standard …) is declared on the line object itself.
 */
export const COST_LINE_MONTH_LOOKUPS = {
  labor: 'crm_labor_cost_line',
  third_party_service: 'crm_service_cost_line',
  procurement: 'crm_procurement_cost_line',
  expense: 'crm_expense_cost_line',
} as const;

export const costLineFields = (lineObject: string) => ({
  crm_cost_plan: Field.masterDetail('crm_cost_plan', { label: '成本计划', group: 'basic', required: true, storage: { notNull: true }, deleteBehavior: 'cascade' }),
  description: Field.text({ label: '说明', required: true, storage: { notNull: true }, group: 'basic' }),
  start_month: Field.date({ label: '起始月份', required: true, storage: { notNull: true }, group: 'basic', description: '分解的第一个月；按当月 1 日记。' }),
  end_month: Field.date({ label: '结束月份', group: 'basic', description: '分解的最后一个月；留空表示只落在起始月份。' }),
  planned_amount: Field.summary({
    label: '计划金额',
    group: 'basic',
    scale: 2,
    summaryOperations: { object: 'crm_cost_plan_month', field: 'amount', function: 'sum', relationshipField: lineObject },
  }),
  notes: Field.textarea({ label: '备注', group: 'basic' }),
});

export const costLineShape = (label: string, icon: string) => ({
  label,
  pluralLabel: label,
  icon,
  sharingModel: 'controlled_by_parent' as const,
  nameField: 'description',
  fieldGroups: [{ key: 'basic', label, icon }],
  indexes: [{ fields: ['crm_cost_plan'] }],
  enable: { apiEnabled: true, apiMethods: ['get', 'list', 'create', 'update', 'delete'] as Array<'get' | 'list' | 'create' | 'update' | 'delete'> },
});
