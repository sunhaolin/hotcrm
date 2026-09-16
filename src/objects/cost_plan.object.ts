// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { F, P } from '@objectstack/spec';
import { COST_PLAN_STATUS_OPTIONS, COST_PLAN_PHASE_OPTIONS } from './_psa-picklists';

/**
 * 成本计划 — one VERSION of a project's cost plan (steps 27 / 32).
 *
 * A plan hangs off a presales project (phase `bizcase`, the step-18 estimate
 * the executive approves) or a delivery project (phase `delivery`). The four
 * line objects and the monthly ledger (`crm_cost_plan_month`) are its
 * children; every total here is a platform rollup — over that ledger on a
 * delivery plan, over the lines' own estimates on a Bizcase — so a plan's
 * figures are never typed in.
 *
 * A Bizcase is a whole-range estimate (2026-09-16): its lines are NOT split by
 * month and it has NO month rows at all — each line carries its figure in
 * `estimate_amount` (`cost_line_estimate`) — and approving it makes it the
 * current version (`cost_plan_defaults`), which is the moment the presales
 * project's four figures show it. Splitting by month is the delivery plan's
 * job, once the Bizcase is imported.
 *
 * `is_current` marks the version the project reads: `crm_delivery_project`
 * and `crm_presales_project` roll up the current version only. Step 27's
 * 导入 Bizcase 预算 creates v1 with `baseline_total` frozen to the Bizcase
 * total (`cost_plan_defaults` refuses a later change); step 32's adjustment
 * approval flips the next version to current and the old one to 已作废.
 *
 * The `comparison` group is what the approver decides on: `cost_plan_compare`
 * snapshots the amounts of the version marked 当前版本 onto the `current_*`
 * columns at submit time, and every `delta_*` is a formula over that pair. The
 * snapshot is taken as declared, itself included — a plan that already IS the
 * current version compares with itself and reads 0 — and the group keeps
 * showing after the decision, as the record of what was put in front of the
 * approver.
 */
/**
 * Every total is a rollup, and every rollup targets a STORED column — a
 * formula is virtual (no column), so a parent summary cannot read one. The
 * phase decides which ledger a plan's amounts live in: a delivery plan's in
 * its month rows, a Bizcase's on its lines (`estimate_amount`). So each amount
 * is a hidden pair of summaries — `*_month_total` over the ledger,
 * `*_line_total` over the lines — of which exactly one is non-zero on any
 * plan, plus the visible formula that adds the pair. The presales project
 * rolls up the `*_line_total` columns, the delivery project
 * `planned_month_total`, and `cost_plan_compare` snapshots the pairs.
 */
const monthSum = (label: string, filter?: Record<string, unknown>) => Field.summary({
  label,
  group: 'totals',
  hidden: true,
  scale: 2,
  summaryOperations: { object: 'crm_cost_plan_month', field: 'amount', function: 'sum', relationshipField: 'crm_cost_plan', ...(filter ? { filter } : {}) },
});
const lineSum = (label: string, object: string, filter?: Record<string, unknown>) => Field.summary({
  label,
  group: 'totals',
  hidden: true,
  scale: 2,
  summaryOperations: { object, field: 'estimate_amount', function: 'sum', relationshipField: 'crm_cost_plan', ...(filter ? { filter } : {}) },
});

