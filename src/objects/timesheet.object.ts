// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { APPROVAL_STATUS_OPTIONS } from './_psa-picklists';

/**
 * 工时表 — steps 33–34: person × project × month (epic #2 / T4).
 *
 * `cost` is a STORED currency, not a formula: `Field.summary` on the parent has
 * precedent only over stored columns in this repo, so the timesheet hook (T6)
 * fills `hours × hourly_rate` and the seed carries the value outright.
 *
 * ⭐ The delivery project is OPTIONAL (maintainer request, 2026-09-15:
 * 「交付项目 不要必填」), which is one decision with two halves — a `lookup`
 * instead of a `masterDetail`, and `private` instead of `controlled_by_parent`.
 * See the field itself for why the second half follows from the first. It also
 * closes a promise the docs have always made and the metadata refused: the
 * timesheet page offers 'Delivery Project *or* Presales Project' and tells the
 * reader to book bid work to the presales project, while a mandatory master
 * made a presales-only (or attendance-only) sheet impossible to create.
 */
export const Timesheet = ObjectSchema.create({
  name: 'crm_timesheet',
  label: '工时表',
  pluralLabel: '工时表',
  icon: 'clock',
  description: 'Monthly hours a person books to a delivery or presales project, approved by the project manager',
  // `private`, with the sheet's own `owner_id` as the anchor — the sheet is a
  // person's monthly record, like `crm_leave_request` and `crm_business_trip`,
  // and it can no longer derive access from a parent it may not have (see
  // `crm_delivery_project` below). `sales_rep` reads its own sheets
  // (`readScope: 'own'`); the 工时审批 approver (`sales_manager`) and the
  // administrator hold View All.
  sharingModel: 'private',
  nameField: 'timesheet_number',
  highlightFields: ['crm_delivery_project', 'owner_id', 'period_month', 'hours', 'cost', 'approval_status'],
  fieldGroups: [
    { key: 'basic',    label: 'Timesheet', icon: 'clock' },
    { key: 'approval', label: 'Approval',  icon: 'check-circle' },
  ],
  fields: {
    timesheet_number: Field.autonumber({ label: 'Timesheet #', format: 'TS-{0000}', group: 'basic' }),
    owner_id: Field.lookup('sys_user', { label: 'Submitted By', group: 'basic', system: true, readonly: false }),
    // ⭐ A `lookup`, not a `masterDetail`, because this parent is OPTIONAL — and
    // an optional master-detail is not a shape the platform has. Two layers say
    // so, and the first is NOT the `required: true` this line used to spell out:
    // `Field.masterDetail()` stamps `required: true` on the field it returns
    // (@objectstack/spec 17.4.0), so deleting the flag and keeping the type
    // changes nothing — MEASURED by the ablation in
    // `test/timesheet-optional-project.test.ts`, which answers `ValidationError:
    // Delivery Project is required` with the flag gone. Behind that stands
    // ADR-0055 itself: a `controlled_by_parent` child reads as
    // `crm_delivery_project IN (<projects the caller can read>)`, which no NULL
    // row matches, and its write gate refuses a detail whose master reference is
    // empty (`MasterReferenceMissingError`, 422 MISSING_REQUIRED_FIELD). A
    // nullable parent gives up the derivation too, which is why `sharingModel`
    // above is `private`. The parent's `labor_actual` rollup is unaffected:
    // `Field.summary` reads a `lookup` relationship the same way it reads a
    // master-detail one, as `crm_presales_project.presales_labor_actual` has
    // done over this object's OTHER project field all along.
    // `deleteBehavior: 'cascade'` is DECLARED rather than left to the lookup
    // default `set_null`, so deleting a project still takes its sheets with it —
    // exactly what master-detail gave for free, and the same declaration
    // `crm_campaign_member` carries on both of its party lookups (#696).
    crm_delivery_project: Field.lookup('crm_delivery_project', { label: 'Delivery Project', group: 'basic', deleteBehavior: 'cascade', description: 'Optional — a sheet with no delivery project books presales or attendance hours only. Approved sheets roll up into the project Labor Actual.' }),
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
