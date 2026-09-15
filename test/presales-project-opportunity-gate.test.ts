// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect } from 'vitest';
import { PresalesProject } from '../src/objects/presales_project.object';
import { Opportunity } from '../src/objects/opportunity.object';
import presalesProjectHooks from '../src/objects/presales_project.hook';
import { makeHarness, makeCtx, hookNamed, type Rec } from './helpers/hook-harness';

/**
 * 售前立项 hangs off an APPROVED opportunity, and takes that opportunity's
 * customer with it — spec step 15, 「售前立项必须引用客户关系系统中已审批通过的
 * 商机数据」 and 「所属客户跟着带出」.
 *
 * Two halves that have to agree, which is why one file pins both:
 *
 *  - the PICKER offers only opportunities past 商机立项审批 (`lookupFilters`);
 *  - the WRITE derives 所属客户 from whichever opportunity was picked
 *    (`presales_project_account_carry`).
 *
 * The gate is `initiation_status`, NOT the amount-tiered `approval_status` —
 * the two are independent ladders on `crm_opportunity` and the object comment
 * says why. A filter that names a field or an option value the opportunity no
 * longer declares filters nothing and reports nothing, so the first test reads
 * the value back off the REAL opportunity field rather than restating it.
 */

const carry = hookNamed(presalesProjectHooks, 'presales_project_account_carry');
const USER = { id: 'user_1' };

const fields = PresalesProject.fields as Rec;

describe('关联商机 offers only opportunities that cleared 商机立项审批', () => {
  it('filters the picker on initiation_status, on an option the opportunity declares', () => {
    expect(fields.crm_opportunity.lookupFilters).toEqual([
      { field: 'initiation_status', operator: 'eq', value: 'approved' },
    ]);

    const gate = (Opportunity.fields as Rec).initiation_status;
    expect(gate).toBeDefined();
    expect((gate.options as Array<{ value: string }>).map((o) => o.value)).toContain('approved');
  });
});

describe('所属客户 is carried from 关联商机', () => {
  const store = (): Record<string, Rec[]> => ({
    crm_opportunity: [
      { id: 'opp_1', name: '华信核心系统升级', crm_account: 'acc_1' },
      { id: 'opp_2', name: '北辰 MES 二期', crm_account: 'acc_2' },
    ],
  });

  it('fills a blank account on insert', async () => {
    const { api } = makeHarness(store());
    const input: Rec = { name: '售前项目1', crm_opportunity: 'opp_1' };
    await carry.handler(makeCtx({ event: 'beforeInsert', input, api, user: USER }));
    expect(input.crm_account).toBe('acc_1');
  });

  it('leaves an account the author named alone', async () => {
    const { api } = makeHarness(store());
    const input: Rec = { name: '售前项目1', crm_opportunity: 'opp_1', crm_account: 'acc_9' };
    await carry.handler(makeCtx({ event: 'beforeInsert', input, api, user: USER }));
    expect(input.crm_account).toBe('acc_9');
  });

  it('follows a re-pointed opportunity when the stored account was the old one’s', async () => {
    const { api } = makeHarness(store());
    const input: Rec = { crm_opportunity: 'opp_2' };
    const previous: Rec = { id: 'psp_1', crm_opportunity: 'opp_1', crm_account: 'acc_1' };
    await carry.handler(makeCtx({ event: 'beforeUpdate', input, previous, api, user: USER }));
    expect(input.crm_account).toBe('acc_2');
  });

  it('keeps a hand-picked account when the opportunity is re-pointed', async () => {
    const { api } = makeHarness(store());
    const input: Rec = { crm_opportunity: 'opp_2' };
    const previous: Rec = { id: 'psp_1', crm_opportunity: 'opp_1', crm_account: 'acc_7' };
    await carry.handler(makeCtx({ event: 'beforeUpdate', input, previous, api, user: USER }));
    expect(input.crm_account).toBeUndefined();
  });

  it('fills a blank account on an update that does not name the opportunity', async () => {
    const { api } = makeHarness(store());
    const input: Rec = { quote_amount: 1_400_000 };
    const previous: Rec = { id: 'psp_1', crm_opportunity: 'opp_1' };
    await carry.handler(makeCtx({ event: 'beforeUpdate', input, previous, api, user: USER }));
    expect(input.crm_account).toBe('acc_1');
  });

  it('writes nothing when the opportunity has no account of its own', async () => {
    const { api } = makeHarness({ crm_opportunity: [{ id: 'opp_3', name: '待补客户' }] });
    const input: Rec = { name: '售前项目1', crm_opportunity: 'opp_3' };
    await carry.handler(makeCtx({ event: 'beforeInsert', input, api, user: USER }));
    expect(input.crm_account).toBeUndefined();
  });
});
