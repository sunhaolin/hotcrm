// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';
import { calendarDays } from './_psa-dates';

/** 出差申请 — round 2: calendar days between the two dates, both inclusive. */
const tripDaysFill: Hook = {
  name: 'business_trip_days_fill',
  object: 'crm_business_trip',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  description: 'Trip days = calendar days from start to end, inclusive.',
  handler: async (ctx: HookContext) => {
    const { input, previous } = ctx;
    if (!input) return;
    if (input.start_date === undefined && input.end_date === undefined) return;
    const start = input.start_date !== undefined ? input.start_date : previous?.start_date;
    const end = input.end_date !== undefined ? input.end_date : previous?.end_date;
    input.days = calendarDays(start, end);
  },
};

export default [tripDaysFill];
