// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';
import type { HookApi } from './_hook-api';

const empty = (v: unknown): boolean => v === undefined || v === null || v === '';

function refuse(message: string, code: string, userMessage: string): Error {
  const err = new Error(message) as Error & { code: string; status: number; userMessage: string };
  err.code = code;
  err.status = 422;
  err.userMessage = userMessage;
  return err;
}

/**
 * 差旅成本 — round 2 (step 35): a cost booked to a business trip takes the
 * trip's project, traveller and start date when they were left blank, and is
 * refused while the trip is not approved — 「差旅成本按项目归集，与人力成本对应，
 * 凭报销单据录入系统」 presumes an approved trip behind the receipt.
 */
const travelCostTripFill: Hook = {
  name: 'travel_cost_trip_fill',
  object: 'crm_travel_cost',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  description: 'Project, traveller and date default from the business trip; refuse a cost on a trip that is not approved.',
  handler: async (ctx: HookContext) => {
    const api = ctx.api as HookApi | undefined;
    const { input, previous } = ctx;
    const tripId = typeof input?.crm_business_trip === 'string' ? input.crm_business_trip : '';
    if (!api || !input || !tripId) return;
    const trip = await api.object('crm_business_trip').findOne({
      where: { id: tripId },
      fields: ['subject', 'approval_status', 'crm_delivery_project', 'owner_id', 'start_date'],
    });
    if (!trip) return;
    if (trip.approval_status !== 'approved') {
      const subject = typeof trip.subject === 'string' ? trip.subject : tripId;
      throw refuse(
        `Business trip ${subject} is not approved; travel cost cannot be booked to it.`,
        'TRIP_NOT_APPROVED',
        `出差申请「${subject}」尚未审批通过，不能登记差旅成本`,
      );
    }
    if (empty(input.crm_delivery_project) && empty(previous?.crm_delivery_project) && typeof trip.crm_delivery_project === 'string') input.crm_delivery_project = trip.crm_delivery_project;
    if (empty(input.owner_id) && empty(previous?.owner_id) && typeof trip.owner_id === 'string') input.owner_id = trip.owner_id;
    if (empty(input.expense_date) && empty(previous?.expense_date) && !empty(trip.start_date)) input.expense_date = trip.start_date;
  },
};

export default [travelCostTripFill];
