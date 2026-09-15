// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.
/**
 * Software-company demo data (epic #2, round 3).
 *
 * The presenter's company is 华软信息技术股份有限公司 — a software house that
 * sells custom development, implementation, O&M and consulting to enterprises.
 * `psa.seed.ts` / `psa-round2.seed.ts` carry the one storyline the 40-step
 * script walks (华信 · 北辰 · 东方联合银行 · 中招国际); this module fills the
 * rest of the CRM around it so lists, dashboards and reports look like a
 * company that has been selling for a while:
 *
 *   - nine more customers across industries, two contacts each;
 *   - a lead funnel (new → contacted → qualified → unqualified) with amounts;
 *   - deals in every stage, won and lost, with 招投标 facts and 铁三角 slots;
 *   - signed contracts, presales Bizcases and delivery projects at different
 *     points of their life (kick-off, mid-flight, completed), each with its
 *     cost plan, timesheets, trips, invoices, collections, purchases, orders;
 *   - a small product catalogue and two quotes.
 *
 * Same doctrine as the other two modules: a seed cannot name a user (owners,
 * 铁三角 and project roles are stamped by `scripts/demo-psa-staff.mjs`);
 * statuses are seeded terminal (`approved` / `rejected`) so replay opens no
 * approval request; hooks run over every write, so each delivery project's
 * timesheets stay under its baseline (the 超预算 story is 华信数据中台 alone).
 * Every string a user sees is Chinese; identifiers stay English.
 */
import { defineSeed } from '@objectstack/spec/data';
import { cel } from '@objectstack/spec';
import { Account } from '../objects/account.object';
import { Contact } from '../objects/contact.object';
import { Lead } from '../objects/lead.object';
import { Opportunity } from '../objects/opportunity.object';
import { Contract } from '../objects/contract.object';
import { PresalesProject } from '../objects/presales_project.object';
import { DeliveryProject } from '../objects/delivery_project.object';
import { CostPlanLine } from '../objects/cost_plan_line.object';
import { Timesheet } from '../objects/timesheet.object';
import { TravelCost } from '../objects/travel_cost.object';
import { BusinessTrip } from '../objects/business_trip.object';
import { LeaveRequest } from '../objects/leave_request.object';
import { BudgetAdjustment } from '../objects/budget_adjustment.object';
import { Invoice } from '../objects/invoice.object';
import { Collection } from '../objects/collection.object';
import { PurchaseContract } from '../objects/purchase_contract.object';
import { SalesOrder } from '../objects/sales_order.object';
import { Product } from '../objects/product.object';
import { Quote } from '../objects/quote.object';
import { QuoteLineItem } from '../objects/quote_line_item.object';
import { Task } from '../objects/task.object';
import { Event } from '../objects/event.object';
import { celDaysAgo, celDaysFromNow } from './_shared';

const ENTITY = '华软信息技术股份有限公司';
const ENTITY_SH = '华软信息技术（上海）有限公司';

// ─── Customers ──────────────────────────────────────────────────────────────
const CJ = '长江新能源汽车有限公司';
const JN = '江南医药集团股份有限公司';
const TQ = '天启物流股份有限公司';
const ZY = '中原城市商业银行股份有限公司';
const HD = '恒达建设集团有限公司';
const XH = '星海保险股份有限公司';
const NF = '南方高速公路集团有限公司';
const PC = '鹏程教育科技有限公司';
const HDL = '华东电力交易中心有限公司';
const ZX = '众信管理咨询有限公司';
const BC = '北辰智能制造集团';

// ─── Deals ──────────────────────────────────────────────────────────────────
const OPP_CJ = '长江新能源 DMS 经销商管理系统';
const OPP_JN = '江南医药 GMP 质量管理系统';
const OPP_ZY = '中原银行手机银行 5.0';
const OPP_HD = '恒达建设项目管理平台';
const OPP_PC = '鹏程教育在线学习平台';
const OPP_HDL = '华东电力交易结算系统运维（2026 年度）';
const OPP_XH = '星海保险核心系统升级咨询';
const OPP_NF = '南方高速收费运营平台';
const OPP_TQ = '天启物流 TMS 运输管理系统';
const OPP_BC2 = '北辰集团设备预测性维护 POC';
const OPP_BC = '北辰集团 MES 二期';

// ─── Contracts (the contract seed's externalId is its description) ─────────
const CT_BC = '北辰集团 MES 二期 — 销售合同（里程碑付款）';
const CT_CJ = '长江新能源 DMS 经销商管理系统 — 销售合同（3-4-3 付款）';
const CT_TQ = '天启物流 TMS 运输管理系统 — 销售合同（已验收）';
const CT_HDL = '华东电力交易结算系统运维 — 年度服务合同（按月结算）';
const CT_XH = '星海保险核心系统升级咨询 — 咨询服务合同';

// ─── Projects ───────────────────────────────────────────────────────────────
const PSP_BC = '北辰 MES 二期 — 售前';
const PSP_CJ = '长江新能源 DMS — 售前';
const PSP_JN = '江南医药 GMP — 售前';
const PSP_ZY = '中原银行手机银行 5.0 — 售前';
const PSP_TQ = '天启物流 TMS — 售前';
const PSP_XH = '星海保险核心系统咨询 — 售前';
const PSP_HDL = '华东电力结算系统运维 — 售前';
const DLV_BC = '北辰 MES 二期 — 交付';
const DLV_CJ = '长江新能源 DMS — 一期交付';
const DLV_TQ = '天启物流 TMS — 交付';
const DLV_HDL = '华东电力结算系统运维 — 2026 服务';
const DLV_XH = '星海保险核心系统咨询 — 交付';

const celClock = (daysAgo: number, hour: number, minute: number) =>
  daysAgo >= 0 ? cel`daysAgo(${daysAgo}) + duration(${`${hour}h${minute}m`})` : cel`daysFromNow(${-daysAgo}) + duration(${`${hour}h${minute}m`})`;

export const industryAccounts = defineSeed(Account, {
  mode: 'upsert',
  externalId: 'name',
  records: [
    { name: CJ, short_name: '长江新能源', registration_number: '91420100MA4KX8N23Q', classification: 'regular_customer', type: 'customer', industry: 'manufacturing', number_of_employees: 15000, annual_revenue: 12600000000, phone: '+86 27 8666 1000', website: 'https://www.cj-ev.example.com', approval_status: 'approved', primary_vendor: '用友', it_budget_current_year: 85000000, payment_cycle: 'days_60', ear_status: 'clear', is_strategic_partner: true, description: '新能源整车厂，全国 600 家经销商。DMS 经销商管理系统一期交付中，二期规划售后与配件。', is_active: true, last_activity_date: celDaysAgo(2) },
    { name: JN, short_name: '江南医药', registration_number: '91330100MA2GY5R71T', classification: 'regular_customer', type: 'customer', industry: 'healthcare', number_of_employees: 6800, annual_revenue: 4300000000, phone: '+86 571 8800 2200', website: 'https://www.jiangnan-pharma.example.com', approval_status: 'approved', primary_vendor: '金蝶', it_budget_current_year: 32000000, payment_cycle: 'days_90', ear_status: 'clear', is_strategic_partner: false, description: '医药制造集团，三个生产基地。GMP 质量管理系统正在方案阶段，合规压力驱动。', is_active: true, last_activity_date: celDaysAgo(4) },
    { name: TQ, short_name: '天启物流', registration_number: '91440300MA5F2Z9K8W', classification: 'regular_customer', type: 'customer', industry: 'logistics', number_of_employees: 9200, annual_revenue: 3100000000, phone: '+86 755 2666 3300', website: 'https://www.tianqi-logistics.example.com', approval_status: 'approved', primary_vendor: '华软股份', it_budget_current_year: 28000000, payment_cycle: 'days_30', ear_status: 'clear', is_strategic_partner: true, description: 'TMS 运输管理系统已于上月验收上线，续签运维在谈。付款信用良好。', is_active: true, last_activity_date: celDaysAgo(8) },
    { name: ZY, short_name: '中原银行', registration_number: '91410000MA3XQ7B45N', classification: 'regular_customer', type: 'prospect', industry: 'finance', number_of_employees: 4600, annual_revenue: 2200000000, phone: '+86 371 6555 8000', website: 'https://www.zybank.example.com', approval_status: 'approved', primary_vendor: '神州信息', it_budget_current_year: 150000000, payment_cycle: 'milestone', ear_status: 'clear', is_strategic_partner: false, description: '城市商业银行，手机银行 5.0 招标进入商务谈判；竞争对手两家。', is_active: true, last_activity_date: celDaysAgo(1) },
    { name: HD, short_name: '恒达建设', registration_number: '91500000MA6C1D3P2X', classification: 'regular_customer', type: 'prospect', industry: 'real_estate', number_of_employees: 21000, annual_revenue: 18000000000, phone: '+86 23 6300 7700', website: 'https://www.hengda-construction.example.com', approval_status: 'approved', primary_vendor: '广联达', it_budget_current_year: 40000000, payment_cycle: 'days_180', ear_status: 'unknown', is_strategic_partner: false, description: '建筑施工集团，项目管理平台需求调研中；付款周期长，需评估回款风险。', is_active: true, last_activity_date: celDaysAgo(12) },
    { name: XH, short_name: '星海保险', registration_number: '91310000MA1K9E6Y0D', classification: 'regular_customer', type: 'customer', industry: 'finance', number_of_employees: 7800, annual_revenue: 9800000000, phone: '+86 21 6888 9900', website: 'https://www.xinghai-ins.example.com', approval_status: 'approved', primary_vendor: '中科软', it_budget_current_year: 210000000, payment_cycle: 'days_60', ear_status: 'clear', is_strategic_partner: false, description: '财产险公司。核心系统升级咨询已交付，后续实施标预计明年一季度发布。', is_active: true, last_activity_date: celDaysAgo(15) },
    { name: NF, short_name: '南方高速', registration_number: '91440000MA7H4Q2L6E', classification: 'regular_customer', type: 'former', industry: 'logistics', number_of_employees: 13500, annual_revenue: 7600000000, phone: '+86 20 8700 1100', website: 'https://www.nanfang-expressway.example.com', approval_status: 'approved', primary_vendor: '千方科技', it_budget_current_year: 55000000, payment_cycle: 'days_90', ear_status: 'clear', is_strategic_partner: false, description: '收费运营平台项目投标失利（价格因素）；保持联系，关注明年联网收费改造。', is_active: true, last_activity_date: celDaysAgo(40) },
    { name: PC, short_name: '鹏程教育', registration_number: '91110108MA9P3W7R1F', classification: 'regular_customer', type: 'prospect', industry: 'education', number_of_employees: 900, annual_revenue: 380000000, phone: '+86 10 6200 5500', website: 'https://www.pengcheng-edu.example.com', approval_status: 'approved', primary_vendor: '自研', it_budget_current_year: 6000000, payment_cycle: 'days_30', ear_status: 'unknown', is_strategic_partner: false, description: '在线教育公司，学习平台重构初步接触，预算有限。', is_active: true, last_activity_date: celDaysAgo(6) },
    { name: HDL, short_name: '华东电力', registration_number: '91310000MA1L2M8T4B', classification: 'regular_customer', type: 'customer', industry: 'energy', number_of_employees: 1200, annual_revenue: 1500000000, phone: '+86 21 5200 6600', website: 'https://www.ecpx.example.com', approval_status: 'approved', primary_vendor: '华软股份', it_budget_current_year: 45000000, payment_cycle: 'days_30', ear_status: 'clear', is_strategic_partner: true, description: '交易结算系统由我司建设，2026 年度运维合同续签，按月结算。', is_active: true, last_activity_date: celDaysAgo(3) },
    { name: ZX, short_name: '众信咨询', registration_number: '91110105MA0B6N4H9J', classification: 'other', type: 'partner', industry: 'other', number_of_employees: 120, annual_revenue: 60000000, approval_status: 'approved', description: '管理咨询公司，为客户方提供选型咨询；其他类客户 —— 仅用于付款回款，不可对其发起商机（演示：与招标代理同样被系统拒绝）。', is_active: true, last_activity_date: celDaysAgo(20) },
  ],
});

