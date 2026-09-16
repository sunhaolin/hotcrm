// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Action } from '@objectstack/spec/ui';
import { P } from '@objectstack/spec';

/**
 * 成本计划 actions (steps 27 / 32). Each body is sandboxed JS over `ctx.api`;
 * the clone routine is one source string shared by both plan actions.
 *
 * `visible` predicates are TOTAL (AGENTS.md): every `record.x` read is
 * `has()`-guarded, so an empty record fails closed.
 */
const LINE_OBJECTS = ['crm_labor_cost_line', 'crm_service_cost_line', 'crm_procurement_cost_line', 'crm_expense_cost_line'];

// Copies a plan's four line families onto `targetPlanId`. Month rows regenerate
// from each inserted line (cost_line_decompose); the source's 手工调整 months
// are then re-applied onto the regenerated rows so a tuned split survives.
const CLONE_LINES_SRC = `
  const LINES = ${JSON.stringify(LINE_OBJECTS)};
  const SKIP = ['id', 'crm_cost_plan', 'planned_amount', 'created_at', 'updated_at', 'created_by', 'updated_by', 'owner_id', 'organization_id'];
  async function cloneLines(sourcePlanId, targetPlanId) {
    for (const object of LINES) {
      const lines = await ctx.api.object(object).find({ where: { crm_cost_plan: sourcePlanId } });
      for (const line of lines) {
        const copy = {};
        for (const key of Object.keys(line)) if (!SKIP.includes(key) && line[key] !== null && line[key] !== undefined) copy[key] = line[key];
        copy.crm_cost_plan = targetPlanId;
        const created = await ctx.api.object(object).insert(copy);
        const manual = await ctx.api.object('crm_cost_plan_month').find({ where: { [object]: line.id, is_manual: true } });
        for (const m of manual) {
          const twin = await ctx.api.object('crm_cost_plan_month').findOne({ where: { [object]: created.id, period_month: m.period_month } });
          if (twin) await ctx.api.object('crm_cost_plan_month').update({ id: twin.id, amount: m.amount, quantity: m.quantity, unit_price: m.unit_price, headcount: m.headcount, is_manual: true }, { where: { id: twin.id } });
        }
      }
    }
  }
`;

/** Step 27 — 导入 Bizcase 预算: the approved presales Bizcase plan becomes delivery plan v1 and the frozen baseline. */
export const ImportBizcaseBudgetAction: Action = {
  name: 'import_bizcase_budget',
  label: '导入 Bizcase 预算',
  objectName: 'crm_delivery_project',
  icon: 'download',
  type: 'script',
  body: {
    language: 'js',
    source: `
      const id = ctx.recordId;
      if (!id) throw new Error('import_bizcase_budget requires a recordId');
      const project = await ctx.api.object('crm_delivery_project').findOne({ where: { id: id } });
      if (!project) throw new Error('交付项目不存在或无权限。');
      if (!project.crm_presales_project) throw new Error('交付项目未关联售前项目，没有可导入的 Bizcase。');
      if ((await ctx.api.object('crm_cost_plan').count({ where: { crm_delivery_project: id } })) > 0) {
        throw new Error('该交付项目已有成本计划；预算变动请在成本计划上「新建计划版本」并提交预算调整。');
      }
      const presales = await ctx.api.object('crm_presales_project').findOne({ where: { id: project.crm_presales_project } });
      if (!presales || presales.approval_status !== 'approved') throw new Error('售前项目尚未审批通过，只有已审批的 Bizcase 才能作为考核基线。');
      const bizcase = await ctx.api.object('crm_cost_plan').findOne({ where: { crm_presales_project: presales.id, is_current: true } });
      if (!bizcase) throw new Error('售前项目「' + presales.name + '」没有当前 Bizcase 成本计划，请先在售前项目下编制并置为当前版本。');
      const total = Number(bizcase.planned_total) || 0;
      if (total <= 0) throw new Error('Bizcase 成本计划总额为 0，没有可导入的预算。');
      const plan = await ctx.api.object('crm_cost_plan').insert({
        name: project.name + ' · 交付成本计划 v1',
        crm_delivery_project: id, phase: 'delivery', version_no: 1, is_current: true,
        baseline_total: total, source_plan: bizcase.id, approval_status: 'draft',
        notes: '自售前 Bizcase 计划「' + bizcase.name + '」导入（步骤 27）；按月拆分与调整见步骤 28–31。',
      });
      ${CLONE_LINES_SRC}
      await cloneLines(bizcase.id, plan.id);
      await ctx.api.object('crm_delivery_project').update({ id: id, budget_baseline: total }, { where: { id: id } });
      return { id: plan.id, baseline_total: total };
    `,
    capabilities: ['api.read', 'api.write'],
    timeoutMs: 20000,
  },
  locations: ['record_header'],
  visible: P`has(record.crm_presales_project) && !isBlank(record.crm_presales_project)`,
  confirmText: '以售前项目已审批的 Bizcase 成本计划作为考核基线，生成交付成本计划 v1？导入后基线不可更改。',
  successMessage: 'Bizcase 预算已导入：基线已冻结，成本计划 v1 已生成。',
  refreshAfter: true,
};

