// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { APPROVAL_STATUS_OPTIONS } from './_psa-picklists';

/**
 * 工时表 — steps 33–34: person × project × month (epic #2 / T4).
 *
 * `cost` is a STORED currency, not a formula: `Field.summary` on the parent has
 * precedent only over stored columns in this repo, so the timesheet hook (T6)
 * fills `hours × hourly_rate` and the seed carries the value outright.
 */
export const Timesheet = ObjectSchema.create({
  name: 'crm_timesheet',
  label: '工时表',
  pluralLabel: '工时表',
  icon: 'clock',
  description: 'Monthly hours a person books to a delivery project, approved by the project manager',
  sharingModel: 'controlled_by_parent',
  nameField: 'timesheet_number',
  highlightFields: ['crm_delivery_project', 'owner_id', 'period_month', 'hours', 'cost', 'approval_status'],
  fieldGroups: [
    { key: 'basic',    label: 'Timesheet', icon: 'clock' },
    { key: 'approval', label: 'Approval',  icon: 'check-circle' },
  ],
  fields: {
    timesheet_number: Field.autonumber({ label: 'Timesheet #', format: 'TS-{0000}', group: 'basic' }),
    owner_id: Field.lookup('sys_user', { label: 'Submitted By', group: 'basic', system: true, readonly: false }),
    crm_delivery_project: Field.masterDetail('crm_delivery_project', { label: 'Delivery Project', group: 'basic', required: true, storage: { notNull: true }, deleteBehavior: 'cascade' }),
    crm_presales_project: Field.lookup('crm_presales_project', { label: 'Presales Project', group: 'basic', description: 'Optional — presales hours are recorded but not rolled up (epic decision 4).' }),
    crm_rate_card: Field.lookup('crm_rate_card', { label: 'Grade / Rate Card', group: 'basic', description: 'Fills the hourly rate from the rate card (timesheet_rate_fill).' }),
    period_month: Field.date({ label: 'Period (Month)', group: 'basic' }),
    // Round 2 (step 33): attendance. `leave_hours` is written by the hook from
    // approved leave requests; `hours` = standard − leave + overtime while the
    // sheet is a draft and the caller did not set it.
    standard_hours: Field.number({ label: 'Standard Hours', group: 'basic', defaultValue: 160 }),
    leave_hours: Field.number({ label: 'Leave Hours', group: 'basic', description: 'Synced from approved leave requests of the submitter for this month.' }),
    overtime_hours: Field.number({ label: 'Overtime Hours', group: 'basic' }),
    hours: Field.number({ label: 'Hours', group: 'basic' }),
    hourly_rate: Field.currency({ label: 'Hourly Rate', scale: 2, group: 'basic' }),
    cost: Field.currency({ label: 'Cost', scale: 2, group: 'basic', description: 'Hours × hourly rate; filled by the timesheet hook.' }),
    notes: Field.textarea({ label: 'Notes', group: 'basic' }),
    // readonly: rendered on forms, written only by the 发起审批 button
    // (`src/actions/psa-approval.actions.ts`) and the approval flow.
    approval_status: Field.select({ label: 'Approval Status', group: 'approval', defaultValue: 'draft', readonly: true, trackHistory: true, options: [...APPROVAL_STATUS_OPTIONS] }),
    approved_date: Field.datetime({ label: 'Approved Date', group: 'approval', readonly: true }),
  },
  indexes: [
    { fields: ['crm_delivery_project'] },
    { fields: ['owner_id'] },
    { fields: ['period_month'] },
  ],
  enable: {
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
  },
});