export const industryContacts = defineSeed(Contact, {
  mode: 'upsert',
  externalId: 'email',
  records: [
    { first_name: '涛', last_name: '周', crm_account: CJ, title: '数字化中心总经理', department: 'engineering', email: 'zhou.tao@cj-ev.example.com', phone: '+86 27 8666 1001', is_primary: true, gender: 'male', buying_influence: 'decision_maker', attitude: 'supportive', relationship_strength: 'strong' },
    { first_name: '雪', last_name: '韩', crm_account: CJ, title: '销售管理部经理', department: 'sales', email: 'han.xue@cj-ev.example.com', phone: '+86 27 8666 1002', gender: 'female', buying_influence: 'end_user', attitude: 'supportive', relationship_strength: 'medium' },
    { first_name: '丽', last_name: '孙', crm_account: JN, title: '质量副总裁', department: 'executive', email: 'sun.li@jiangnan-pharma.example.com', phone: '+86 571 8800 2201', is_primary: true, gender: 'female', buying_influence: 'decision_maker', attitude: 'supportive', relationship_strength: 'medium' },
    { first_name: '斌', last_name: '杨', crm_account: JN, title: '信息部经理', department: 'engineering', email: 'yang.bin@jiangnan-pharma.example.com', phone: '+86 571 8800 2202', gender: 'male', buying_influence: 'technical_evaluator', attitude: 'neutral', relationship_strength: 'medium' },
    { first_name: '静', last_name: '罗', crm_account: TQ, title: 'CIO', department: 'executive', email: 'luo.jing@tianqi-logistics.example.com', phone: '+86 755 2666 3301', is_primary: true, gender: 'female', buying_influence: 'decision_maker', attitude: 'supportive', relationship_strength: 'strong' },
    { first_name: '鹏', last_name: '何', crm_account: TQ, title: '运输运营总监', department: 'operations', email: 'he.peng@tianqi-logistics.example.com', phone: '+86 755 2666 3302', gender: 'male', buying_influence: 'champion', attitude: 'supportive', relationship_strength: 'strong' },
    { first_name: '军', last_name: '吴', crm_account: ZY, title: '科技部总经理', department: 'engineering', email: 'wu.jun@zybank.example.com', phone: '+86 371 6555 8001', is_primary: true, gender: 'male', buying_influence: 'decision_maker', attitude: 'neutral', relationship_strength: 'medium' },
    { first_name: '欣', last_name: '许', crm_account: ZY, title: '采购中心主任', department: 'finance', email: 'xu.xin@zybank.example.com', phone: '+86 371 6555 8002', gender: 'female', buying_influence: 'procurement', attitude: 'neutral', relationship_strength: 'weak' },
    { first_name: '浩', last_name: '郑', crm_account: HD, title: '信息化部部长', department: 'engineering', email: 'zheng.hao@hengda-construction.example.com', phone: '+86 23 6300 7701', is_primary: true, gender: 'male', buying_influence: 'influencer', attitude: 'supportive', relationship_strength: 'medium' },
    { first_name: '峰', last_name: '刘', crm_account: HD, title: '副总裁（运营）', department: 'executive', email: 'liu.feng@hengda-construction.example.com', phone: '+86 23 6300 7702', gender: 'male', buying_influence: 'decision_maker', attitude: 'unknown', relationship_strength: 'weak' },
    { first_name: '芳', last_name: '林', crm_account: XH, title: '信息技术部总经理', department: 'engineering', email: 'lin.fang@xinghai-ins.example.com', phone: '+86 21 6888 9901', is_primary: true, gender: 'female', buying_influence: 'decision_maker', attitude: 'supportive', relationship_strength: 'strong' },
    { first_name: '宇', last_name: '程', crm_account: XH, title: '架构规划处处长', department: 'engineering', email: 'cheng.yu@xinghai-ins.example.com', phone: '+86 21 6888 9902', gender: 'male', buying_influence: 'technical_evaluator', attitude: 'supportive', relationship_strength: 'medium' },
    { first_name: '远', last_name: '高', crm_account: NF, title: '收费管理部主任', department: 'operations', email: 'gao.yuan@nanfang-expressway.example.com', phone: '+86 20 8700 1101', is_primary: true, gender: 'male', buying_influence: 'influencer', attitude: 'neutral', relationship_strength: 'weak' },
    { first_name: '晓', last_name: '马', crm_account: PC, title: 'CTO', department: 'engineering', email: 'ma.xiao@pengcheng-edu.example.com', phone: '+86 10 6200 5501', is_primary: true, gender: 'male', buying_influence: 'decision_maker', attitude: 'supportive', relationship_strength: 'weak' },
    { first_name: '磊', last_name: '黄', crm_account: HDL, title: '技术运行部主任', department: 'operations', email: 'huang.lei@ecpx.example.com', phone: '+86 21 5200 6601', is_primary: true, gender: 'male', buying_influence: 'decision_maker', attitude: 'supportive', relationship_strength: 'strong' },
    { first_name: '婷', last_name: '谢', crm_account: HDL, title: '合同管理岗', department: 'finance', email: 'xie.ting@ecpx.example.com', phone: '+86 21 5200 6602', gender: 'female', buying_influence: 'procurement', attitude: 'neutral', relationship_strength: 'medium' },
    { first_name: '明', last_name: '曹', crm_account: ZX, title: '合伙人', department: 'executive', email: 'cao.ming@zhongxin-consulting.example.com', phone: '+86 10 8500 3300', is_primary: true, gender: 'male', buying_influence: 'other', attitude: 'neutral', relationship_strength: 'medium' },
    { first_name: '海', last_name: '赵', crm_account: BC, title: '设备管理部经理', department: 'operations', email: 'zhao.hai@beichen.example.com', phone: '+86 512 6666 8802', gender: 'male', buying_influence: 'end_user', attitude: 'supportive', relationship_strength: 'medium' },
  ],
});

