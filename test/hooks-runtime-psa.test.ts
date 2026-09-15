// Copyright (c) 2026 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect } from 'vitest';
import timesheetHooks from '../src/objects/timesheet.hook';
import costPlanLineHooks from '../src/objects/cost_plan_line.hook';
import presalesProjectHooks from '../src/objects/presales_project.hook';
import deliveryProjectHooks from '../src/objects/delivery_project.hook';
import leaveRequestHooks from '../src/objects/leave_request.hook';
import businessTripHooks from '../src/objects/business_trip.hook';
import travelCostHooks from '../src/objects/travel_cost.hook';
import opportunityHooks from '../src/objects/opportunity.hook';
import { makeHarness, makeCtx, hookNamed, type Rec } from './helpers/hook-harness';

/**
 * Runtime tests for the PSA-side hooks (project-type sales demo, epic #2) —
 * the real handler bodies against the in-memory data layer, the same way
 * `hooks-runtime-sales.test.ts` covers the sales side.
 *
 * Every hook here is a derivation or a gate the customer's 40-step process
 * names: cost from hours × rate (step 34), the over-budget block (36), the
 * Bizcase baseline and its cost plan (27), leave hours on a timesheet (33),
 * trip days and the unapproved-trip block (35), the account a presales project
 * takes from its opportunity (15), and the account classification / EAR gates
 * on a new opportunity (steps 1 and 3).
 */

const USER = { id: 'user_1' };

// ─────────────────────────────────────────────────────────── timesheet ──

/**
 * An `afterInsert` ctx as the engine hands it to the carry hook: the routed
 * ctx from `makeCtx`, plus the `result` the insert produced. Built here rather
 * than as a literal so `ctx.input` keeps the flat-record Proxy shape
 * (`test/hook-input-shape.test.ts`, rule A).
 */
const withResult = (ctx: Rec, result: Rec): Rec => Object.assign(ctx, { result });

describe('timesheet_cost_fill', () => {
  const hook = hookNamed(timesheetHooks, 'timesheet_cost_fill');

  it('writes cost = hours × hourly_rate on insert', async () => {
    const input: Rec = { hours: 8, hourly_rate: 800 };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER }));
    expect(input.cost).toBe(6_400);
  });

  it('recomputes from the stored row when only the hours change', async () => {
    const input: Rec = { hours: 10 };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input, previous: { hourly_rate: 900 }, user: USER }));
    expect(input.cost).toBe(9_000);
  });
});

