// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { F } from '@objectstack/spec';
import { APPROVAL_STATUS_OPTIONS_ZH } from './_psa-picklists';

/**
 * 请假申请 — round 2 (step 33 「请假、加班申请同步后自动更新」): an approved
 * leave lowers the submitter's timesheet hours for the months it touches
 * (`leave_request.hook.ts` / `timesheet.hook.ts`). Working days are counted
 * Mon–Fri; one working day is eight hours.
 */
export const LeaveRequest = ObjectSchema.create({
  name: 'crm_leave_request',
  label: '请假申请',
  pluralLabel: '请假申请',
  icon: 'calendar',
  description: '请假申请与审批；审批通过后自动同步到申请人当月工时表的请假工时',
  sharingModel: 'private',
  nameField: 'leave_code',
  searchableFields: ['leave_code'],
  highlightFields: ['owner_id', 'leave_type', 'start_date', 'end_date', 'days', 'approval_status'],
  fieldGroups: [
    { key: 'basic', label: '请假信息', icon: 'calendar' },
    { key: 'approval', label: '审批', icon: 'check-circle' },
  ],
  fields: {
    leave_code: Field.autonumber({ label: '请假单号', format: 'LV-{0000}', group: 'basic' }),
    owner_id: Field.lookup('sys_user', { label: '申请人', group: 'basic', system: true, readonly: false }),
    leave_type: Field.select({
      label: '请假类型',
      group: 'basic',
      required: true,
      storage: { notNull: true },
      options: [
        { label: '年假', value: 'annual', default: true },
        { label: '病假', value: 'sick' },
        { label: '事假', value: 'personal' },
        { label: '调休', value: 'compensatory' },
        { label: '婚假', value: 'marriage' },
        { label: '产假 / 陪产假', value: 'maternity' },
        { label: '其他', value: 'other' },
      ],
    }),
    start_date: Field.date({ label: '开始日期', required: true, storage: { notNull: true }, group: 'basic' }),
    end_date: Field.date({ label: '结束日期', required: true, storage: { notNull: true }, group: 'basic' }),
    days: Field.number({ label: '工作日天数', group: 'basic', description: '按起止日期自动计算，只计周一至周五' }),
    hours: Field.formula({
      label: '请假工时',
      group: 'basic',
      expression: F`coalesce(record.days, 0) * 8.0`,
      scale: 1,
    }),
    reason: Field.textarea({ label: '请假事由', required: true, storage: { notNull: true }, group: 'basic' }),
    crm_delivery_project: Field.lookup('crm_delivery_project', { label: '影响项目', group: 'basic', description: '可选：请假期间所在的交付项目' }),
    // readonly: rendered on forms, written only by the 发起审批 button
    // (`src/actions/psa-approval.actions.ts`) and the approval flow.
    approval_status: Field.select({ label: '审批状态', group: 'approval', defaultValue: 'draft', readonly: true, trackHistory: true, options: [...APPROVAL_STATUS_OPTIONS_ZH] }),
    approved_date: Field.datetime({ label: '审批通过时间', group: 'approval', readonly: true }),
    notes: Field.textarea({ label: '备注', group: 'basic' }),
  },
  indexes: [
    { fields: ['owner_id'] },
    { fields: ['approval_status'] },
    { fields: ['start_date'] },
  ],
  enable: {
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
    files: true,
  },
});
