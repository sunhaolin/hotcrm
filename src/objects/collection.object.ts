// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * 收款 — round 2 (steps 37 / 38): money received against a delivery project,
 * optionally matched to an invoice. Entered by hand this round.
 */
export const Collection = ObjectSchema.create({
  name: 'crm_collection',
  label: '收款',
  pluralLabel: '收款',
  icon: 'dollar-sign',
  description: '按交付项目登记的收款记录，可关联到具体发票',
  sharingModel: 'controlled_by_parent',
  nameField: 'collection_code',
  searchableFields: ['collection_code', 'bank_reference'],
  highlightFields: ['crm_delivery_project', 'crm_invoice', 'received_date', 'amount'],
  fieldGroups: [
    { key: 'basic', label: '收款信息', icon: 'dollar-sign' },
  ],
  fields: {
    collection_code: Field.autonumber({ label: '收款编号', format: 'RCV-{0000}', group: 'basic' }),
    owner_id: Field.lookup('sys_user', { label: '经办人', group: 'basic', system: true, readonly: false }),
    crm_delivery_project: Field.masterDetail('crm_delivery_project', { label: '交付项目', group: 'basic', required: true, storage: { notNull: true }, deleteBehavior: 'cascade' }),
    crm_invoice: Field.lookup('crm_invoice', { label: '关联发票', group: 'basic' }),
    crm_account: Field.lookup('crm_account', { label: '客户', group: 'basic' }),
    received_date: Field.date({ label: '收款日期', group: 'basic', required: true, storage: { notNull: true } }),
    amount: Field.currency({ label: '收款金额', scale: 2, required: true, storage: { notNull: true }, group: 'basic' }),
    method: Field.select({
      label: '收款方式',
      group: 'basic',
      options: [
        { label: '银行转账', value: 'bank_transfer', default: true },
        { label: '支票', value: 'check' },
        { label: '承兑汇票', value: 'bank_draft' },
        { label: '其他', value: 'other' },
      ],
    }),
    bank_reference: Field.text({ label: '银行流水号', group: 'basic' }),
    description: Field.textarea({ label: '说明', group: 'basic' }),
  },
  indexes: [
    { fields: ['crm_delivery_project'] },
    { fields: ['crm_invoice'] },
  ],
  enable: {
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
    files: true,
  },
});
