// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { F } from '@objectstack/spec';
import { APPROVAL_STATUS_OPTIONS, PROJECT_TYPE_OPTIONS, BUSINESS_CATEGORY_OPTIONS, SECURITY_CLASS_OPTIONS, COST_CENTER_OPTIONS, DEPARTMENT_OPTIONS } from './_psa-picklists';

/**
 * 交付项目 — steps 21–26 plus the cost rollups steps 27, 36 and 39 read
 * (epic #2 / T3). Demo branch only.
 *
 * The rollups are platform-native `Field.summary` over the three cost children
 * (T4); the two percentages inline the two summaries rather than read a formula
 * from a formula. Two of the three are master-detail: `crm_timesheet` became a
 * `lookup` child when its delivery project stopped being mandatory (「交付项目
 * 不要必填」, 2026-09-15), and `Field.summary` reads either relationship — a
 * sheet that names no project simply joins no project's `labor_actual`.
 */
export const DeliveryProject = ObjectSchema.create({
  name: 'crm_delivery_project',
  label: '交付项目',
  pluralLabel: '交付项目',
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
    { key: 'finance',    label: 'Contract & Finance',  icon: 'dollar-sign' },
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
    pricing_manager: Field.lookup('sys_user', { label: 'Pricing Owner', group: 'roles' }),
    subcontract_ts_lead: Field.lookup('sys_user', { label: 'Subcontract TS Owner', group: 'roles' }),
    qa_lead: Field.lookup('sys_user', { label: 'QA Lead', group: 'roles' }),

    budget_baseline: Field.currency({ label: 'Budget Baseline', description: 'The approved Bizcase total cost, carried over as the control baseline. Leave it empty on create and it is carried from the approved presales project, together with that Bizcase as cost plan lines (spec step 27).', scale: 2, group: 'budget' }),
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
      // Round 2 (step 34): only APPROVED timesheets count as actual cost.
      summaryOperations: { object: 'crm_timesheet', field: 'cost', function: 'sum', relationshipField: 'crm_delivery_project', filter: { approval_status: 'approved' } },
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
    // Round 2 (step 32): approved adjustments move the control line; the two
    // percentages and the variance read the CURRENT budget (baseline + adjustments).
    budget_adjustment_total: Field.summary({
      label: 'Approved Adjustments',
      group: 'budget',
      scale: 2,
      summaryOperations: { object: 'crm_budget_adjustment', field: 'amount', function: 'sum', relationshipField: 'crm_delivery_project', filter: { approval_status: 'approved' } },
    }),
    budget_current: Field.formula({
      label: 'Current Budget',
      group: 'budget',
      expression: F`coalesce(record.budget_baseline, 0) + coalesce(record.budget_adjustment_total, 0)`,
      scale: 2,
    }),
    budget_burn_pct: Field.formula({
      label: 'Budget Burn %',
      description: 'Actual ÷ Current budget × 100. Reads 0 until a positive budget is set.',
      group: 'budget',
      expression: F`(coalesce(record.budget_baseline, 0) + coalesce(record.budget_adjustment_total, 0)) > 0 ? ((coalesce(record.labor_actual, 0) + coalesce(record.travel_actual, 0)) * 100.0) / (coalesce(record.budget_baseline, 0) + coalesce(record.budget_adjustment_total, 0)) : 0.0`,
      scale: 2,
    }),
    budget_variance: Field.formula({
      label: 'Budget Variance',
      group: 'budget',
      expression: F`(coalesce(record.budget_baseline, 0) + coalesce(record.budget_adjustment_total, 0)) - (coalesce(record.labor_actual, 0) + coalesce(record.travel_actual, 0))`,
      scale: 2,
    }),

    // Round 2 (steps 37 / 38 / 40): contract, progress, revenue, invoicing and
    // collections. Invoices / collections / purchase contracts / orders are
    // master-detail children; their totals are platform rollups.
    crm_contract: Field.lookup('crm_contract', { label: 'Sales Contract', group: 'finance' }),
    contract_amount: Field.currency({ label: 'Contract Amount', scale: 2, group: 'finance', description: 'Defaults from the sales contract value (delivery_project_defaults).' }),
    progress_pct: Field.number({ label: 'Progress %', group: 'finance', description: '0–100, maintained by the project manager.' }),
    revenue_recognized: Field.formula({
      label: 'Revenue Recognized',
      description: 'Contract amount × progress %.',
      group: 'finance',
      expression: F`coalesce(record.contract_amount, 0) * coalesce(record.progress_pct, 0) / 100.0`,
      scale: 2,
    }),
    invoiced_total: Field.summary({
      label: 'Invoiced Total',
      group: 'finance',
      scale: 2,
      summaryOperations: { object: 'crm_invoice', field: 'amount', function: 'sum', relationshipField: 'crm_delivery_project', filter: { status: { $ne: 'void' } } },
    }),
    collected_total: Field.summary({
      label: 'Collected Total',
      group: 'finance',
      scale: 2,
      summaryOperations: { object: 'crm_collection', field: 'amount', function: 'sum', relationshipField: 'crm_delivery_project' },
    }),
    receivable_balance: Field.formula({
      label: 'Receivable Balance',
      group: 'finance',
      expression: F`coalesce(record.invoiced_total, 0) - coalesce(record.collected_total, 0)`,
      scale: 2,
    }),
    purchase_total: Field.summary({
      label: 'Purchase Contracts Total',
      group: 'finance',
      scale: 2,
      summaryOperations: { object: 'crm_purchase_contract', field: 'amount', function: 'sum', relationshipField: 'crm_delivery_project', filter: { status: { $ne: 'terminated' } } },
    }),
    order_total: Field.summary({
      label: 'Sales Orders Total',
      group: 'finance',
      scale: 2,
      summaryOperations: { object: 'crm_sales_order', field: 'amount', function: 'sum', relationshipField: 'crm_delivery_project' },
    }),
    project_margin_pct: Field.formula({
      label: 'Project Gross Margin %',
      description: '(Contract amount − actual cost) ÷ contract amount × 100.',
      group: 'finance',
      expression: F`coalesce(record.contract_amount, 0) > 0 ? ((record.contract_amount - (coalesce(record.labor_actual, 0) + coalesce(record.travel_actual, 0))) * 100.0) / record.contract_amount : 0.0`,
      scale: 2,
    }),

    security_class: Field.select({ label: 'Security Class', group: 'security', options: [...SECURITY_CLASS_OPTIONS] }),
    security_note: Field.textarea({ label: 'Security Note', group: 'security' }),

    // readonly: rendered on forms, written only by the 发起审批 button
    // (`src/actions/psa-approval.actions.ts`) and the approval flow.
    approval_status: Field.select({ label: 'Approval Status', group: 'approval', defaultValue: 'draft', readonly: true, trackHistory: true, options: [...APPROVAL_STATUS_OPTIONS] }),
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
