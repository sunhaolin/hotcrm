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
 * Statuses are seeded `approved` directly; the T5 flows fire only on the
 * transition to `submitted`, so replay opens no approval requests. The three
 * records the presenter submits LIVE (东方联合银行 · 张建国 · 东方联合银行信贷风控平台)
 * are seeded `draft`, so the submit gesture is a real draft → submitted edit.
 */
import { defineSeed } from '@objectstack/spec/data';
import { cel } from '@objectstack/spec';
import { Account } from '../objects/account.object';
import { Contact } from '../objects/contact.object';
import { Lead } from '../objects/lead.object';
import { Opportunity } from '../objects/opportunity.object';
import { PresalesProject } from '../objects/presales_project.object';
import { DeliveryProject } from '../objects/delivery_project.object';
import { CostPlan } from '../objects/cost_plan.object';
import { LaborCostLine } from '../objects/labor_cost_line.object';
import { ServiceCostLine } from '../objects/service_cost_line.object';
import { ProcurementCostLine } from '../objects/procurement_cost_line.object';
import { ExpenseCostLine } from '../objects/expense_cost_line.object';
import { Timesheet } from '../objects/timesheet.object';
import { TravelCost } from '../objects/travel_cost.object';
import { Task } from '../objects/task.object';
import { Event } from '../objects/event.object';
import { celDaysAgo, celDaysFromNow } from './_shared';
import { CONTRACT_HX } from './psa-round2.seed';

const CUSTOMER = '华信科技有限公司';
const AGENCY = '中招国际招标代理有限公司';
const OPP = '华信科技核心业务系统升级项目';
const PSP = '华信核心系统升级 — 售前';
const DLV_A = '华信核心系统升级 — 一期交付';
const DLV_B = '华信数据中台 — 试点交付';
const CUSTOMER_2 = '北辰智能制造集团';
const CUSTOMER_3 = '东方联合银行';
const OPP_2 = '北辰集团 MES 二期';
const OPP_3 = '东方联合银行信贷风控平台';
const celClock = (daysAgo: number, hour: number, minute: number) =>
  daysAgo >= 0 ? cel`daysAgo(${daysAgo}) + duration(${`${hour}h${minute}m`})` : cel`daysFromNow(${-daysAgo}) + duration(${`${hour}h${minute}m`})`;

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
      billing_address: { street: '中关村大街 1 号华信大厦 18 层', city: '北京', state: '北京市', postalCode: '100080', country: 'CN' },
      approval_status: 'approved',
      // Round 2 (step 3)
      primary_vendor: '东软集团', it_budget_current_year: 120000000, payment_cycle: 'days_90', ear_status: 'clear', is_strategic_partner: true,
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
      billing_address: { street: '建国路 88 号 SOHO 现代城 B 座', city: '北京', state: '北京市', postalCode: '100022', country: 'CN' },
      approval_status: 'approved',
      description: '招标代理公司 —— 仅用于付款回款；不可对其发起商机、投标或销售合同（演示：新建商机会被系统拒绝）。',
      is_active: true,
      last_activity_date: celDaysAgo(3),
    },
    {
      name: CUSTOMER_2, short_name: '北辰智造', registration_number: '91320500MA1WXYZ12P', classification: 'regular_customer',
      type: 'customer', industry: 'manufacturing', number_of_employees: 8600, annual_revenue: 2400000000,
      billing_address: { street: '苏州工业园区星湖街 328 号', city: '苏州', state: '江苏省', postalCode: '215021', country: 'CN' },
      approval_status: 'approved', primary_vendor: '西门子', it_budget_current_year: 60000000, payment_cycle: 'days_60', ear_status: 'clear', is_strategic_partner: false,
      description: '华东区制造业客户，MES 一期已上线，二期评估中。', is_active: true, last_activity_date: celDaysAgo(6),
    },
    {
      name: CUSTOMER_3, short_name: '东方联合', registration_number: '91310000MA1FGHJ34K', classification: 'regular_customer',
      type: 'prospect', industry: 'finance', number_of_employees: 12000, annual_revenue: 5800000000,
      billing_address: { street: '陆家嘴环路 1000 号', city: '上海', state: '上海市', postalCode: '200120', country: 'CN' },
      approval_status: 'draft', primary_vendor: '恒生电子', it_budget_current_year: 300000000, payment_cycle: 'milestone', ear_status: 'suspected', is_strategic_partner: false,
      description: '股份制银行，信贷风控平台选型阶段；客户信息待提交审批（演示：现场提交）。EAR 机器比对疑似命中，只提示不阻断。', is_active: true, last_activity_date: celDaysAgo(1),
    },
  ],
});