// Lead emails / phones differ from the contacts' on purpose: the same people
// re-captured would trip `lead_duplicate_check` (see psa.seed.ts).
export const industryLeads = defineSeed(Lead, {
  mode: 'upsert',
  externalId: 'email',
  records: [
    { first_name: '涛', last_name: '周', company: CJ, title: '数字化中心总经理', email: 'zhoutao@cj-ev.example.com', phone: '+86 139 2766 1001', status: 'qualified', lead_source: 'referral', industry: 'manufacturing', estimated_amount: 3200000, demand_type: 'implementation', approval_status: 'approved', description: '客户意向：经销商管理系统 DMS，覆盖 600 家经销商的销售、库存与售后。由用友实施顾问推荐。' },
    { first_name: '丽', last_name: '孙', company: JN, title: '质量副总裁', email: 'sunli@jiangnan-pharma.example.com', phone: '+86 138 5710 2201', status: 'qualified', lead_source: 'event', industry: 'healthcare', estimated_amount: 2400000, demand_type: 'software_development', approval_status: 'approved', description: '客户意向：GMP 质量管理系统（偏差、变更、CAPA、审计追踪），满足新版 GMP 合规。医药行业峰会获取。' },
    { first_name: '军', last_name: '吴', company: ZY, title: '科技部总经理', email: 'wujun@zybank.example.com', phone: '+86 137 3710 8001', status: 'qualified', lead_source: 'partner', industry: 'finance', estimated_amount: 5600000, demand_type: 'software_development', approval_status: 'approved', description: '客户意向：手机银行 5.0 重构，含开放平台与理财超市；公开招标。' },
    { first_name: '浩', last_name: '郑', company: HD, title: '信息化部部长', email: 'zhenghao@hengda-construction.example.com', phone: '+86 136 2300 7701', status: 'contacted', lead_source: 'web', industry: 'real_estate', estimated_amount: 1200000, demand_type: 'implementation', approval_status: 'draft', description: '客户意向：工程项目管理平台（进度、成本、安全），先做两个试点项目部。' },
    { first_name: '晓', last_name: '马', company: PC, title: 'CTO', email: 'maxiao@pengcheng-edu.example.com', phone: '+86 135 1062 5501', status: 'new', lead_source: 'webinar', industry: 'education', estimated_amount: 600000, demand_type: 'software_development', approval_status: 'draft', description: '客户意向：在线学习平台重构，微服务化；预算待批。' },
    { first_name: '磊', last_name: '黄', company: HDL, title: '技术运行部主任', email: 'huanglei@ecpx.example.com', phone: '+86 139 2152 6601', status: 'qualified', lead_source: 'other', industry: 'energy', estimated_amount: 900000, demand_type: 'operations', approval_status: 'approved', description: '客户意向：交易结算系统 2026 年度运维续签，增加 7×24 值守。' },
    { first_name: '芳', last_name: '林', company: XH, title: '信息技术部总经理', email: 'linfang@xinghai-ins.example.com', phone: '+86 138 2168 9901', status: 'qualified', lead_source: 'referral', industry: 'finance', estimated_amount: 450000, demand_type: 'consulting', approval_status: 'approved', description: '客户意向：核心系统升级架构咨询，输出蓝图与分期路线图。' },
    { first_name: '远', last_name: '高', company: NF, title: '收费管理部主任', email: 'gaoyuan@nanfang-expressway.example.com', phone: '+86 139 2087 1101', status: 'unqualified', disqualification_reason: 'no_budget', lead_source: 'cold_call', industry: 'logistics', estimated_amount: 300000, demand_type: 'operations', approval_status: 'rejected', description: '客户意向：收费站设备巡检小程序；本年度无预算，明年再跟。' },
    { first_name: '静', last_name: '罗', company: TQ, title: 'CIO', email: 'luojing@tianqi-logistics.example.com', phone: '+86 137 5526 3301', status: 'qualified', lead_source: 'referral', industry: 'logistics', estimated_amount: 1800000, demand_type: 'implementation', approval_status: 'approved', description: '客户意向：TMS 运输管理系统（已成交并验收）。' },
    { first_name: '雪', last_name: '韩', company: '北方重工集团有限公司', title: '信息化处处长', email: 'hanxue@beifang-heavy.example.com', phone: '+86 138 2455 6600', status: 'new', lead_source: 'web', industry: 'manufacturing', estimated_amount: 2000000, demand_type: 'software_development', approval_status: 'draft', description: '客户意向：设备全生命周期管理系统；官网表单留资，待首次联系。' },
    { first_name: '诺', last_name: '许', company: '蓝海跨境电商有限公司', title: '运营副总', email: 'xunuo@lanhai-ec.example.com', phone: '+86 135 7554 8800', status: 'contacted', lead_source: 'social', industry: 'retail', estimated_amount: 800000, demand_type: 'implementation', approval_status: 'draft', description: '客户意向：跨境 ERP 与海外仓对接；已电话沟通，等待需求文档。' },
  ],
});

// `approval_status: 'approved'` on every deal keeps the standard Large Deal
// Approval from locking seeded records (see psa.seed.ts). Closed deals carry
// their reasons; open deals close in the future so the lifecycle hook's
// close-date rule holds on replay.
export const industryOpportunities = defineSeed(Opportunity, {
  mode: 'upsert',
  externalId: 'name',
  records: [
    { name: OPP_CJ, crm_account: CJ, amount: 3200000, stage: 'closed_won', probability: 100, close_date: celDaysAgo(50), type: 'new_business', forecast_category: 'closed', stage_entry_date: celDaysAgo(50), is_bid: true, level: 'level_a', priority: 'high', approval_status: 'approved', initiation_status: 'approved', controllability: 'high', customer_initiation_date: celDaysAgo(150), expected_bid_date: celDaysAgo(80), crm_legal_entity: ENTITY, business_category: 'manufacturing', revenue_recognition_type: 'milestone', win_reason: 'best_fit', loss_details: '汽车行业 DMS 案例 + 经销商移动端方案打动业务部门。', description: '客户简介：新能源整车厂，600 家经销商。\n项目背景：经销商库存与售后数据不透明，总部无法及时决策。\n风险分析：经销商推广需要总部政策配合。\n付款条款：3-4-3。', next_step: '一期交付中，规划二期售后与配件模块。' },
    { name: OPP_JN, crm_account: JN, amount: 2400000, stage: 'proposal', probability: 55, close_date: celDaysFromNow(60), type: 'new_business', forecast_category: 'best_case', stage_entry_date: celDaysAgo(12), is_bid: true, level: 'level_a', priority: 'medium', approval_status: 'approved', initiation_status: 'approved', controllability: 'medium', customer_initiation_date: celDaysAgo(45), expected_bid_date: celDaysFromNow(25), crm_legal_entity: ENTITY_SH, business_category: 'manufacturing', revenue_recognition_type: 'milestone', subcontract_info: '审计追踪与电子签名模块拟采用第三方合规组件。', description: '客户简介：医药制造集团，三个生产基地。\n项目背景：新版 GMP 检查在即，纸质记录不可追溯。\n风险分析：竞争对手有医药行业成熟产品；我方以定制化与本地团队取胜。\n付款条款：签约 30% / 上线 40% / 验收 30%。', next_step: '提交技术方案与报价，安排质量部门演示。' },
    { name: OPP_ZY, crm_account: ZY, amount: 5600000, stage: 'negotiation', probability: 75, close_date: celDaysFromNow(12), type: 'new_business', forecast_category: 'commit', stage_entry_date: celDaysAgo(6), is_bid: true, level: 'level_a', priority: 'high', approval_status: 'approved', initiation_status: 'approved', controllability: 'high', customer_initiation_date: celDaysAgo(120), expected_bid_date: celDaysAgo(20), crm_legal_entity: ENTITY, business_category: 'finance', revenue_recognition_type: 'milestone', subcontract_info: '安全渗透测试拟分包。', description: '客户简介：城市商业银行。\n项目背景：手机银行 4.x 架构老化，监管要求开放平台改造。\n风险分析：两家竞争对手报价更低；客户关注交付团队驻场能力。\n付款条款：里程碑付款，验收后付 20%。', next_step: '商务谈判：付款节点与质保期。' },
    { name: OPP_HD, crm_account: HD, amount: 1200000, stage: 'qualification', probability: 20, close_date: celDaysFromNow(90), type: 'new_business', forecast_category: 'pipeline', stage_entry_date: celDaysAgo(10), is_bid: false, level: 'level_b', priority: 'medium', approval_status: 'approved', initiation_status: 'draft', controllability: 'low', customer_initiation_date: celDaysAgo(20), crm_legal_entity: ENTITY, business_category: 'government_enterprise', revenue_recognition_type: 'acceptance', description: '客户简介：建筑施工集团。\n项目背景：项目部进度与成本靠周报，集团层面缺少实时视图。\n风险分析：付款周期 180 天，需评估回款。', next_step: '完成两个试点项目部的需求调研，评估是否立项。' },
    { name: OPP_PC, crm_account: PC, amount: 600000, stage: 'prospecting', probability: 10, close_date: celDaysFromNow(120), type: 'new_business', forecast_category: 'pipeline', stage_entry_date: celDaysAgo(3), is_bid: false, level: 'level_c', priority: 'low', approval_status: 'approved', initiation_status: 'draft', controllability: 'low', crm_legal_entity: ENTITY, business_category: 'internet', revenue_recognition_type: 'acceptance', description: '客户简介：在线教育公司。\n项目背景：学习平台单体架构，扩容困难。\n风险分析：预算未批，可能推迟。', next_step: '发送案例资料，约 CTO 交流架构方案。' },
    { name: OPP_HDL, crm_account: HDL, amount: 900000, stage: 'closed_won', probability: 100, close_date: celDaysAgo(20), type: 'existing_renewal', forecast_category: 'closed', stage_entry_date: celDaysAgo(20), is_bid: false, level: 'level_b', priority: 'medium', approval_status: 'approved', initiation_status: 'approved', controllability: 'high', customer_initiation_date: celDaysAgo(60), crm_legal_entity: ENTITY_SH, business_category: 'government_enterprise', revenue_recognition_type: 'periodic', win_reason: 'relationship', loss_details: '原厂运维续签，增加 7×24 值守。', description: '客户简介：电力交易中心，交易结算系统由我司建设。\n项目背景：2026 年度运维续签。\n付款条款：按月结算。', next_step: '按月开票、收款。' },
    { name: OPP_XH, crm_account: XH, amount: 450000, stage: 'closed_won', probability: 100, close_date: celDaysAgo(70), type: 'new_business', forecast_category: 'closed', stage_entry_date: celDaysAgo(70), is_bid: false, level: 'level_b', priority: 'medium', approval_status: 'approved', initiation_status: 'approved', controllability: 'high', customer_initiation_date: celDaysAgo(110), crm_legal_entity: ENTITY_SH, business_category: 'finance', revenue_recognition_type: 'acceptance', win_reason: 'better_product', loss_details: '架构咨询方法论与保险行业案例。', description: '客户简介：财产险公司。\n项目背景：核心系统升级前的架构咨询，输出蓝图与分期路线。\n风险分析：实施标预计明年一季度，本项目是入场券。', next_step: '咨询已交付验收；跟进明年实施标。' },
    { name: OPP_NF, crm_account: NF, amount: 2800000, stage: 'closed_lost', probability: 0, close_date: celDaysAgo(40), type: 'new_business', forecast_category: 'omitted', stage_entry_date: celDaysAgo(40), is_bid: true, level: 'level_a', priority: 'high', approval_status: 'approved', initiation_status: 'approved', controllability: 'medium', customer_initiation_date: celDaysAgo(130), expected_bid_date: celDaysAgo(55), crm_legal_entity: ENTITY, business_category: 'government_enterprise', revenue_recognition_type: 'milestone', loss_reason: 'price', loss_details: '中标价低于我方报价 18%；技术评分第一，商务评分落后。教训：分包成本估算偏高。', description: '客户简介：高速公路集团。\n项目背景：收费运营平台改造，公开招标。\n风险分析：竞争对手本地化价格优势。', next_step: '复盘报价策略；关注明年联网收费改造。' },
    { name: OPP_TQ, crm_account: TQ, amount: 1800000, stage: 'closed_won', probability: 100, close_date: celDaysAgo(200), type: 'new_business', forecast_category: 'closed', stage_entry_date: celDaysAgo(200), is_bid: true, level: 'level_a', priority: 'high', approval_status: 'approved', initiation_status: 'approved', controllability: 'high', customer_initiation_date: celDaysAgo(280), expected_bid_date: celDaysAgo(230), crm_legal_entity: ENTITY, business_category: 'government_enterprise', revenue_recognition_type: 'milestone', win_reason: 'better_support', loss_details: '深圳本地交付团队 + 物流行业实施经验。', description: '客户简介：物流企业，9,200 人。\n项目背景：运输管理系统（调度、在途跟踪、结算）。\n付款条款：3-4-3，已全部回款。', next_step: '已验收；运维续签在谈。' },
    { name: OPP_BC2, crm_account: BC, amount: 800000, stage: 'needs_analysis', probability: 30, close_date: celDaysFromNow(14), type: 'existing_expansion', forecast_category: 'pipeline', stage_entry_date: celDaysAgo(8), is_bid: false, level: 'level_b', priority: 'medium', approval_status: 'approved', initiation_status: 'approved', controllability: 'medium', customer_initiation_date: celDaysAgo(25), crm_legal_entity: ENTITY, business_category: 'manufacturing', revenue_recognition_type: 'acceptance', description: '客户简介：MES 客户续作。\n项目背景：设备预测性维护 POC，两条产线试点。\n风险分析：数据采集依赖设备厂商开放接口。', next_step: '完成 POC 范围与验收标准确认。' },
  ],
});

