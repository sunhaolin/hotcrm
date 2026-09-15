// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { APPROVAL_STATUS_OPTIONS_ZH } from './_psa-picklists';

/**
 * 预算调整 — round 2 (step 32): a signed amount against a delivery project's
 * baseline, with the reason and variance analysis the customer's step names,
 * approved through the same one-tier flow as everything else on this branch.
 * Only APPROVED adjustments roll up (`crm_delivery_project.budget_adjustment_total`).
 */
export const BudgetAdjustment = ObjectSchema.create({
  name: 'crm_budget_adjustment',
  label: '预算调整',
  pluralLabel: '预算调整',
  icon: 'trending-up',
  description: '交付项目的预算追加或核减申请：调整金额、原因、差异分析，审批通过后计入当前预算',
  sharingModel: 'controlled_by_parent',
  nameField: 'adjustment_number',
  highlightFields: ['crm_delivery_project', 'amount', 'reason', 'approval_status'],
  fieldGroups: [
    { key: 'basic', label: '调整申请', icon: 'trending-up' },
    { key: 'approval', label: '审批', icon: 'check-circle' },
  ],
  fields: {
    adjustment_number: Field.autonumber({ label: '调整单号', format: 'BA-{0000}', group: 'basic' }),
    owner_id: Field.lookup('sys_user', { label: '申请人', group: 'basic', system: true, readonly: false }),
    crm_delivery_project: Field.masterDetail('crm_delivery_project', { label: '交付项目', group: 'basic', required: true, storage: { notNull: true }, deleteBehavior: 'cascade' }),
    amount: Field.currency({ label: '调整金额', scale: 2, required: true, storage: { notNull: true }, group: 'basic', description: '追加为正数，核减为负数' }),
    reason: Field.select({
      label: '调整原因',
      group: 'basic',
      required: true,
      storage: { notNull: true },
      options: [
        { label: '范围变更', value: 'scope_change' },
        { label: '工期延长', value: 'schedule_extension' },
        { label: '费率变化', value: 'rate_change' },
        { label: '风险应对', value: 'risk_response' },
        { label: '其他', value: 'other' },
      ],
    }),
    analysis: Field.textarea({ label: '差异分析', group: 'basic', required: true, storage: { notNull: true }, description: '预算不足的原因、与基线的差异及影响' }),
    approval_status: Field.select({ label: '审批状态', group: 'approval', defaultValue: 'draft', trackHistory: true, options: [...APPROVAL_STATUS_OPTIONS_ZH] }),
    approved_date: Field.datetime({ label: '审批通过时间', group: 'approval', readonly: true }),
    notes: Field.textarea({ label: '备注', group: 'basic' }),
  },
  indexes: [
    { fields: ['crm_delivery_project'] },
    { fields: ['approval_status'] },
  ],
  enable: {
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
  },
});
