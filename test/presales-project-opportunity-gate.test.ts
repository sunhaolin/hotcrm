// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect } from 'vitest';
import { PresalesProject } from '../src/objects/presales_project.object';
import { Opportunity } from '../src/objects/opportunity.object';
import type { Rec } from './helpers/hook-harness';

/**
 * 售前立项 hangs off an APPROVED opportunity — spec step 15,
 * 「售前立项必须引用客户关系系统中已审批通过的商机数据」.
 *
 * The gate is `initiation_status` (spec step 11's 商机立项审批), NOT the
 * amount-tiered `approval_status` the standard Large Deal Approval writes:
 * the two are independent ladders on `crm_opportunity`, and the object comment
 * says why. A filter naming a field or an option value the opportunity no
 * longer declares filters nothing and reports nothing, so the value is read
 * back off the REAL opportunity field rather than restated here.
 *
 * The write half of the same rule — 所属客户 carried from whichever opportunity
 * is picked — runs its real handler in `test/hooks-runtime-psa.test.ts`
 * (`presales_project_account_carry`).
 */
describe('关联商机 offers only opportunities that cleared 商机立项审批', () => {
  it('filters the picker on initiation_status, on an option the opportunity declares', () => {
    const fields = PresalesProject.fields as Rec;
    expect(fields.crm_opportunity.lookupFilters).toEqual([
      { field: 'initiation_status', operator: 'eq', value: 'approved' },
    ]);

    const gate = (Opportunity.fields as Rec).initiation_status;
    expect(gate).toBeDefined();
    expect((gate.options as Array<{ value: string }>).map((o) => o.value)).toContain('approved');
  });
});