export const psaContacts = defineSeed(Contact, {
  mode: 'upsert',
  externalId: 'email',
  records: [
    { first_name: '志强', last_name: '王', crm_account: CUSTOMER, title: '信息中心主任', department: 'engineering', email: 'wang.zhiqiang@huaxin-tech.example.com', phone: '+86 10 8888 6601', is_primary: true, gender: 'male', buying_influence: 'decision_maker', attitude: 'supportive', relationship_strength: 'strong' },
    { first_name: '晓燕', last_name: '李', crm_account: CUSTOMER, title: '采购部经理', department: 'operations', email: 'li.xiaoyan@huaxin-tech.example.com', phone: '+86 10 8888 6602', gender: 'female', buying_influence: 'procurement', attitude: 'neutral', relationship_strength: 'medium' },
    { first_name: '建国', last_name: '张', crm_account: CUSTOMER_2, title: '智能制造部总监', department: 'engineering', email: 'zhang.jianguo@beichen.example.com', phone: '+86 512 6666 8801', is_primary: true, gender: 'male', buying_influence: 'champion', attitude: 'supportive', relationship_strength: 'strong' },
    { first_name: '敏', last_name: '陈', crm_account: CUSTOMER_3, title: '科技部副总经理', department: 'executive', email: 'chen.min@dfub.example.com', phone: '+86 21 5555 0102', is_primary: true, gender: 'female', buying_influence: 'decision_maker', attitude: 'unknown', relationship_strength: 'weak' },
  ],
});

// Lead emails/phones deliberately differ from the contacts' (the same people,
// pre-conversion): `lead_duplicate_check` flags a re-captured address as a
// suspected duplicate and the record page then carries a warning banner.
export const psaLeads = defineSeed(Lead, {
  mode: 'upsert',
  externalId: 'email',
  records: [
    {
      first_name: '志强', last_name: '王', company: CUSTOMER, title: '信息中心主任',
      email: 'wangzq@huaxin-tech.example.com', phone: '+86 139 1088 6601',
      status: 'qualified', lead_source: 'partner', industry: 'technology',
      estimated_amount: 1400000, demand_type: 'software_development',
      approval_status: 'approved',
      description: '客户意向：核心业务系统升级，含 AI 审批助手；预计 Q4 招标，希望 2027 年 Q2 上线。',
    },
    {
      first_name: '建国', last_name: '张', company: CUSTOMER_2, title: '智能制造部总监', email: 'zhangjg@beichen.example.com', phone: '+86 138 6266 8801',
      status: 'contacted', lead_source: 'event', industry: 'manufacturing', estimated_amount: 2600000, demand_type: 'implementation',
      approval_status: 'draft', description: '客户意向：MES 二期覆盖三个新工厂；行业展会上获取（演示：现场提交审批）。',
    },
    {
      first_name: '敏', last_name: '陈', company: CUSTOMER_3, title: '科技部副总经理', email: 'chenmin@dfub.example.com', phone: '+86 135 5555 0102',
      status: 'new', lead_source: 'web', industry: 'finance', estimated_amount: 4800000, demand_type: 'consulting',
      approval_status: 'draft', description: '客户意向：信贷风控平台咨询 + 实施，先做架构咨询。',
    },
  ],
});

