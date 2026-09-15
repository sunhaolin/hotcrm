// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * 销售订单 — round 2 (step 40): a customer order under a sales contract,
 * tracked to delivery and acceptance on the delivery project.
 */
export const SalesOrder = ObjectSchema.create({
  name: 'crm_sales_order',
  label: '销售订单',
  pluralLabel: '销售订单',
  icon: 'clipboard',
  description: '销售合同下的客户订单及交付、验收进度',
  sharingModel: 'controlled_by_parent',
  nameField: 'name',
  searchableFields: ['name', 'order_code'],
  highlightFields: ['order_code', 'crm_delivery_project', 'amount', 'delivery_status'],
  fieldGroups: [
    { key: 'basic', label: '订单信息', icon: 'clipboard' },
  ],
  fields: {
    order_code: Field.autonumber({ label: '订单编号', format: 'SO-{0000}', group: 'basic' }),
    owner_id: Field.lookup('sys_user', { label: '商务负责人', group: 'basic', system: true, readonly: false }),
    name: Field.text({ label: '订单名称', required: true, storage: { notNull: true }, searchable: true, group: 'basic' }),
    crm_delivery_project: Field.masterDetail('crm_delivery_project', { label: '交付项目', group: 'basic', required: true, storage: { notNull: true }, deleteBehavior: 'cascade' }),
    crm_contract: Field.lookup('crm_contract', { label: '销售合同', group: 'basic' }),
    crm_account: Field.lookup('crm_account', { label: '客户', group: 'basic' }),
    order_date: Field.date({ label: '下单日期', group: 'basic' }),
    amount: Field.currency({ label: '订单金额', scale: 2, required: true, storage: { notNull: true }, group: 'basic' }),
    delivery_status: Field.select({
      label: '交付状态',
      group: 'basic',
      defaultValue: 'pending',
      options: [
        { label: '待交付', value: 'pending', default: true },
        { label: '交付中', value: 'in_progress', color: '#4169E1' },
        { label: '已交付', value: 'delivered', color: '#FFA500' },
        { label: '已验收', value: 'accepted', color: '#00AA00' },
      ],
    }),
    acceptance_date: Field.date({ label: '验收日期', group: 'basic' }),
    description: Field.textarea({ label: '说明', group: 'basic' }),
  },
  indexes: [
    { fields: ['crm_delivery_project'] },
    { fields: ['delivery_status'] },
  ],
  enable: {
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
    files: true,
  },
});
