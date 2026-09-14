// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';
import type { HookApi } from './_hook-api';

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

export default [timesheetCostFill, timesheetBudgetGate];