// `approval_status: 'approved'` on every opportunity: the standard Large Deal
// Approval fires on create for amounts >= 100,000 and routes to positions the
// demo org does not staff, which would lock all three records behind the
// admin's override buttons. Seeding the stamp keeps the demo on the customer's
// own 立项 gate (initiation_status), which is the one the script walks through.
export const psaOpportunities = defineSeed(Opportunity, {
  mode: 'upsert',
  externalId: 'name',
  records: [
    {
      name: OPP,
      crm_account: CUSTOMER,
      amount: 1400000,
      stage: 'proposal',
      probability: 60, expected_revenue: 840000,
      close_date: celDaysFromNow(45),
      type: 'new_business',
      forecast_category: 'commit',
      stage_entry_date: celDaysAgo(9),
      is_bid: true,
      level: 'level_a',
      priority: 'high',
      approval_status: 'approved', initiation_status: 'approved',
      // Round 2 (steps 8 / 9)
      controllability: 'high', customer_initiation_date: celDaysAgo(30), expected_bid_date: celDaysFromNow(20),
      subcontract_info: '数据迁移拟分包给北京数联科技有限公司（约 25 万）。',
      crm_legal_entity: '华软信息技术股份有限公司', business_category: 'government_enterprise', revenue_recognition_type: 'milestone',
      description: `客户简介：华北区重点客户，核心业务系统运行 8 年。
项目背景：系统性能与合规双重压力，2026 年立项升级。
风险分析：竞争对手已有驻场团队；付款周期 90 天。
付款条款：3-4-3（签约 30% / 上线 40% / 验收 30%）。
下包说明：数据迁移拟分包给本地伙伴。`,
      next_step: '完成售前立项与 Bizcase 审批，提交投标文件。',
    },
    {
      name: OPP_2, crm_account: CUSTOMER_2, amount: 2600000, stage: 'closed_won', probability: 100, expected_revenue: 2600000, close_date: celDaysAgo(30),
      type: 'existing_expansion', forecast_category: 'closed', stage_entry_date: celDaysAgo(30), is_bid: true, level: 'level_a', priority: 'high',
      approval_status: 'approved', initiation_status: 'approved', win_reason: 'relationship', loss_details: '一期口碑 + 本地交付团队；价格略高于竞对但客户选择了续作。',
      description: 'MES 一期客户续作二期：三个新工厂产线数字化。', next_step: '启动交付立项。',
    },
    {
      name: OPP_3, crm_account: CUSTOMER_3, amount: 4800000, stage: 'qualification', probability: 25, expected_revenue: 1200000, close_date: celDaysFromNow(120),
      type: 'new_business', forecast_category: 'pipeline', stage_entry_date: celDaysAgo(5), is_bid: true, level: 'level_b', priority: 'medium',
      approval_status: 'approved', initiation_status: 'draft', description: '信贷风控平台：规则引擎 + 模型管理；招标预计下季度。', next_step: '提交商机立项审批（演示：现场提交）；准备 POC 方案。',
    },
  ],
});

export const psaTasks = defineSeed(Task, {
  mode: 'upsert',
  externalId: 'subject',
  records: [
    { subject: '提交投标文件（技术标 + 商务标）', description: '投标截止前 3 个工作日完成内部评审。', status: 'in_progress', priority: 'high', priority_rank: 3, due_date: celDaysFromNow(5), related_to_type: 'crm_opportunity', related_to_account: CUSTOMER, related_to_opportunity: OPP },
    { subject: '与王主任确认付款条款 3-4-3', description: '确认签约 30% / 上线 40% / 验收 30% 的节点定义。', status: 'not_started', priority: 'normal', priority_rank: 2, due_date: celDaysFromNow(2), related_to_type: 'crm_opportunity', related_to_account: CUSTOMER, related_to_opportunity: OPP },
    { subject: '北辰二期开工确认单签署', description: '交付立项后 5 个工作日内完成。', status: 'not_started', priority: 'high', priority_rank: 3, due_date: celDaysFromNow(7), related_to_type: 'crm_opportunity', related_to_account: CUSTOMER_2, related_to_opportunity: OPP_2 },
  ],
});

export const psaEvents = defineSeed(Event, {
  mode: 'upsert',
  externalId: 'subject',
  records: [
    { subject: '华信现场需求调研', type: 'onsite_visit', status: 'held', start_datetime: celClock(40, 9, 30), end_datetime: celClock(40, 12, 0), duration_minutes: 150, all_day: false, related_to_type: 'crm_opportunity', related_to_opportunity: OPP, related_to_account: CUSTOMER, outcome_notes: '确认核心系统升级范围：三大模块 + AI 审批助手。' },
    { subject: '华信方案汇报（含 Bizcase）', type: 'meeting', status: 'held', start_datetime: celClock(9, 14, 0), end_datetime: celClock(9, 16, 0), duration_minutes: 120, all_day: false, related_to_type: 'crm_opportunity', related_to_opportunity: OPP, related_to_account: CUSTOMER, outcome_notes: '客户认可方案，进入投标阶段。' },
    { subject: '华信投标答疑电话会', type: 'call', status: 'planned', start_datetime: celClock(-3, 10, 0), end_datetime: celClock(-3, 11, 0), duration_minutes: 60, all_day: false, related_to_type: 'crm_opportunity', related_to_opportunity: OPP, related_to_account: CUSTOMER },
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
      quote_amount: 1400000,
      security_class: 'confidential',
      security_note: '涉及客户业务数据，交付团队须签署保密协议；开发环境使用脱敏数据。',
      approval_status: 'approved',
      description: 'Bizcase：总成本 105.4 万，报价 140 万，毛利率 24.7%（四项成本为其 Bizcase 成本计划的汇总）。五级审批（成本中心负责人 → 事业部负责人 → Bizcase 审核 → 事业本部负责人 → 事业群运营负责人）已通过。',
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
      budget_baseline: 1054320,
      security_class: 'confidential',
      approval_status: 'approved',
      // Round 2: the sales contract (contract_amount follows it), progress for revenue.
      crm_contract: CONTRACT_HX,
      progress_pct: 55,
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
      contract_amount: 300000,
      progress_pct: 90,
    },
  ],
});

