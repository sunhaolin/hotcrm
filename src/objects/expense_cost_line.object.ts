// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { P } from '@objectstack/spec';
import { costLineFields, costLineShape } from './_cost-line';
import { EXPENSE_TYPE_OPTIONS } from './_psa-picklists';

/**
 * 项目费用成本行 — step 31. 差旅 is computed: 出差次数 × 每次人数 × (往返交通 + 天数
 * × 日标准) off a 差旅标准; every 报销类 type is a typed budget. The type rides
 * down onto each month row, so plans and reports keep travel and
 * reimbursements apart. The two `requiredWhen` gates are transition gates
 * (semantics rule 7), and TOTAL: every read is `has()`-guarded.
 */
const IS_TRAVEL = P`has(record.expense_type) && record.expense_type == "travel"`;
const IS_REIMBURSEMENT = P`has(record.expense_type) && record.expense_type != "travel"`;

export const ExpenseCostLine = ObjectSchema.create({
  name: 'crm_expense_cost_line',
  ...costLineShape('项目费用成本行', 'receipt'),
  description: 'Project expense plan line: travel computed from a travel standard, reimbursement types budgeted directly, split by month',
  highlightFields: ['expense_type', 'crm_travel_standard', 'budget_amount', 'planned_amount'],
  fields: {
    ...costLineFields('crm_expense_cost_line'),
    expense_type: Field.select({ label: '费用类型', required: true, storage: { notNull: true }, group: 'basic', defaultValue: 'travel', options: [...EXPENSE_TYPE_OPTIONS] }),
    crm_travel_standard: Field.lookup('crm_travel_standard', { label: '差旅标准', group: 'basic', requiredWhen: IS_TRAVEL }),
    trips: Field.number({ label: '出差次数', group: 'basic', requiredWhen: IS_TRAVEL }),
    travelers: Field.number({ label: '每次人数', group: 'basic', requiredWhen: IS_TRAVEL }),
    days: Field.number({ label: '每次天数', group: 'basic', requiredWhen: IS_TRAVEL }),
    budget_amount: Field.currency({ label: '预算金额', scale: 2, group: 'basic', requiredWhen: IS_REIMBURSEMENT, description: '报销类费用直接填预算总额；差旅类按差旅标准计算，不填。' }),
  },
});