export const industryContracts = defineSeed(Contract, {
  mode: 'upsert',
  externalId: 'description',
  records: [
    { description: CT_BC, crm_account: BC, crm_contact: 'zhang.jianguo@beichen.example.com', crm_opportunity: OPP_BC, status: 'activated', contract_type: 'service', contract_term_months: 10, start_date: celDaysAgo(28), end_date: celDaysFromNow(272), signed_date: celDaysAgo(29), contract_value: 2600000, special_terms: '里程碑付款：签约 30% / 试运行 40% / 验收 30%。质保期 12 个月。' },
    { description: CT_CJ, crm_account: CJ, crm_contact: 'zhou.tao@cj-ev.example.com', crm_opportunity: OPP_CJ, status: 'activated', contract_type: 'service', contract_term_months: 12, start_date: celDaysAgo(48), end_date: celDaysFromNow(317), signed_date: celDaysAgo(49), contract_value: 3200000, special_terms: '付款条款 3-4-3：签约 30% / 上线 40% / 验收 30%。' },
    { description: CT_TQ, crm_account: TQ, crm_contact: 'luo.jing@tianqi-logistics.example.com', crm_opportunity: OPP_TQ, status: 'activated', contract_type: 'service', contract_term_months: 8, start_date: celDaysAgo(198), end_date: celDaysFromNow(45), signed_date: celDaysAgo(199), contract_value: 1800000, special_terms: '付款条款 3-4-3，已全部回款；质保期至合同到期。' },
    { description: CT_HDL, crm_account: HDL, crm_contact: 'huang.lei@ecpx.example.com', crm_opportunity: OPP_HDL, status: 'activated', contract_type: 'service', contract_term_months: 12, start_date: celDaysAgo(18), end_date: celDaysFromNow(347), signed_date: celDaysAgo(19), contract_value: 900000, billing_frequency: 'monthly', special_terms: '每月 75,000，月末开票，次月 30 日内付款；含 7×24 值守。' },
    { description: CT_XH, crm_account: XH, crm_contact: 'lin.fang@xinghai-ins.example.com', crm_opportunity: OPP_XH, status: 'activated', contract_type: 'service', contract_term_months: 3, start_date: celDaysAgo(68), end_date: celDaysFromNow(22), signed_date: celDaysAgo(69), contract_value: 450000, special_terms: '咨询服务：蓝图交付后一次性付款。' },
  ],
});

export const industryPresalesProjects = defineSeed(PresalesProject, {
  mode: 'upsert',
  externalId: 'name',
  records: [
    { name: PSP_BC, alias: 'BC-MES2-PS', crm_opportunity: OPP_BC, crm_account: BC, project_type: 'implementation', business_category: 'manufacturing', planned_start: celDaysAgo(90), planned_end: celDaysAgo(35), expected_contract_amount: 2600000, labor_cost: 1300000, third_party_service_cost: 300000, procurement_cost: 200000, project_expense: 60000, quote_amount: 2600000, security_class: 'internal', approval_status: 'approved', description: 'Bizcase：总成本 186 万，报价 260 万，毛利率 28.5%。MES 一期团队续作，产线集成分包。' },
    { name: PSP_CJ, alias: 'CJ-DMS-PS', crm_opportunity: OPP_CJ, crm_account: CJ, project_type: 'implementation', business_category: 'manufacturing', planned_start: celDaysAgo(120), planned_end: celDaysAgo(55), expected_contract_amount: 3200000, labor_cost: 1400000, third_party_service_cost: 350000, procurement_cost: 250000, project_expense: 80000, quote_amount: 3200000, security_class: 'confidential', security_note: '涉及经销商销售数据，签署保密协议。', approval_status: 'approved', description: 'Bizcase：总成本 208 万，报价 320 万，毛利率 35%。' },
    { name: PSP_JN, alias: 'JN-GMP-PS', crm_opportunity: OPP_JN, crm_account: JN, project_type: 'software_development', business_category: 'manufacturing', planned_start: celDaysAgo(15), planned_end: celDaysFromNow(30), expected_contract_amount: 2400000, labor_cost: 1100000, third_party_service_cost: 200000, procurement_cost: 150000, project_expense: 50000, quote_amount: 2400000, security_class: 'confidential', security_note: 'GMP 记录属受监管数据，开发环境使用脱敏数据。', approval_status: 'draft', description: 'Bizcase 编制中：总成本 150 万，报价 240 万，毛利率 37.5%（演示：可现场发起审批）。' },
    { name: PSP_ZY, alias: 'ZY-MB5-PS', crm_opportunity: OPP_ZY, crm_account: ZY, project_type: 'software_development', business_category: 'finance', planned_start: celDaysAgo(80), planned_end: celDaysFromNow(10), expected_contract_amount: 5600000, labor_cost: 2600000, third_party_service_cost: 600000, procurement_cost: 500000, project_expense: 120000, quote_amount: 5600000, security_class: 'secret', security_note: '银行客户数据，投标文件与方案受控发放。', approval_status: 'approved', description: 'Bizcase：总成本 382 万，报价 560 万，毛利率 31.8%。渗透测试分包。' },
    { name: PSP_TQ, alias: 'TQ-TMS-PS', crm_opportunity: OPP_TQ, crm_account: TQ, project_type: 'implementation', business_category: 'government_enterprise', planned_start: celDaysAgo(270), planned_end: celDaysAgo(210), expected_contract_amount: 1800000, labor_cost: 800000, third_party_service_cost: 200000, procurement_cost: 150000, project_expense: 50000, quote_amount: 1800000, security_class: 'internal', approval_status: 'approved', description: 'Bizcase：总成本 120 万，报价 180 万，毛利率 33.3%。' },
    { name: PSP_XH, alias: 'XH-ARCH-PS', crm_opportunity: OPP_XH, crm_account: XH, project_type: 'consulting', business_category: 'finance', planned_start: celDaysAgo(100), planned_end: celDaysAgo(75), expected_contract_amount: 450000, labor_cost: 280000, third_party_service_cost: 0, procurement_cost: 0, project_expense: 20000, quote_amount: 450000, security_class: 'confidential', approval_status: 'approved', description: 'Bizcase：总成本 30 万，报价 45 万，毛利率 33.3%。两名架构师 8 周。' },
    { name: PSP_HDL, alias: 'HDL-OPS-PS', crm_opportunity: OPP_HDL, crm_account: HDL, project_type: 'operations', business_category: 'government_enterprise', planned_start: celDaysAgo(50), planned_end: celDaysAgo(25), expected_contract_amount: 900000, labor_cost: 600000, third_party_service_cost: 0, procurement_cost: 0, project_expense: 30000, quote_amount: 900000, security_class: 'internal', approval_status: 'approved', description: 'Bizcase：总成本 63 万，报价 90 万，毛利率 30%。一名驻场工程师 + 7×24 值守轮班。' },
  ],
});

