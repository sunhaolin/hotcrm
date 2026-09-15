// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { costLineFields, costLineShape } from './_cost-line';
import { PROCUREMENT_CATEGORY_OPTIONS } from './_psa-picklists';

/**
 * 软硬件采购成本行 — step 30: 采购品类 × 数量 × 单价. A one-off purchase lands in
 * its 起始月份 (the planned delivery month); a subscription or maintenance
 * term with an 结束月份 is amortised evenly across the range.
 */
export const ProcurementCostLine = ObjectSchema.create({
  name: 'crm_procurement_cost_line',
  ...costLineShape('软硬件采购成本行', 'package'),
  description: 'Hardware / software procurement plan line: category × quantity × unit price, landed in the delivery month or amortised',
  highlightFields: ['procurement_category', 'quantity', 'unit_price', 'planned_amount'],
  fields: {
    ...costLineFields('crm_procurement_cost_line'),
    procurement_category: Field.select({ label: '采购品类', required: true, storage: { notNull: true }, group: 'basic', options: [...PROCUREMENT_CATEGORY_OPTIONS] }),
    crm_product: Field.lookup('crm_product', { label: '产品', group: 'basic', description: '选了产品则单价从价目带出，否则手填。' }),
    quantity: Field.number({ label: '数量', required: true, storage: { notNull: true }, group: 'basic', defaultValue: 1 }),
    unit_price: Field.currency({ label: '单价', scale: 2, required: true, storage: { notNull: true }, group: 'basic' }),
  },
});
