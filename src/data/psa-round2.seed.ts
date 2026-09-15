// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.
/**
 * Round 2 seeds (Chinese-only): master data, the sales contract, budget
 * adjustment, invoices / collections / purchase contract / sales order under
 * 一期交付, business trips behind the travel costs, and two leave requests.
 *
 * Same doctrine as `psa.seed.ts`: a seed cannot name a user, so every
 * `owner_id` (出差人 / 申请人 / 经办人) is stamped afterwards by
 * `scripts/demo-psa-staff.mjs`; approval statuses are seeded directly and the
 * flows fire only on the transition to `submitted`.
 */
import { defineSeed } from '@objectstack/spec/data';
import { RateCard } from '../objects/rate_card.object';
import { LegalEntity } from '../objects/legal_entity.object';
import { Contract } from '../objects/contract.object';
import { BudgetAdjustment } from '../objects/budget_adjustment.object';
import { Invoice } from '../objects/invoice.object';
import { Collection } from '../objects/collection.object';
import { PurchaseContract } from '../objects/purchase_contract.object';
import { SalesOrder } from '../objects/sales_order.object';
import { BusinessTrip } from '../objects/business_trip.object';
import { LeaveRequest } from '../objects/leave_request.object';
import { celDaysAgo, celDaysFromNow } from './_shared';

const CUSTOMER = '华信科技有限公司';
const OPP = '华信科技核心业务系统升级项目';
const PSP = '华信核心系统升级 — 售前';
const DLV_A = '华信核心系统升级 — 一期交付';
const DLV_B = '华信数据中台 — 试点交付';
export const CONTRACT_HX = '华信科技核心业务系统升级项目 — 销售合同（3-4-3 付款）';

export const rateCards = defineSeed(RateCard, {
  mode: 'upsert',
  externalId: 'name',
  records: [
    { name: '架构师', grade_code: 'P7', hourly_rate: 1000, daily_rate: 8000, effective_from: '2026-01-01', is_active: true, notes: '解决方案架构 / 技术总监级' },
    { name: '项目经理', grade_code: 'M2', hourly_rate: 900, daily_rate: 7200, effective_from: '2026-01-01', is_active: true },
    { name: '高级工程师', grade_code: 'P6', hourly_rate: 800, daily_rate: 6400, effective_from: '2026-01-01', is_active: true },
    { name: '数据工程师', grade_code: 'P6', hourly_rate: 800, daily_rate: 6400, effective_from: '2026-01-01', is_active: true },
    { name: '工程师', grade_code: 'P5', hourly_rate: 600, daily_rate: 4800, effective_from: '2026-01-01', is_active: true },
    { name: '初级工程师', grade_code: 'P4', hourly_rate: 400, daily_rate: 3200, effective_from: '2025-01-01', effective_to: '2025-12-31', is_active: false, notes: '2025 年费率，已停用' },
  ],
});

export const legalEntities = defineSeed(LegalEntity, {
  mode: 'upsert',
  externalId: 'name',
  records: [
    { name: '华软信息技术股份有限公司', short_name: '华软股份', registration_number: '91110108MA00HR01XA', legal_representative: '陈建华', address: '北京市海淀区中关村软件园二期 12 号楼', bank_name: '招商银行北京中关村支行', bank_account: '1109 0888 6610 001', is_active: true },
    { name: '华软信息技术（上海）有限公司', short_name: '华软上海', registration_number: '91310115MA1HR02SH', legal_representative: '周敏', address: '上海市浦东新区张江高科技园区博云路 2 号', bank_name: '浦发银行张江支行', bank_account: '9755 0123 4567 8901', is_active: true },
  ],
});

export const psaContracts = defineSeed(Contract, {
  mode: 'upsert',
  externalId: 'description',
  records: [
    {
      description: CONTRACT_HX,
      crm_account: CUSTOMER,
      crm_contact: 'wang.zhiqiang@huaxin-tech.example.com',
      crm_opportunity: OPP,
      status: 'activated',
      contract_type: 'service',
      contract_term_months: 12,
      start_date: celDaysAgo(60),
      end_date: celDaysFromNow(305),
      signed_date: celDaysAgo(62),
      contract_value: 1400000,
      special_terms: '付款条款 3-4-3：签约 30% / 上线 40% / 验收 30%。',
    },
  ],
});

export const budgetAdjustments = defineSeed(BudgetAdjustment, {
  mode: 'upsert',
  externalId: 'analysis',
  records: [
    {
      crm_delivery_project: DLV_A,
      amount: 150000,
      reason: 'scope_change',
      analysis: '客户在需求确认后新增「AI 审批助手」模块：预计增加高级工程师 2 人 × 1.5 个月（约 120,000）与模型服务费（约 30,000）。原基线 1,000,000 未包含该范围，申请追加 150,000。',
      approval_status: 'draft',
      notes: '演示：现场提交审批，通过后「当前预算」变为 1,150,000，预算消耗率随之下降。',
    },
  ],
});