export const industryDeliveryProjects = defineSeed(DeliveryProject, {
  mode: 'upsert',
  externalId: 'name',
  records: [
    // No `budget_baseline` here on purpose: delivery_project_defaults imports
    // the presales Bizcase total (1,860,000) — the step-27 behaviour, seeded.
    { name: DLV_BC, alias: 'BC-MES2-D1', crm_presales_project: PSP_BC, crm_opportunity: OPP_BC, crm_account: BC, project_type: 'implementation', business_category: 'manufacturing', planned_start: celDaysAgo(28), planned_end: celDaysFromNow(240), status: 'active', impl_cost_center: 'dc_east', accounting_cost_center: 'dc_east', department: 'bu_manufacturing', security_class: 'internal', approval_status: 'approved', crm_contract: CT_BC, progress_pct: 45 },
    { name: DLV_CJ, alias: 'CJ-DMS-D1', crm_presales_project: PSP_CJ, crm_opportunity: OPP_CJ, crm_account: CJ, project_type: 'implementation', business_category: 'manufacturing', planned_start: celDaysAgo(25), planned_end: celDaysFromNow(300), status: 'active', impl_cost_center: 'dc_south', accounting_cost_center: 'dc_south', department: 'bu_manufacturing', budget_baseline: 2080000, security_class: 'confidential', approval_status: 'approved', crm_contract: CT_CJ, progress_pct: 20 },
    { name: DLV_TQ, alias: 'TQ-TMS-D1', crm_presales_project: PSP_TQ, crm_opportunity: OPP_TQ, crm_account: TQ, project_type: 'implementation', business_category: 'government_enterprise', planned_start: celDaysAgo(195), planned_end: celDaysAgo(30), status: 'closed', impl_cost_center: 'dc_south', accounting_cost_center: 'dc_south', department: 'bu_government', budget_baseline: 1200000, security_class: 'internal', approval_status: 'approved', crm_contract: CT_TQ, progress_pct: 100 },
    { name: DLV_HDL, alias: 'HDL-OPS-2026', crm_presales_project: PSP_HDL, crm_opportunity: OPP_HDL, crm_account: HDL, project_type: 'operations', business_category: 'government_enterprise', planned_start: celDaysAgo(18), planned_end: celDaysFromNow(347), status: 'active', impl_cost_center: 'dc_east', accounting_cost_center: 'dc_east', department: 'bu_government', budget_baseline: 630000, security_class: 'internal', approval_status: 'approved', crm_contract: CT_HDL, progress_pct: 15 },
    { name: DLV_XH, alias: 'XH-ARCH-D1', crm_presales_project: PSP_XH, crm_opportunity: OPP_XH, crm_account: XH, project_type: 'consulting', business_category: 'finance', planned_start: celDaysAgo(68), planned_end: celDaysAgo(12), status: 'closed', impl_cost_center: 'dc_east', accounting_cost_center: 'dc_east', department: 'bu_finance', budget_baseline: 300000, security_class: 'confidential', approval_status: 'approved', crm_contract: CT_XH, progress_pct: 100 },
  ],
});

export const industryBusinessTrips = defineSeed(BusinessTrip, {
  mode: 'upsert',
  externalId: 'subject',
  records: [
    { subject: '北辰二期开工会议', crm_delivery_project: DLV_BC, destination: '苏州 · 北辰智造', start_date: celDaysAgo(27), end_date: celDaysAgo(26), transport: 'train', purpose: '交付立项后开工会议，确认三个工厂的实施顺序。', estimated_cost: 9000, approval_status: 'approved' },
    { subject: '北辰一工厂产线调研', crm_delivery_project: DLV_BC, destination: '苏州 · 北辰一工厂', start_date: celDaysAgo(16), end_date: celDaysAgo(14), transport: 'train', purpose: '一工厂产线数据采集点调研。', estimated_cost: 8000, approval_status: 'approved' },
    { subject: '长江新能源 DMS 启动会', crm_delivery_project: DLV_CJ, destination: '武汉 · 长江新能源总部', start_date: celDaysAgo(24), end_date: celDaysAgo(23), transport: 'flight', purpose: '项目启动会与经销商试点选择。', estimated_cost: 12000, approval_status: 'approved' },
    { subject: '天启物流 TMS 上线支持', crm_delivery_project: DLV_TQ, destination: '深圳 · 天启物流', start_date: celDaysAgo(60), end_date: celDaysAgo(55), transport: 'flight', purpose: '系统上线切换，3 人 6 天驻场。', estimated_cost: 20000, approval_status: 'approved' },
    { subject: '天启物流 TMS 验收评审', crm_delivery_project: DLV_TQ, destination: '深圳 · 天启物流', start_date: celDaysAgo(33), end_date: celDaysAgo(31), transport: 'flight', purpose: '验收评审会与培训。', estimated_cost: 15000, approval_status: 'approved' },
    { subject: '星海保险蓝图汇报', crm_delivery_project: DLV_XH, destination: '上海 · 星海保险', start_date: celDaysAgo(14), end_date: celDaysAgo(13), transport: 'train', purpose: '架构蓝图最终汇报。', estimated_cost: 3000, approval_status: 'approved' },
    { subject: '中原银行商务谈判', crm_presales_project: PSP_ZY, destination: '郑州 · 中原银行', start_date: celDaysFromNow(6), end_date: celDaysFromNow(7), transport: 'flight', purpose: '手机银行 5.0 合同条款谈判（售前）。', estimated_cost: 6000, approval_status: 'approved' },
    { subject: '江南医药质量部演示', crm_presales_project: PSP_JN, destination: '杭州 · 江南医药', start_date: celDaysFromNow(10), end_date: celDaysFromNow(10), transport: 'train', purpose: 'GMP 系统方案演示（售前）。', estimated_cost: 2500, approval_status: 'draft', notes: '待项目经理审批。' },
  ],
});

const m = (daysAgo: number) => celDaysAgo(daysAgo);