const month1 = celDaysAgo(45);
const month2 = celDaysAgo(15);

// Cost plans (steps 27–31): the 华信 Bizcase (phase bizcase, on the presales
// project) and the delivery plan v1 it was imported as. Lines are seeded; the
// month ledger is generated from them by `cost_line_decompose` — one row per
// month on the delivery plan, one whole-range row per line on the Bizcase —
// and every total on the plan and both projects is a rollup of that ledger.
// Months are calendar months on purpose: a plan is authored for specific months.
const PLAN_HX_BIZCASE = '华信核心系统升级 · Bizcase 成本计划 v1';
const PLAN_HX_DELIVERY = '华信一期交付 · 成本计划 v1';

export const costPlans = defineSeed(CostPlan, {
  mode: 'upsert',
  externalId: 'name',
  records: [
    { name: PLAN_HX_BIZCASE, crm_presales_project: PSP, phase: 'bizcase', version_no: 1, is_current: true, approval_status: 'approved', notes: '步骤 18 的成本测算：四类明细行整段估算、不按月拆分，售前项目的四项成本读此版本。' },
    { name: PLAN_HX_DELIVERY, crm_delivery_project: DLV_A, phase: 'delivery', version_no: 1, is_current: true, baseline_total: 1054320, approval_status: 'approved', notes: '步骤 27 导入 Bizcase 预算的结果：冻结基线 1,054,320，明细行自 Bizcase 克隆。' },
  ],
});

export const laborCostLines = defineSeed(LaborCostLine, {
  mode: 'upsert',
  externalId: 'description',
  records: [
    { crm_cost_plan: PLAN_HX_BIZCASE, description: 'Bizcase · 华信 · 高级工程师 × 2', crm_rate_card: '高级工程师', headcount: 2, hours_per_month: 160, start_month: '2026-08-01', end_month: '2026-09-01' },
    { crm_cost_plan: PLAN_HX_BIZCASE, description: 'Bizcase · 华信 · 项目经理', crm_rate_card: '项目经理', headcount: 1, hours_per_month: 80, start_month: '2026-08-01', end_month: '2026-09-01' },
    { crm_cost_plan: PLAN_HX_DELIVERY, description: '交付 · 华信 · 高级工程师 × 2', crm_rate_card: '高级工程师', headcount: 2, hours_per_month: 160, start_month: '2026-08-01', end_month: '2026-09-01' },
    { crm_cost_plan: PLAN_HX_DELIVERY, description: '交付 · 华信 · 项目经理', crm_rate_card: '项目经理', headcount: 1, hours_per_month: 80, start_month: '2026-08-01', end_month: '2026-09-01' },
  ],
});

export const serviceCostLines = defineSeed(ServiceCostLine, {
  mode: 'upsert',
  externalId: 'description',
  records: [
    { crm_cost_plan: PLAN_HX_BIZCASE, description: 'Bizcase · 华信 · 数据迁移分包', vendor: '数联科技', pricing_basis: 'per_month', unit_price: 62500, headcount: 2, start_month: '2026-08-01', duration: 2 },
    { crm_cost_plan: PLAN_HX_DELIVERY, description: '交付 · 华信 · 数据迁移分包', vendor: '数联科技', pricing_basis: 'per_month', unit_price: 62500, headcount: 2, start_month: '2026-08-01', duration: 2 },
  ],
});

export const procurementCostLines = defineSeed(ProcurementCostLine, {
  mode: 'upsert',
  externalId: 'description',
  records: [
    { crm_cost_plan: PLAN_HX_BIZCASE, description: 'Bizcase · 华信 · 中间件许可', procurement_category: 'software_license', quantity: 2, unit_price: 25000, start_month: '2026-08-01' },
    { crm_cost_plan: PLAN_HX_BIZCASE, description: 'Bizcase · 华信 · 测试服务器', procurement_category: 'hardware', quantity: 1, unit_price: 50000, start_month: '2026-09-01' },
    { crm_cost_plan: PLAN_HX_DELIVERY, description: '交付 · 华信 · 中间件许可', procurement_category: 'software_license', quantity: 2, unit_price: 25000, start_month: '2026-08-01' },
    { crm_cost_plan: PLAN_HX_DELIVERY, description: '交付 · 华信 · 测试服务器', procurement_category: 'hardware', quantity: 1, unit_price: 50000, start_month: '2026-09-01' },
  ],
});