export const CostPlan = ObjectSchema.create({
  name: 'crm_cost_plan',
  label: '成本计划',
  pluralLabel: '成本计划',
  icon: 'calculator',
  description: '项目成本计划的一个版本：阶段、版本号、冻结基线，四类明细行与月度分解行的汇总',
  sharingModel: 'private',
  nameField: 'name',
  searchableFields: ['name', 'plan_number'],
  highlightFields: ['plan_number', 'phase', 'version_no', 'is_current', 'planned_total', 'approval_status'],
  fieldGroups: [
    { key: 'basic',    label: '计划信息', icon: 'info' },
    { key: 'totals',   label: '计划金额', icon: 'calculator' },
    { key: 'comparison', label: '与当前版本对比', icon: 'git-compare', description: '与「提交审批时」标记为当前版本的成本计划逐项对比，提交时取数、审批后保留为留痕。本记录本身就是当前版本时与自己对比，差异为 0。' },
    { key: 'approval', label: '审批',     icon: 'check-circle' },
  ],
  fields: {
    plan_number: Field.autonumber({ label: '计划编号', format: 'CP-{0000}', group: 'basic' }),
    name: Field.text({ label: '计划名称', required: true, storage: { notNull: true }, searchable: true, group: 'basic' }),
    owner_id: Field.lookup('sys_user', { label: '成本管理员', group: 'basic', system: true, readonly: false }),
    crm_presales_project: Field.lookup('crm_presales_project', { label: '售前项目', group: 'basic', description: 'Bizcase 阶段的计划挂在售前项目上；与交付项目二选一。' }),
    crm_delivery_project: Field.lookup('crm_delivery_project', { label: '交付项目', group: 'basic', description: '交付阶段的计划挂在交付项目上；与售前项目二选一。' }),
    phase: Field.select({ label: '阶段', group: 'basic', options: [...COST_PLAN_PHASE_OPTIONS], description: '保存时按所挂项目自动写入。Bizcase（售前）阶段的明细行不按月拆分、不生成月度分解行，金额直接算在明细行上；交付阶段按月分解。' }),
    version_no: Field.number({ label: '版本号', group: 'basic', description: '同一项目下顺序递增；留空时保存自动编号。' }),
    is_current: Field.boolean({ label: '当前版本', group: 'basic', defaultValue: false, description: '项目只读当前版本的金额；置为当前时其余版本自动作废。Bizcase 计划审批通过即自动成为当前版本。' }),
    source_plan: Field.lookup('crm_cost_plan', { label: '克隆来源', group: 'basic' }),
    crm_budget_adjustment: Field.lookup('crm_budget_adjustment', { label: '触发本版本的预算调整', group: 'basic' }),
    baseline_total: Field.currency({ label: '冻结基线', scale: 2, group: 'totals', description: '导入 Bizcase 预算时写入的考核基线，之后不可更改。' }),
    planned_month_total: monthSum('月度分解计划总额'),
    labor_month_total: monthSum('月度分解人工服务合计', { category: 'labor' }),
    service_month_total: monthSum('月度分解第三方服务合计', { category: 'third_party_service' }),
    procurement_month_total: monthSum('月度分解软硬件采购合计', { category: 'procurement' }),
    expense_month_total: monthSum('月度分解项目费用合计', { category: 'expense' }),
    travel_month_total: monthSum('月度分解其中差旅', { expense_type: 'travel' }),
    labor_line_total: lineSum('估算人工服务合计', 'crm_labor_cost_line'),
    service_line_total: lineSum('估算第三方服务合计', 'crm_service_cost_line'),
    procurement_line_total: lineSum('估算软硬件采购合计', 'crm_procurement_cost_line'),
    expense_line_total: lineSum('估算项目费用合计', 'crm_expense_cost_line'),
    travel_line_total: lineSum('估算其中差旅', 'crm_expense_cost_line', { expense_type: 'travel' }),
    planned_total: Field.formula({
      label: '计划总额',
      group: 'totals',
      description: 'Bizcase 为四类明细行估算之和；交付计划为月度分解行之和。',
      expression: F`coalesce(record.planned_month_total, 0) + coalesce(record.labor_line_total, 0) + coalesce(record.service_line_total, 0) + coalesce(record.procurement_line_total, 0) + coalesce(record.expense_line_total, 0)`,
      scale: 2,
    }),
    labor_total: Field.formula({ label: '人工服务合计', group: 'totals', expression: F`coalesce(record.labor_month_total, 0) + coalesce(record.labor_line_total, 0)`, scale: 2 }),
    service_total: Field.formula({ label: '第三方服务合计', group: 'totals', expression: F`coalesce(record.service_month_total, 0) + coalesce(record.service_line_total, 0)`, scale: 2 }),
    procurement_total: Field.formula({ label: '软硬件采购合计', group: 'totals', expression: F`coalesce(record.procurement_month_total, 0) + coalesce(record.procurement_line_total, 0)`, scale: 2 }),
    expense_total: Field.formula({ label: '项目费用合计', group: 'totals', expression: F`coalesce(record.expense_month_total, 0) + coalesce(record.expense_line_total, 0)`, scale: 2 }),
    travel_total: Field.formula({ label: '其中差旅', group: 'totals', expression: F`coalesce(record.travel_month_total, 0) + coalesce(record.travel_line_total, 0)`, scale: 2 }),

    // 审批对比 (2026-09-16): the approver decides on ONE version, so every
    // amount it carries is shown against the version actually in force.
    // `cost_plan_compare` snapshots the in-force version's figures onto the
    // `current_*` columns when the plan is submitted — the platform has no
    // cross-record formula (ADR-0055: a field path is a single column), so the
    // other version's numbers have to be carried on this row to be subtracted
    // — and each `delta_*` is a formula over the two columns, so the
    // difference can never disagree with the pair it is drawn from.
    //
    // 当前版本 is taken as the data declares it, with no exception for this row:
    // a plan that is already 当前版本 snapshots itself and reads 0 everywhere,
    // because that is what the group's own title claims. The first cut excluded
    // the row itself, which showed an approved current version a 1,566,320
    // increase over a version that did not exist.
    compare_plan: Field.lookup('crm_cost_plan', { label: '对比的当前版本', group: 'comparison', readonly: true, description: '提交审批时标记为当前版本的那个计划；本记录本身是当前版本时指向自己，差异全为 0。为空表示项目当时没有当前版本，下面的差异即全额新增。' }),
    current_baseline_total: Field.currency({ label: '当前版本冻结基线', scale: 2, group: 'comparison', readonly: true }),
    delta_baseline_total: Field.formula({
      label: '冻结基线差异',
      group: 'comparison',
      expression: F`coalesce(record.baseline_total, 0) - coalesce(record.current_baseline_total, 0)`,
      scale: 2,
    }),
    current_planned_total: Field.currency({ label: '当前版本计划总额', scale: 2, group: 'comparison', readonly: true }),
    delta_planned_total: Field.formula({
      label: '计划总额差异',
      description: '本次审批的计划总额减去提交时当前版本的计划总额；正数为增加，负数为核减；本记录即当前版本时为 0。',
      group: 'comparison',
      expression: F`(coalesce(record.planned_month_total, 0) + coalesce(record.labor_line_total, 0) + coalesce(record.service_line_total, 0) + coalesce(record.procurement_line_total, 0) + coalesce(record.expense_line_total, 0)) - coalesce(record.current_planned_total, 0)`,
      scale: 2,
    }),
    delta_planned_pct: Field.formula({
      label: '计划总额差异率 %',
      description: '差异 ÷ 提交时当前版本的计划总额 × 100。当前版本总额为 0 时读作 0。',
      group: 'comparison',
      expression: F`coalesce(record.current_planned_total, 0) > 0 ? (((coalesce(record.planned_month_total, 0) + coalesce(record.labor_line_total, 0) + coalesce(record.service_line_total, 0) + coalesce(record.procurement_line_total, 0) + coalesce(record.expense_line_total, 0)) - record.current_planned_total) * 100.0) / record.current_planned_total : 0.0`,
      scale: 2,
    }),
    current_labor_total: Field.currency({ label: '当前版本人工服务合计', scale: 2, group: 'comparison', readonly: true }),
    delta_labor_total: Field.formula({
      label: '人工服务合计差异',
      group: 'comparison',
      expression: F`(coalesce(record.labor_month_total, 0) + coalesce(record.labor_line_total, 0)) - coalesce(record.current_labor_total, 0)`,
      scale: 2,
    }),
    current_service_total: Field.currency({ label: '当前版本第三方服务合计', scale: 2, group: 'comparison', readonly: true }),
    delta_service_total: Field.formula({
      label: '第三方服务合计差异',
      group: 'comparison',
      expression: F`(coalesce(record.service_month_total, 0) + coalesce(record.service_line_total, 0)) - coalesce(record.current_service_total, 0)`,
      scale: 2,
    }),
    current_procurement_total: Field.currency({ label: '当前版本软硬件采购合计', scale: 2, group: 'comparison', readonly: true }),
    delta_procurement_total: Field.formula({
      label: '软硬件采购合计差异',
      group: 'comparison',
      expression: F`(coalesce(record.procurement_month_total, 0) + coalesce(record.procurement_line_total, 0)) - coalesce(record.current_procurement_total, 0)`,
      scale: 2,
    }),
    current_expense_total: Field.currency({ label: '当前版本项目费用合计', scale: 2, group: 'comparison', readonly: true }),
    delta_expense_total: Field.formula({
      label: '项目费用合计差异',
      group: 'comparison',
      expression: F`(coalesce(record.expense_month_total, 0) + coalesce(record.expense_line_total, 0)) - coalesce(record.current_expense_total, 0)`,
      scale: 2,
    }),
    current_travel_total: Field.currency({ label: '当前版本其中差旅', scale: 2, group: 'comparison', readonly: true }),
    delta_travel_total: Field.formula({
      label: '其中差旅差异',
      group: 'comparison',
      expression: F`(coalesce(record.travel_month_total, 0) + coalesce(record.travel_line_total, 0)) - coalesce(record.current_travel_total, 0)`,
      scale: 2,
    }),
    approval_status: Field.select({ label: '审批状态', group: 'approval', defaultValue: 'draft', readonly: true, trackHistory: true, options: [...COST_PLAN_STATUS_OPTIONS] }),
    approved_date: Field.datetime({ label: '审批通过时间', group: 'approval', readonly: true }),
    notes: Field.textarea({ label: '备注', group: 'basic' }),
  },
  validations: [
    {
      name: 'one_project_per_plan',
      type: 'script',
      severity: 'error',
      message: '成本计划必须且只能挂在一个项目上：售前项目或交付项目',
      condition: P`((!has(record.crm_presales_project) || isBlank(record.crm_presales_project)) && (!has(record.crm_delivery_project) || isBlank(record.crm_delivery_project))) || (has(record.crm_presales_project) && !isBlank(record.crm_presales_project) && has(record.crm_delivery_project) && !isBlank(record.crm_delivery_project))`,
    },
  ],
  indexes: [
    { fields: ['crm_delivery_project'] },
    { fields: ['crm_presales_project'] },
    { fields: ['is_current'] },
    { fields: ['compare_plan'] },
    { fields: ['owner_id'] },
  ],
  enable: {
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
    files: true,
  },
});