export const industryCostPlanLines = defineSeed(CostPlanLine, {
  mode: 'upsert',
  externalId: 'description',
  records: [
    { crm_delivery_project: DLV_BC, category: 'labor', crm_rate_card: '项目经理', period_month: m(75), description: '人工 · 北辰二期 · 项目经理 · 第 1 月', quantity: 160, unit_price: 900, planned_amount: 144000 },
    { crm_delivery_project: DLV_BC, category: 'labor', crm_rate_card: '高级工程师', period_month: m(75), description: '人工 · 北辰二期 · 高级工程师 × 2 · 第 1 月', quantity: 320, unit_price: 800, planned_amount: 256000 },
    { crm_delivery_project: DLV_BC, category: 'labor', crm_rate_card: '工程师', period_month: m(45), description: '人工 · 北辰二期 · 工程师 × 2 · 第 2 月', quantity: 320, unit_price: 600, planned_amount: 192000 },
    { crm_delivery_project: DLV_BC, category: 'third_party_service', period_month: m(45), description: '第三方 · 北辰二期 · 产线集成分包 · 第 2 月', quantity: 1, unit_price: 160000, planned_amount: 160000 },
    { crm_delivery_project: DLV_BC, category: 'procurement', period_month: m(75), description: '采购 · 北辰二期 · 数据采集网关 · 第 1 月', quantity: 6, unit_price: 30000, planned_amount: 180000 },
    { crm_delivery_project: DLV_BC, category: 'expense', period_month: m(75), description: '费用 · 北辰二期 · 差旅与驻场 · 第 1 月', quantity: 1, unit_price: 20000, planned_amount: 20000 },
    { crm_delivery_project: DLV_CJ, category: 'labor', crm_rate_card: '架构师', period_month: m(15), description: '人工 · 长江 DMS · 架构师 · 第 1 月', quantity: 80, unit_price: 1000, planned_amount: 80000 },
    { crm_delivery_project: DLV_CJ, category: 'labor', crm_rate_card: '高级工程师', period_month: m(15), description: '人工 · 长江 DMS · 高级工程师 × 3 · 第 1 月', quantity: 480, unit_price: 800, planned_amount: 384000 },
    { crm_delivery_project: DLV_CJ, category: 'third_party_service', period_month: m(15), description: '第三方 · 长江 DMS · 地图与短信服务 · 第 1 月', quantity: 1, unit_price: 40000, planned_amount: 40000 },
    { crm_delivery_project: DLV_CJ, category: 'expense', period_month: m(15), description: '费用 · 长江 DMS · 差旅 · 第 1 月', quantity: 1, unit_price: 15000, planned_amount: 15000 },
    { crm_delivery_project: DLV_TQ, category: 'labor', crm_rate_card: '项目经理', period_month: m(190), description: '人工 · 天启 TMS · 项目经理 · 第 1 月', quantity: 160, unit_price: 900, planned_amount: 144000 },
    { crm_delivery_project: DLV_TQ, category: 'labor', crm_rate_card: '工程师', period_month: m(190), description: '人工 · 天启 TMS · 工程师 × 2 · 第 1 月', quantity: 320, unit_price: 600, planned_amount: 192000 },
    { crm_delivery_project: DLV_TQ, category: 'procurement', period_month: m(160), description: '采购 · 天启 TMS · 车载 GPS 终端 · 第 2 月', quantity: 300, unit_price: 500, planned_amount: 150000 },
    { crm_delivery_project: DLV_TQ, category: 'expense', period_month: m(60), description: '费用 · 天启 TMS · 上线驻场 · 第 5 月', quantity: 1, unit_price: 40000, planned_amount: 40000 },
    { crm_delivery_project: DLV_HDL, category: 'labor', crm_rate_card: '工程师', period_month: m(15), description: '人工 · 华东电力运维 · 驻场工程师 · 第 1 月', quantity: 160, unit_price: 600, planned_amount: 96000 },
    { crm_delivery_project: DLV_HDL, category: 'expense', period_month: m(15), description: '费用 · 华东电力运维 · 值守补贴 · 第 1 月', quantity: 1, unit_price: 6000, planned_amount: 6000 },
    { crm_delivery_project: DLV_XH, category: 'labor', crm_rate_card: '架构师', period_month: m(70), description: '人工 · 星海咨询 · 架构师 × 2 · 第 1 月', quantity: 160, unit_price: 1000, planned_amount: 160000 },
    { crm_delivery_project: DLV_XH, category: 'labor', crm_rate_card: '架构师', period_month: m(40), description: '人工 · 星海咨询 · 架构师 · 第 2 月', quantity: 120, unit_price: 1000, planned_amount: 120000 },
  ],
});

// Every sheet is `approved` so it counts toward its project's actuals; each
// project's running total stays under its baseline for the budget gate.
export const industryTimesheets = defineSeed(Timesheet, {
  mode: 'upsert',
  externalId: 'notes',
  records: [
    { crm_delivery_project: DLV_BC, crm_rate_card: '项目经理', period_month: m(75), hours: 160, approval_status: 'approved', notes: 'TS · 北辰二期 · 第 1 月 · 项目经理' },
    { crm_delivery_project: DLV_BC, crm_rate_card: '高级工程师', period_month: m(75), hours: 160, approval_status: 'approved', notes: 'TS · 北辰二期 · 第 1 月 · 高级工程师' },
    { crm_delivery_project: DLV_BC, crm_rate_card: '项目经理', period_month: m(45), hours: 160, approval_status: 'approved', notes: 'TS · 北辰二期 · 第 2 月 · 项目经理' },
    { crm_delivery_project: DLV_BC, crm_rate_card: '高级工程师', period_month: m(45), hours: 160, approval_status: 'approved', notes: 'TS · 北辰二期 · 第 2 月 · 高级工程师' },
    { crm_delivery_project: DLV_BC, crm_rate_card: '工程师', period_month: m(45), hours: 160, approval_status: 'approved', notes: 'TS · 北辰二期 · 第 2 月 · 工程师' },
    { crm_delivery_project: DLV_BC, crm_rate_card: '高级工程师', period_month: m(15), hours: 160, approval_status: 'approved', notes: 'TS · 北辰二期 · 第 3 月 · 高级工程师' },
    { crm_delivery_project: DLV_BC, crm_rate_card: '工程师', period_month: m(15), hours: 160, approval_status: 'approved', notes: 'TS · 北辰二期 · 第 3 月 · 工程师' },
    { crm_delivery_project: DLV_CJ, crm_rate_card: '架构师', period_month: m(15), hours: 80, approval_status: 'approved', notes: 'TS · 长江 DMS · 第 1 月 · 架构师' },
    { crm_delivery_project: DLV_CJ, crm_rate_card: '项目经理', period_month: m(15), hours: 160, approval_status: 'approved', notes: 'TS · 长江 DMS · 第 1 月 · 项目经理' },
    { crm_delivery_project: DLV_CJ, crm_rate_card: '高级工程师', period_month: m(15), hours: 160, approval_status: 'approved', notes: 'TS · 长江 DMS · 第 1 月 · 高级工程师' },
    { crm_delivery_project: DLV_TQ, crm_rate_card: '项目经理', period_month: m(190), hours: 160, approval_status: 'approved', notes: 'TS · 天启 TMS · 第 1 月 · 项目经理' },
    { crm_delivery_project: DLV_TQ, crm_rate_card: '工程师', period_month: m(190), hours: 160, approval_status: 'approved', notes: 'TS · 天启 TMS · 第 1 月 · 工程师' },
    { crm_delivery_project: DLV_TQ, crm_rate_card: '项目经理', period_month: m(160), hours: 160, approval_status: 'approved', notes: 'TS · 天启 TMS · 第 2 月 · 项目经理' },
    { crm_delivery_project: DLV_TQ, crm_rate_card: '工程师', period_month: m(160), hours: 160, approval_status: 'approved', notes: 'TS · 天启 TMS · 第 2 月 · 工程师' },
    { crm_delivery_project: DLV_TQ, crm_rate_card: '项目经理', period_month: m(130), hours: 160, approval_status: 'approved', notes: 'TS · 天启 TMS · 第 3 月 · 项目经理' },
    { crm_delivery_project: DLV_TQ, crm_rate_card: '工程师', period_month: m(130), hours: 160, approval_status: 'approved', notes: 'TS · 天启 TMS · 第 3 月 · 工程师' },
    { crm_delivery_project: DLV_TQ, crm_rate_card: '项目经理', period_month: m(100), hours: 160, approval_status: 'approved', notes: 'TS · 天启 TMS · 第 4 月 · 项目经理' },
    { crm_delivery_project: DLV_TQ, crm_rate_card: '工程师', period_month: m(100), hours: 160, approval_status: 'approved', notes: 'TS · 天启 TMS · 第 4 月 · 工程师' },
    { crm_delivery_project: DLV_TQ, crm_rate_card: '工程师', period_month: m(70), hours: 160, approval_status: 'approved', notes: 'TS · 天启 TMS · 第 5 月 · 工程师' },
    { crm_delivery_project: DLV_TQ, crm_rate_card: '项目经理', period_month: m(40), hours: 40, approval_status: 'approved', notes: 'TS · 天启 TMS · 第 6 月 · 项目经理（验收）' },
    { crm_delivery_project: DLV_HDL, crm_rate_card: '工程师', period_month: m(15), hours: 160, approval_status: 'approved', notes: 'TS · 华东电力运维 · 第 1 月 · 驻场工程师' },
    { crm_delivery_project: DLV_XH, crm_rate_card: '架构师', period_month: m(70), hours: 160, approval_status: 'approved', notes: 'TS · 星海咨询 · 第 1 月 · 架构师' },
    { crm_delivery_project: DLV_XH, crm_rate_card: '架构师', period_month: m(40), hours: 80, approval_status: 'approved', notes: 'TS · 星海咨询 · 第 2 月 · 架构师' },
    { crm_delivery_project: DLV_XH, crm_rate_card: '项目经理', period_month: m(40), hours: 32, approval_status: 'approved', notes: 'TS · 星海咨询 · 第 2 月 · 项目经理（汇报）' },
  ],
});

