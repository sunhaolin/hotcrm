// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * 费率卡 — round 2 (steps 18 / 28): the grade × rate master data the customer
 * asked for. A timesheet or a labor cost-plan line that names a rate card gets
 * its rate from here (see `timesheet.hook.ts` / `cost_plan_line.hook.ts`).
 * Chinese-only branch: labels are authored in Chinese directly.
 */
export const RateCard = ObjectSchema.create({
  name: 'crm_rate_card',
  label: '费率卡',
  pluralLabel: '费率卡',
  icon: 'tag',
  description: '岗位级别与费率标准：工时表和人工成本计划的单价来源',
  sharingModel: 'public_read_write',
  nameField: 'name',
  searchableFields: ['name', 'grade_code'],
  highlightFields: ['grade_code', 'hourly_rate', 'daily_rate', 'is_active'],
  fieldGroups: [
    { key: 'basic', label: '费率卡', icon: 'tag' },
  ],
  fields: {
    name: Field.text({ label: '岗位级别', required: true, storage: { notNull: true }, searchable: true, group: 'basic' }),
    grade_code: Field.text({ label: '级别代码', group: 'basic' }),
    hourly_rate: Field.currency({ label: '小时费率', scale: 2, required: true, storage: { notNull: true }, group: 'basic' }),
    daily_rate: Field.currency({ label: '日费率', scale: 2, group: 'basic', description: '按 8 小时折算的参考值' }),
    effective_from: Field.date({ label: '生效日期', group: 'basic' }),
    effective_to: Field.date({ label: '失效日期', group: 'basic' }),
    is_active: Field.boolean({ label: '启用', group: 'basic', defaultValue: true }),
    notes: Field.textarea({ label: '备注', group: 'basic' }),
  },
  indexes: [
    { fields: ['name'] },
    { fields: ['is_active'] },
  ],
  enable: {
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
  },
});
