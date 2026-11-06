// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';
import type { HookApi } from './_hook-api';

/**
 * 售前项目 — 所属客户 follows 关联商机 (spec step 15, 「所属客户跟着带出」).
 *
 * The picker half of the same rule is `lookupFilters` on
 * `crm_presales_project.crm_opportunity`: only an opportunity that cleared
 * 商机立项审批 is offered. This is the WRITE half — the account is derived from
 * the opportunity that was picked, never retyped beside it.
 *
 * Two carries, and the second is why this is not a plain blank-fill:
 *
 *  - **A named opportunity fills a blank account.** The create form leaves
 *    所属客户 empty (the field is optional and nobody should have to look up
 *    what the deal already knows); so does an API insert and the seed.
 *  - **A re-pointed opportunity takes the account with it** — but only when the
 *    stored account IS the old opportunity's. Re-pointing a draft project at
 *    the right deal otherwise leaves it filed under the wrong customer, which
 *    is worse than an empty column: every rollup and sharing rule reads it. An
 *    account somebody chose by hand (it differs from the old opportunity's) is
 *    left exactly as it is, and so is any write that names `crm_account`
 *    itself — the carry derives a value, it never overrules one.
 *
 * Shaped after `delivery_project_defaults`, which carries the same pair one
 * object downstream. The handler closes over nothing (the id helper is inline),
 * so the body still lowers to metadata (`hook-body/not-lowerable`).
 */
const presalesProjectAccountCarry: Hook = {
  name: 'presales_project_account_carry',
  object: 'crm_presales_project',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  description: 'Carry 所属客户 from the linked 关联商机: filled when blank, re-derived when the opportunity moves and the stored account was that opportunity\'s (spec step 15).',
  handler: async (ctx: HookContext) => {
    // Inline so the body lowers to metadata (`hook-body/not-lowerable`).
    const id = (v: unknown): string => (typeof v === 'string' && v !== '' ? v : '');
    const api = ctx.api as HookApi | undefined;
    const { input, previous } = ctx;
    if (!input || !api) return;

    // A write that names the account is the author's own; nothing below runs.
    if (id(input.crm_account)) return;

    const opportunityId = id(input.crm_opportunity) || id(previous?.crm_opportunity);
    if (!opportunityId) return;

    const storedAccountId = id(previous?.crm_account);
    if (storedAccountId) {
      const previousOpportunityId = id(previous?.crm_opportunity);
      // Unchanged opportunity: the stored account is already this deal's answer.
      if (!previousOpportunityId || previousOpportunityId === opportunityId) return;
      const previousOpportunity = await api.object('crm_opportunity').findOne({
        where: { id: previousOpportunityId },
        fields: ['crm_account'],
      });
      // Hand-picked, not carried — leave it alone.
      if (!previousOpportunity || id(previousOpportunity.crm_account) !== storedAccountId) return;
    }

    const opportunity = await api.object('crm_opportunity').findOne({
      where: { id: opportunityId },
      fields: ['crm_account'],
    });
    const accountId = id(opportunity?.crm_account);
    if (accountId && accountId !== storedAccountId) input.crm_account = accountId;
  },
};

export default [presalesProjectAccountCarry];
