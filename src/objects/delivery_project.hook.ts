// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';
import type { HookApi } from './_hook-api';

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);
const empty = (v: unknown): boolean => v === undefined || v === null || v === '';

/**
 * 交付项目 — round 2 defaults.
 *
 * Step 27 「导入 Bizcase 预算」: when a delivery project is opened on (or moved
 * to) a presales project and no baseline was written, the approved Bizcase
 * total (the four presales cost lines) becomes the baseline. The opportunity
 * and account follow the presales project when they are blank.
 *
 * Step 38: when a sales contract is attached and no contract amount was
 * written, the contract value becomes the contract amount.
 */
const deliveryProjectDefaults: Hook = {
  name: 'delivery_project_defaults',
  object: 'crm_delivery_project',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  description: 'Baseline from the presales Bizcase total; contract amount from the sales contract; opportunity and account from the presales project.',
  handler: async (ctx: HookContext) => {
    const api = ctx.api as HookApi | undefined;
    const { input, previous } = ctx;
    if (!input || !api) return;

    const presalesId = typeof input.crm_presales_project === 'string' ? input.crm_presales_project : '';
    if (presalesId) {
      const psp = await api.object('crm_presales_project').findOne({
        where: { id: presalesId },
        fields: ['labor_cost', 'third_party_service_cost', 'procurement_cost', 'project_expense', 'crm_opportunity', 'crm_account'],
      });
      if (psp) {
        const total = num(psp.labor_cost) + num(psp.third_party_service_cost) + num(psp.procurement_cost) + num(psp.project_expense);
        const baselineGiven = !empty(input.budget_baseline) || (input.budget_baseline === undefined && num(previous?.budget_baseline) > 0);
        if (!baselineGiven && total > 0) input.budget_baseline = total;
        if (empty(input.crm_opportunity) && empty(previous?.crm_opportunity) && typeof psp.crm_opportunity === 'string') input.crm_opportunity = psp.crm_opportunity;
        if (empty(input.crm_account) && empty(previous?.crm_account) && typeof psp.crm_account === 'string') input.crm_account = psp.crm_account;
      }
    }

    const contractId = typeof input.crm_contract === 'string' ? input.crm_contract : '';
    if (contractId) {
      const contract = await api.object('crm_contract').findOne({ where: { id: contractId }, fields: ['contract_value', 'crm_account'] });
      const amountGiven = !empty(input.contract_amount) || (input.contract_amount === undefined && num(previous?.contract_amount) > 0);
      if (contract && !amountGiven && num(contract.contract_value) > 0) input.contract_amount = num(contract.contract_value);
      if (contract && empty(input.crm_account) && empty(previous?.crm_account) && typeof contract.crm_account === 'string') input.crm_account = contract.crm_account;
    }
  },
};

export default [deliveryProjectDefaults];