export const industryTravelCosts = defineSeed(TravelCost, {
  mode: 'upsert',
  externalId: 'receipt_number',
  records: [
    { crm_delivery_project: DLV_BC, crm_business_trip: '北辰二期开工会议', expense_date: celDaysAgo(26), amount: 9600, receipt_number: 'BX-2026-1103', description: '苏州 · 开工会议 · 4 人 2 天' },
    { crm_delivery_project: DLV_BC, crm_business_trip: '北辰一工厂产线调研', expense_date: celDaysAgo(14), amount: 7800, receipt_number: 'BX-2026-1157', description: '苏州 · 产线调研 · 2 人 3 天' },
    { crm_delivery_project: DLV_CJ, crm_business_trip: '长江新能源 DMS 启动会', expense_date: celDaysAgo(23), amount: 11200, receipt_number: 'BX-2026-1121', description: '武汉 · 启动会 · 3 人 2 天' },
    { crm_delivery_project: DLV_TQ, crm_business_trip: '天启物流 TMS 上线支持', expense_date: celDaysAgo(55), amount: 18600, receipt_number: 'BX-2026-0801', description: '深圳 · 上线切换 · 3 人 6 天' },
    { crm_delivery_project: DLV_TQ, crm_business_trip: '天启物流 TMS 验收评审', expense_date: celDaysAgo(31), amount: 23400, receipt_number: 'BX-2026-1010', description: '深圳 · 验收评审与培训 · 4 人 3 天' },
    { crm_delivery_project: DLV_XH, crm_business_trip: '星海保险蓝图汇报', expense_date: celDaysAgo(13), amount: 2600, receipt_number: 'BX-2026-1160', description: '上海 · 蓝图汇报 · 2 人 2 天' },
  ],
});

export const industryBudgetAdjustments = defineSeed(BudgetAdjustment, {
  mode: 'upsert',
  externalId: 'analysis',
  records: [
    { crm_delivery_project: DLV_TQ, amount: 100000, reason: 'schedule_extension', analysis: '客户上线窗口推迟 5 周，上线驻场与验收周期延长：项目经理 1 个月（约 36,000）+ 工程师 1 个月（约 96,000）扣除已含费用，申请追加 100,000。', approval_status: 'approved', notes: '已审批：当前预算 1,300,000。' },
    { crm_delivery_project: DLV_BC, amount: 80000, reason: 'rate_change', analysis: '高级工程师费率自 2026 年 7 月上调 5%，预计影响剩余 6 个月人工约 80,000。', approval_status: 'rejected', notes: '已驳回：费率变化由事业部内部消化，不调整项目预算。' },
  ],
});

export const industryInvoices = defineSeed(Invoice, {
  mode: 'upsert',
  externalId: 'invoice_number',
  records: [
    { crm_delivery_project: DLV_BC, crm_contract: CT_BC, crm_account: BC, invoice_type: 'vat_special', invoice_number: 'BC20260818001', invoice_date: celDaysAgo(28), amount: 780000, tax_rate: 6, due_date: celDaysFromNow(2), status: 'paid', description: '签约款 30%（合同额 2,600,000）' },
    { crm_delivery_project: DLV_CJ, crm_contract: CT_CJ, crm_account: CJ, invoice_type: 'vat_special', invoice_number: 'CJ20260729001', invoice_date: celDaysAgo(48), amount: 960000, tax_rate: 6, due_date: celDaysFromNow(12), status: 'paid', description: '签约款 30%（合同额 3,200,000）' },
    { crm_delivery_project: DLV_TQ, crm_contract: CT_TQ, crm_account: TQ, invoice_type: 'vat_special', invoice_number: 'TQ20260302001', invoice_date: celDaysAgo(197), amount: 540000, tax_rate: 6, due_date: celDaysAgo(167), status: 'paid', description: '签约款 30%（合同额 1,800,000）' },
    { crm_delivery_project: DLV_TQ, crm_contract: CT_TQ, crm_account: TQ, invoice_type: 'vat_special', invoice_number: 'TQ20260720002', invoice_date: celDaysAgo(57), amount: 720000, tax_rate: 6, due_date: celDaysAgo(27), status: 'paid', description: '上线款 40%' },
    { crm_delivery_project: DLV_TQ, crm_contract: CT_TQ, crm_account: TQ, invoice_type: 'vat_special', invoice_number: 'TQ20260815003', invoice_date: celDaysAgo(31), amount: 540000, tax_rate: 6, due_date: celDaysAgo(1), status: 'paid', description: '验收款 30%' },
    { crm_delivery_project: DLV_HDL, crm_contract: CT_HDL, crm_account: HDL, invoice_type: 'electronic', invoice_number: 'HD20260831001', invoice_date: celDaysAgo(15), amount: 75000, tax_rate: 6, due_date: celDaysFromNow(15), status: 'paid', description: '运维服务费 · 第 1 月' },
    { crm_delivery_project: DLV_HDL, crm_contract: CT_HDL, crm_account: HDL, invoice_type: 'electronic', invoice_number: 'HD20260915002', invoice_date: celDaysAgo(1), amount: 75000, tax_rate: 6, due_date: celDaysFromNow(29), status: 'issued', description: '运维服务费 · 第 2 月' },
    { crm_delivery_project: DLV_XH, crm_contract: CT_XH, crm_account: XH, invoice_type: 'vat_special', invoice_number: 'XH20260901001', invoice_date: celDaysAgo(12), amount: 450000, tax_rate: 6, due_date: celDaysFromNow(18), status: 'issued', description: '咨询服务费（蓝图交付后一次性）' },
  ],
});

export const industryCollections = defineSeed(Collection, {
  mode: 'upsert',
  externalId: 'bank_reference',
  records: [
    { crm_delivery_project: DLV_BC, crm_invoice: 'BC20260818001', crm_account: BC, received_date: celDaysAgo(10), amount: 780000, method: 'bank_transfer', bank_reference: 'ICBC20260905000771', description: '北辰二期签约款到账' },
    { crm_delivery_project: DLV_CJ, crm_invoice: 'CJ20260729001', crm_account: CJ, received_date: celDaysAgo(20), amount: 960000, method: 'bank_draft', bank_reference: 'CCB20260826000412', description: '长江 DMS 签约款（银行承兑汇票）' },
    { crm_delivery_project: DLV_TQ, crm_invoice: 'TQ20260302001', crm_account: TQ, received_date: celDaysAgo(180), amount: 540000, method: 'bank_transfer', bank_reference: 'CMB20260319000233', description: '天启 TMS 签约款到账' },
    { crm_delivery_project: DLV_TQ, crm_invoice: 'TQ20260720002', crm_account: TQ, received_date: celDaysAgo(35), amount: 720000, method: 'bank_transfer', bank_reference: 'CMB20260811000509', description: '天启 TMS 上线款到账' },
    { crm_delivery_project: DLV_TQ, crm_invoice: 'TQ20260815003', crm_account: TQ, received_date: celDaysAgo(5), amount: 540000, method: 'bank_transfer', bank_reference: 'CMB20260910000688', description: '天启 TMS 验收款到账' },
    { crm_delivery_project: DLV_HDL, crm_invoice: 'HD20260831001', crm_account: HDL, received_date: celDaysAgo(3), amount: 75000, method: 'bank_transfer', bank_reference: 'BOC20260912000145', description: '华东电力运维 · 第 1 月服务费到账' },
  ],
});

export const industryPurchaseContracts = defineSeed(PurchaseContract, {
  mode: 'upsert',
  externalId: 'name',
  records: [
    { name: '数据采集网关采购 — 北辰二期', crm_delivery_project: DLV_BC, vendor_name: '苏州工业物联科技有限公司', category: 'hardware', amount: 180000, paid_amount: 180000, signed_date: celDaysAgo(26), status: 'completed', description: '工业网关 6 台，含安装调试。' },
    { name: '产线集成分包合同 — 北辰二期', crm_delivery_project: DLV_BC, vendor_name: '南京智控自动化有限公司', category: 'subcontract', amount: 320000, paid_amount: 160000, signed_date: celDaysAgo(20), start_date: celDaysAgo(18), end_date: celDaysFromNow(150), status: 'active', description: '三个工厂 PLC 接口集成，按工厂验收付款。' },
    { name: '地图与短信服务采购 — 长江 DMS', crm_delivery_project: DLV_CJ, vendor_name: '高德软件有限公司', category: 'software', amount: 40000, paid_amount: 0, signed_date: celDaysAgo(15), status: 'active', description: '经销商定位与到店提醒服务，年度包。' },
    { name: '车载 GPS 终端采购 — 天启 TMS', crm_delivery_project: DLV_TQ, vendor_name: '深圳北斗车联科技有限公司', category: 'hardware', amount: 150000, paid_amount: 150000, signed_date: celDaysAgo(160), status: 'completed', description: 'GPS 终端 300 台。' },
  ],
});

export const industrySalesOrders = defineSeed(SalesOrder, {
  mode: 'upsert',
  externalId: 'name',
  records: [
    { name: '北辰 MES 二期 — 订单', crm_delivery_project: DLV_BC, crm_contract: CT_BC, crm_account: BC, order_date: celDaysAgo(28), amount: 2600000, delivery_status: 'in_progress', description: '三个工厂分批验收。' },
    { name: '长江新能源 DMS — 一期订单', crm_delivery_project: DLV_CJ, crm_contract: CT_CJ, crm_account: CJ, order_date: celDaysAgo(48), amount: 3200000, delivery_status: 'in_progress', description: '对应销售合同全额。' },
    { name: '天启物流 TMS — 订单', crm_delivery_project: DLV_TQ, crm_contract: CT_TQ, crm_account: TQ, order_date: celDaysAgo(198), amount: 1800000, delivery_status: 'accepted', acceptance_date: celDaysAgo(31), description: '已验收，已全额回款。' },
    { name: '华东电力运维 2026 — 订单', crm_delivery_project: DLV_HDL, crm_contract: CT_HDL, crm_account: HDL, order_date: celDaysAgo(18), amount: 900000, delivery_status: 'in_progress', description: '按月服务、按月开票。' },
    { name: '星海保险咨询 — 订单', crm_delivery_project: DLV_XH, crm_contract: CT_XH, crm_account: XH, order_date: celDaysAgo(68), amount: 450000, delivery_status: 'accepted', acceptance_date: celDaysAgo(12), description: '蓝图已验收。' },
  ],
});

