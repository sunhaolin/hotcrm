// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { APPROVAL_STATUS_OPTIONS_ZH } from './_psa-picklists';

/**
 * 出差申请 — round 2: a trip request approved before travel. Travel costs
 * (`crm_travel_cost`) reference the trip and roll up onto it, and the trip
 * carries the project so a cost booked to it lands on the right project
 * (`travel_cost.hook.ts`).
 */
export const BusinessTrip = ObjectSchema.create({
  name: 'crm_business_trip',
  label: '出差申请',
  pluralLabel: '出差申请',
  icon: 'map-pin',
  description: '出差申请与审批：目的地、起止日期、事由、预计费用；差旅成本关联到出差单后自动汇总实际费用',
  sharingModel: 'private',
  nameField: 'subject',
  searchableFields: ['subject', 'trip_code', 'destination'],
  highlightFields: ['trip_code', 'owner_id', 'destination', 'start_date', 'end_date', 'approval_status'],
  fieldGroups: [
    { key: 'basic', label: '出差信息', icon: 'map-pin' },
    { key: 'cost', label: '费用', icon: 'dollar-sign' },
    { key: 'approval', label: '审批', icon: 'check-circle' },
  ],
  fields: {
    trip_code: Field.autonumber({ label: '出差单号', format: 'TRP-{0000}', group: 'basic' }),
    subject: Field.text({ label: '出差主题', required: true, storage: { notNull: true }, searchable: true, group: 'basic' }),
    owner_id: Field.lookup('sys_user', { label: '出差人', group: 'basic', system: true, readonly: false }),
    crm_delivery_project: Field.lookup('crm_delivery_project', { label: '交付项目', group: 'basic' }),
    crm_presales_project: Field.lookup('crm_presales_project', { label: '售前项目', group: 'basic', description: '售前阶段的出差挂在售前项目上' }),
    destination: Field.text({ label: '目的地', required: true, storage: { notNull: true }, group: 'basic' }),
    start_date: Field.date({ label: '开始日期', required: true, storage: { notNull: true }, group: 'basic' }),
    end_date: Field.date({ label: '结束日期', required: true, storage: { notNull: true }, group: 'basic' }),
    days: Field.number({ label: '出差天数', group: 'basic', description: '按起止日期自动计算（含首尾）' }),
    transport: Field.select({
      label: '交通方式',
      group: 'basic',
      options: [
        { label: '飞机', value: 'flight' },
        { label: '高铁 / 火车', value: 'train', default: true },
        { label: '自驾 / 汽车', value: 'car' },
        { label: '其他', value: 'other' },
      ],
    }),
    purpose: Field.textarea({ label: '出差事由', required: true, storage: { notNull: true }, group: 'basic' }),
    estimated_cost: Field.currency({ label: '预计费用', scale: 2, group: 'cost' }),
    actual_cost: Field.summary({
      label: '实际费用',
      group: 'cost',
      scale: 2,
      summaryOperations: { object: 'crm_travel_cost', field: 'amount', function: 'sum', relationshipField: 'crm_business_trip' },
    }),
    // readonly: rendered on forms, written only by the 发起审批 button
    // (`src/actions/psa-approval.actions.ts`) and the approval flow.
    approval_status: Field.select({ label: '审批状态', group: 'approval', defaultValue: 'draft', readonly: true, trackHistory: true, options: [...APPROVAL_STATUS_OPTIONS_ZH] }),
    approved_date: Field.datetime({ label: '审批通过时间', group: 'approval', readonly: true }),
    notes: Field.textarea({ label: '备注', group: 'basic' }),
  },
  indexes: [
    { fields: ['owner_id'] },
    { fields: ['crm_delivery_project'] },
    { fields: ['approval_status'] },
  ],
  enable: {
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
    files: true,
  },
});
