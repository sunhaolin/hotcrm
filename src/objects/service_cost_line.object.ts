// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { costLineFields, costLineShape } from './_cost-line';
import { PRICING_BASIS_OPTIONS } from './_psa-picklists';

/**
 * 第三方服务成本行 — step 29: 服务名称 × 计价方式 × 单价 × 人数 × 工期. The unit
 * price is the supplier's quote, typed by hand; 人月 lands unit price ×
 * headcount in every month, 人天 and 包干 spread their total evenly.
 */
export const ServiceCostLine = ObjectSchema.create({
  name: 'crm_service_cost_line',
  ...costLineShape('第三方服务成本行', 'handshake'),
  description: 'Third-party service plan line: pricing basis × unit price × headcount × duration, split by month',
  highlightFields: ['vendor', 'pricing_basis', 'unit_price', 'planned_amount'],
  fields: {
    ...costLineFields('crm_service_cost_line'),
    vendor: Field.text({ label: '供应商', group: 'basic' }),
    pricing_basis: Field.select({ label: '计价方式', required: true, storage: { notNull: true }, group: 'basic', options: [...PRICING_BASIS_OPTIONS] }),
    unit_price: Field.currency({ label: '单价', scale: 2, required: true, storage: { notNull: true }, group: 'basic', description: '人月 / 人天单价，或包干总价；来源为供应商报价。' }),
    headcount: Field.number({ label: '人数', group: 'basic', defaultValue: 1 }),
    duration: Field.number({ label: '工期', group: 'basic', description: '人月计价按月数，人天计价按人天数；包干不填。' }),
  },
});
