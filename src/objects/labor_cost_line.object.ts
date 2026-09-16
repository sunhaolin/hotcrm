// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { costLineFields, costLineShape } from './_cost-line';

/**
 * 人工服务成本行 — step 28: 岗位级别 × 费率标准 × 人数 × 每人每月工时, decomposed
 * over the month range by `cost_line_decompose`. The rate is never typed:
 * `cost_line_rate_fill` copies it from the rate card, and each month row
 * re-resolves the card effective in that month.
 */
export const LaborCostLine = ObjectSchema.create({
  name: 'crm_labor_cost_line',
  ...costLineShape('人工服务成本行', 'users'),
  description: 'Labor plan line: grade × rate × headcount × hours per month, split by month',
  highlightFields: ['crm_rate_card', 'headcount', 'hours_per_month', 'planned_amount'],
  fields: {
    ...costLineFields('crm_labor_cost_line'),
    crm_rate_card: Field.lookup('crm_rate_card', { label: '岗位级别 / 费率卡', required: true, storage: { notNull: true }, group: 'basic', description: '费率标准由费率卡带出，按月解析生效费率。' }),
    hourly_rate: Field.currency({ label: '费率标准（小时）', scale: 2, group: 'basic', readonly: true, description: '起始月份生效的费率卡小时费率，保存时自动带出。' }),
    headcount: Field.number({ label: '人数', required: true, storage: { notNull: true }, group: 'basic', defaultValue: 1 }),
    hours_per_month: Field.number({ label: '每人每月工时', required: true, storage: { notNull: true }, group: 'basic', defaultValue: 160 }),
  },
});
