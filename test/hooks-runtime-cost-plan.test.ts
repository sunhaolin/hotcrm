// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * 成本计划 hooks (steps 27–32) against the in-memory harness: the month
 * decomposition per category, the rate resolved per month, the whole-range
 * row a Bizcase line lands as, the lock on a plan that left draft, the month
 * ledger's derived keys, the Bizcase put in force by its approval, and the
 * adjustment amount read off two plan versions. Business facts only
 * (AGENTS.md scope 3).
 */
import { describe, it, expect } from 'vitest';
import { ExpressionEngine } from '@objectstack/formula';
import costPlanHooks from '../src/objects/cost_plan.hook';
import { CostPlan } from '../src/objects/cost_plan.object';
import { makeHarness, makeCtx, hookNamed, type Rec } from './helpers/hook-harness';

const USER = { id: 'user_1' };
const withResult = (ctx: Rec, result: Rec): Rec => Object.assign(ctx, { result });
const withObject = (ctx: Rec, object: string): Rec => Object.assign(ctx, { object });

const cards = () => ({
  crm_rate_card: [
    { id: 'rc_se_2026', name: '高级工程师', rate_standard: 'standard', hourly_rate: 800, effective_from: '2026-01-01', effective_to: '2026-06-30', is_active: true },
    { id: 'rc_se_h2', name: '高级工程师', rate_standard: 'standard', hourly_rate: 840, effective_from: '2026-07-01', is_active: true },
  ],
  crm_travel_standard: [{ id: 'ts_1', lodging_per_day: 500, meal_per_day: 100, local_transport_per_day: 80, fare_per_trip: 1500 }],
  crm_cost_plan_month: [] as Rec[],
});

