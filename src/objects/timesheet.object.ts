// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { APPROVAL_STATUS_OPTIONS } from './_psa-picklists';

/**
 * 工时表 — steps 33–34: person × project × month (epic #2 / T4).
 *
 * `cost` is a STORED currency, not a formula: `Field.summary` on the parent has
 * precedent only over stored columns in this repo, so the timesheet hook (T6)
 * fills `hours × hourly_rate` and the seed carries the value outright. Stored
 * does not mean authored — see the note on `hourly_rate` / `cost` below.
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
    // DERIVED, never authored — and `readonly` is the declaration that says so
    // (the `crm_case` narrowing in `src/views/case.view.ts` is the precedent).
    // The rate is the rate card's, the cost is hours × rate, and
    // `timesheet.hook.ts` is the only writer of either. A caller's own value is
    // stripped from the payload while a value a hook wrote survives — the
    // UPDATE side of that is measured in `test/readonly-write-semantics.test.ts`,
    // and the file's retired INSERT describe records the 17.4.0 change that
    // made the create path behave the same way.
    //
    // ⚠️ `readonly` is a WRITE contract, not `hidden`: both columns still
    // render on the list view and on the synthesized detail page. Keeping them
    // off the CREATE/EDIT form is the form's own field set — see the note on
    // `src/views/timesheet.view.ts`, pinned by
    // `test/timesheet-derived-price-surface.test.ts`.
    hourly_rate: Field.currency({ label: 'Hourly Rate', scale: 2, group: 'basic', readonly: true, description: 'Copied from the rate card the sheet names; never typed (timesheet_rate_fill).' }),
    cost: Field.currency({ label: 'Cost', scale: 2, group: 'basic', readonly: true, description: 'Hours × hourly rate; filled by the timesheet hook.' }),
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
