// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';
import { F } from '@objectstack/spec';
import { CITY_TIER_OPTIONS } from './_psa-picklists';

/**
 * 差旅标准 — master data for step 31: the per-day lodging / meal / local
 * transport standard of a city tier plus a return-fare estimate, which a
 * 差旅 expense line multiplies by trips × travellers × days. Same shape and
 * sharing as the rate card: one shared table, no owner.
 */
export const TravelStandard = ObjectSchema.create({
  name: 'crm_travel_standard',
  label: '差旅标准',
  pluralLabel: '差旅标准',
  icon: 'map-pin',
  description: '城市级别的住宿、餐补、市内交通日标准与往返交通估算：差旅类项目费用的单价来源',
  sharingModel: 'public_read_write',
  nameField: 'name',
  searchableFields: ['name'],
  highlightFields: ['city_tier', 'daily_total', 'fare_per_trip', 'is_active'],
  fieldGroups: [
    { key: 'basic', label: '差旅标准', icon: 'map-pin' },
  ],
  fields: {
    name: Field.text({ label: '标准名称', required: true, storage: { notNull: true }, searchable: true, group: 'basic' }),
    city_tier: Field.select({ label: '城市级别', required: true, storage: { notNull: true }, group: 'basic', options: [...CITY_TIER_OPTIONS] }),
    lodging_per_day: Field.currency({ label: '住宿标准 / 天', scale: 2, group: 'basic' }),
    meal_per_day: Field.currency({ label: '餐补标准 / 天', scale: 2, group: 'basic' }),
    local_transport_per_day: Field.currency({ label: '市内交通 / 天', scale: 2, group: 'basic' }),
    fare_per_trip: Field.currency({ label: '往返交通 / 人次', scale: 2, group: 'basic' }),
    daily_total: Field.formula({
      label: '日标准合计',
      group: 'basic',
      expression: F`coalesce(record.lodging_per_day, 0) + coalesce(record.meal_per_day, 0) + coalesce(record.local_transport_per_day, 0)`,
      scale: 2,
    }),
    effective_from: Field.date({ label: '生效日期', group: 'basic' }),
    effective_to: Field.date({ label: '失效日期', group: 'basic' }),
    is_active: Field.boolean({ label: '启用', group: 'basic', defaultValue: true }),
    notes: Field.textarea({ label: '备注', group: 'basic' }),
  },
  indexes: [
    { fields: ['city_tier'] },
    { fields: ['is_active'] },
  ],
  enable: {
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
  },
});