describe('timesheet_rate_fill', () => {
  const hook = hookNamed(timesheetHooks, 'timesheet_rate_fill');

  it('takes the hourly rate from the rate card the sheet names, and recomputes cost', async () => {
    const h = makeHarness({ crm_rate_card: [{ id: 'rc_pm', hourly_rate: 900 }] });
    const input: Rec = { crm_rate_card: 'rc_pm', hours: 160 };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.hourly_rate).toBe(900);
    expect(input.cost).toBe(144_000);
  });

  /**
   * ⭐ REVERSES the pin that stood here ("leaves an explicitly written rate
   * alone"). Customer ruling: 「计算人工成本时使用的费率从选择的岗位级别 /
   * 费率卡中获取。」 — the card is the rate's source, so a rate on the payload
   * is not an author's choice to respect. It was also the DEFECT: the create
   * form carried an empty `费率标准` box, so every sheet posted
   * `hourly_rate: 0`, the old guard read that as "explicitly written" and
   * priced the sheet at zero. The box is gone from the form and both columns
   * are `readonly: true` now (`test/timesheet-derived-price-surface.test.ts`),
   * so the value the engine would strip anyway no longer reaches the price.
   */
  it('prices by the card even when the payload carries a rate of its own', async () => {
    const h = makeHarness({ crm_rate_card: [{ id: 'rc_pm', hourly_rate: 900 }] });
    const input: Rec = { crm_rate_card: 'rc_pm', hours: 10, hourly_rate: 500 };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.hourly_rate).toBe(900);
    expect(input.cost).toBe(9_000);
  });

  /** The empty-form payload the narrowing retired, priced correctly anyway. */
  it('a zero on the payload never reaches the price', async () => {
    const h = makeHarness({ crm_rate_card: [{ id: 'rc_eng', hourly_rate: 600 }] });
    const input: Rec = { crm_rate_card: 'rc_eng', hours: 3, hourly_rate: 0, cost: 0 };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.hourly_rate).toBe(600);
    expect(input.cost).toBe(1_800);
  });

  /**
   * The snapshot the docs promise — 「费率卡改了只影响新表，不动已审批的历史」.
   * The sheet keeps the card it already priced against, so a later edit of the
   * card's own `hourly_rate` does not reprice it.
   */
  it('keeps the rate a sheet already priced itself at when the card is unchanged', async () => {
    const h = makeHarness({ crm_rate_card: [{ id: 'rc_pm', hourly_rate: 1_100 }] });
    const input: Rec = { hours: 20 };
    const previous: Rec = { crm_rate_card: 'rc_pm', hourly_rate: 900 };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input, previous, user: USER, api: h.api }));
    expect(input.hourly_rate).toBe(900);
    expect(input.cost).toBe(18_000);
  });

  /** Picking a DIFFERENT card is the write that reprices. */
  it('reprices when the write picks another card', async () => {
    const h = makeHarness({ crm_rate_card: [{ id: 'rc_pm', hourly_rate: 900 }, { id: 'rc_arch', hourly_rate: 1_000 }] });
    const input: Rec = { crm_rate_card: 'rc_arch' };
    const previous: Rec = { crm_rate_card: 'rc_pm', hourly_rate: 900, hours: 10 };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input, previous, user: USER, api: h.api }));
    expect(input.hourly_rate).toBe(1_000);
    expect(input.cost).toBe(10_000);
  });

  /**
   * A sheet priced some other way — the seeded rows that carry `hourly_rate`
   * and no card — keeps its own rate. Without this branch the hook would zero
   * every one of them (`src/data/psa.seed.ts`).
   */
  it('leaves a sheet that names no rate card alone', async () => {
    const h = makeHarness({ crm_rate_card: [{ id: 'rc_pm', hourly_rate: 900 }] });
    const input: Rec = { hours: 160, hourly_rate: 800 };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.hourly_rate).toBe(800);
    expect(input.cost).toBeUndefined();
  });
});

describe('timesheet_attendance_sync', () => {
  const hook = hookNamed(timesheetHooks, 'timesheet_attendance_sync');

  it('sums approved leave inside the month (working days × 8) and derives draft hours and cost', async () => {
    const h = makeHarness({
      crm_leave_request: [
        { id: 'lv_1', owner_id: 'user_1', approval_status: 'approved', start_date: '2026-09-07', end_date: '2026-09-08' },
        { id: 'lv_2', owner_id: 'user_1', approval_status: 'draft', start_date: '2026-09-14', end_date: '2026-09-14' },
        { id: 'lv_3', owner_id: 'user_2', approval_status: 'approved', start_date: '2026-09-21', end_date: '2026-09-21' },
      ],
    });
    const input: Rec = { owner_id: 'user_1', period_month: '2026-09-01', standard_hours: 176, overtime_hours: 0, approval_status: 'draft', hourly_rate: 900 };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.leave_hours).toBe(16);
    expect(input.hours).toBe(160);
    expect(input.cost).toBe(144_000);
  });

  it('keeps the hours of an approved sheet — only the leave figure follows', async () => {
    const h = makeHarness({
      crm_leave_request: [{ id: 'lv_1', owner_id: 'user_1', approval_status: 'approved', start_date: '2026-09-07', end_date: '2026-09-08' }],
    });
    const input: Rec = { leave_hours: 0 };
    const previous: Rec = { owner_id: 'user_1', period_month: '2026-09-01', standard_hours: 176, hours: 176, approval_status: 'approved', hourly_rate: 900, leave_hours: 0 };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input, previous, user: USER, api: h.api }));
    expect(input.leave_hours).toBe(16);
    expect(input.hours).toBeUndefined();
  });
});

