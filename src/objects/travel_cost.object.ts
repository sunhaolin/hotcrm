// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';

/** 差旅成本 — step 35: a travel actual booked to a delivery project against a receipt (epic #2 / T4). */
export const TravelCost = ObjectSchema.create({
  name: 'crm_travel_cost',
  label: 'Travel Cost',
  pluralLabel: 'Travel Costs',
  icon: 'plane',
  description: 'A travel expense booked to a delivery project, referenced to its reimbursement receipt',
  sharingModel: 'controlled_by_parent',
  nameField: 'travel_number',
  highlightFields: ['crm_delivery_project', 'owner_id', 'expense_date', 'amount'],
  fieldGroups: [
    { key: 'basic', label: 'Travel Cost', icon: 'plane' },
  ],
  fields: {
    travel_number: Field.autonumber({ label: 'Travel #', format: 'TRV-{0000}', group: 'basic' }),
    owner_id: Field.lookup('sys_user', { label: 'Traveller', group: 'basic', system: true, readonly: false }),
    crm_delivery_project: Field.masterDetail('crm_delivery_project', { label: 'Delivery Project', group: 'basic', required: true, storage: { notNull: true }, deleteBehavior: 'cascade' }),
    expense_date: Field.date({ label: 'Expense Date', group: 'basic' }),
    amount: Field.currency({ label: 'Amount', scale: 2, group: 'basic', required: true, storage: { notNull: true } }),
    receipt_number: Field.text({ label: 'Receipt Number', group: 'basic' }),
    description: Field.text({ label: 'Description', group: 'basic' }),
  },
  indexes: [
    { fields: ['crm_delivery_project'] },
    { fields: ['owner_id'] },
  ],
  enable: {
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
  },
});