describe('cost_line_decompose', () => {
  const hook = hookNamed(costPlanHooks, 'cost_line_decompose');

  it('splits a labor line into one month per month, priced by the card effective in that month', async () => {
    const h = makeHarness(cards());
    const line = { id: 'l1', crm_cost_plan: 'cp1', description: '高级工程师 × 2', crm_rate_card: 'rc_se_2026', headcount: 2, hours_per_month: 160, start_month: '2026-06-01', end_month: '2026-07-01' };
    await hook.handler(withObject(withResult(makeCtx({ event: 'afterInsert', input: line, user: USER, api: h.api }), line), 'crm_labor_cost_line'));
    const rows = h.rows('crm_cost_plan_month');
    expect(rows.map((r) => [r.period_month, r.unit_price, r.amount])).toEqual([
      ['2026-06-01', 800, 256_000],
      ['2026-07-01', 840, 268_800],
    ]);
    expect(rows.every((r) => r.category === 'labor' && r.crm_labor_cost_line === 'l1' && r.crm_cost_plan === 'cp1' && r.is_manual === false)).toBe(true);
    expect(rows[0]!.description).toBe('高级工程师 × 2 · 2026-06');
  });

  it('lands a 人月 service line as unit price × headcount for `duration` months', async () => {
    const h = makeHarness(cards());
    const line = { id: 's1', crm_cost_plan: 'cp1', description: '分包', pricing_basis: 'per_month', unit_price: 62_500, headcount: 2, duration: 3, start_month: '2026-08-01' };
    await hook.handler(withObject(withResult(makeCtx({ event: 'afterInsert', input: line, user: USER, api: h.api }), line), 'crm_service_cost_line'));
    expect(h.rows('crm_cost_plan_month').map((r) => [r.period_month, r.amount])).toEqual([
      ['2026-08-01', 125_000], ['2026-09-01', 125_000], ['2026-10-01', 125_000],
    ]);
  });

  it('spreads a procurement term evenly and gives the last month the rounding remainder', async () => {
    const h = makeHarness(cards());
    const line = { id: 'p1', crm_cost_plan: 'cp1', description: '云资源', quantity: 1, unit_price: 100_000, start_month: '2026-09-01', end_month: '2026-11-01' };
    await hook.handler(withObject(withResult(makeCtx({ event: 'afterInsert', input: line, user: USER, api: h.api }), line), 'crm_procurement_cost_line'));
    const amounts = h.rows('crm_cost_plan_month').map((r) => r.amount as number);
    expect(amounts).toEqual([33_333.33, 33_333.33, 33_333.34]);
    expect(Math.round(amounts.reduce((a, b) => a + b, 0) * 100) / 100).toBe(100_000);
  });

  it('computes 差旅 from the travel standard and carries the expense type down', async () => {
    const h = makeHarness(cards());
    const line = { id: 'e1', crm_cost_plan: 'cp1', description: '差旅', expense_type: 'travel', crm_travel_standard: 'ts_1', trips: 4, travelers: 2, days: 3, start_month: '2026-08-01', end_month: '2026-09-01' };
    await hook.handler(withObject(withResult(makeCtx({ event: 'afterInsert', input: line, user: USER, api: h.api }), line), 'crm_expense_cost_line'));
    const rows = h.rows('crm_cost_plan_month');
    expect(rows.map((r) => r.amount)).toEqual([14_160, 14_160]);
    expect(rows.every((r) => r.expense_type === 'travel' && r.category === 'expense')).toBe(true);
  });

  it('keeps a 手工调整 month, refreshes the rest, and prunes months that left the range', async () => {
    const store = cards();
    store.crm_cost_plan_month = [
      { id: 'm_jun', crm_cost_plan: 'cp1', crm_labor_cost_line: 'l1', period_month: '2026-06-01', amount: 1, is_manual: true },
      { id: 'm_jul', crm_cost_plan: 'cp1', crm_labor_cost_line: 'l1', period_month: '2026-07-01', amount: 2, is_manual: false },
      { id: 'm_aug', crm_cost_plan: 'cp1', crm_labor_cost_line: 'l1', period_month: '2026-08-01', amount: 3, is_manual: false },
    ];
    const h = makeHarness(store);
    const previous = { id: 'l1', crm_cost_plan: 'cp1', description: 'SE', crm_rate_card: 'rc_se_2026', headcount: 1, hours_per_month: 100, start_month: '2026-06-01', end_month: '2026-08-01' };
    await hook.handler(withObject(makeCtx({ event: 'afterUpdate', input: { end_month: '2026-07-01' }, previous, user: USER, api: h.api }), 'crm_labor_cost_line'));
    const rows = h.rows('crm_cost_plan_month');
    expect(rows.map((r) => [r.period_month, r.amount, r.is_manual])).toEqual([
      ['2026-06-01', 1, true],
      ['2026-07-01', 84_000, false],
    ]);
    expect(h.callsFor('crm_cost_plan_month', 'delete')).toHaveLength(1);
  });

  it('keeps splitting a line by month when its plan is a delivery plan', async () => {
    const h = makeHarness({ ...cards(), crm_cost_plan: [{ id: 'dp1', crm_delivery_project: 'dlv_1', phase: 'delivery' }] });
    const line = { id: 'l1', crm_cost_plan: 'dp1', description: 'SE', crm_rate_card: 'rc_se_2026', headcount: 1, hours_per_month: 100, start_month: '2026-06-01', end_month: '2026-07-01' };
    await hook.handler(withObject(withResult(makeCtx({ event: 'afterInsert', input: line, user: USER, api: h.api }), line), 'crm_labor_cost_line'));
    expect(h.rows('crm_cost_plan_month').map((r) => r.period_month)).toEqual(['2026-06-01', '2026-07-01']);
  });
});

/**
 * 售前阶段不按月拆分 — 不需要在月度分解行中生成数据 (2026-09-16): a Bizcase line
 * carries its own whole-range figure (`cost_line_estimate` → `estimate_amount`)
 * and the ledger stays empty; the decomposition writes nothing on a Bizcase
 * and clears whatever rows a line still has from before the rule.
 */
