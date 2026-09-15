// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';
import type { HookApi } from './_hook-api';

/**
 * 成本计划行 — round 2 (step 28): a labor line that names a rate card takes its
 * unit price from the card, and `planned_amount` is quantity × unit price
 * unless the caller wrote it. Seeds that carry all three are left alone.
 *
 * The handler closes over nothing — its two helpers are inline — so it lowers
 * to a metadata-only body (`hook-body/not-lowerable`).
 */
const costPlanLineFill: Hook = {
  name: 'cost_plan_line_fill',
  object: 'crm_cost_plan_line',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  description: 'Unit price from the rate card; planned amount = quantity × unit price when not given.',
  handler: async (ctx: HookContext) => {
    const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);
    const round2 = (v: number): number => Math.round(v * 100) / 100;
    const api = ctx.api as HookApi | undefined;
    const { input, previous } = ctx;
    if (!input) return;
    const cardId = typeof input.crm_rate_card === 'string' ? input.crm_rate_card : '';
    if (cardId && api && input.unit_price === undefined) {
      const card = await api.object('crm_rate_card').findOne({ where: { id: cardId }, fields: ['hourly_rate'] });
      if (card && num(card.hourly_rate) > 0) input.unit_price = num(card.hourly_rate);
    }
    const touched = input.quantity !== undefined || input.unit_price !== undefined;
    if (touched && input.planned_amount === undefined) {
      const qty = num(input.quantity !== undefined ? input.quantity : previous?.quantity);
      const price = num(input.unit_price !== undefined ? input.unit_price : previous?.unit_price);
      if (qty > 0 && price > 0) input.planned_amount = round2(qty * price);
    }
  },
};

export default [costPlanLineFill];