/** Step 32 — 新建计划版本: clone this plan into the next draft version, to be put in force by an approved budget adjustment. */
export const CreatePlanVersionAction: Action = {
  name: 'create_plan_version',
  label: '新建计划版本',
  objectName: 'crm_cost_plan',
  icon: 'copy',
  type: 'script',
  body: {
    language: 'js',
    source: `
      const id = ctx.recordId;
      if (!id) throw new Error('create_plan_version requires a recordId');
      const source = await ctx.api.object('crm_cost_plan').findOne({ where: { id: id } });
      if (!source) throw new Error('成本计划不存在或无权限。');
      const projectKey = source.crm_delivery_project ? 'crm_delivery_project' : 'crm_presales_project';
      const version = (await ctx.api.object('crm_cost_plan').count({ where: { [projectKey]: source[projectKey] } })) + 1;
      const plan = await ctx.api.object('crm_cost_plan').insert({
        name: String(source.name).replace(/ v\\d+$/, '') + ' v' + version,
        [projectKey]: source[projectKey], phase: source.phase, version_no: version, is_current: false,
        baseline_total: source.baseline_total, source_plan: source.id, approval_status: 'draft',
      });
      ${CLONE_LINES_SRC}
      await cloneLines(source.id, plan.id);
      return { id: plan.id, version_no: version };
    `,
    capabilities: ['api.read', 'api.write'],
    timeoutMs: 20000,
  },
  locations: ['record_header'],
  visible: P`has(record.approval_status) && record.approval_status != "draft" && record.approval_status != "rejected"`,
  confirmText: '以当前版本为底稿克隆一个新的草稿版本？新版本审批通过后才成为当前版本。',
  successMessage: '新计划版本已创建，请在新版本上调整明细行，再提交预算调整审批。',
  refreshAfter: true,
};

/** 重新分解 — drop the 手工调整 marks on a line's months and regenerate them from the line's factors. */
const redecomposeAction = (objectName: string): Action => ({
  name: 'redecompose_months',
  label: '重新分解',
  objectName,
  icon: 'refresh-cw',
  type: 'script',
  body: {
    language: 'js',
    source: `
      const id = ctx.recordId;
      if (!id) throw new Error('redecompose_months requires a recordId');
      const line = await ctx.api.object('${objectName}').findOne({ where: { id: id } });
      if (!line) throw new Error('明细行不存在或无权限。');
      const manual = await ctx.api.object('crm_cost_plan_month').find({ where: { ${objectName}: id, is_manual: true } });
      for (const m of manual) await ctx.api.object('crm_cost_plan_month').update({ id: m.id, is_manual: false }, { where: { id: m.id } });
      await ctx.api.object('${objectName}').update({ id: id, start_month: line.start_month }, { where: { id: id } });
      return { id: id, reset: manual.length };
    `,
    capabilities: ['api.read', 'api.write'],
    timeoutMs: 10000,
  },
  locations: ['record_header'],
  visible: P`has(record.start_month) && !isBlank(record.start_month)`,
  confirmText: '清除这条明细行上所有手工调整的月份，按人数、单价、起止月份重新分解？',
  successMessage: '月度分解已重新生成。',
  refreshAfter: true,
});

export const LaborLineRedecomposeAction: Action = redecomposeAction('crm_labor_cost_line');
export const ServiceLineRedecomposeAction: Action = redecomposeAction('crm_service_cost_line');
export const ProcurementLineRedecomposeAction: Action = redecomposeAction('crm_procurement_cost_line');
export const ExpenseLineRedecomposeAction: Action = redecomposeAction('crm_expense_cost_line');
