// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.
/**
 * Demo golden path (epic #2 / T9) — one customer through all nine steps:
 * 客户 → 线索 → 商机 → 售前项目 → 交付项目 → 成本计划 → 工时/差旅 → 报表.
 *
 * Seed doctrine lives in `./_shared.ts`. Two things it dictates here:
 *   - a seed cannot name a user, so `owner_id`, the 铁三角 lookups and every
 *     project role are left unset — the presenter picks people in the form;
 *   - hooks run over seed writes, so the over-budget delivery project (DLV-B)
 *     carries a 200,000 baseline and two 128,000 timesheets: the gate lets the
 *     second one through (actual 128,000 < 200,000 before the write) and the
 *     project ends at 256,000 + travel — over budget for the dashboard, and a
 *     THIRD timesheet added live is what the gate refuses.
 *
 * Statuses are seeded `approved` directly; the T5 flows fire only on
 * `submitted`, so replay opens no approval requests.
 */
import { defineSeed } from '@objectstack/spec/data';
import { cel } from '@objectstack/spec';
import { Account } from '../objects/account.object';
import { Contact } from '../objects/contact.object';
import { Lead } from '../objects/lead.object';
import { Opportunity } from '../objects/opportunity.object';
import { PresalesProject } from '../objects/presales_project.object';
import { DeliveryProject } from '../objects/delivery_project.object';
import { CostPlanLine } from '../objects/cost_plan_line.object';
import { Timesheet } from '../objects/timesheet.object';
import { TravelCost } from '../objects/travel_cost.object';
import { celDaysAgo, celDaysFromNow } from './_shared';

const CUSTOMER = '华信科技有限公司';
const AGENCY = '中招国际招标代理有限公司';
const OPP = '华信科技核心业务系统升级项目';
const PSP = '华信核心系统升级 — 售前';
const DLV_A = '华信核心系统升级 — 一期交付';
const DLV_B = '华信数据中台 — 试点交付';

export const psaAccounts = defineSeed(Account, {
  mode: 'upsert',
  externalId: 'name',
  records: [
    {
      name: CUSTOMER,
      short_name: '华信科技',
      registration_number: '91110108MA01ABCD2X',
      classification: 'regular_customer',
      type: 'customer',
      industry: 'technology',
      number_of_employees: 3200,
      annual_revenue: 860000000,
      phone: '+86 10 8888 6666',
      website: 'https://www.huaxin-tech.example.com',
      approval_status: 'approved',
      description: '华北区重点客户，年度 IT 采购预算约 1.2 亿元，现有核心业务系统运行 8 年，2026 年启动升级。',
      is_active: true,
      last_activity_date: cel`today()`,
    },
    {
      name: AGENCY,
      short_name: '中招国际',
      registration_number: '91110105MA00XYZW9K',
      classification: 'bidding_agency',
      type: 'partner',
      industry: 'other',
      approval_status: 'approved',
      description: '招标代理公司 —— 仅用于付款回款；不可对其发起商机、投标或销售合同（演示：新建商机会被系统拒绝）。',
      is_active: true,
      last_activity_date: celDaysAgo(3),
    },
  ],
});

export const psaContacts = defineSeed(Contact, {
  mode: 'upsert',
  externalId: 'email',
  records: [
    { first_name: '志强', last_name: '王', crm_account: CUSTOMER, title: '信息中心主任', department: 'engineering', email: 'wang.zhiqiang@huaxin-tech.example.com', phone: '+86 10 8888 6601', is_primary: true },
    { first_name: '晓燕', last_name: '李', crm_account: CUSTOMER, title: '采购部经理', department: 'operations', email: 'li.xiaoyan@huaxin-tech.example.com', phone: '+86 10 8888 6602' },
  ],
});