export const industryLeaveRequests = defineSeed(LeaveRequest, {
  mode: 'upsert',
  externalId: 'reason',
  records: [
    { leave_type: 'annual', start_date: celDaysAgo(64), end_date: celDaysAgo(60), reason: '年假：休假（上月，已审批 · 李娜）', crm_delivery_project: DLV_XH, approval_status: 'approved' },
    { leave_type: 'compensatory', start_date: celDaysAgo(29), end_date: celDaysAgo(29), reason: '调休：天启上线加班调休（已审批 · 陈晨）', crm_delivery_project: DLV_TQ, approval_status: 'approved' },
    { leave_type: 'personal', start_date: celDaysAgo(5), end_date: celDaysAgo(3), reason: '事假：家中事务（已驳回 · 陈晨）', crm_delivery_project: DLV_BC, approval_status: 'rejected', notes: '与一工厂调研冲突，改期。' },
  ],
});

// ─── Catalogue and quotes ───────────────────────────────────────────────────
export const industryProducts = defineSeed(Product, {
  mode: 'upsert',
  externalId: 'name',
  records: [
    { name: '华软 MES 制造执行系统（企业版许可）', description: '离散制造 MES：工单、排程、质量、设备、追溯。', category: 'software', family: 'enterprise', sku: 'HR-MES-ENT', list_price: 1200000, cost: 300000, is_active: true },
    { name: '华软 GMP 质量管理系统（许可）', description: '偏差、变更、CAPA、审计追踪、电子签名。', category: 'software', family: 'enterprise', sku: 'HR-GMP-ENT', list_price: 1500000, cost: 400000, is_active: true },
    { name: '实施服务（人天）', description: '需求、配置、集成与上线支持，按人天计。', category: 'service', family: 'services', sku: 'HR-SVC-DAY', list_price: 8000, cost: 4800, is_active: true },
    { name: '运维服务（年）', description: '5×8 远程支持 + 季度巡检；7×24 值守另计。', category: 'support', family: 'services', sku: 'HR-OPS-YEAR', list_price: 120000, cost: 60000, is_active: true },
    { name: '培训服务（人天）', description: '关键用户与管理员培训。', category: 'service', family: 'services', sku: 'HR-TRN-DAY', list_price: 6000, cost: 3000, is_active: true },
  ],
});

// Quote totals are recomputed by `quote_total_rollup` from the lines below;
// the figures here equal what the rollup produces (subtotal − discount + tax).
export const industryQuotes = defineSeed(Quote, {
  mode: 'upsert',
  externalId: 'name',
  records: [
    { name: '江南医药 GMP 质量管理系统 — 报价', crm_account: JN, crm_contact: 'sun.li@jiangnan-pharma.example.com', crm_opportunity: OPP_JN, status: 'presented', quote_date: celDaysAgo(5), expiration_date: celDaysFromNow(25), subtotal: 2360000, discount: 0, discount_amount: 0, tax: 141600, shipping_handling: 0, total_price: 2501600, payment_terms: 'net_30', description: '软件许可 + 100 人天实施 + 10 人天培训；含税 6%。' },
    { name: '恒达建设项目管理平台 — 预算报价', crm_account: HD, crm_contact: 'zheng.hao@hengda-construction.example.com', crm_opportunity: OPP_HD, status: 'draft', quote_date: celDaysAgo(2), expiration_date: celDaysFromNow(28), subtotal: 1200000, discount: 5, discount_amount: 60000, tax: 68400, shipping_handling: 0, total_price: 1208400, payment_terms: 'net_60', description: '两个试点项目部：150 人天实施；预算报价，供客户立项参考。' },
  ],
});

export const industryQuoteLineItems = defineSeed(QuoteLineItem, {
  mode: 'upsert',
  externalId: ['crm_quote', 'crm_product'],
  records: [
    { crm_quote: '江南医药 GMP 质量管理系统 — 报价', crm_product: '华软 GMP 质量管理系统（许可）', description: 'GMP 质量管理系统企业版许可', quantity: 1, list_price: 1500000, unit_price: 1500000, discount: 0, line_number: 1 },
    { crm_quote: '江南医药 GMP 质量管理系统 — 报价', crm_product: '实施服务（人天）', description: '实施服务 100 人天', quantity: 100, list_price: 8000, unit_price: 8000, discount: 0, line_number: 2 },
    { crm_quote: '江南医药 GMP 质量管理系统 — 报价', crm_product: '培训服务（人天）', description: '关键用户培训 10 人天', quantity: 10, list_price: 6000, unit_price: 6000, discount: 0, line_number: 3 },
    { crm_quote: '恒达建设项目管理平台 — 预算报价', crm_product: '实施服务（人天）', description: '项目管理平台实施 150 人天', quantity: 150, list_price: 8000, unit_price: 8000, discount: 0, line_number: 1 },
  ],
});

// ─── Activities ─────────────────────────────────────────────────────────────
export const industryTasks = defineSeed(Task, {
  mode: 'upsert',
  externalId: 'subject',
  records: [
    { subject: '中原银行：回复付款节点与质保期修改意见', description: '法务已审阅，回复客户采购中心。', status: 'in_progress', priority: 'high', priority_rank: 3, due_date: celDaysFromNow(1), related_to_type: 'crm_opportunity', related_to_account: ZY, related_to_opportunity: OPP_ZY },
    { subject: '江南医药：安排质量部门 GMP 系统演示', description: '演示环境准备偏差与 CAPA 流程。', status: 'not_started', priority: 'high', priority_rank: 3, due_date: celDaysFromNow(9), related_to_type: 'crm_opportunity', related_to_account: JN, related_to_opportunity: OPP_JN },
    { subject: '恒达建设：完成两个试点项目部需求调研纪要', description: '重庆两个项目部现场调研，输出需求清单。', status: 'not_started', priority: 'normal', priority_rank: 2, due_date: celDaysFromNow(14), related_to_type: 'crm_opportunity', related_to_account: HD, related_to_opportunity: OPP_HD },
    { subject: '鹏程教育：发送微服务架构案例资料', description: '教育行业两个案例 + 架构白皮书。', status: 'not_started', priority: 'low', priority_rank: 1, due_date: celDaysFromNow(3), related_to_type: 'crm_opportunity', related_to_account: PC, related_to_opportunity: OPP_PC },
    { subject: '天启物流：运维续签方案报价', description: 'TMS 质保期结束后的运维方案（5×8 / 7×24 两档）。', status: 'in_progress', priority: 'normal', priority_rank: 2, due_date: celDaysFromNow(10), related_to_type: 'crm_account', related_to_account: TQ },
    { subject: '南方高速：投标复盘会', description: '价格策略与分包成本估算复盘，输出改进项。', status: 'in_progress', priority: 'normal', priority_rank: 2, due_date: celDaysFromNow(4), related_to_type: 'crm_opportunity', related_to_account: NF, related_to_opportunity: OPP_NF },
  ],
});

export const industryEvents = defineSeed(Event, {
  mode: 'upsert',
  externalId: 'subject',
  records: [
    { subject: '中原银行商务谈判（第二轮）', type: 'meeting', status: 'held', start_datetime: celClock(6, 14, 0), end_datetime: celClock(6, 17, 0), duration_minutes: 180, all_day: false, related_to_type: 'crm_opportunity', related_to_opportunity: OPP_ZY, related_to_account: ZY, outcome_notes: '付款节点达成一致；质保期客户要求 24 个月，我方提出 18 个月。' },
    { subject: '江南医药方案初次汇报', type: 'onsite_visit', status: 'held', start_datetime: celClock(12, 9, 30), end_datetime: celClock(12, 11, 30), duration_minutes: 120, all_day: false, related_to_type: 'crm_opportunity', related_to_opportunity: OPP_JN, related_to_account: JN, outcome_notes: '质量副总裁认可总体方案，要求补充审计追踪细节。' },
    { subject: '恒达建设需求调研启动电话', type: 'call', status: 'held', start_datetime: celClock(10, 15, 0), end_datetime: celClock(10, 15, 40), duration_minutes: 40, all_day: false, related_to_type: 'crm_opportunity', related_to_opportunity: OPP_HD, related_to_account: HD, outcome_notes: '确认两个试点项目部与调研时间。' },
    { subject: '北辰预测性维护 POC 范围会', type: 'meeting', status: 'planned', start_datetime: celClock(-5, 10, 0), end_datetime: celClock(-5, 12, 0), duration_minutes: 120, all_day: false, related_to_type: 'crm_opportunity', related_to_opportunity: OPP_BC2, related_to_account: BC },
    { subject: '华东电力运维月度例会', type: 'meeting', status: 'planned', start_datetime: celClock(-8, 14, 0), end_datetime: celClock(-8, 15, 0), duration_minutes: 60, all_day: false, related_to_type: 'crm_account', related_to_account: HDL },
  ],
});