describe('timesheet_budget_gate', () => {
  const hook = hookNamed(timesheetHooks, 'timesheet_budget_gate');
  const store = () => ({
    crm_delivery_project: [{ id: 'dlv_1', name: '试点交付', budget_baseline: 200_000 }],
    crm_timesheet: [{ id: 'ts_1', crm_delivery_project: 'dlv_1', cost: 128_000 }],
    crm_travel_cost: [{ id: 'tc_1', crm_delivery_project: 'dlv_1', amount: 8_000 }],
  });

  it('lets a sheet through while the project is under its baseline', async () => {
    const h = makeHarness(store());
    await expect(hook.handler(makeCtx({ event: 'beforeInsert', input: { crm_delivery_project: 'dlv_1' }, user: USER, api: h.api }))).resolves.toBeUndefined();
  });

  it('refuses a sheet once actual cost meets the baseline — invalid_value, with the numbers in the sentence', async () => {
    const s = store();
    s.crm_timesheet.push({ id: 'ts_2', crm_delivery_project: 'dlv_1', cost: 128_000 });
    const h = makeHarness(s);
    const err = await hook.handler(makeCtx({ event: 'beforeInsert', input: { crm_delivery_project: 'dlv_1' }, user: USER, api: h.api })).catch((e: unknown) => e) as Rec;
    expect(err).toBeInstanceOf(Error);
    expect([err.code, err.status]).toEqual(['VALIDATION_FAILED', 400]);
    expect(String(err.userMessage)).toContain('试点交付');
    expect(String(err.userMessage)).toContain('264,000');
  });

  it('ignores a sheet with no project or a project with no baseline', async () => {
    const h = makeHarness({ crm_delivery_project: [{ id: 'dlv_0', name: 'x', budget_baseline: 0 }] });
    await expect(hook.handler(makeCtx({ event: 'beforeInsert', input: {}, user: USER, api: h.api }))).resolves.toBeUndefined();
    await expect(hook.handler(makeCtx({ event: 'beforeInsert', input: { crm_delivery_project: 'dlv_0' }, user: USER, api: h.api }))).resolves.toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────── cost plan line ──

describe('cost_plan_line_fill', () => {
  const hook = hookNamed(costPlanLineHooks, 'cost_plan_line_fill');

  it('takes the unit price from the rate card and multiplies it out', async () => {
    const h = makeHarness({ crm_rate_card: [{ id: 'rc_se', hourly_rate: 800 }] });
    const input: Rec = { crm_rate_card: 'rc_se', quantity: 160 };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.unit_price).toBe(800);
    expect(input.planned_amount).toBe(128_000);
  });

  it('leaves a planned amount the caller wrote alone', async () => {
    const h = makeHarness();
    const input: Rec = { quantity: 2, unit_price: 25_000, planned_amount: 40_000 };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.planned_amount).toBe(40_000);
  });
});

// ───────────────────────────────────────────────────── presales project ──

/**
 * 所属客户 is DERIVED from 关联商机 (spec step 15, 「所属客户跟着带出」) — the
 * write half of the same rule `crm_presales_project.crm_opportunity`'s
 * `lookupFilters` scopes the picker with (pinned in
 * `test/presales-project-opportunity-gate.test.ts`).
 */
describe('presales_project_account_carry', () => {
  const hook = hookNamed(presalesProjectHooks, 'presales_project_account_carry');
  const deals = () => ({
    crm_opportunity: [
      { id: 'opp_1', name: '华信核心系统升级', crm_account: 'acc_1' },
      { id: 'opp_2', name: '北辰 MES 二期', crm_account: 'acc_2' },
    ],
  });

  it('fills a blank account from the opportunity on insert', async () => {
    const h = makeHarness(deals());
    const input: Rec = { name: '售前项目1', crm_opportunity: 'opp_1' };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.crm_account).toBe('acc_1');
  });

  it('leaves an account the write names alone', async () => {
    const h = makeHarness(deals());
    const input: Rec = { name: '售前项目1', crm_opportunity: 'opp_1', crm_account: 'acc_9' };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.crm_account).toBe('acc_9');
  });

  it('follows a re-pointed opportunity when the stored account was the old one’s', async () => {
    const h = makeHarness(deals());
    const input: Rec = { crm_opportunity: 'opp_2' };
    const previous: Rec = { id: 'psp_1', crm_opportunity: 'opp_1', crm_account: 'acc_1' };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input, previous, user: USER, api: h.api }));
    expect(input.crm_account).toBe('acc_2');
  });

  it('keeps a hand-picked account when the opportunity is re-pointed', async () => {
    const h = makeHarness(deals());
    const input: Rec = { crm_opportunity: 'opp_2' };
    const previous: Rec = { id: 'psp_1', crm_opportunity: 'opp_1', crm_account: 'acc_7' };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input, previous, user: USER, api: h.api }));
    expect(input.crm_account).toBeUndefined();
  });

  it('fills a blank account on an update that does not name the opportunity', async () => {
    const h = makeHarness(deals());
    const input: Rec = { quote_amount: 1_400_000 };
    const previous: Rec = { id: 'psp_1', crm_opportunity: 'opp_1' };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input, previous, user: USER, api: h.api }));
    expect(input.crm_account).toBe('acc_1');
  });

  it('writes nothing when the opportunity carries no account of its own', async () => {
    const h = makeHarness({ crm_opportunity: [{ id: 'opp_3', name: '待补客户' }] });
    const input: Rec = { name: '售前项目1', crm_opportunity: 'opp_3' };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.crm_account).toBeUndefined();
  });
});

