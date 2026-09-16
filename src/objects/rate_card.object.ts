// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { RATE_STANDARD_OPTIONS } from './_psa-picklists';

/**
 * 费率卡 — round 2 (steps 18 / 28): 岗位级别 × 费率标准 × 生效区间, one row per
 * interval. A timesheet copies the hourly rate it names; a labor cost-plan line
 * re-resolves the row effective in each month (`timesheet.hook.ts` /
 * `cost_plan.hook.ts`).
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
  highlightFields: ['grade_code', 'rate_standard', 'hourly_rate', 'daily_rate', 'is_active'],
  fieldGroups: [
    { key: 'basic', label: '费率卡', icon: 'tag' },
  ],
  fields: {
    name: Field.text({ label: '岗位级别', required: true, storage: { notNull: true }, searchable: true, group: 'basic' }),
    grade_code: Field.text({ label: '级别代码', group: 'basic' }),
    rate_standard: Field.select({ label: '费率标准', group: 'basic', options: [...RATE_STANDARD_OPTIONS], description: '同一岗位级别可按标准分行；人工成本行按级别与标准解析该月生效的费率。' }),
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
