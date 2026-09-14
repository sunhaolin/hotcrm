// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { COST_CATEGORY_OPTIONS } from './_psa-picklists';

/** 成本计划行 — steps 28–31: one planned amount per category per month (epic #2 / T4). */
export const CostPlanLine = ObjectSchema.create({
  name: 'crm_cost_plan_line',
  label: 'Cost Plan Line',
  pluralLabel: 'Cost Plan Lines',
  icon: 'list',
  description: 'One planned cost amount for a delivery project, by category and month',
  sharingModel: 'controlled_by_parent',
  nameField: 'description',
  highlightFields: ['category', 'period_month', 'planned_amount'],
  fieldGroups: [
    { key: 'basic', label: 'Cost Plan Line', icon: 'list' },
  ],
  fields: {
    crm_delivery_project: Field.masterDetail('crm_delivery_project', { label: 'Delivery Project', group: 'basic', required: true, storage: { notNull: true }, deleteBehavior: 'cascade' }),
    category: Field.select({ label: 'Cost Category', required: true, storage: { notNull: true }, group: 'basic', options: [...COST_CATEGORY_OPTIONS] }),
    period_month: Field.date({ label: 'Period (Month)', group: 'basic' }),
    description: Field.text({ label: 'Description', required: true, storage: { notNull: true }, group: 'basic', description: 'Grade / service name / procurement category the line is for.' }),
    quantity: Field.number({ label: 'Quantity', group: 'basic' }),
    unit_price: Field.currency({ label: 'Unit Price', scale: 2, group: 'basic' }),
    planned_amount: Field.currency({ label: 'Planned Amount', scale: 2, group: 'basic' }),
    notes: Field.textarea({ label: 'Notes', group: 'basic' }),
  },
  indexes: [
    { fields: ['crm_delivery_project'] },
    { fields: ['category'] },
  ],
  enable: {
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
  },
});
