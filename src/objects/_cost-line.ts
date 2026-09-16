// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Field } from '@objectstack/spec/data';
import { F } from '@objectstack/spec';

/**
 * The part of a cost-plan line every category shares (steps 28–31): the plan
 * it belongs to, a description, the month range the system decomposes it
 * over, and the planned amount. Everything that differs by category (rate
 * card, unit price, headcount, quantity, travel standard …) is declared on
 * the line object itself.
 *
 * 计划金额 is ONE number in both phases, read off two stored columns (a
 * formula is virtual — no column — so a parent summary cannot read it):
 * `estimate_amount` is a Bizcase line's whole-range figure, written from the
 * line's factors by `cost_line_estimate` and empty on a delivery line, since
 * a Bizcase has no month rows (2026-09-16, 「不需要在月度分解行中生成数据」);
 * `allocated_amount` is the sum of the line's month rows, which only a
 * delivery line has, so a delivery line and its split cannot drift apart.
 * Exactly one of the pair is non-zero on any line, and the plan's own totals
 * roll the same pair up (`*_line_total` / `*_month_total` on `crm_cost_plan`).
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
  estimate_amount: Field.currency({ label: '估算金额', scale: 2, group: 'basic', hidden: true, readonly: true }),
  allocated_amount: Field.summary({
    label: '已分解金额',
    group: 'basic',
    hidden: true,
    scale: 2,
    summaryOperations: { object: 'crm_cost_plan_month', field: 'amount', function: 'sum', relationshipField: lineObject },
  }),
  planned_amount: Field.formula({
    label: '计划金额',
    group: 'basic',
    description: 'Bizcase 明细行为按系数算出的整段估算；交付明细行为本行各月度分解行金额之和。不能手填。',
    expression: F`coalesce(record.estimate_amount, 0) + coalesce(record.allocated_amount, 0)`,
    scale: 2,
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