describe('cost_line_decompose on a Bizcase plan', () => {
  const hook = hookNamed(costPlanHooks, 'cost_line_decompose');
  const bizcase = () => ({ ...cards(), crm_cost_plan: [{ id: 'bc1', crm_presales_project: 'psp_1', phase: 'bizcase' }] });

  it('generates no month rows for a line on a Bizcase', async () => {
    const h = makeHarness(bizcase());
    const line = { id: 'l1', crm_cost_plan: 'bc1', description: '高级工程师 × 2', crm_rate_card: 'rc_se_2026', headcount: 2, hours_per_month: 160, start_month: '2026-06-01', end_month: '2026-07-01' };
    await hook.handler(withObject(withResult(makeCtx({ event: 'afterInsert', input: line, user: USER, api: h.api }), line), 'crm_labor_cost_line'));
    expect(h.rows('crm_cost_plan_month')).toEqual([]);
    expect(h.callsFor('crm_cost_plan_month', 'insert')).toHaveLength(0);
  });

  it('removes the rows a line was split into before the rule, 手工调整 included', async () => {
    // The plan hangs off a presales project but carries no phase yet — read off the project.
    const store = { ...cards(), crm_cost_plan: [{ id: 'bc1', crm_presales_project: 'psp_1' }] };
    store.crm_cost_plan_month = [
      { id: 'm_jun', crm_cost_plan: 'bc1', crm_labor_cost_line: 'l1', period_month: '2026-06-01', amount: 1, is_manual: true },
      { id: 'm_jul', crm_cost_plan: 'bc1', crm_labor_cost_line: 'l1', period_month: '2026-07-01', amount: 2, is_manual: false },
      { id: 'm_other', crm_cost_plan: 'bc1', crm_labor_cost_line: 'l2', period_month: '2026-07-01', amount: 3, is_manual: false },
    ];
    const h = makeHarness(store);
    const previous = { id: 'l1', crm_cost_plan: 'bc1', description: 'SE', crm_rate_card: 'rc_se_h2', headcount: 1, hours_per_month: 100, start_month: '2026-06-01', end_month: '2026-07-01' };
    await hook.handler(withObject(makeCtx({ event: 'afterUpdate', input: { hours_per_month: 100 }, previous, user: USER, api: h.api }), 'crm_labor_cost_line'));
    expect(h.rows('crm_cost_plan_month').map((r) => r.id)).toEqual(['m_other']);
    expect(h.callsFor('crm_cost_plan_month', 'delete')).toHaveLength(2);
  });
});