// ───────────────────────────────────────────────────── delivery project ──

const bizcase = () => ({
  crm_presales_project: [{ id: 'psp_1', project_number: 'PSP-0001', approval_status: 'approved', labor_cost: 600_000, third_party_service_cost: 250_000, procurement_cost: 100_000, project_expense: 50_000, crm_opportunity: 'opp_1', crm_account: 'acc_1' }],
  crm_contract: [{ id: 'ctr_1', contract_value: 1_400_000, crm_account: 'acc_1' }],
  crm_cost_plan_line: [] as Rec[],
});

describe('delivery_project_defaults', () => {
  const hook = hookNamed(deliveryProjectHooks, 'delivery_project_defaults');

  it('carries the Bizcase total as the baseline, and the contract value as the contract amount', async () => {
    const h = makeHarness(bizcase());
    const input: Rec = { crm_presales_project: 'psp_1', crm_contract: 'ctr_1' };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.budget_baseline).toBe(1_000_000);
    expect(input.contract_amount).toBe(1_400_000);
    expect(input.crm_opportunity).toBe('opp_1');
    expect(input.crm_account).toBe('acc_1');
  });

  it('never overwrites a baseline or an amount the user typed', async () => {
    const h = makeHarness(bizcase());
    const input: Rec = { crm_presales_project: 'psp_1', crm_contract: 'ctr_1', budget_baseline: 500_000, contract_amount: 1 };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.budget_baseline).toBe(500_000);
    expect(input.contract_amount).toBe(1);
  });

  // ── the 商机 / 客户 half of the carry ───────────────────────────────────
  //
  // Asserted above as two lines inside the baseline case; the four below are
  // the cases that half has of its own. They exist because this is the pair a
  // creator WATCHES: the console create form resolves no lookup-driven
  // default, so picking the presales project leaves both pickers empty on
  // screen and the carry is invisible until the record is saved (measured on
  // the pinned 17.4.0, driving the real form). What answers "did it work?" is
  // therefore this hook, and nothing else.

  it('carries 商机 / 客户 when the form omits the keys entirely', async () => {
    // Exactly what the console posts when only the name and the presales
    // project are filled in: no `crm_opportunity` key at all.
    const h = makeHarness(bizcase());
    const input: Rec = { name: '华信核心系统升级 — 交付', status: 'planning', crm_presales_project: 'psp_1' };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.crm_opportunity).toBe('opp_1');
    expect(input.crm_account).toBe('acc_1');
  });

  it('treats a blank string the same as an absent key', async () => {
    // A form that posts every field it rendered sends `''`, not `undefined`.
    // `empty()` covers both, and this is the case that says so.
    const h = makeHarness(bizcase());
    const input: Rec = { crm_presales_project: 'psp_1', crm_opportunity: '', crm_account: '' };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.crm_opportunity).toBe('opp_1');
    expect(input.crm_account).toBe('acc_1');
  });

  it('never overwrites a 商机 / 客户 the user picked, or one already on the record', async () => {
    const h = makeHarness(bizcase());
    const typed: Rec = { crm_presales_project: 'psp_1', crm_opportunity: 'opp_typed', crm_account: 'acc_typed' };
    await hook.handler(makeCtx({ event: 'beforeInsert', input: typed, user: USER, api: h.api }));
    expect(typed.crm_opportunity).toBe('opp_typed');
    expect(typed.crm_account).toBe('acc_typed');

    // Re-pointing the presales project on an existing record does NOT re-carry
    // over values that are already there.
    const h2 = makeHarness(bizcase());
    const repointed: Rec = { crm_presales_project: 'psp_1' };
    await hook.handler(makeCtx({
      event: 'beforeUpdate',
      input: repointed,
      previous: { crm_opportunity: 'opp_old', crm_account: 'acc_old' },
      user: USER,
      api: h2.api,
    }));
    expect(repointed.crm_opportunity).toBeUndefined();
    expect(repointed.crm_account).toBeUndefined();
  });

  it('carries 商机 / 客户 from a presales project whose Bizcase is empty', async () => {
    // The baseline and the pair are independent claims: a presales project
    // that has not been costed yet still names the opportunity and the client,
    // and the creator still wants those two.
    const store = bizcase();
    Object.assign(store.crm_presales_project[0], {
      labor_cost: 0, third_party_service_cost: 0, procurement_cost: 0, project_expense: 0,
    });
    const h = makeHarness(store);
    const input: Rec = { crm_presales_project: 'psp_1' };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.crm_opportunity).toBe('opp_1');
    expect(input.crm_account).toBe('acc_1');
    expect(input.budget_baseline).toBeUndefined();
  });
});

