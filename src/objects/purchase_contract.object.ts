// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { F } from '@objectstack/spec';

/**
 * 采购合同 — round 2 (step 40): a subcontract / software / hardware purchase
 * signed for a delivery project, with what has been paid so far.
 */
export const PurchaseContract = ObjectSchema.create({
  name: 'crm_purchase_contract',
  label: '采购合同',
  pluralLabel: '采购合同',
  icon: 'briefcase',
  description: '交付项目下的分包、软件、硬件采购合同及付款进度',
  sharingModel: 'controlled_by_parent',
  nameField: 'name',
  searchableFields: ['name', 'contract_code', 'vendor_name'],
  highlightFields: ['contract_code', 'crm_delivery_project', 'vendor_name', 'amount', 'status'],
  fieldGroups: [
    { key: 'basic', label: '合同信息', icon: 'briefcase' },
    { key: 'payment', label: '付款情况', icon: 'dollar-sign' },
  ],
  fields: {
    contract_code: Field.autonumber({ label: '采购合同编号', format: 'PC-{0000}', group: 'basic' }),
    owner_id: Field.lookup('sys_user', { label: '商务负责人', group: 'basic', system: true, readonly: false }),
    name: Field.text({ label: '合同名称', required: true, storage: { notNull: true }, searchable: true, group: 'basic' }),
    crm_delivery_project: Field.masterDetail('crm_delivery_project', { label: '交付项目', group: 'basic', required: true, storage: { notNull: true }, deleteBehavior: 'cascade' }),
    vendor_name: Field.text({ label: '供应商', required: true, storage: { notNull: true }, group: 'basic' }),
    category: Field.select({
      label: '采购类别',
      group: 'basic',
      options: [
        { label: '分包服务', value: 'subcontract', default: true },
        { label: '软件采购', value: 'software' },
        { label: '硬件采购', value: 'hardware' },
        { label: '其他', value: 'other' },
      ],
    }),
    amount: Field.currency({ label: '合同金额', scale: 2, required: true, storage: { notNull: true }, group: 'basic' }),
    signed_date: Field.date({ label: '签订日期', group: 'basic' }),
    start_date: Field.date({ label: '开始日期', group: 'basic' }),
    end_date: Field.date({ label: '结束日期', group: 'basic' }),
    status: Field.select({
      label: '状态',
      group: 'basic',
      defaultValue: 'draft',
      options: [
        { label: '草稿', value: 'draft', default: true },
        { label: '执行中', value: 'active', color: '#00AA00' },
        { label: '已完成', value: 'completed', color: '#4169E1' },
        { label: '已终止', value: 'terminated', color: '#999999' },
      ],
    }),
    description: Field.textarea({ label: '说明', group: 'basic' }),
    paid_amount: Field.currency({ label: '已付款', scale: 2, group: 'payment' }),
    unpaid_amount: Field.formula({
      label: '未付款',
      group: 'payment',
      expression: F`coalesce(record.amount, 0) - coalesce(record.paid_amount, 0)`,
      scale: 2,
    }),
  },
  indexes: [
    { fields: ['crm_delivery_project'] },
    { fields: ['status'] },
  ],
  enable: {
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
    files: true,
  },
});
