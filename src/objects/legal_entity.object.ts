// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * 签约主体 — round 2 (step 9): the seller's own legal entities an opportunity
 * is signed under. A business lookup target, deliberately NOT a tenant
 * dimension (semantics rule 10). Chinese-only branch.
 */
export const LegalEntity = ObjectSchema.create({
  name: 'crm_legal_entity',
  label: '签约主体',
  pluralLabel: '签约主体',
  icon: 'building',
  description: '我方签约主体（法人公司）主数据，供商机、合同选择',
  sharingModel: 'public_read_write',
  nameField: 'name',
  searchableFields: ['name', 'short_name', 'registration_number'],
  highlightFields: ['short_name', 'registration_number', 'is_active'],
  fieldGroups: [
    { key: 'basic', label: '主体信息', icon: 'building' },
    { key: 'bank', label: '银行信息', icon: 'dollar-sign', collapse: 'collapsed' },
  ],
  fields: {
    name: Field.text({ label: '主体名称', required: true, storage: { notNull: true }, searchable: true, group: 'basic' }),
    short_name: Field.text({ label: '简称', group: 'basic' }),
    registration_number: Field.text({ label: '统一社会信用代码', group: 'basic' }),
    legal_representative: Field.text({ label: '法定代表人', group: 'basic' }),
    address: Field.textarea({ label: '注册地址', group: 'basic' }),
    is_active: Field.boolean({ label: '启用', group: 'basic', defaultValue: true }),
    bank_name: Field.text({ label: '开户银行', group: 'bank' }),
    bank_account: Field.text({ label: '银行账号', group: 'bank' }),
    notes: Field.textarea({ label: '备注', group: 'basic' }),
  },
  indexes: [
    { fields: ['name'] },
  ],
  enable: {
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
  },
});
