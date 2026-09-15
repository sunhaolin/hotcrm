// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect } from 'vitest';
import deliveryProjectHooks from '../src/objects/delivery_project.hook';
import { makeHarness, makeCtx, hookNamed, type Rec } from './helpers/hook-harness';

/**
 * Runtime coverage for `delivery_project_defaults` — the carry a creator of a
 * 交付项目 actually sees.
 *
 * ## Why this file exists
 *
 * The hook was registered and never exercised: nothing in `test/` named
 * `crm_delivery_project`, so "选择关联售前项目后自动带入关联商机/所属客户" was a
 * claim held up by a `description` string and an entry in the hooks barrel.
 * The cases below run the real handler body and assert the three values the
 * carry writes, plus the three guards that decide when it does NOT write.
 *
 * ## What it does NOT claim
 *
 * The carry lands on SAVE (`beforeInsert` / `beforeUpdate`) — it is a hook, so
 * that is the only moment it can land. The console's create form has no
 * lookup-driven default of its own, so 关联商机 / 所属客户 stay blank ON SCREEN
 * from the moment the presales project is picked until the record is created;
 * a form-time fill would be a platform form-runtime capability, and per
 * AGENTS.md ("HotCRM is a metadata application") it is not compensated for
 * here. Measured on the pinned 17.4.0 by driving the real console form: picking
 * a presales project issues no default-resolving request, and the pair is still
 * empty; the record that comes back from `POST /api/v1/data/crm_delivery_project`
 * carries both. These tests pin the second half — the half this repo owns.
 */

const USER = { id: 'user_1' };

/** 华信核心系统升级 — 售前, shaped the way the seed writes one. */
const presalesRow = (over: Rec = {}): Rec => ({
  id: 'psp_1',
  project_number: 'PSP-0001',
  approval_status: 'approved',
  crm_opportunity: 'opp_1',
  crm_account: 'acc_1',
  labor_cost: 600_000,
  third_party_service_cost: 250_000,
  procurement_cost: 100_000,
  project_expense: 50_000,
  ...over,
});

describe('delivery_project_defaults', () => {
  const hook = hookNamed(deliveryProjectHooks, 'delivery_project_defaults');

  const run = async (input: Rec, opts: { previous?: Rec; store?: Record<string, Rec[]> } = {}) => {
    const store = opts.store ?? { crm_presales_project: [presalesRow()] };
    const { api } = makeHarness(store);
    const ctx = makeCtx({
      event: opts.previous ? 'beforeUpdate' : 'beforeInsert',
      input,
      previous: opts.previous,
      user: USER,
      api,
    });
    await hook.handler(ctx);
    return ctx.input as Rec;
  };

  it('carries opportunity, account and the Bizcase baseline from the presales project on create', async () => {
    // Exactly what the console's create form posts when only the name and the
    // presales project are filled in — no `crm_opportunity` key at all.
    const written = await run({ name: '华信核心系统升级 — 交付', status: 'planning', crm_presales_project: 'psp_1' });

    expect(written.crm_opportunity).toBe('opp_1');
    expect(written.crm_account).toBe('acc_1');
    // 600,000 + 250,000 + 100,000 + 50,000 — the four presales cost columns,
    // the same sum `total_cost` inlines as a formula on the presales project.
    expect(written.budget_baseline).toBe(1_000_000);
  });

  it('treats a blank string the same as an absent key', async () => {
    // A form that posts every field it rendered sends `''`, not `undefined`.
    // `empty()` covers both, and this is the case that says so.
    const written = await run({ name: '交付', crm_presales_project: 'psp_1', crm_opportunity: '', crm_account: '' });

    expect(written.crm_opportunity).toBe('opp_1');
    expect(written.crm_account).toBe('acc_1');
  });

  it('never overwrites what the creator typed', async () => {
    const written = await run({
      name: '交付',
      crm_presales_project: 'psp_1',
      crm_opportunity: 'opp_typed',
      crm_account: 'acc_typed',
      budget_baseline: 42,
    });

    expect(written.crm_opportunity).toBe('opp_typed');
    expect(written.crm_account).toBe('acc_typed');
    expect(written.budget_baseline).toBe(42);
  });

  it('leaves values already on the record alone when the presales project is re-pointed', async () => {
    const written = await run(
      { crm_presales_project: 'psp_1' },
      { previous: { crm_opportunity: 'opp_old', crm_account: 'acc_old', budget_baseline: 900_000 } },
    );

    expect(written.crm_opportunity).toBeUndefined();
    expect(written.crm_account).toBeUndefined();
    expect(written.budget_baseline).toBeUndefined();
  });

  it('carries nothing when the write names no presales project', async () => {
    const written = await run({ name: '交付' });

    expect(written.crm_opportunity).toBeUndefined();
    expect(written.crm_account).toBeUndefined();
    expect(written.budget_baseline).toBeUndefined();
  });

  it('carries the opportunity and account from a presales project whose Bizcase is empty', async () => {
    // The baseline and the pair are independent claims: a presales project
    // that has not been costed yet still names the opportunity and the client.
    const store = {
      crm_presales_project: [presalesRow({
        labor_cost: 0, third_party_service_cost: 0, procurement_cost: 0, project_expense: 0,
      })],
    };
    const written = await run({ name: '交付', crm_presales_project: 'psp_1' }, { store });

    expect(written.crm_opportunity).toBe('opp_1');
    expect(written.crm_account).toBe('acc_1');
    expect(written.budget_baseline).toBeUndefined();
  });

  it('fills the contract amount and the account from an attached sales contract', async () => {
    const store = {
      crm_presales_project: [],
      crm_contract: [{ id: 'ctr_1', contract_value: 2_400_000, crm_account: 'acc_from_contract' }],
    };
    const written = await run({ name: '交付', crm_contract: 'ctr_1' }, { store });

    expect(written.contract_amount).toBe(2_400_000);
    expect(written.crm_account).toBe('acc_from_contract');
  });
});
