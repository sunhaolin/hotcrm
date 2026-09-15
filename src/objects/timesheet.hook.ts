// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';
import type { HookApi } from './_hook-api';

/**
 * Demo timesheet hooks (epic #2 / T4 + T6, extended in round 2).
 *
 * `timesheet_rate_fill` — a sheet that names a rate card takes the card's
 * hourly rate unless the same write set the rate explicitly.
 *
 * `timesheet_attendance_sync` — `leave_hours` is summed from the submitter's
 * APPROVED leave requests for the sheet's month (working days × 8); while the
 * sheet is a draft and the caller did not write `hours`, hours = standard −
 * leave + overtime. Approved sheets keep their hours — only the leave figure
 * follows.
 *
 * `timesheet_cost_fill` — `cost` is a STORED currency (the parent's
 * `Field.summary` sums stored columns), so hours × hourly_rate is written here
 * on every insert/update that carries either input. Each of the three fillers
 * recomputes `cost` itself so the outcome does not depend on hook ordering.
 *
 * `timesheet_budget_gate` — 「成本超预算时限制工时填报」 (spec step 36). A
 * cross-object TRANSITION gate: a CEL predicate reads only the record under
 * write, so the parent's actuals are summed here. Existing rows are untouched
 * (semantics rule 7); the spec's 限制 reads as a block, stated so under rule 8.
 * Actuals are summed from the children directly rather than read off the
 * parent's summary fields, so the gate does not depend on when the platform
 * materialises a rollup. Its refusal is `invalid_value` (VALIDATION_FAILED /
 * 400): the project the user picked is one this object's own rule rejects.
 *
 * Every handler closes over nothing — the number, rounding and calendar
 * helpers are inline per body — so each still lowers to metadata
 * (`hook-body/not-lowerable`); `refuse()` is the inline copy every refusing
 * hook carries (`_refusal.ts`, pinned by `test/refusal-envelope.test.ts`).
 */
const timesheetRateFill: Hook = {
  name: 'timesheet_rate_fill',
  object: 'crm_timesheet',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 90,
  description: 'Hourly rate from the rate card the sheet names; cost follows.',
  handler: async (ctx: HookContext) => {
    const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);
    const api = ctx.api as HookApi | undefined;
    const { input, previous } = ctx;
    const cardId = typeof input?.crm_rate_card === 'string' ? input.crm_rate_card : '';
    if (!api || !input || !cardId || input.hourly_rate !== undefined) return;
    const card = await api.object('crm_rate_card').findOne({ where: { id: cardId }, fields: ['hourly_rate'] });
    if (!card || num(card.hourly_rate) <= 0) return;
    input.hourly_rate = num(card.hourly_rate);
    const hours = num(input.hours !== undefined ? input.hours : previous?.hours);
    input.cost = Math.round(hours * num(input.hourly_rate) * 100) / 100;
  },
};

const timesheetAttendanceSync: Hook = {
  name: 'timesheet_attendance_sync',
  object: 'crm_timesheet',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 95,
  description: 'Leave hours from approved leave requests; draft hours = standard − leave + overtime.',
  handler: async (ctx: HookContext) => {
    const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);
    const toUtcDay = (value: unknown): Date | null => {
      if (value === null || value === undefined || value === '') return null;
      const d = value instanceof Date ? value : new Date(String(value));
      if (Number.isNaN(d.getTime())) return null;
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    };
    // Working days (Mon–Fri) of the leave that fall inside the sheet's month.
    const weekdaysInMonth = (start: unknown, end: unknown, month: unknown): number => {
      const m = toUtcDay(month); const a = toUtcDay(start); const b = toUtcDay(end);
      if (!m || !a || !b) return 0;
      const first = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), 1));
      const last = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 0));
      const from = a > first ? a : first;
      const to = b < last ? b : last;
      let n = 0;
      for (let t = from.getTime(); t <= to.getTime(); t += 86_400_000) {
        const dow = new Date(t).getUTCDay();
        if (dow !== 0 && dow !== 6) n += 1;
      }
      return n;
    };
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
    if (owner && month && toUtcDay(month)) {
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
      input.cost = Math.round(num(input.hours) * rate * 100) / 100;
    }
  },
};

const timesheetCostFill: Hook = {
  name: 'timesheet_cost_fill',
  object: 'crm_timesheet',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  description: 'Write cost = hours × hourly_rate so the delivery project can roll it up.',
  handler: async (ctx: HookContext) => {
    const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);
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
    function refuse(
      message: string,
      code: string,
      status: number,
      userMessage: string = message,
    ): Error {
      const err = new Error(message) as Error & {
        code: string;
        status: number;
        userMessage: string;
      };
      err.code = code;
      err.status = status;
      err.userMessage = userMessage;
      return err;
    }
    const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);
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
        'VALIDATION_FAILED',
        400,
        `项目「${name}」成本已超预算（实际 ${actual.toLocaleString()} ≥ 基线 ${baseline.toLocaleString()}），工时填报已限制`,
      );
    }
  },
};

export default [timesheetRateFill, timesheetAttendanceSync, timesheetCostFill, timesheetBudgetGate];