export const expenseCostLines = defineSeed(ExpenseCostLine, {
  mode: 'upsert',
  externalId: 'description',
  records: [
    { crm_cost_plan: PLAN_HX_BIZCASE, description: 'Bizcase · 华信 · 差旅', expense_type: 'travel', crm_travel_standard: '一线城市标准', trips: 4, travelers: 2, days: 3, start_month: '2026-08-01', end_month: '2026-09-01' },
    { crm_cost_plan: PLAN_HX_BIZCASE, description: 'Bizcase · 华信 · 驻场补贴', expense_type: 'other', budget_amount: 20000, start_month: '2026-08-01', end_month: '2026-09-01' },
    { crm_cost_plan: PLAN_HX_DELIVERY, description: '交付 · 华信 · 差旅', expense_type: 'travel', crm_travel_standard: '一线城市标准', trips: 4, travelers: 2, days: 3, start_month: '2026-08-01', end_month: '2026-09-01' },
    { crm_cost_plan: PLAN_HX_DELIVERY, description: '交付 · 华信 · 驻场补贴', expense_type: 'other', budget_amount: 20000, start_month: '2026-08-01', end_month: '2026-09-01' },
  ],
});

export const timesheets = defineSeed(Timesheet, {
  mode: 'upsert',
  externalId: 'notes',
  records: [
    { crm_delivery_project: DLV_A, period_month: month1, hours: 160, hourly_rate: 800, cost: 128000, approval_status: 'approved', notes: 'TS · 一期 · 第 1 月 · 架构师' },
    { crm_delivery_project: DLV_A, crm_rate_card: '高级工程师', period_month: month1, hours: 160, hourly_rate: 800, cost: 128000, approval_status: 'approved', notes: 'TS · 一期 · 第 1 月 · 高级工程师' },
    { crm_delivery_project: DLV_A, period_month: month2, hours: 160, hourly_rate: 800, cost: 128000, approval_status: 'approved', notes: 'TS · 一期 · 第 2 月 · 架构师' },
    { crm_delivery_project: DLV_A, crm_rate_card: '高级工程师', period_month: month2, hours: 160, hourly_rate: 800, cost: 128000, approval_status: 'approved', notes: 'TS · 一期 · 第 2 月 · 高级工程师' },
    { crm_delivery_project: DLV_B, crm_rate_card: '数据工程师', period_month: month1, hours: 160, hourly_rate: 800, cost: 128000, approval_status: 'approved', notes: 'TS · 试点 · 第 1 月 · 数据工程师' },
    { crm_delivery_project: DLV_B, crm_rate_card: '数据工程师', period_month: month2, hours: 160, hourly_rate: 800, cost: 128000, approval_status: 'approved', notes: 'TS · 试点 · 第 2 月 · 数据工程师' },
    // Round 2: this month's DRAFT sheet for the project manager — no `hours`,
    // so timesheet_attendance_sync derives them (standard − leave + overtime)
    // and the approved-only rollup leaves it out of the project's actuals
    // until it is approved. The staff script stamps 王强 as its submitter.
    { crm_delivery_project: DLV_A, crm_rate_card: '项目经理', period_month: cel`today()`, standard_hours: 176, overtime_hours: 0, approval_status: 'draft', notes: 'TS · 一期 · 本月 · 项目经理（草稿，演示请假同步）' },
  ],
});

export const travelCosts = defineSeed(TravelCost, {
  mode: 'upsert',
  externalId: 'receipt_number',
  records: [
    { crm_delivery_project: DLV_A, crm_business_trip: '华信现场需求调研', expense_date: celDaysAgo(40), amount: 6800, receipt_number: 'BX-2026-0917', description: '北京—客户现场 · 需求调研 · 2 人 3 天' },
    { crm_delivery_project: DLV_A, crm_business_trip: '华信上线演练', expense_date: celDaysAgo(12), amount: 9200, receipt_number: 'BX-2026-1042', description: '北京—客户现场 · 上线演练 · 3 人 2 天' },
    { crm_delivery_project: DLV_B, crm_business_trip: '数据中台试点评审', expense_date: celDaysAgo(20), amount: 8000, receipt_number: 'BX-2026-0988', description: '上海—客户现场 · 数据中台试点评审' },
  ],
});
