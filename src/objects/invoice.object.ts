// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { F } from '@objectstack/spec';

/**
 * 开票 — round 2 (steps 37 / 38): an invoice issued against a delivery
 * project, entered by hand (no finance-system feed in this round). Collections
 * roll up onto it, so the outstanding balance is one subtraction.
 */
export const Invoice = ObjectSchema.create({
  name: 'crm_invoice',
  label: '开票',
  pluralLabel: '开票',
  icon: 'file-text',
  description: '按交付项目登记的开票记录：发票信息、金额、状态，收款汇总后得出未收余额',
  sharingModel: 'controlled_by_parent',
  nameField: 'invoice_code',
  searchableFields: ['invoice_code', 'invoice_number'],
  highlightFields: ['crm_delivery_project', 'invoice_date', 'amount', 'collected_amount', 'status'],
  fieldGroups: [
    { key: 'basic', label: '开票信息', icon: 'file-text' },
    { key: 'settlement', label: '收款情况', icon: 'dollar-sign' },
  ],
  fields: {
    invoice_code: Field.autonumber({ label: '开票编号', format: 'INV-{0000}', group: 'basic' }),
    owner_id: Field.lookup('sys_user', { label: '经办人', group: 'basic', system: true, readonly: false }),
    crm_delivery_project: Field.masterDetail('crm_delivery_project', { label: '交付项目', group: 'basic', required: true, storage: { notNull: true }, deleteBehavior: 'cascade' }),
    crm_contract: Field.lookup('crm_contract', { label: '销售合同', group: 'basic' }),
    crm_account: Field.lookup('crm_account', { label: '客户', group: 'basic' }),
    invoice_type: Field.select({
      label: '发票类型',
      group: 'basic',
      options: [
        { label: '增值税专用发票', value: 'vat_special', default: true },
        { label: '增值税普通发票', value: 'vat_general' },
        { label: '电子发票', value: 'electronic' },
      ],
    }),
    invoice_number: Field.text({ label: '发票号码', group: 'basic' }),
    invoice_date: Field.date({ label: '开票日期', group: 'basic', required: true, storage: { notNull: true } }),
    amount: Field.currency({ label: '开票金额', scale: 2, required: true, storage: { notNull: true }, group: 'basic', description: '含税金额' }),
    tax_rate: Field.number({ label: '税率 (%)', group: 'basic', defaultValue: 6 }),
    due_date: Field.date({ label: '到期日', group: 'basic' }),
    status: Field.select({
      label: '状态',
      group: 'basic',
      defaultValue: 'draft',
      options: [
        { label: '草稿', value: 'draft', default: true },
        { label: '已开具', value: 'issued', color: '#4169E1' },
        { label: '已寄出', value: 'sent', color: '#FFA500' },
        { label: '已收款', value: 'paid', color: '#00AA00' },
        { label: '作废', value: 'void', color: '#999999' },
      ],
    }),
    description: Field.textarea({ label: '说明', group: 'basic' }),
    collected_amount: Field.summary({
      label: '已收款金额',
      group: 'settlement',
      scale: 2,
      summaryOperations: { object: 'crm_collection', field: 'amount', function: 'sum', relationshipField: 'crm_invoice' },
    }),
    outstanding_amount: Field.formula({
      label: '未收余额',
      group: 'settlement',
      expression: F`coalesce(record.amount, 0) - coalesce(record.collected_amount, 0)`,
      scale: 2,
    }),
  },
  indexes: [
    { fields: ['crm_delivery_project'] },
    { fields: ['crm_account'] },
    { fields: ['status'] },
  ],
  enable: {
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
    files: true,
  },
});
