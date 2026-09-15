// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';
import type { HookApi } from './_hook-api';

/**
 * 交付项目 — 步骤 27「预算基线导入」(epic #2 / T3 + T4). Demo branch only.
 *
 * `delivery_project_cost_plan_carry` — a delivery project opened against an
 * APPROVED presales project takes that project's Bizcase over as its own plan:
 * the four estimate figures become four 成本计划行, and their total becomes the
 * 预算基线 the burn rate is measured against. 步骤 28–31 then split each
 * carried line by month; the carry seeds the plan, it does not finish it.
 *
 * Three guards, in the order the spec states them:
 *
 *  - **A baseline the creator typed wins.** An empty 预算基线 is the import
 *    gesture (「导入 Bizcase 预算」); a number someone wrote down is a decision,
 *    and nothing is carried over it. This is also what keeps the seeded
 *    projects (both carry their own baseline) off the carry path.
 *  - **Only an approved Bizcase.** 「以审批通过的 Bizcase 总成本作为考核基线」 —
 *    a presales project still in draft or in review has no baseline to give.
 *  - **Never over an existing plan.** Unreachable on `afterInsert` (a new
 *    project has no children yet) and kept so the carry stays safe if it is
 *    ever re-pointed at the presales approval, which is its production shape.
 *
 * `total_cost` on the presales project is a FORMULA, so the four stored columns
 * are summed here rather than read off it — the same four terms the formula
 * inlines, and the same thing an analytics read of that object has to do (a
 * live-run finding, REPORT.md §六).
 *
 * The category table and the numeric coercion are INLINE rather than module
 * constants: a handler that closes over a module identifier cannot be lowered
 * to a metadata-only body, and `os lint` names that as an error. The Chinese
 * labels are DATA on a Chinese-only demo — the way the seed writes rows, not a
 * UI string the locale packs carry.
 *
 * `onError: 'log'`: the carry is derived convenience. A delivery project must
 * still be creatable when it fails — the plan can be typed by hand.
 */
const deliveryProjectCostPlanCarry: Hook = {
  name: 'delivery_project_cost_plan_carry',
  object: 'crm_delivery_project',
  events: ['afterInsert'],
  priority: 200,
  onError: 'log',
  description: 'Carry the approved presales Bizcase over as the new delivery project\'s budget baseline and its first cost plan lines (demo, epic #2, spec step 27).',
  handler: async (ctx: HookContext) => {
    const api = ctx.api as HookApi | undefined;
    const created = ctx.result as Record<string, unknown> | undefined;
    const money = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);

    const projectId = typeof created?.id === 'string' ? created.id : '';
    const presalesId = typeof created?.crm_presales_project === 'string' ? created.crm_presales_project : '';
    if (!api || !projectId || !presalesId) return;
    if (money(created?.budget_baseline) > 0) return;

    const presales = await api.object('crm_presales_project').findOne({
      where: { id: presalesId },
      fields: ['project_number', 'approval_status', 'labor_cost', 'third_party_service_cost', 'procurement_cost', 'project_expense'],
    });
    if (!presales || presales.approval_status !== 'approved') return;

    // 售前 Bizcase 的四项成本 → 成本计划行的四个类别.
    const carried = [
      { source: 'labor_cost', category: 'labor', label: '人工服务' },
      { source: 'third_party_service_cost', category: 'third_party_service', label: '第三方服务' },
      { source: 'procurement_cost', category: 'procurement', label: '软硬件采购' },
      { source: 'project_expense', category: 'expense', label: '项目费用' },
    ]
      .map((c) => ({ ...c, amount: Math.round(money(presales[c.source]) * 100) / 100 }))
      .filter((c) => c.amount > 0);
    if (carried.length === 0) return;

    const existing = await api.object('crm_cost_plan_line').count({ where: { crm_delivery_project: projectId } });
    if (existing > 0) return;

    const source = typeof presales.project_number === 'string' ? presales.project_number : '售前项目';
    const total = Math.round(carried.reduce((sum, c) => sum + c.amount, 0) * 100) / 100;

    // Baseline first: a half-carried plan still reads against the right number.
    await api.object('crm_delivery_project').update(
      { id: projectId, budget_baseline: total },
      { where: { id: projectId } },
    );

    for (const line of carried) {
      await api.object('crm_cost_plan_line').insert({
        crm_delivery_project: projectId,
        category: line.category,
        // 月份 is deliberately left empty: the carried line is the whole-project
        // envelope, and splitting it by month is 步骤 28–31 — the cost admin's
        // work, not a number this hook can invent.
        description: `${line.label} · 自售前 ${source} 带入`,
        planned_amount: line.amount,
        notes: `自售前项目 ${source} 的 Bizcase 成本测算带入（步骤 27）；按月拆分见步骤 28–31。`,
      });
    }
  },
};

export default [deliveryProjectCostPlanCarry];
