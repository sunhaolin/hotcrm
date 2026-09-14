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
