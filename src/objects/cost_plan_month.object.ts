// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { P } from '@objectstack/spec';
import { COST_CATEGORY_OPTIONS, EXPENSE_TYPE_OPTIONS } from './_psa-picklists';

/**
 * 月度分解行 — the one ledger every cost-plan total and report reads (steps
 * 28–31, 39). `cost_line_decompose` writes one row per line per month;
 * `cost_plan_month_fill` normalises the month, copies the category and the
 * expense type down, and derives the unique 分解键.
 *
 * `Field.lookup` takes exactly one target, so the row points back to its
 * line the way `crm_task.related_to_*` does: `category` names the line
 * object and one lookup per object is paired to it by `requiredWhen`.
 *
 * `allocation_key` is `unique: true` on the FIELD, the tenant-scoped form
 * (`crm_account.name` records why the `indexes[]` form is not used).
 */
const cat = (value: string) => P`has(record.category) && record.category == ${value}`;

export const CostPlanMonth = ObjectSchema.create({
  name: 'crm_cost_plan_month',
  label: '月度分解行',
  pluralLabel: '月度分解行',
  icon: 'calendar',
  description: 'One planned amount of one cost line in one month; the ledger every plan total, project rollup and report reads',
  sharingModel: 'controlled_by_parent',
  nameField: 'description',
  highlightFields: ['category', 'period_month', 'amount', 'is_manual'],
  fieldGroups: [
    { key: 'basic', label: '月度分解行', icon: 'calendar' },
  ],
  fields: {
    crm_cost_plan: Field.masterDetail('crm_cost_plan', { label: '成本计划', group: 'basic', required: true, storage: { notNull: true }, deleteBehavior: 'cascade' }),
    category: Field.select({ label: '成本类别', required: true, storage: { notNull: true }, group: 'basic', options: [...COST_CATEGORY_OPTIONS] }),
    crm_labor_cost_line: Field.lookup('crm_labor_cost_line', { label: '人工服务成本行', group: 'basic', requiredWhen: cat('labor') }),
    crm_service_cost_line: Field.lookup('crm_service_cost_line', { label: '第三方服务成本行', group: 'basic', requiredWhen: cat('third_party_service') }),
    crm_procurement_cost_line: Field.lookup('crm_procurement_cost_line', { label: '软硬件采购成本行', group: 'basic', requiredWhen: cat('procurement') }),
    crm_expense_cost_line: Field.lookup('crm_expense_cost_line', { label: '项目费用成本行', group: 'basic', requiredWhen: cat('expense') }),
    period_month: Field.date({ label: '月份', required: true, storage: { notNull: true }, group: 'basic', description: '保存时归一到当月 1 日。' }),
    description: Field.text({ label: '说明', group: 'basic', description: '明细行说明加年月，保存时自动写入。' }),
    expense_type: Field.select({ label: '费用类型', group: 'basic', options: [...EXPENSE_TYPE_OPTIONS], description: '费用行复制下来，供差旅与报销分开汇总。' }),
    headcount: Field.number({ label: '人数', group: 'basic' }),
    quantity: Field.number({ label: '数量 / 工时', group: 'basic' }),
    unit_price: Field.currency({ label: '单价 / 费率', scale: 2, group: 'basic', description: '该月快照；人工行按月解析生效费率。' }),
    amount: Field.currency({ label: '金额', scale: 2, required: true, storage: { notNull: true }, group: 'basic' }),
    is_manual: Field.boolean({ label: '手工调整', group: 'basic', defaultValue: false, description: '标记后重新分解不覆盖这一行。' }),
    allocation_key: Field.text({ label: '分解键', group: 'basic', unique: true, readonly: true, description: '类别、明细行与年月，一行一个月。' }),
  },
  indexes: [
    { fields: ['crm_cost_plan'] },
    { fields: ['period_month'] },
    { fields: ['category'] },
  ],
  enable: {
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
  },
});
