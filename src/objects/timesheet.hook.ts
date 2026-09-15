// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';
import type { HookApi } from './_hook-api';
import { monthBounds, weekdaysInMonth } from './_psa-dates';

/**
 * Demo timesheet hooks (epic #2 / T4 + T6).
 *
 * `timesheet_cost_fill` — `cost` is a STORED currency (the parent's
 * `Field.summary` sums stored columns), so hours × hourly_rate is written here
 * on every insert/update that carries either input.
 *
 * `timesheet_budget_gate` — 「成本超预算时限制工时填报」 (spec step 36). A
 * cross-object TRANSITION gate: a CEL predicate reads only the record under
 * write, so the parent's actuals are summed here. Existing rows are untouched
 * (semantics rule 7); the spec's 限制 reads as a block, stated so under rule 8.
 * Actuals are summed from the children directly rather than read off the
 * parent's summary fields, so the gate does not depend on when the platform
 * materialises a rollup.
 */
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);

function refuse(message: string, code: string, status: number, userMessage: string = message): Error {
  const err = new Error(message) as Error & { code: string; status: number; userMessage: string };
  err.code = code;
  err.status = status;
  err.userMessage = userMessage;
  return err;
}

const timesheetCostFill: Hook = {
  name: 'timesheet_cost_fill',
  object: 'crm_timesheet',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  description: 'Write cost = hours × hourly_rate so the delivery project can roll it up.',
  handler: async (ctx: HookContext) => {
    const { input } = ctx;
    const previous = ctx.previous;
    if (!input) return;
    const touched = input.hours !== undefined || input.hourly_rate !== undefined || input.cost === undefined;
    if (!touched) return;
    const hours = num(input.hours !== undefined ? input.hours : previous?.hours);
    const rate = num(input.hourly_rate !== undefined ? input.hourly_rate : previous?.hourly_rate);
    input.cost = Math.round(hours * rate * 100) / 100;
  },
};

const timesheetBudgetGate: Hook = {
  name: 'timesheet_budget_gate',
  object: 'crm_timesheet',
  events: ['beforeInsert'],
  priority: 150,
  description: 'Refuse a new timesheet on a delivery project whose actual cost already meets its budget baseline (demo, epic #2).',
  handler: async (ctx: HookContext) => {
    const api = ctx.api as HookApi | undefined;
    const { input } = ctx;
    const projectId = typeof input?.crm_delivery_project === 'string' ? input.crm_delivery_project : '';
    if (!api || !projectId) return;
    const project = await api.object('crm_delivery_project').findOne({ where: { id: projectId }, fields: ['name', 'budget_baseline'] });
    const baseline = num(project?.budget_baseline);
    if (baseline <= 0) return;
    const sheets = await api.object('crm_timesheet').find({ where: { crm_delivery_project: projectId }, fields: ['cost'] });
    const travel = await api.object('crm_travel_cost').find({ where: { crm_delivery_project: projectId }, fields: ['amount'] });
    const actual = sheets.reduce((s, r) => s + num(r.cost), 0) + travel.reduce((s, r) => s + num(r.amount), 0);
    if (actual >= baseline) {
      const name = typeof project?.name === 'string' ? project.name : projectId;
      throw refuse(
        `Delivery project ${name} is over budget (actual ${actual} >= baseline ${baseline}); timesheet entry is restricted.`,
        'PROJECT_OVER_BUDGET',
        422,
        `项目「${name}」成本已超预算（实际 ${actual.toLocaleString()} ≥ 基线 ${baseline.toLocaleString()}），工时填报已限制`,
      );
    }
  },
};

/**
 * Round 2 (step 28 / 33). Two more hooks on the same object; each recomputes
 * `cost` itself so the outcome does not depend on hook ordering.
 *
 * `timesheet_rate_fill` — a sheet that names a rate card takes the card's
 * hourly rate unless the same write set the rate explicitly.
 *
 * `timesheet_attendance_sync` — `leave_hours` is summed from the submitter's
 * APPROVED leave requests for the sheet's month (working days × 8); while the
 * sheet is a draft and the caller did not write `hours`, hours = standard −
 * leave + overtime. Approved sheets keep their hours — only the leave figure
 * follows.
 */
const round2 = (v: number): number => Math.round(v * 100) / 100;

const timesheetRateFill: Hook = {
  name: 'timesheet_rate_fill',
  object: 'crm_timesheet',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 90,
  description: 'Hourly rate from the rate card the sheet names; cost follows.',
  handler: async (ctx: HookContext) => {
    const api = ctx.api as HookApi | undefined;
    const { input, previous } = ctx;
    const cardId = typeof input?.crm_rate_card === 'string' ? input.crm_rate_card : '';
    if (!api || !input || !cardId || input.hourly_rate !== undefined) return;
    const card = await api.object('crm_rate_card').findOne({ where: { id: cardId }, fields: ['hourly_rate'] });
    if (!card || num(card.hourly_rate) <= 0) return;
    input.hourly_rate = num(card.hourly_rate);
    const hours = num(input.hours !== undefined ? input.hours : previous?.hours);
    input.cost = round2(hours * num(input.hourly_rate));
  },
};

const timesheetAttendanceSync: Hook = {
  name: 'timesheet_attendance_sync',
  object: 'crm_timesheet',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 95,
  description: 'Leave hours from approved leave requests; draft hours = standard − leave + overtime.',
  handler: async (ctx: HookContext) => {
    const api = ctx.api as HookApi | undefined;
    const { input, previous } = ctx;
    if (!api || !input) return;
    const owner = typeof input.owner_id === 'string' && input.owner_id ? input.owner_id
      : typeof previous?.owner_id === 'string' && previous.owner_id ? previous.owner_id
      : typeof ctx.session?.userId === 'string' ? ctx.session.userId : '';
    const month = input.period_month !== undefined ? input.period_month : previous?.period_month;
    const status = (input.approval_status !== undefined ? input.approval_status : previous?.approval_status) ?? 'draft';
    const previousLeave = num(previous?.leave_hours);
    let leave = num(input.leave_hours !== undefined ? input.leave_hours : previous?.leave_hours);
    if (owner && month && monthBounds(month)) {
      const leaves = await api.object('crm_leave_request').find({ where: { owner_id: owner, approval_status: 'approved' }, fields: ['start_date', 'end_date'] });
      leave = leaves.reduce((sum, l) => sum + weekdaysInMonth(l.start_date, l.end_date, month) * 8, 0);
      if (leave !== previousLeave || input.leave_hours !== undefined || ctx.event === 'beforeInsert') input.leave_hours = leave;
    }
    const hoursGiven = input.hours !== undefined && input.hours !== null && input.hours !== '';
    const standard = num(input.standard_hours !== undefined ? input.standard_hours : previous?.standard_hours);
    const overtime = num(input.overtime_hours !== undefined ? input.overtime_hours : previous?.overtime_hours);
    const attendanceTouched = ctx.event === 'beforeInsert' || input.standard_hours !== undefined || input.overtime_hours !== undefined || leave !== previousLeave;
    if (!hoursGiven && status === 'draft' && standard > 0 && attendanceTouched) {
      input.hours = Math.max(0, standard - leave + overtime);
      const rate = num(input.hourly_rate !== undefined ? input.hourly_rate : previous?.hourly_rate);
      input.cost = round2(num(input.hours) * rate);
    }
  },
};

export default [timesheetRateFill, timesheetAttendanceSync, timesheetCostFill, timesheetBudgetGate];
