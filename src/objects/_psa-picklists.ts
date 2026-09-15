// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Picklists shared by the demo's PSA objects (epic #2). Option values are
 * ≥ 2 characters — the schema rejects shorter system identifiers.
 */
export const APPROVAL_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft', default: true },
  { label: 'Submitted', value: 'submitted', color: '#4169E1' },
  { label: 'Pending', value: 'pending', color: '#FFA500' },
  { label: 'Approved', value: 'approved', color: '#00AA00' },
  { label: 'Rejected', value: 'rejected', color: '#FF0000' },
] as const;

export const PROJECT_TYPE_OPTIONS = [
  { label: 'Software Development', value: 'software_development' },
  { label: 'Implementation Service', value: 'implementation' },
  { label: 'Operations & Maintenance', value: 'operations' },
  { label: 'Consulting', value: 'consulting' },
] as const;

export const BUSINESS_CATEGORY_OPTIONS = [
  { label: 'Government & Enterprise', value: 'government_enterprise' },
  { label: 'Finance', value: 'finance' },
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Internet', value: 'internet' },
] as const;

export const SECURITY_CLASS_OPTIONS = [
  { label: 'Public', value: 'public', default: true },
  { label: 'Internal', value: 'internal' },
  { label: 'Confidential', value: 'confidential', color: '#FFA500' },
  { label: 'Secret', value: 'secret', color: '#FF0000' },
] as const;

export const COST_CENTER_OPTIONS = [
  { label: 'Delivery Center East', value: 'dc_east' },
  { label: 'Delivery Center South', value: 'dc_south' },
  { label: 'Delivery Center North', value: 'dc_north' },
] as const;

export const DEPARTMENT_OPTIONS = [
  { label: 'BU Finance Solutions', value: 'bu_finance' },
  { label: 'BU Government Solutions', value: 'bu_government' },
  { label: 'BU Manufacturing Solutions', value: 'bu_manufacturing' },
] as const;

export const COST_CATEGORY_OPTIONS = [
  { label: 'Labor Service', value: 'labor' },
  { label: 'Third-party Service', value: 'third_party_service' },
  { label: 'Hardware/Software Procurement', value: 'procurement' },
  { label: 'Project Expense', value: 'expense' },
] as const;

/** Round 2 (Chinese-only): the same approval ladder with Chinese source labels for the new objects. */
export const APPROVAL_STATUS_OPTIONS_ZH = [
  { label: '草稿', value: 'draft', default: true },
  { label: '提交审批', value: 'submitted', color: '#4169E1' },
  { label: '审批中', value: 'pending', color: '#FFA500' },
  { label: '已审批', value: 'approved', color: '#00AA00' },
  { label: '已驳回', value: 'rejected', color: '#FF0000' },
] as const;

/** 成本计划版本状态 — the approval ladder plus 已作废, the state a superseded version ends in (steps 27 / 32). */
export const COST_PLAN_STATUS_OPTIONS = [
  ...APPROVAL_STATUS_OPTIONS_ZH,
  { label: '已作废', value: 'superseded', color: '#999999' },
] as const;

export const COST_PLAN_PHASE_OPTIONS = [
  { label: 'Bizcase（售前）', value: 'bizcase' },
  { label: '交付', value: 'delivery' },
] as const;

/**
 * 项目费用类型 — 差旅 is computed from a 差旅标准; every other type is a typed budget
 * (step 31). No option default: the month ledger shares this list, and the engine
 * writes an option default onto every row that omits the field — a labor month
 * would read as travel and be summed into 其中差旅.
 */
export const EXPENSE_TYPE_OPTIONS = [
  { label: '差旅', value: 'travel' },
  { label: '会议费', value: 'meeting' },
  { label: '培训费', value: 'training' },
  { label: '办公费', value: 'office' },
  { label: '通讯费', value: 'communication' },
  { label: '业务招待费', value: 'entertainment' },
  { label: '其他报销', value: 'other' },
] as const;

export const PRICING_BASIS_OPTIONS = [
  { label: '人月', value: 'per_month', default: true },
  { label: '人天', value: 'per_day' },
  { label: '包干', value: 'lump_sum' },
] as const;

export const PROCUREMENT_CATEGORY_OPTIONS = [
  { label: '硬件', value: 'hardware', default: true },
  { label: '软件许可', value: 'software_license' },
  { label: '云服务', value: 'cloud_service' },
  { label: '维保', value: 'maintenance' },
] as const;

export const RATE_STANDARD_OPTIONS = [
  { label: '标准', value: 'standard', default: true },
  { label: '优惠', value: 'discount' },
  { label: '外包', value: 'outsourced' },
] as const;

export const CITY_TIER_OPTIONS = [
  { label: '一线城市', value: 'tier_1', default: true },
  { label: '二线城市', value: 'tier_2' },
  { label: '三线及以下', value: 'tier_3' },
  { label: '海外', value: 'overseas' },
] as const;
