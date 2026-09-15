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

/**
 * 成本计划行从售前项目自动带入 — 步骤 27 的后半段.
 *
 * `delivery_project_defaults` above carries the BASELINE (the approved
 * Bizcase total). This carries the PLAN it is measured against: the same four
 * presales estimate figures become four 成本计划行, one per category. 步骤
 * 28–31 then split each carried line by month and hang a 费率卡 on the labour
 * one; the carry seeds the plan, it does not finish it, so 月份, 数量 and 单价
 * are deliberately left empty and `planned_amount` is written directly
 * (`cost_plan_line_fill` only computes an amount that was not given).
 *
 * Four guards, and each answers a different question:
 *
 *  - **A system write brings its own plan.** Seed replay writes with
 *    `isSystem: true` (`skipTriggers` suppresses flows, not hooks), and the
 *    seeded 一期交付 already carries its eight monthly rows — materialising an
 *    envelope on top of them would double its 计划总额. Same reasoning as
 *    `plugin-sharing`, which returns early on system writes.
 *  - **The plan follows the baseline it is measured against.** The lines are
 *    carried only when the project's baseline IS that Bizcase total — either
 *    because `delivery_project_defaults` just carried it, or because someone
 *    typed the same number. A hand-set baseline of another value means the
 *    plan is not this Bizcase's, and nothing is carried under it.
 *  - **Only an approved Bizcase.** 「以审批通过的 Bizcase 总成本作为考核基线」.
 *  - **Never over an existing plan.** Unreachable on `afterInsert`; kept so the
 *    carry stays safe if it is ever re-pointed at the presales approval, which
 *    is its production shape.
 *
 * `onError: 'log'`: the carry is derived convenience. A delivery project must
 * still be creatable when it fails — the plan can be typed by hand.
 *
 * The handler closes over nothing (helpers and the category table are inline),
 * so it still lowers to a metadata-only body.
 */
const deliveryProjectCostPlanCarry: Hook = {
  name: 'delivery_project_cost_plan_carry',
  object: 'crm_delivery_project',
  events: ['afterInsert'],
  priority: 200,
  onError: 'log',
  description: 'Carry the approved presales Bizcase over as the new delivery project\'s first cost plan lines (demo, epic #2, spec step 27).',
  handler: async (ctx: HookContext) => {
    const api = ctx.api as HookApi | undefined;
    const created = ctx.result as Record<string, unknown> | undefined;
    const money = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);

    if (ctx.session?.isSystem === true) return;
    const projectId = typeof created?.id === 'string' ? created.id : '';
    const presalesId = typeof created?.crm_presales_project === 'string' ? created.crm_presales_project : '';
    if (!api || !projectId || !presalesId) return;

    const presales = await api.object('crm_presales_project').findOne({
      where: { id: presalesId },
      fields: ['project_number', 'approval_status', 'labor_cost', 'third_party_service_cost', 'procurement_cost', 'project_expense'],
    });
    if (!presales || presales.approval_status !== 'approved') return;

    // 售前 Bizcase 的四项成本 → 成本计划行的四个类别. The Chinese labels are
    // DATA on a Chinese-only demo, written the way the seed writes rows.
    const carried = [
      { source: 'labor_cost', category: 'labor', label: '人工服务' },
      { source: 'third_party_service_cost', category: 'third_party_service', label: '第三方服务' },
      { source: 'procurement_cost', category: 'procurement', label: '软硬件采购' },
      { source: 'project_expense', category: 'expense', label: '项目费用' },
    ]
      .map((c) => ({ ...c, amount: Math.round(money(presales[c.source]) * 100) / 100 }))
      .filter((c) => c.amount > 0);
    if (carried.length === 0) return;

    // `total_cost` on the presales project is a FORMULA, so the four stored
    // columns are summed here — the same terms the formula inlines, and the
    // same sum `delivery_project_defaults` wrote as the baseline.
    const total = Math.round(carried.reduce((sum, c) => sum + c.amount, 0) * 100) / 100;
    if (Math.abs(money(created?.budget_baseline) - total) >= 0.005) return;

    const existing = await api.object('crm_cost_plan_line').count({ where: { crm_delivery_project: projectId } });
    if (existing > 0) return;

    const source = typeof presales.project_number === 'string' ? presales.project_number : '售前项目';
    for (const line of carried) {
      await api.object('crm_cost_plan_line').insert({
        crm_delivery_project: projectId,
        category: line.category,
        description: `${line.label} · 自售前 ${source} 带入`,
        planned_amount: line.amount,
        notes: `自售前项目 ${source} 的 Bizcase 成本测算带入（步骤 27）；按月拆分见步骤 28–31。`,
      });
    }
  },
};

export default [deliveryProjectDefaults, deliveryProjectCostPlanCarry];