describe('cost_line_estimate', () => {
  const hook = hookNamed(costPlanHooks, 'cost_line_estimate');
  const bizcase = () => ({ ...cards(), crm_cost_plan: [{ id: 'bc1', crm_presales_project: 'psp_1', phase: 'bizcase' }] });
  const run = async (store: Rec, object: string, input: Rec, event: 'beforeInsert' | 'beforeUpdate' = 'beforeInsert', previous?: Rec) => {
    const h = makeHarness(store);
    await hook.handler(withObject(makeCtx({ event, input, previous, user: USER, api: h.api }), object));
    return input;
  };

  it('prices a labor line month by month off the card in force and writes the sum on the line', async () => {
    // 2 × 160 × 800 (June) + 2 × 160 × 840 (July).
    const input = await run(bizcase(), 'crm_labor_cost_line', { crm_cost_plan: 'bc1', crm_rate_card: 'rc_se_2026', headcount: 2, hours_per_month: 160, start_month: '2026-06-01', end_month: '2026-07-01' });
    expect(input.estimate_amount).toBe(524_800);
  });

  it('prices the service, procurement and expense lines from their own factors', async () => {
    expect((await run(bizcase(), 'crm_service_cost_line', { crm_cost_plan: 'bc1', pricing_basis: 'per_month', unit_price: 62_500, headcount: 2, duration: 3, start_month: '2026-08-01' })).estimate_amount).toBe(375_000);
    expect((await run(bizcase(), 'crm_service_cost_line', { crm_cost_plan: 'bc1', pricing_basis: 'per_day', unit_price: 2_000, headcount: 2, duration: 10, start_month: '2026-08-01' })).estimate_amount).toBe(40_000);
    expect((await run(bizcase(), 'crm_service_cost_line', { crm_cost_plan: 'bc1', pricing_basis: 'lump_sum', unit_price: 300_000, start_month: '2026-09-01', end_month: '2026-10-01' })).estimate_amount).toBe(300_000);
    expect((await run(bizcase(), 'crm_procurement_cost_line', { crm_cost_plan: 'bc1', procurement_category: 'software_license', quantity: 2, unit_price: 25_000, start_month: '2026-08-01' })).estimate_amount).toBe(50_000);
    expect((await run(bizcase(), 'crm_expense_cost_line', { crm_cost_plan: 'bc1', expense_type: 'travel', crm_travel_standard: 'ts_1', trips: 4, travelers: 2, days: 3, start_month: '2026-08-01', end_month: '2026-09-01' })).estimate_amount).toBe(28_320);
    expect((await run(bizcase(), 'crm_expense_cost_line', { crm_cost_plan: 'bc1', expense_type: 'other', budget_amount: 20_000, start_month: '2026-08-01' })).estimate_amount).toBe(20_000);
  });

  it('clears the estimate on a delivery line, and leaves a write that touches no factor alone', async () => {
    const delivery = { ...cards(), crm_cost_plan: [{ id: 'dp1', crm_delivery_project: 'dlv_1', phase: 'delivery' }] };
    const cleared = await run(delivery, 'crm_labor_cost_line', { hours_per_month: 120 }, 'beforeUpdate', { id: 'l1', crm_cost_plan: 'dp1', crm_rate_card: 'rc_se_2026', headcount: 1, start_month: '2026-06-01', estimate_amount: 5 });
    expect(cleared.estimate_amount).toBeNull();
    const fresh = await run(delivery, 'crm_labor_cost_line', { crm_cost_plan: 'dp1', crm_rate_card: 'rc_se_2026', headcount: 1, hours_per_month: 100, start_month: '2026-06-01' });
    expect(fresh.estimate_amount).toBeUndefined();
    const untouched = await run(bizcase(), 'crm_labor_cost_line', { notes: 'x' }, 'beforeUpdate', { id: 'l1', crm_cost_plan: 'bc1', crm_rate_card: 'rc_se_2026', headcount: 1, hours_per_month: 100, start_month: '2026-06-01', estimate_amount: 80_000 });
    expect(untouched.estimate_amount).toBeUndefined();
  });

  /**
   * The Bizcase figure and the delivery split are the SAME pricing: what the
   * executive approved is what the imported v1 splits, to the cent — the
   * frozen baseline read off the Bizcase equals the delivery plan's first
   * month total.
   */
  it('equals the sum of the months the same line splits into on a delivery plan', async () => {
    const decompose = hookNamed(costPlanHooks, 'cost_line_decompose');
    const lines: Array<[string, Rec]> = [
      ['crm_labor_cost_line', { id: 'l1', description: 'SE', crm_rate_card: 'rc_se_2026', headcount: 2, hours_per_month: 160, start_month: '2026-06-01', end_month: '2026-08-01' }],
      ['crm_service_cost_line', { id: 's1', description: '分包', pricing_basis: 'per_month', unit_price: 62_500, headcount: 2, duration: 3, start_month: '2026-08-01' }],
      ['crm_procurement_cost_line', { id: 'p1', description: '云资源', quantity: 1, unit_price: 100_000, start_month: '2026-09-01', end_month: '2026-11-01' }],
      ['crm_expense_cost_line', { id: 'e1', description: '差旅', expense_type: 'travel', crm_travel_standard: 'ts_1', trips: 4, travelers: 2, days: 3, start_month: '2026-08-01', end_month: '2026-09-01' }],
    ];
    for (const [object, line] of lines) {
      const split = makeHarness({ ...cards(), crm_cost_plan: [{ id: 'dp1', crm_delivery_project: 'dlv_1', phase: 'delivery' }] });
      const asDelivery = { ...line, crm_cost_plan: 'dp1' };
      await decompose.handler(withObject(withResult(makeCtx({ event: 'afterInsert', input: asDelivery, user: USER, api: split.api }), asDelivery), object));
      const months = Math.round(split.rows('crm_cost_plan_month').reduce((s, r) => s + (r.amount as number), 0) * 100) / 100;
      const estimated = await run(bizcase(), object, { ...line, crm_cost_plan: 'bc1' });
      expect(estimated.estimate_amount, object).toBe(months);
    }
  });
});

describe('cost_plan_month_fill', () => {
  const hook = hookNamed(costPlanHooks, 'cost_plan_month_fill');

  it('normalises the month, pairs the category to the line lookup, derives the amount and the unique key', async () => {
    const input: Rec = { crm_cost_plan: 'cp1', crm_procurement_cost_line: 'p1', period_month: '2026-08-17', headcount: 1, quantity: 6, unit_price: 30_000 };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER }));
    expect(input.period_month).toBe('2026-08-01');
    expect(input.category).toBe('procurement');
    expect(input.amount).toBe(180_000);
    expect(input.allocation_key).toBe('procurement:p1:2026-08');
    expect(input.description).toBe('procurement · 2026-08');
  });

  it('marks a month a person re-priced as 手工调整, and leaves the decomposition\'s explicit flag alone', async () => {
    const typed: Rec = { amount: 99 };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input: typed, previous: { crm_labor_cost_line: 'l1', period_month: '2026-06-01', amount: 100 }, user: USER }));
    expect(typed.is_manual).toBe(true);
    const generated: Rec = { amount: 99, is_manual: false };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input: generated, previous: { crm_labor_cost_line: 'l1', period_month: '2026-06-01', amount: 100 }, user: USER }));
    expect(generated.is_manual).toBe(false);
  });
});