export const psaLeads = defineSeed(Lead, {
  mode: 'upsert',
  externalId: 'email',
  records: [
    {
      first_name: '志强', last_name: '王', company: CUSTOMER, title: '信息中心主任',
      email: 'wang.zhiqiang@huaxin-tech.example.com', phone: '+86 10 8888 6601',
      status: 'qualified', lead_source: 'partner', industry: 'technology',
      estimated_amount: 1400000, demand_type: 'software_development',
      approval_status: 'approved',
      description: '客户意向：核心业务系统升级，含 AI 审批助手；预计 Q4 招标，希望 2027 年 Q2 上线。',
    },
  ],
});

export const psaOpportunities = defineSeed(Opportunity, {
  mode: 'upsert',
  externalId: 'name',
  records: [
    {
      name: OPP,
      crm_account: CUSTOMER,
      amount: 1400000,
      stage: 'proposal',
      probability: 60,
      close_date: celDaysFromNow(45),
      type: 'new_business',
      forecast_category: 'commit',
      stage_entry_date: celDaysAgo(9),
      is_bid: true,
      level: 'level_a',
      priority: 'high',
      initiation_status: 'approved',
      description: `客户简介：华北区重点客户，核心业务系统运行 8 年。
项目背景：系统性能与合规双重压力，2026 年立项升级。
风险分析：竞争对手已有驻场团队；付款周期 90 天。
付款条款：3-4-3（签约 30% / 上线 40% / 验收 30%）。
下包说明：数据迁移拟分包给本地伙伴。`,
      next_step: '完成售前立项与 Bizcase 审批，提交投标文件。',
    },
  ],
});

export const presalesProjects = defineSeed(PresalesProject, {
  mode: 'upsert',
  externalId: 'name',
  records: [
    {
      name: PSP,
      alias: 'HX-UPGRADE-PS',
      crm_opportunity: OPP,
      crm_account: CUSTOMER,
      project_type: 'software_development',
      business_category: 'government_enterprise',
      planned_start: celDaysAgo(20),
      planned_end: celDaysFromNow(40),
      expected_contract_amount: 1400000,
      labor_cost: 600000,
      third_party_service_cost: 250000,
      procurement_cost: 100000,
      project_expense: 50000,
      quote_amount: 1400000,
      security_class: 'confidential',
      security_note: '涉及客户业务数据，交付团队须签署保密协议；开发环境使用脱敏数据。',
      approval_status: 'approved',
      description: 'Bizcase：总成本 100 万，报价 140 万，毛利率 28.6%。五级审批（成本中心负责人 → 事业部负责人 → Bizcase 审核 → 事业本部负责人 → 事业群运营负责人）已通过。',
    },
  ],
});

export const deliveryProjects = defineSeed(DeliveryProject, {
  mode: 'upsert',
  externalId: 'name',
  records: [
    {
      name: DLV_A,
      alias: 'HX-UPGRADE-D1',
      crm_presales_project: PSP,
      crm_opportunity: OPP,
      crm_account: CUSTOMER,
      project_type: 'software_development',
      business_category: 'government_enterprise',
      planned_start: celDaysAgo(60),
      planned_end: celDaysFromNow(120),
      status: 'active',
      impl_cost_center: 'dc_north',
      accounting_cost_center: 'dc_north',
      department: 'bu_government',
      budget_baseline: 1000000,
      security_class: 'confidential',
      approval_status: 'approved',
    },
    {
      name: DLV_B,
      alias: 'HX-DATA-PILOT',
      crm_presales_project: PSP,
      crm_opportunity: OPP,
      crm_account: CUSTOMER,
      project_type: 'implementation',
      business_category: 'government_enterprise',
      planned_start: celDaysAgo(75),
      planned_end: celDaysFromNow(15),
      status: 'active',
      impl_cost_center: 'dc_east',
      accounting_cost_center: 'dc_north',
      department: 'bu_government',
      // Deliberately over budget once its two timesheets land (see header).
      budget_baseline: 200000,
      security_class: 'internal',
      approval_status: 'approved',
    },
  ],
});

const month1 = celDaysAgo(45);
const month2 = celDaysAgo(15);

