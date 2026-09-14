// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { F } from '@objectstack/spec';
import { APPROVAL_STATUS_OPTIONS, PROJECT_TYPE_OPTIONS, BUSINESS_CATEGORY_OPTIONS, SECURITY_CLASS_OPTIONS } from './_psa-picklists';

/**
 * 售前项目 — steps 15–20 of the customer's spec collapsed into one object
 * (epic #2 / T2). Demo branch only. The four cost inputs and the quote yield
 * `total_cost` and `gross_margin_pct` as formulas; both inline the sum rather
 * than reading one formula from another.
 */
export const PresalesProject = ObjectSchema.create({
  name: 'crm_presales_project',
  label: 'Presales Project',
  pluralLabel: 'Presales Projects',
  icon: 'lightbulb',
  description: 'A presales project opened against an approved opportunity: roles, cost estimate, quote and margin',
  sharingModel: 'private',
  nameField: 'name',
  searchableFields: ['name', 'project_number'],
  highlightFields: ['project_number', 'crm_opportunity', 'quote_amount', 'gross_margin_pct', 'approval_status'],

  fieldGroups: [
    { key: 'basic',         label: 'Project Information', icon: 'info' },
    { key: 'roles',         label: 'Project Roles',       icon: 'users' },
    { key: 'cost_estimate', label: 'Cost Estimate & Quote', icon: 'calculator' },
    { key: 'security',      label: 'Information Security', icon: 'shield' },
    { key: 'approval',      label: 'Approval',            icon: 'check-circle' },
    { key: 'notes',         label: 'Background',          icon: 'file-text', collapse: 'collapsed' },
  ],

  fields: {
    owner_id: Field.lookup('sys_user', { label: 'Project Owner', group: 'basic', system: true, readonly: false }),
    project_number: Field.autonumber({ label: 'Project Number', format: 'PSP-{0000}', group: 'basic' }),
    name: Field.text({ label: 'Project Name', required: true, storage: { notNull: true }, searchable: true, group: 'basic' }),
    alias: Field.text({ label: 'Alias', group: 'basic' }),
    crm_opportunity: Field.lookup('crm_opportunity', { label: 'Opportunity', required: true, storage: { notNull: true }, group: 'basic' }),
    crm_account: Field.lookup('crm_account', { label: 'Account', group: 'basic' }),
    project_type: Field.select({ label: 'Project Type', group: 'basic', options: [...PROJECT_TYPE_OPTIONS] }),
    business_category: Field.select({ label: 'Business Category', group: 'basic', options: [...BUSINESS_CATEGORY_OPTIONS] }),
    planned_start: Field.date({ label: 'Planned Start', group: 'basic' }),
    planned_end: Field.date({ label: 'Planned End', group: 'basic' }),
    expected_contract_amount: Field.currency({ label: 'Expected Contract Amount', scale: 2, group: 'basic' }),

    account_manager: Field.lookup('sys_user', { label: 'Account Manager', group: 'roles' }),
    project_manager: Field.lookup('sys_user', { label: 'Project Manager', group: 'roles' }),
    project_director: Field.lookup('sys_user', { label: 'Project Director', group: 'roles' }),
    project_qa: Field.lookup('sys_user', { label: 'Project QA', group: 'roles' }),
    pricing_owner: Field.lookup('sys_user', { label: 'Pricing Owner', group: 'roles' }),

    labor_cost: Field.currency({ label: 'Labor Service Cost', scale: 2, group: 'cost_estimate' }),
    third_party_service_cost: Field.currency({ label: 'Third-party Service Cost', scale: 2, group: 'cost_estimate' }),
    procurement_cost: Field.currency({ label: 'Hardware/Software Procurement Cost', scale: 2, group: 'cost_estimate' }),
    project_expense: Field.currency({ label: 'Project Expense', scale: 2, group: 'cost_estimate' }),
    total_cost: Field.formula({
      label: 'Total Cost',
      group: 'cost_estimate',
      expression: F`coalesce(record.labor_cost, 0) + coalesce(record.third_party_service_cost, 0) + coalesce(record.procurement_cost, 0) + coalesce(record.project_expense, 0)`,
      scale: 2,
    }),
    quote_amount: Field.currency({ label: 'Quote Amount', scale: 2, group: 'cost_estimate' }),
    gross_margin_pct: Field.formula({
      label: 'Gross Margin %',
      description: '(Quote − Total Cost) ÷ Quote × 100. Reads 0 until a positive quote is set.',
      group: 'cost_estimate',
      expression: F`coalesce(record.quote_amount, 0) > 0 ? ((record.quote_amount - (coalesce(record.labor_cost, 0) + coalesce(record.third_party_service_cost, 0) + coalesce(record.procurement_cost, 0) + coalesce(record.project_expense, 0))) * 100.0) / record.quote_amount : 0.0`,
      scale: 2,
    }),

    security_class: Field.select({ label: 'Security Class', group: 'security', options: [...SECURITY_CLASS_OPTIONS] }),
    security_note: Field.textarea({ label: 'Security Note', group: 'security' }),

    // Demo submit gesture (epic #2, decision 1): editable; the T5 flow mirrors
    // pending / approved / rejected once the user sets `submitted`.
    approval_status: Field.select({ label: 'Approval Status', group: 'approval', defaultValue: 'draft', trackHistory: true, options: [...APPROVAL_STATUS_OPTIONS] }),
    approved_date: Field.datetime({ label: 'Approved Date', group: 'approval', readonly: true }),

    description: Field.markdown({ label: 'Project Background', group: 'notes' }),
  },

  indexes: [
    { fields: ['crm_opportunity'] },
    { fields: ['owner_id'] },
    { fields: ['approval_status'] },
  ],

  enable: {
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
    files: true,
  },
});