describe('cost_plan_lock', () => {
  const hook = hookNamed(costPlanHooks, 'cost_plan_lock');
  const plans = (status: string) => ({ crm_cost_plan: [{ id: 'cp1', name: '一期计划', approval_status: status }] });

  it('lets a draft plan\'s lines be written, and refuses once the plan is approved', async () => {
    const draft = makeHarness(plans('draft'));
    await expect(hook.handler(withObject(makeCtx({ event: 'beforeInsert', input: { crm_cost_plan: 'cp1' }, user: USER, api: draft.api }), 'crm_labor_cost_line'))).resolves.toBeUndefined();
    const approved = makeHarness(plans('approved'));
    const err = await hook.handler(withObject(makeCtx({ event: 'beforeUpdate', input: { headcount: 3 }, previous: { crm_cost_plan: 'cp1' }, user: USER, api: approved.api }), 'crm_labor_cost_line')).then(() => null, (e: Error) => e);
    expect(err).toBeInstanceOf(Error);
    expect((err as Rec).code).toBe('RECORD_LOCKED');
    expect((err as Rec).status).toBe(409);
    expect((err as Rec).userMessage).toContain('一期计划');
  });

  it('passes a system write — seed replay and the approval flow — on any status', async () => {
    const h = makeHarness(plans('superseded'));
    await expect(hook.handler(withObject(makeCtx({ event: 'beforeInsert', input: { crm_cost_plan: 'cp1' }, session: { isSystem: true }, api: h.api }), 'crm_cost_plan_month'))).resolves.toBeUndefined();
  });
});

describe('cost_plan_defaults', () => {
  const hook = hookNamed(costPlanHooks, 'cost_plan_defaults');

  it('numbers the version, sets the phase from the project, and retires the version a new current one replaces', async () => {
    const h = makeHarness({ crm_cost_plan: [{ id: 'v1', crm_delivery_project: 'dlv_1', version_no: 1, is_current: true, approval_status: 'approved' }] });
    const input: Rec = { crm_delivery_project: 'dlv_1', is_current: true };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.phase).toBe('delivery');
    expect(input.version_no).toBe(2);
    expect(h.rows('crm_cost_plan')[0]).toMatchObject({ id: 'v1', is_current: false, approval_status: 'superseded' });
  });

  it('refuses a change to a frozen baseline', async () => {
    const err = await hook.handler(makeCtx({ event: 'beforeUpdate', input: { baseline_total: 5 }, previous: { id: 'v1', name: '一期计划', baseline_total: 1_000_000 }, user: USER })).then(() => null, (e: Error) => e);
    expect((err as Rec)?.code).toBe('RECORD_LOCKED');
  });

  /**
   * 售前成本计划审批通过后，售前项目的成本测算与报价要读到它 (2026-09-16): the
   * presales project rolls up the CURRENT Bizcase only, and nothing but this
   * flip ever made an approved Bizcase current — there is no step-32
   * adjustment on a presales project.
   */
  it('puts an approved Bizcase in force — the approval flow\'s stamp — and retires the Bizcase it replaces', async () => {
    const h = makeHarness({ crm_cost_plan: [
      { id: 'b1', crm_presales_project: 'psp_1', version_no: 1, is_current: true, approval_status: 'approved' },
      { id: 'b2', crm_presales_project: 'psp_1', version_no: 2, is_current: false, approval_status: 'pending' },
    ] });
    const input: Rec = { approval_status: 'approved', approved_date: '2026-09-16T00:00:00.000Z' };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input, previous: { id: 'b2', crm_presales_project: 'psp_1', version_no: 2, is_current: false, approval_status: 'pending' }, session: { isSystem: true }, api: h.api }));
    expect(input.is_current).toBe(true);
    expect(h.rows('crm_cost_plan')[0]).toMatchObject({ id: 'b1', is_current: false, approval_status: 'superseded' });
  });

  it('does not touch the version flag on a rejection, on a re-stamp, or when the write names it', async () => {
    const h = makeHarness({ crm_cost_plan: [] });
    const rejected: Rec = { approval_status: 'rejected' };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input: rejected, previous: { id: 'b2', crm_presales_project: 'psp_1', approval_status: 'pending' }, session: { isSystem: true }, api: h.api }));
    expect(rejected.is_current).toBeUndefined();
    const restamp: Rec = { approval_status: 'approved' };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input: restamp, previous: { id: 'b2', crm_presales_project: 'psp_1', approval_status: 'approved', is_current: false }, session: { isSystem: true }, api: h.api }));
    expect(restamp.is_current).toBeUndefined();
    const explicit: Rec = { approval_status: 'approved', is_current: false };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input: explicit, previous: { id: 'b2', crm_presales_project: 'psp_1', approval_status: 'pending' }, session: { isSystem: true }, api: h.api }));
    expect(explicit.is_current).toBe(false);
  });

  it('leaves a delivery version to the budget adjustment that names it (step 32)', async () => {
    const h = makeHarness({ crm_cost_plan: [{ id: 'v1', crm_delivery_project: 'dlv_1', is_current: true, approval_status: 'approved' }] });
    const input: Rec = { approval_status: 'approved' };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input, previous: { id: 'v2', crm_delivery_project: 'dlv_1', is_current: false, approval_status: 'pending' }, session: { isSystem: true }, api: h.api }));
    expect(input.is_current).toBeUndefined();
    expect(h.rows('crm_cost_plan')[0]).toMatchObject({ id: 'v1', is_current: true, approval_status: 'approved' });
  });
});