describe('delivery_project_cost_plan_carry', () => {
  const hook = hookNamed(deliveryProjectHooks, 'delivery_project_cost_plan_carry');
  const created = { id: 'dlv_1', crm_presales_project: 'psp_1', budget_baseline: 1_000_000 };

  it('carries the four Bizcase figures as four plan lines on a user create', async () => {
    const h = makeHarness(bizcase());
    await hook.handler(withResult(makeCtx({ event: 'afterInsert', input: created, user: USER, api: h.api }), created));
    const lines = h.rows('crm_cost_plan_line');
    expect(lines.map((l) => [l.category, l.planned_amount])).toEqual([
      ['labor', 600_000], ['third_party_service', 250_000], ['procurement', 100_000], ['expense', 50_000],
    ]);
    expect(lines.every((l) => l.crm_delivery_project === 'dlv_1')).toBe(true);
  });

  it('carries nothing for a system write, an unapproved Bizcase, or a baseline that is not that total', async () => {
    const asSystem = makeHarness(bizcase());
    await hook.handler(withResult(makeCtx({ event: 'afterInsert', input: created, session: { isSystem: true }, api: asSystem.api }), created));
    expect(asSystem.rows('crm_cost_plan_line')).toHaveLength(0);

    const draft = bizcase(); draft.crm_presales_project[0].approval_status = 'draft';
    const h2 = makeHarness(draft);
    await hook.handler(withResult(makeCtx({ event: 'afterInsert', input: created, user: USER, api: h2.api }), created));
    expect(h2.rows('crm_cost_plan_line')).toHaveLength(0);

    const h3 = makeHarness(bizcase());
    const typed = { ...created, budget_baseline: 500_000 };
    await hook.handler(withResult(makeCtx({ event: 'afterInsert', input: typed, user: USER, api: h3.api }), typed));
    expect(h3.rows('crm_cost_plan_line')).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────── leave request ──

describe('leave_days_fill', () => {
  const hook = hookNamed(leaveRequestHooks, 'leave_days_fill');

  it('counts Monday to Friday only', async () => {
    const input: Rec = { start_date: '2026-09-07', end_date: '2026-09-13' }; // Mon → Sun
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER }));
    expect(input.days).toBe(5);
  });

  it('reads the other date off the stored row on a partial update, and is 0 for a weekend', async () => {
    const input: Rec = { end_date: '2026-09-13' };
    await hook.handler(makeCtx({ event: 'beforeUpdate', input, previous: { start_date: '2026-09-12' }, user: USER }));
    expect(input.days).toBe(0);
  });
});

describe('leave_timesheet_sync', () => {
  const hook = hookNamed(leaveRequestHooks, 'leave_timesheet_sync');

  it('re-saves the requester’s sheets for the months an approved leave touches, and no one else’s', async () => {
    const h = makeHarness({
      crm_timesheet: [
        { id: 'ts_sep', owner_id: 'user_1', period_month: '2026-09-01', leave_hours: 0 },
        { id: 'ts_aug', owner_id: 'user_1', period_month: '2026-08-01', leave_hours: 0 },
        { id: 'ts_other', owner_id: 'user_2', period_month: '2026-09-01', leave_hours: 0 },
      ],
    });
    const previous: Rec = { id: 'lv_1', owner_id: 'user_1', start_date: '2026-09-07', end_date: '2026-09-08', approval_status: 'submitted' };
    await hook.handler(makeCtx({ event: 'afterUpdate', input: { approval_status: 'approved' }, previous, user: USER, api: h.api }));
    expect(h.callsFor('crm_timesheet', 'update').map((c) => (c.args[0] as Rec).id)).toEqual(['ts_sep']);
  });

  it('does nothing while the leave is not approved and was not approved before', async () => {
    const h = makeHarness({ crm_timesheet: [{ id: 'ts_sep', owner_id: 'user_1', period_month: '2026-09-01', leave_hours: 0 }] });
    await hook.handler(makeCtx({ event: 'afterUpdate', input: { approval_status: 'submitted' }, previous: { owner_id: 'user_1', start_date: '2026-09-07', end_date: '2026-09-08', approval_status: 'draft' }, user: USER, api: h.api }));
    expect(h.callsFor('crm_timesheet', 'update')).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────── business trip / travel ──

describe('business_trip_days_fill', () => {
  const hook = hookNamed(businessTripHooks, 'business_trip_days_fill');

  it('counts calendar days, both ends inclusive', async () => {
    const input: Rec = { start_date: '2026-09-01', end_date: '2026-09-03' };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER }));
    expect(input.days).toBe(3);
  });
});

describe('travel_cost_trip_fill', () => {
  const hook = hookNamed(travelCostHooks, 'travel_cost_trip_fill');
  const trips = (status: string) => ({
    crm_business_trip: [{ id: 'trip_1', subject: '华信上线演练', approval_status: status, crm_delivery_project: 'dlv_1', owner_id: 'user_9', start_date: '2026-09-02' }],
  });

  it('defaults project, traveller and date from an approved trip', async () => {
    const h = makeHarness(trips('approved'));
    const input: Rec = { crm_business_trip: 'trip_1', amount: 1_200 };
    await hook.handler(makeCtx({ event: 'beforeInsert', input, user: USER, api: h.api }));
    expect(input.crm_delivery_project).toBe('dlv_1');
    expect(input.owner_id).toBe('user_9');
    expect(input.expense_date).toBe('2026-09-02');
  });

  it('refuses a cost on a trip that is not approved — invalid_value', async () => {
    const h = makeHarness(trips('draft'));
    const err = await hook.handler(makeCtx({ event: 'beforeInsert', input: { crm_business_trip: 'trip_1' }, user: USER, api: h.api })).catch((e: unknown) => e) as Rec;
    expect([err.code, err.status]).toEqual(['VALIDATION_FAILED', 400]);
    expect(String(err.userMessage)).toContain('华信上线演练');
  });
});

// ─────────────────────────────────────────────── opportunity account gate ──

describe('opportunity_account_classification_gate', () => {
  const hook = hookNamed(opportunityHooks, 'opportunity_account_classification_gate');
  const accounts = (classification: string, ear_status: string) => ({
    crm_account: [{ id: 'acc_1', name: '中招国际', classification, ear_status }],
  });

  it('refuses a new opportunity on a bidding-agency or other-class account — prohibited', async () => {
    for (const cls of ['bidding_agency', 'other']) {
      const h = makeHarness(accounts(cls, 'clear'));
      const err = await hook.handler(makeCtx({ event: 'beforeInsert', input: { crm_account: 'acc_1' }, user: USER, api: h.api })).catch((e: unknown) => e) as Rec;
      expect([err.code, err.status]).toEqual(['FORBIDDEN', 403]);
      expect(String(err.userMessage)).toContain('中招国际');
    }
  });

  it('refuses only a CONFIRMED EAR listing — a machine suspicion passes', async () => {
    const confirmed = makeHarness(accounts('regular_customer', 'confirmed'));
    const err = await hook.handler(makeCtx({ event: 'beforeInsert', input: { crm_account: 'acc_1' }, user: USER, api: confirmed.api })).catch((e: unknown) => e) as Rec;
    expect([err.code, err.status]).toEqual(['FORBIDDEN', 403]);
    const suspected = makeHarness(accounts('regular_customer', 'suspected'));
    await expect(hook.handler(makeCtx({ event: 'beforeInsert', input: { crm_account: 'acc_1' }, user: USER, api: suspected.api }))).resolves.toBeUndefined();
  });
});
