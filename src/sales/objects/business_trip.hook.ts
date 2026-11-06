// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';

/**
 * 出差申请 — round 2: calendar days between the two dates, both inclusive.
 * The date arithmetic is inline so the body lowers to metadata.
 */
const tripDaysFill: Hook = {
  name: 'business_trip_days_fill',
  object: 'crm_business_trip',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  description: 'Trip days = calendar days from start to end, inclusive.',
  handler: async (ctx: HookContext) => {
    const toUtcDay = (value: unknown): Date | null => {
      if (value === null || value === undefined || value === '') return null;
      const d = value instanceof Date ? value : new Date(String(value));
      if (Number.isNaN(d.getTime())) return null;
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    };
    const { input, previous } = ctx;
    if (!input) return;
    if (input.start_date === undefined && input.end_date === undefined) return;
    const a = toUtcDay(input.start_date !== undefined ? input.start_date : previous?.start_date);
    const b = toUtcDay(input.end_date !== undefined ? input.end_date : previous?.end_date);
    input.days = !a || !b || b < a ? 0 : Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1;
  },
};

export default [tripDaysFill];