describe('budget_adjustment_amount', () => {
  const hook = hookNamed(costPlanHooks, 'budget_adjustment_amount');

  it('reads the amount off the named version minus the version in force', async () => {
    const h = makeHarness({ crm_cost_plan: [
      { id: 'v1', crm_delivery_project: 'dlv_1', is_current: true, planned_month_total: 1_000_000 },
      { id: 'v2', crm_delivery_project: 'dlv_1', is_current: false, planned_month_total: 1_150_000 },
    ] });
    const input: Rec = { crm_cost_plan: 'v2', reason: 'scope_change' };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.amount).toBe(150_000);
    expect(input.crm_delivery_project).toBe('dlv_1');
  });
});

describe('cost_line_rate_fill', () => {
  const hook = hookNamed(costPlanHooks, 'cost_line_rate_fill');

  it('copies the hourly rate from the card the labor line names, and re-copies when the card changes', async () => {
    const h = makeHarness(cards());
    const input: Rec = { crm_rate_card: 'rc_se_h2', headcount: 2 };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.hourly_rate).toBe(840);
    const untouched: Rec = { headcount: 3 };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input: untouched, previous: { crm_rate_card: 'rc_se_h2', hourly_rate: 840 }, user: USER, api: h.api }));
    expect(untouched.hourly_rate).toBeUndefined();
  });
});

describe('budget_adjustment_version_flip', () => {
  const hook = hookNamed(costPlanHooks, 'budget_adjustment_version_flip');

  it('puts the named version in force once the adjustment is approved, and only then', async () => {
    const h = makeHarness({ crm_cost_plan: [{ id: 'v2', is_current: false, approval_status: 'draft' }] });
    await hook.handler(makeCtx({ event: 'afterUpdate', input: { approval_status: 'pending' }, previous: { crm_cost_plan: 'v2', approval_status: 'submitted' }, user: USER, api: h.api }));
    expect(h.rows('crm_cost_plan')[0]).toMatchObject({ is_current: false, approval_status: 'draft' });
    await hook.handler(makeCtx({ event: 'afterUpdate', input: { approval_status: 'approved' }, previous: { crm_cost_plan: 'v2', approval_status: 'pending' }, session: { isSystem: true }, api: h.api }));
    expect(h.rows('crm_cost_plan')[0]).toMatchObject({ is_current: true, approval_status: 'approved' });
  });
});