export const invoices = defineSeed(Invoice, {
  mode: 'upsert',
  externalId: 'invoice_number',
  records: [
    {
      crm_delivery_project: DLV_A, crm_contract: CONTRACT_HX, crm_account: CUSTOMER,
      invoice_type: 'vat_special', invoice_number: 'HX20260716001', invoice_date: celDaysAgo(55), amount: 420000, tax_rate: 6,
      due_date: celDaysAgo(25), status: 'paid', description: '签约款 30%（合同额 1,400,000）',
    },
    {
      crm_delivery_project: DLV_A, crm_contract: CONTRACT_HX, crm_account: CUSTOMER,
      invoice_type: 'vat_special', invoice_number: 'HX20260905002', invoice_date: celDaysAgo(5), amount: 560000, tax_rate: 6,
      due_date: celDaysFromNow(25), status: 'issued', description: '上线款 40%（合同额 1,400,000）',
    },
  ],
});

export const collections = defineSeed(Collection, {
  mode: 'upsert',
  externalId: 'bank_reference',
  records: [
    {
      crm_delivery_project: DLV_A, crm_contract: CONTRACT_HX, crm_invoice: 'HX20260716001', crm_account: CUSTOMER,
      received_date: celDaysAgo(40), amount: 420000, method: 'bank_transfer', bank_reference: 'CMB20260731000158', description: '签约款到账，对应发票 HX20260716001',
    },
  ],
});

export const purchaseContracts = defineSeed(PurchaseContract, {
  mode: 'upsert',
  externalId: 'name',
  records: [
    {
      name: '数据迁移分包合同 — 一期', crm_delivery_project: DLV_A, vendor_name: '北京数联科技有限公司', category: 'subcontract',
      amount: 250000, paid_amount: 125000, signed_date: celDaysAgo(50), start_date: celDaysAgo(45), end_date: celDaysFromNow(60), status: 'active',
      description: '历史数据迁移与校验，按里程碑付款：签约 50%，验收 50%。',
    },
    {
      name: '中间件许可采购 — 一期', crm_delivery_project: DLV_A, vendor_name: '东方中间件软件有限公司', category: 'software',
      amount: 50000, paid_amount: 50000, signed_date: celDaysAgo(44), status: 'completed', description: '应用服务器许可 2 套。',
    },
  ],
});

export const salesOrders = defineSeed(SalesOrder, {
  mode: 'upsert',
  externalId: 'name',
  records: [
    {
      name: '华信核心系统升级 — 一期订单', crm_delivery_project: DLV_A, crm_contract: CONTRACT_HX, crm_account: CUSTOMER,
      order_date: celDaysAgo(58), amount: 1400000, delivery_status: 'in_progress', description: '对应销售合同全额；上线后验收。',
    },
  ],
});

export const businessTrips = defineSeed(BusinessTrip, {
  mode: 'upsert',
  externalId: 'subject',
  records: [
    { subject: '华信现场需求调研', crm_delivery_project: DLV_A, destination: '北京 · 华信科技', start_date: celDaysAgo(42), end_date: celDaysAgo(40), transport: 'train', purpose: '核心系统升级需求调研，与信息中心确认三大模块范围。', estimated_cost: 7000, approval_status: 'approved' },
    { subject: '华信上线演练', crm_delivery_project: DLV_A, destination: '北京 · 华信科技', start_date: celDaysAgo(13), end_date: celDaysAgo(12), transport: 'train', purpose: '一期上线演练，3 人 2 天驻场。', estimated_cost: 9000, approval_status: 'approved' },
    { subject: '数据中台试点评审', crm_delivery_project: DLV_B, destination: '上海 · 华信数据中心', start_date: celDaysAgo(21), end_date: celDaysAgo(20), transport: 'flight', purpose: '数据中台试点阶段评审。', estimated_cost: 8000, approval_status: 'approved' },
    { subject: '华信投标答疑现场支持', crm_presales_project: PSP, destination: '北京 · 华信科技', start_date: celDaysFromNow(3), end_date: celDaysFromNow(4), transport: 'train', purpose: '投标答疑会现场技术支持（售前）。', estimated_cost: 4000, approval_status: 'draft', notes: '演示：现场提交审批；未通过前不能登记差旅成本。' },
  ],
});

// The approved leave spans three calendar days ending a week ago, so it always
// contains at least one working day and, except in the first days of a month,
// falls inside the month of this month's draft timesheet.
export const leaveRequests = defineSeed(LeaveRequest, {
  mode: 'upsert',
  externalId: 'reason',
  records: [
    { leave_type: 'annual', start_date: celDaysAgo(9), end_date: celDaysAgo(7), reason: '年假：家中事务（本月，已审批）', crm_delivery_project: DLV_A, approval_status: 'approved' },
    { leave_type: 'sick', start_date: celDaysFromNow(2), end_date: celDaysFromNow(3), reason: '病假：体检复查（演示：现场提交审批）', crm_delivery_project: DLV_A, approval_status: 'draft' },
  ],
});
