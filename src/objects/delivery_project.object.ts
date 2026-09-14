// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { F } from '@objectstack/spec';
import { APPROVAL_STATUS_OPTIONS, PROJECT_TYPE_OPTIONS, BUSINESS_CATEGORY_OPTIONS, SECURITY_CLASS_OPTIONS, COST_CENTER_OPTIONS, DEPARTMENT_OPTIONS } from './_psa-picklists';

/**
 * 交付项目 — steps 21–26 plus the cost rollups steps 27, 36 and 39 read
 * (epic #2 / T3). Demo branch only.
 *
 * The rollups are platform-native `Field.summary` over the three master-detail
 * children (T4); the two percentages inline the two summaries rather than read
 * a formula from a formula.
 */
export const DeliveryProject = ObjectSchema.create({
  name: 'crm_delivery_project',
  label: 'Delivery Project',
  pluralLabel: 'Delivery Projects',
  icon: 'hammer',
  description: 'A delivery project opened from an approved presales project: cost centres, roles, budget baseline and cost rollups',
  sharingModel: 'private',
  nameField: 'name',
  searchableFields: ['name', 'project_number'],
  highlightFields: ['project_number', 'crm_presales_project', 'budget_baseline', 'actual_cost', 'budget_burn_pct'],

  fieldGroups: [
    { key: 'basic',      label: 'Project Information', icon: 'info' },
    { key: 'org',        label: 'Cost Centre & Department', icon: 'building' },
    { key: 'roles',      label: 'Project Roles',       icon: 'users' },
    { key: 'budget',     label: 'Budget & Actuals',    icon: 'trending-up' },
    { key: 'security',   label: 'Information Security', icon: 'shield' },
    { key: 'approval',   label: 'Approval',            icon: 'check-circle' },
  ],

  fields: {
    owner_id: Field.lookup('sys_user', { label: 'Project Owner', group: 'basic', system: true, readonly: false }),
    project_number: Field.autonumber({ label: 'Project Number', format: 'DLV-{0000}', group: 'basic' }),
    name: Field.text({ label: 'Project Name', required: true, storage: { notNull: true }, searchable: true, group: 'basic' }),
    alias: Field.text({ label: 'Alias', group: 'basic' }),
    crm_presales_project: Field.lookup('crm_presales_project', { label: 'Presales Project', required: true, storage: { notNull: true }, group: 'basic' }),
    crm_opportunity: Field.lookup('crm_opportunity', { label: 'Opportunity', group: 'basic' }),
    crm_account: Field.lookup('crm_account', { label: 'Account', group: 'basic' }),
    project_type: Field.select({ label: 'Project Type', group: 'basic', options: [...PROJECT_TYPE_OPTIONS] }),
    business_category: Field.select({ label: 'Business Category', group: 'basic', options: [...BUSINESS_CATEGORY_OPTIONS] }),
    planned_start: Field.date({ label: 'Planned Start', group: 'basic' }),
    planned_end: Field.date({ label: 'Planned End', group: 'basic' }),
    status: Field.select({
      label: 'Status',
      group: 'basic',
      defaultValue: 'planning',
      options: [
        { label: 'Planning', value: 'planning', default: true },
        { label: 'Active', value: 'active', color: '#00AA00' },
        { label: 'Closed', value: 'closed', color: '#999999' },
      ],
    }),

    impl_cost_center: Field.select({ label: 'Implementation Cost Centre', group: 'org', options: [...COST_CENTER_OPTIONS] }),
    accounting_cost_center: Field.select({ label: 'Accounting Cost Centre', group: 'org', options: [...COST_CENTER_OPTIONS] }),
    department: Field.select({ label: 'Department', group: 'org', options: [...DEPARTMENT_OPTIONS] }),

    project_manager: Field.lookup('sys_user', { label: 'Project Manager', group: 'roles' }),
    project_director: Field.lookup('sys_user', { label: 'Project Director', group: 'roles' }),
    pricing_owner: Field.lookup('sys_user', { label: 'Pricing Owner', group: 'roles' }),
    subcontract_ts_owner: Field.lookup('sys_user', { label: 'Subcontract TS Owner', group: 'roles' }),
    qa_lead: Field.lookup('sys_user', { label: 'QA Lead', group: 'roles' }),

    budget_baseline: Field.currency({ label: 'Budget Baseline', description: 'The approved Bizcase total cost, carried over as the control baseline.', scale: 2, group: 'budget' }),
    planned_total: Field.summary({
      label: 'Planned Total',
      group: 'budget',
      scale: 2,
      summaryOperations: { object: 'crm_cost_plan_line', field: 'planned_amount', function: 'sum', relationshipField: 'crm_delivery_project' },
    }),
    labor_actual: Field.summary({
      label: 'Labor Actual',
      group: 'budget',
      scale: 2,
      summaryOperations: { object: 'crm_timesheet', field: 'cost', function: 'sum', relationshipField: 'crm_delivery_project' },
    }),
    travel_actual: Field.summary({
      label: 'Travel Actual',
      group: 'budget',
      scale: 2,
      summaryOperations: { object: 'crm_travel_cost', field: 'amount', function: 'sum', relationshipField: 'crm_delivery_project' },
    }),
    actual_cost: Field.formula({
      label: 'Actual Cost',
      group: 'budget',
      expression: F`coalesce(record.labor_actual, 0) + coalesce(record.travel_actual, 0)`,
      scale: 2,
    }),
    budget_burn_pct: Field.formula({
      label: 'Budget Burn %',
      description: 'Actual ÷ Baseline × 100. Reads 0 until a positive baseline is set.',
      group: 'budget',
      expression: F`coalesce(record.budget_baseline, 0) > 0 ? ((coalesce(record.labor_actual, 0) + coalesce(record.travel_actual, 0)) * 100.0) / record.budget_baseline : 0.0`,
      scale: 2,
    }),
    budget_variance: Field.formula({
      label: 'Budget Variance',
      group: 'budget',
      expression: F`coalesce(record.budget_baseline, 0) - (coalesce(record.labor_actual, 0) + coalesce(record.travel_actual, 0))`,
      scale: 2,
    }),

    security_class: Field.select({ label: 'Security Class', group: 'security', options: [...SECURITY_CLASS_OPTIONS] }),
    security_note: Field.textarea({ label: 'Security Note', group: 'security' }),

    approval_status: Field.select({ label: 'Approval Status', group: 'approval', defaultValue: 'draft', trackHistory: true, options: [...APPROVAL_STATUS_OPTIONS] }),
    approved_date: Field.datetime({ label: 'Approved Date', group: 'approval', readonly: true }),
  },

  indexes: [
    { fields: ['crm_presales_project'] },
    { fields: ['owner_id'] },
    { fields: ['status'] },
  ],

  enable: {
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
    files: true,
  },
});
