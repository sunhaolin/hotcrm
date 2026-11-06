// Copyright (c) 2026 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect, beforeAll } from 'vitest';
import type { VerifyStack } from '@objectstack/verify';
import { hotcrmStack, signUpPerson, systemUpdate, flowRuns, type Person } from './helpers/verify-stack';

type Rec = Record<string, any>;

/**
 * Runtime tests for the nine PSA approval flows (`psa-approvals.flow.ts`).
 *
 * All nine are one template: a `record-after-update` start gated on the
 * record's status field reading `submitted`, a `get_record`, and an approval
 * node that locks the record and parks the run until the organization's owner
 * decides. Each case here is the half of that template no metadata test can
 * see — that the gate HOLDS on a real write, that the run reaches the approval
 * node rather than dying before it (the `[runAs]` shape `opportunity_approval`
 * once shipped, see flow-record-change.test.ts), and that the record comes
 * out locked in `pending` with exactly one request open.
 *
 * The write that submits is a system update, as `submit_approval` (a sandboxed
 * script body carrying no session) and a seed replay both are: the flow is
 * declared `runAs: 'system'` for exactly that trigger, so a user-less fire is
 * the one worth proving. Approval and rejection are the approval node's own
 * business (`sys_approval_request`), not the flow's gate, and are not driven
 * here.
 */

let verify: VerifyStack;
let rep: Person;
let accountId: string;
let k = 0;
beforeAll(async () => {
  verify = await hotcrmStack();
  await verify.signIn();
  rep = await signUpPerson(verify, 'rep@flow-psa-approvals.test', {
    name: 'PSA Approvals Rep', positions: ['sales_rep'], permissionSets: ['sales_rep'],
  });
  const [account] = await verify.seed('crm_account', [{ name: 'PSA Approvals Co', owner_id: rep.id }]);
  accountId = String(account!.id);
}, 120_000);

const seedOne = async (object: string, doc: Rec): Promise<Rec> => {
  const [row] = await verify.seed(object, [doc]);
  return row!;
};

/** A deal, a presales project under it, and a delivery project under that — the PSA spine. */
const spine = async () => {
  const deal = await seedOne('crm_opportunity', {
    name: `PSA Deal ${++k}`, amount: 50_000, stage: 'negotiation', close_date: '2030-06-30',
    approval_status: 'not_required', crm_account: accountId, owner_id: rep.id,
  });
  const presales = await seedOne('crm_presales_project', { name: `PSA Presales ${k}`, crm_opportunity: deal.id, owner_id: rep.id });
  const delivery = await seedOne('crm_delivery_project', { name: `PSA Delivery ${k}`, crm_presales_project: presales.id, owner_id: rep.id });
  return { deal, presales, delivery };
};

/**
 * One case per flow: `flow` is the registered name, `object` the record it
 * watches, `statusField` the field whose `submitted` is the gate, and `seed`
 * makes a draft record for it (the required fields and the parent it hangs
 * off; `owner_id` so the notify nodes have a recipient to resolve).
 */
const CASES: ReadonlyArray<{
  flow: string; object: string; statusField: 'approval_status' | 'initiation_status'; seed: () => Promise<Rec>;
}> = [
  {
    flow: 'lead_approval', object: 'crm_lead', statusField: 'approval_status',
    seed: () => seedOne('crm_lead', {
      first_name: 'PSA', last_name: `Lead ${++k}`, company: `PSA Lead Co ${k}`, email: `psa-lead-${k}@flow-psa-approvals.test`,
      owner_id: rep.id,
    }),
  },
  {
    flow: 'opportunity_initiation', object: 'crm_opportunity', statusField: 'initiation_status',
    seed: async () => (await spine()).deal,
  },
  {
    flow: 'presales_project_approval', object: 'crm_presales_project', statusField: 'approval_status',
    seed: async () => (await spine()).presales,
  },
  {
    flow: 'delivery_project_approval', object: 'crm_delivery_project', statusField: 'approval_status',
    seed: async () => (await spine()).delivery,
  },
  {
    flow: 'timesheet_approval', object: 'crm_timesheet', statusField: 'approval_status',
    // No delivery project: a sheet with none books presales or attendance
    // hours only, so the budget gate has nothing to compare against.
    seed: async () => seedOne('crm_timesheet', { period_month: '2030-01-01', hours: 160, owner_id: rep.id }),
  },
  {
    flow: 'budget_adjustment_approval', object: 'crm_budget_adjustment', statusField: 'approval_status',
    seed: async () => seedOne('crm_budget_adjustment', {
      crm_delivery_project: (await spine()).delivery.id, amount: 1000, reason: 'other', analysis: 'Scope grew by one module.',
      owner_id: rep.id,
    }),
  },
  {
    flow: 'business_trip_approval', object: 'crm_business_trip', statusField: 'approval_status',
    seed: async () => seedOne('crm_business_trip', {
      subject: `PSA Trip ${++k}`, destination: 'Shanghai', start_date: '2030-03-01', end_date: '2030-03-03',
      purpose: 'Kick-off workshop on site.', crm_delivery_project: (await spine()).delivery.id, owner_id: rep.id,
    }),
  },
  {
    flow: 'leave_request_approval', object: 'crm_leave_request', statusField: 'approval_status',
    seed: () => seedOne('crm_leave_request', {
      leave_type: 'annual', start_date: '2030-04-01', end_date: '2030-04-02', reason: 'Family travel.', owner_id: rep.id,
    }),
  },
  {
    flow: 'cost_plan_approval', object: 'crm_cost_plan', statusField: 'approval_status',
    seed: async () => seedOne('crm_cost_plan', { name: `PSA Plan ${k + 1}`, crm_presales_project: (await spine()).presales.id, owner_id: rep.id }),
  },
];

describe('the PSA approval flows reach their approval node on a submit', () => {
  it.each(CASES)('$flow parks $object in pending with one request open', async ({ flow, object, statusField, seed }) => {
    const record = await seed();
    // The record is born a draft: the gate must not have fired on the insert.
    expect(await flowRuns(verify, flow, record.id), `${flow} fired on a draft insert`).toHaveLength(0);

    await systemUpdate(verify, object, { id: record.id, [statusField]: 'submitted' });

    const [run] = await flowRuns(verify, flow, record.id);
    expect(run, `no ${flow} run recorded`).toBeDefined();
    expect(String(run?.error ?? ''), `${flow} died before its approval node`).toBe('');
    expect(run?.status).toBe('paused');
    expect(await verify.rows('sys_approval_request', { record_id: record.id })).toHaveLength(1);
    const [stored] = await verify.rows(object, { id: record.id });
    expect(stored![statusField]).toBe('pending');
  }, 30_000);

  it('a draft that is saved without submitting opens nothing', async () => {
    // The gate is `== "submitted"`, not "status changed": a plain edit on a
    // draft (or on a plan already approved) records no run at all.
    const { presales } = await spine();
    await systemUpdate(verify, 'crm_presales_project', { id: presales.id, name: `${presales.name} (edited)` });
    expect(await flowRuns(verify, 'presales_project_approval', presales.id)).toHaveLength(0);
    expect(await verify.rows('sys_approval_request', { record_id: presales.id })).toHaveLength(0);
  });
});
