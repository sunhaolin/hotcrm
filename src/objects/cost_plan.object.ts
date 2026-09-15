// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { P } from '@objectstack/spec';
import { COST_PLAN_STATUS_OPTIONS, COST_PLAN_PHASE_OPTIONS } from './_psa-picklists';

/**
 * 成本计划 — one VERSION of a project's cost plan (steps 27 / 32).
 *
 * A plan hangs off a presales project (phase `bizcase`, the step-18 estimate
 * the executive approves) or a delivery project (phase `delivery`). The four
 * line objects and the monthly ledger (`crm_cost_plan_month`) are its
 * children; every total here is a platform rollup over that ledger, so a
 * plan's figures are never typed in.
 *
 * `is_current` marks the version the project reads: `crm_delivery_project`
 * and `crm_presales_project` roll up the current version only. Step 27's
 * 导入 Bizcase 预算 creates v1 with `baseline_total` frozen to the Bizcase
 * total (`cost_plan_defaults` refuses a later change); step 32's adjustment
 * approval flips the next version to current and the old one to 已作废.
 */
const monthSum = (label: string, filter?: Record<string, unknown>) => Field.summary({
  label,
  group: 'totals',
  scale: 2,
  summaryOperations: { object: 'crm_cost_plan_month', field: 'amount', function: 'sum', relationshipField: 'crm_cost_plan', ...(filter ? { filter } : {}) },
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
    { key: 'approval', label: '审批',     icon: 'check-circle' },
  ],
  fields: {
    plan_number: Field.autonumber({ label: '计划编号', format: 'CP-{0000}', group: 'basic' }),
    name: Field.text({ label: '计划名称', required: true, storage: { notNull: true }, searchable: true, group: 'basic' }),
    owner_id: Field.lookup('sys_user', { label: '成本管理员', group: 'basic', system: true, readonly: false }),
    crm_presales_project: Field.lookup('crm_presales_project', { label: '售前项目', group: 'basic', description: 'Bizcase 阶段的计划挂在售前项目上；与交付项目二选一。' }),
    crm_delivery_project: Field.lookup('crm_delivery_project', { label: '交付项目', group: 'basic', description: '交付阶段的计划挂在交付项目上；与售前项目二选一。' }),
    phase: Field.select({ label: '阶段', group: 'basic', options: [...COST_PLAN_PHASE_OPTIONS], description: '保存时按所挂项目自动写入。' }),
    version_no: Field.number({ label: '版本号', group: 'basic', description: '同一项目下顺序递增；留空时保存自动编号。' }),
    is_current: Field.boolean({ label: '当前版本', group: 'basic', defaultValue: false, description: '项目只读当前版本的金额；置为当前时其余版本自动作废。' }),
    source_plan: Field.lookup('crm_cost_plan', { label: '克隆来源', group: 'basic' }),
    crm_budget_adjustment: Field.lookup('crm_budget_adjustment', { label: '触发本版本的预算调整', group: 'basic' }),
    baseline_total: Field.currency({ label: '冻结基线', scale: 2, group: 'totals', description: '导入 Bizcase 预算时写入的考核基线，之后不可更改。' }),
    planned_total: monthSum('计划总额'),
    labor_total: monthSum('人工服务合计', { category: 'labor' }),
    service_total: monthSum('第三方服务合计', { category: 'third_party_service' }),
    procurement_total: monthSum('软硬件采购合计', { category: 'procurement' }),
    expense_total: monthSum('项目费用合计', { category: 'expense' }),
    travel_total: monthSum('其中差旅', { expense_type: 'travel' }),
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
    { fields: ['owner_id'] },
  ],
  enable: {
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
    files: true,
  },
});