describe('cost_plan_compare', () => {
  const hook = hookNamed(costPlanHooks, 'cost_plan_compare');

  /** Two versions of one delivery project's plan: v1 in force, v2 the draft under review. */
  const versions = () => ({ crm_cost_plan: [
    { id: 'v1', crm_delivery_project: 'dlv_1', is_current: true, approval_status: 'approved',
      baseline_total: 1_000_000, planned_month_total: 1_000_000, labor_month_total: 700_000, service_month_total: 150_000, procurement_month_total: 100_000, expense_month_total: 50_000, travel_month_total: 30_000 },
    { id: 'v2', crm_delivery_project: 'dlv_1', is_current: false, approval_status: 'draft',
      baseline_total: 1_000_000, planned_month_total: 1_150_000, labor_month_total: 780_000, service_month_total: 180_000, procurement_month_total: 130_000, expense_month_total: 60_000, travel_month_total: 42_000 },
  ] });

  it('snapshots every amount of the version in force when the plan is submitted', async () => {
    const h = makeHarness(versions());
    const input: Rec = { approval_status: 'submitted' };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input, previous: { id: 'v2', crm_delivery_project: 'dlv_1', approval_status: 'draft' }, user: USER, api: h.api }));
    expect(input).toEqual({
      approval_status: 'submitted',
      compare_plan: 'v1',
      current_baseline_total: 1_000_000,
      current_planned_total: 1_000_000,
      current_labor_total: 700_000,
      current_service_total: 150_000,
      current_procurement_total: 100_000,
      current_expense_total: 50_000,
      current_travel_total: 30_000,
    });
  });

  it('compares a plan that is ITSELF the version in force with itself, so every difference reads 0', async () => {
    // 当前版本 = 自己：the approver asked for the difference against the plan
    // marked 当前版本, and on a project's first version that IS this row. So the
    // snapshot is the row's own amounts and the comparison reads 0 — not a
    // full-amount increase against an absent version.
    // A Bizcase carries its amounts on the line side of the pair — no month rows at all.
    const h = makeHarness({ crm_cost_plan: [{ id: 'v1', crm_presales_project: 'pre_1', is_current: true, labor_line_total: 720_000, expense_line_total: 80_000, travel_line_total: 30_000 }] });
    const input: Rec = { approval_status: 'submitted' };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input, previous: { id: 'v1', crm_presales_project: 'pre_1', approval_status: 'draft' }, user: USER, api: h.api }));
    expect(input.compare_plan).toBe('v1');
    expect(input.current_planned_total).toBe(800_000);
    expect(input.current_travel_total).toBe(30_000);
  });

  it('leaves the comparison empty when the project has no version in force', async () => {
    const h = makeHarness({ crm_cost_plan: [{ id: 'v1', crm_presales_project: 'pre_1', is_current: false, approval_status: 'superseded', labor_line_total: 800_000 }] });
    const input: Rec = { approval_status: 'submitted' };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input, previous: { id: 'v2', crm_presales_project: 'pre_1', approval_status: 'draft' }, user: USER, api: h.api }));
    expect(input.compare_plan).toBeNull();
    expect(input.current_planned_total).toBe(0);
    expect(input.current_travel_total).toBe(0);
  });

  it('writes nothing on a status that is not the submit transition', async () => {
    const h = makeHarness(versions());
    for (const [status, previousStatus] of [['approved', 'pending'], ['rejected', 'pending'], ['submitted', 'submitted']] as const) {
      const input: Rec = { approval_status: status };
      await hook.handler(makeCtx({ event: 'beforeUpdate', input, previous: { id: 'v2', crm_delivery_project: 'dlv_1', approval_status: previousStatus }, user: USER, api: h.api }));
      expect(input).toEqual({ approval_status: status });
    }
  });
});

/**
 * The approver reads a DIFFERENCE, and the difference is a formula over the
 * pair beside it — the version's own amount and the snapshot
 * `cost_plan_compare` took of the version in force. Asserting the hook's
 * snapshot alone would leave the half the approver actually decides on
 * unmeasured, so the formulas are evaluated over the row the hook produced.
 */
