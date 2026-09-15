// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';
import type { HookApi } from './_hook-api';

/**
 * Demo timesheet hooks (epic #2 / T4 + T6, extended in round 2).
 *
 * `timesheet_rate_fill` — a sheet that names a rate card is priced by that
 * card, full stop: the card's hourly rate wins over anything on the payload,
 * because `hourly_rate` is `readonly: true` on the object and a value reaching
 * this hook is a caller's, not an author's. It is re-read when the write picks
 * a card and when the sheet carries no rate yet, so a rate-card edit reaches
 * new sheets and leaves approved history alone.
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
 * Actuals — and the approved adjustments that move the control line — are
 * summed from the children directly rather than read off the parent's summary
 * fields, so the gate does not depend on when the platform materialises a
 * rollup. Its refusal is `invalid_value` (VALIDATION_FAILED / 400): the project
 * the user picked is one this object's own rule rejects.
 *
 * It refuses TWO ways, and the second one is why a create is checked at all:
 *
 *   1. the project is already at or past its budget — the sheet is refused
 *      whatever it costs;
 *   2. the project still has budget left, but LESS than this sheet costs, so
 *      saving it would take actual cost past the budget.
 *
 * Only (1) existed at first, which left the gate blind on exactly the write it
 * fires on: every sheet already stored counted, and the one being inserted
 * counted for nothing, so the sheet that blew the budget was always accepted
 * and only the NEXT one was refused. A first sheet costing 900,000 on a project
 * budgeted 200,000 saved without a word.
 *
 * The control line is the CURRENT budget — `budget_baseline` plus the APPROVED
 * `crm_budget_adjustment` rows, which is what `crm_delivery_project`'s own
 * `budget_current` formula and every burn/variance figure read (step 32). It
 * was the bare baseline until the same repair, which is why the documented way
 * out — 「项目要先有一条审批通过的预算调整，才能再往上记工时」 — did nothing at all.
 * A project with no budget at all (baseline 0 and no approved adjustment) has
 * no control line, so it is not gated; that is unchanged.
 *
 * ⚠️ A SYSTEM write is not gated — the one exemption, and the sheet-under-write
 * check is why it had to be written down. Seed replay writes with
 * `isSystem: true` (`skipTriggers` suppresses flows, not hooks), and 试点交付 is
 * seeded DELIBERATELY over its budget: two 128,000 sheets against a 200,000
 * baseline, which is the data interception ② demonstrates. Gating that replay
 * would refuse the second sheet and quietly seed a project that is merely at
 * budget — the gate rewriting the fixture it is demonstrated on. The rule
 * behind the exemption is the spec's own: 「成本超预算时限制工时填报」 restricts a
 * PERSON booking hours, and a replay of curated rows is not one. Same reflex,
 * and same reasoning, as `delivery_project_cost_plan_carry`.
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
    if (!input) return;
    // Which card prices this sheet: the one this write picks, else the one
    // already stored (an update that does not mention the column).
    const picked = typeof input.crm_rate_card === 'string' ? input.crm_rate_card : '';
    const stored = typeof previous?.crm_rate_card === 'string' ? previous.crm_rate_card : '';
    const cardId = picked || (input.crm_rate_card === undefined ? stored : '');
    // No card names a rate, so there is nothing for this hook to say: a sheet
    // priced some other way (a seeded row, a legacy row) keeps its own rate.
    if (!cardId) return;
    // A write PICKS a card when it names one the sheet was not already priced
    // against — an insert, or an edit that changes the grade. Re-sending the
    // stored card, which is what the form does on every edit, is not picking.
    const picks = picked !== '' && picked !== stored;
    // The SNAPSHOT rule the docs state: re-read the card when this write picks
    // one, and when the sheet carries no rate yet. A sheet that already priced
    // itself keeps that rate, so editing a rate card reaches new sheets and
    // leaves approved history alone.
    let rate = num(previous?.hourly_rate);
    if (api && (picks || rate <= 0)) {
      const card = await api.object('crm_rate_card').findOne({ where: { id: cardId }, fields: ['hourly_rate'] });
      const carded = num(card?.hourly_rate);
      if (carded > 0) rate = carded;
    }
    // Nothing to price from — keep whatever came in rather than zeroing it.
    if (rate <= 0) rate = num(input.hourly_rate);
    if (rate <= 0 && input.hourly_rate === undefined) return;
    // Assigned unconditionally, and that is the point: a sheet that names a
    // card is priced by the CARD, never by a rate on the payload. `hourly_rate`
    // is `readonly: true`, so a value on the payload is a caller's and the
    // engine strips it — reading it back here would price the sheet at whatever
    // an empty form posted (`0`), which is the defect this closes.
    input.hourly_rate = rate;
    const hours = num(input.hours !== undefined ? input.hours : previous?.hours);
    input.cost = Math.round(hours * rate * 100) / 100;
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
  description: 'Refuse a new timesheet a delivery project has no budget left for — one already over budget, or one this sheet would take over (demo, epic #2).',
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
    const round2 = (v: number): number => Math.round(v * 100) / 100;
    // Thousands separators, written out rather than delegated. MEASURED on the
    // shipped path: `toLocaleString()` groups nothing inside the sandbox (no
    // ICU in QuickJS), so a user read `实际 264000` while every test on a Node
    // runtime read back `264,000` and agreed with the docs — the suite
    // certifying a sentence production does not emit. Grouping here makes the
    // one sentence identical on both.
    const money = (v: number): string => {
      const parts = String(Math.abs(round2(v))).split('.');
      return (v < 0 ? '-' : '') + parts[0]!.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (parts[1] ? `.${parts[1]}` : '');
    };
    const api = ctx.api as HookApi | undefined;
    const { input } = ctx;
    if (ctx.session?.isSystem === true) return;
    const projectId = typeof input?.crm_delivery_project === 'string' ? input.crm_delivery_project : '';
    if (!api || !input || !projectId) return;
    const project = await api.object('crm_delivery_project').findOne({ where: { id: projectId }, fields: ['name', 'budget_baseline'] });
    const adjustments = await api.object('crm_budget_adjustment').find({ where: { crm_delivery_project: projectId, approval_status: 'approved' }, fields: ['amount'] });
    const budget = round2(num(project?.budget_baseline) + adjustments.reduce((s, r) => s + num(r.amount), 0));
    if (budget <= 0) return;
    const sheets = await api.object('crm_timesheet').find({ where: { crm_delivery_project: projectId }, fields: ['cost'] });
    const travel = await api.object('crm_travel_cost').find({ where: { crm_delivery_project: projectId }, fields: ['amount'] });
    const actual = round2(sheets.reduce((s, r) => s + num(r.cost), 0) + travel.reduce((s, r) => s + num(r.amount), 0));
    const name = typeof project?.name === 'string' ? project.name : projectId;
    if (actual >= budget) {
      throw refuse(
        `Delivery project ${name} is over budget (actual ${actual} >= budget ${budget}); timesheet entry is restricted.`,
        'VALIDATION_FAILED',
        400,
        `项目「${name}」成本已超预算（实际 ${money(actual)} ≥ 预算 ${money(budget)}），工时填报已限制`,
      );
    }
    // The sheet under write is the one row the sum above cannot carry: it has
    // no id yet. `cost` is already filled by `timesheet_cost_fill` (priority
    // 100, and the engine runs hooks in ascending priority); the product is
    // recomputed here for a caller that reaches the engine another way.
    const incoming = input.cost === undefined || input.cost === null || input.cost === '' ? round2(num(input.hours) * num(input.hourly_rate)) : num(input.cost);
    const projected = round2(actual + incoming);
    if (incoming > 0 && projected > budget) {
      throw refuse(
        `Delivery project ${name} has ${round2(budget - actual)} of budget left; this timesheet costs ${incoming} and would take actual cost to ${projected}.`,
        'VALIDATION_FAILED',
        400,
        `项目「${name}」预算剩余 ${money(budget - actual)}，本次工时成本 ${money(incoming)} 已超出剩余预算，工时填报已限制；请调减工时，或先提交预算调整并审批通过`,
      );
    }
  },
};

export default [timesheetRateFill, timesheetAttendanceSync, timesheetCostFill, timesheetBudgetGate];