export const costPlanLines = defineSeed(CostPlanLine, {
  mode: 'upsert',
  externalId: 'description',
  records: [
    { crm_delivery_project: DLV_A, category: 'labor',               period_month: month1, description: '人工 · 高级工程师 × 4 · 第 1 月', quantity: 640, unit_price: 468.75, planned_amount: 300000 },
    { crm_delivery_project: DLV_A, category: 'labor',               period_month: month2, description: '人工 · 高级工程师 × 4 · 第 2 月', quantity: 640, unit_price: 468.75, planned_amount: 300000 },
    { crm_delivery_project: DLV_A, category: 'third_party_service', period_month: month1, description: '第三方 · 数据迁移分包 · 第 1 月', quantity: 1, unit_price: 125000, planned_amount: 125000 },
    { crm_delivery_project: DLV_A, category: 'third_party_service', period_month: month2, description: '第三方 · 数据迁移分包 · 第 2 月', quantity: 1, unit_price: 125000, planned_amount: 125000 },
    { crm_delivery_project: DLV_A, category: 'procurement',         period_month: month1, description: '采购 · 中间件许可 · 第 1 月', quantity: 2, unit_price: 25000, planned_amount: 50000 },
    { crm_delivery_project: DLV_A, category: 'procurement',         period_month: month2, description: '采购 · 测试服务器 · 第 2 月', quantity: 1, unit_price: 50000, planned_amount: 50000 },
    { crm_delivery_project: DLV_A, category: 'expense',             period_month: month1, description: '费用 · 差旅与驻场 · 第 1 月', quantity: 1, unit_price: 25000, planned_amount: 25000 },
    { crm_delivery_project: DLV_A, category: 'expense',             period_month: month2, description: '费用 · 差旅与驻场 · 第 2 月', quantity: 1, unit_price: 25000, planned_amount: 25000 },
  ],
});

export const timesheets = defineSeed(Timesheet, {
  mode: 'upsert',
  externalId: 'notes',
  records: [
    { crm_delivery_project: DLV_A, period_month: month1, hours: 160, hourly_rate: 800, cost: 128000, approval_status: 'approved', notes: 'TS · 一期 · 第 1 月 · 架构师' },
    { crm_delivery_project: DLV_A, period_month: month1, hours: 160, hourly_rate: 800, cost: 128000, approval_status: 'approved', notes: 'TS · 一期 · 第 1 月 · 高级工程师' },
    { crm_delivery_project: DLV_A, period_month: month2, hours: 160, hourly_rate: 800, cost: 128000, approval_status: 'approved', notes: 'TS · 一期 · 第 2 月 · 架构师' },
    { crm_delivery_project: DLV_A, period_month: month2, hours: 160, hourly_rate: 800, cost: 128000, approval_status: 'approved', notes: 'TS · 一期 · 第 2 月 · 高级工程师' },
    { crm_delivery_project: DLV_B, period_month: month1, hours: 160, hourly_rate: 800, cost: 128000, approval_status: 'approved', notes: 'TS · 试点 · 第 1 月 · 数据工程师' },
    { crm_delivery_project: DLV_B, period_month: month2, hours: 160, hourly_rate: 800, cost: 128000, approval_status: 'approved', notes: 'TS · 试点 · 第 2 月 · 数据工程师' },
  ],
});

export const travelCosts = defineSeed(TravelCost, {
  mode: 'upsert',
  externalId: 'receipt_number',
  records: [
    { crm_delivery_project: DLV_A, expense_date: celDaysAgo(40), amount: 6800, receipt_number: 'BX-2026-0917', description: '北京—客户现场 · 需求调研 · 2 人 3 天' },
    { crm_delivery_project: DLV_A, expense_date: celDaysAgo(12), amount: 9200, receipt_number: 'BX-2026-1042', description: '北京—客户现场 · 上线演练 · 3 人 2 天' },
    { crm_delivery_project: DLV_B, expense_date: celDaysAgo(20), amount: 8000, receipt_number: 'BX-2026-0988', description: '上海—客户现场 · 数据中台试点评审' },
  ],
});