describe('the comparison a leader approves on', () => {
  // A stored row carries every summary column, null until the first child
  // lands; a fixture that names only the columns it sets would make strict
  // CEL abort on the absent key (`No such key`), which no real row ever has.
  const COLUMNS: Rec = Object.fromEntries(['planned', 'labor', 'service', 'procurement', 'expense', 'travel'].flatMap((k) => [[k + '_month_total', null], [k + '_line_total', null]]).filter(([k]) => k !== 'planned_line_total'));
  const evalFormula = (field: string, record: Rec): number => {
    const expression = (CostPlan as Rec).fields?.[field]?.expression;
    const source = String((expression as Rec)?.source ?? expression);
    const result = ExpressionEngine.evaluate({ dialect: 'cel', source }, { record: { ...COLUMNS, ...record } }) as { ok?: boolean; value?: unknown };
    expect(result?.ok, `${field} did not evaluate: ${JSON.stringify(result)}`).toBe(true);
    return Number(result?.value);
  };

  it('每一项金额的差异 = 本次审批数据 − 当前执行的成本计划', async () => {
    const hook = hookNamed(costPlanHooks, 'cost_plan_compare');
    const submitted = {
      id: 'v2', crm_delivery_project: 'dlv_1', approval_status: 'draft',
      baseline_total: 1_000_000, planned_month_total: 1_150_000, labor_month_total: 780_000, service_month_total: 180_000, procurement_month_total: 130_000, expense_month_total: 60_000, travel_month_total: 42_000,
    };
    const h = makeHarness({ crm_cost_plan: [
      { id: 'v1', crm_delivery_project: 'dlv_1', is_current: true, approval_status: 'approved',
        baseline_total: 1_000_000, planned_month_total: 1_000_000, labor_month_total: 700_000, service_month_total: 150_000, procurement_month_total: 100_000, expense_month_total: 50_000, travel_month_total: 30_000 },
      submitted,
    ] });
    const input: Rec = { approval_status: 'submitted' };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input, previous: submitted, user: USER, api: h.api }));

    const row: Rec = { ...submitted, ...input };
    expect(evalFormula('delta_baseline_total', row)).toBe(0);
    expect(evalFormula('delta_planned_total', row)).toBe(150_000);
    expect(evalFormula('delta_labor_total', row)).toBe(80_000);
    expect(evalFormula('delta_service_total', row)).toBe(30_000);
    expect(evalFormula('delta_procurement_total', row)).toBe(30_000);
    expect(evalFormula('delta_expense_total', row)).toBe(10_000);
    expect(evalFormula('delta_travel_total', row)).toBe(12_000);
    expect(evalFormula('delta_planned_pct', row)).toBe(15);
  });

  it('当前版本为自己时，每一项差异都是 0', async () => {
    const hook = hookNamed(costPlanHooks, 'cost_plan_compare');
    // A Bizcase this time: the amounts sit on the line side of every pair.
    const inForce = {
      id: 'v1', crm_presales_project: 'pre_1', is_current: true, approval_status: 'draft',
      baseline_total: 1_054_320, labor_line_total: 1_168_000, service_line_total: 250_000, procurement_line_total: 100_000, expense_line_total: 48_320, travel_line_total: 28_320,
    };
    const h = makeHarness({ crm_cost_plan: [inForce] });
    const input: Rec = { approval_status: 'submitted' };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input, previous: inForce, user: USER, api: h.api }));

    const row: Rec = { ...inForce, ...input };
    for (const field of ['delta_baseline_total', 'delta_planned_total', 'delta_labor_total', 'delta_service_total', 'delta_procurement_total', 'delta_expense_total', 'delta_travel_total', 'delta_planned_pct']) {
      expect(evalFormula(field, row), field).toBe(0);
    }
  });

  it('每个可见合计 = 月度分解台账 + 明细行估算，两边只有一边非零', () => {
    const bizcase = { labor_line_total: 720_000, service_line_total: 150_000, procurement_line_total: 50_000, expense_line_total: 80_000, travel_line_total: 30_000 };
    expect(evalFormula('planned_total', bizcase)).toBe(1_000_000);
    expect(evalFormula('labor_total', bizcase)).toBe(720_000);
    expect(evalFormula('travel_total', bizcase)).toBe(30_000);
    const delivery = { planned_month_total: 1_150_000, labor_month_total: 780_000, service_month_total: 180_000, procurement_month_total: 130_000, expense_month_total: 60_000, travel_month_total: 42_000 };
    expect(evalFormula('planned_total', delivery)).toBe(1_150_000);
    expect(evalFormula('expense_total', delivery)).toBe(60_000);
    expect(evalFormula('service_total', delivery)).toBe(180_000);
  });

  it('reads a reduction as a negative difference, and a plan with no version in force as zero-based', () => {
    expect(evalFormula('delta_planned_total', { planned_month_total: 900_000, current_planned_total: 1_000_000 })).toBe(-100_000);
    expect(evalFormula('delta_planned_pct', { planned_month_total: 900_000, current_planned_total: 1_000_000 })).toBe(-10);
    // No version in force: the whole amount IS the increase, and the rate reads 0 rather than dividing by zero.
    expect(evalFormula('delta_planned_total', { labor_line_total: 800_000, current_planned_total: 0 })).toBe(800_000);
    expect(evalFormula('delta_planned_pct', { labor_line_total: 800_000, current_planned_total: 0 })).toBe(0);
  });
});
