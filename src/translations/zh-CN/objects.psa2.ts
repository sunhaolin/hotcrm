// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { ObjectTranslationData } from '@objectstack/spec/system';

/**
 * zh-CN — round 2 / 3 of the PSA family (demo, epic #2): the nine finance, trip and leave objects in full, plus the 发起审批 action and help keys merged over the base pack at the locale root.
 */
export const psa2: Record<string, Partial<ObjectTranslationData>> = {
  crm_account: {
    _actions: {
      submit_approval: { confirmText: '确认发起客户审批？提交后记录将锁定，直到审批完成。', label: '发起审批', successMessage: '客户已发起审批，等待审批人处理。' },
    },
  },
  crm_budget_adjustment: {
    label: '预算调整',
    pluralLabel: '预算调整',
    description: '交付项目的预算追加或核减申请：调整金额、原因、差异分析，审批通过后计入当前预算',
    fields: {
      adjustment_number: { label: '调整单号' },
      amount: { help: '追加为正数，核减为负数', label: '调整金额' },
      analysis: { help: '预算不足的原因、与基线的差异及影响', label: '差异分析' },
      approval_status: {
        label: '审批状态',
        options: {
          approved: '已审批',
          draft: '草稿',
          pending: '审批中',
          rejected: '已驳回',
          submitted: '提交审批',
        },
      },
      approved_date: { label: '审批通过时间' },
      crm_delivery_project: { label: '交付项目' },
      notes: { label: '备注' },
      owner_id: { label: '申请人' },
      reason: {
        label: '调整原因',
        options: {
          other: '其他',
          rate_change: '费率变化',
          risk_response: '风险应对',
          schedule_extension: '工期延长',
          scope_change: '范围变更',
        },
      },
    },
    _sections: {
      approval: { label: '审批' },
      basic: { label: '调整申请' },
    },
    _views: {
      all_budget_adjustments: { label: '全部预算调整' },
    },
    _actions: {
      submit_approval: { confirmText: '确认发起预算调整审批？提交后记录将锁定，直到审批完成。', label: '发起审批', successMessage: '预算调整已发起审批，等待审批人处理。' },
    },
  },
  crm_business_trip: {
    label: '出差申请',
    pluralLabel: '出差申请',
    description: '出差申请与审批：目的地、起止日期、事由、预计费用；差旅成本关联到出差单后自动汇总实际费用',
    fields: {
      actual_cost: { label: '实际费用' },
      approval_status: {
        label: '审批状态',
        options: {
          approved: '已审批',
          draft: '草稿',
          pending: '审批中',
          rejected: '已驳回',
          submitted: '提交审批',
        },
      },
      approved_date: { label: '审批通过时间' },
      crm_delivery_project: { label: '交付项目' },
      crm_presales_project: { help: '售前阶段的出差挂在售前项目上', label: '售前项目' },
      days: { help: '按起止日期自动计算（含首尾）', label: '出差天数' },
      destination: { label: '目的地' },
      end_date: { label: '结束日期' },
      estimated_cost: { label: '预计费用' },
      notes: { label: '备注' },
      owner_id: { label: '出差人' },
      purpose: { label: '出差事由' },
      start_date: { label: '开始日期' },
      subject: { label: '出差主题' },
      transport: {
        label: '交通方式',
        options: {
          car: '自驾 / 汽车',
          flight: '飞机',
          other: '其他',
          train: '高铁 / 火车',
        },
      },
      trip_code: { label: '出差单号' },
    },
    _sections: {
      approval: { label: '审批' },
      basic: { label: '出差信息' },
      cost: { label: '费用' },
    },
    _views: {
      all_business_trips: { label: '全部出差申请' },
    },
    _actions: {
      submit_approval: { confirmText: '确认发起出差申请审批？提交后记录将锁定，直到审批完成。', label: '发起审批', successMessage: '出差申请已发起审批，等待审批人处理。' },
    },
  },
  crm_collection: {
    label: '收款',
    pluralLabel: '收款',
    description: '按交付项目和销售合同登记的收款记录，可关联到具体发票',
    fields: {
      description: { label: '说明' },
      amount: { label: '收款金额' },
      bank_reference: { label: '银行流水号' },
      collection_code: { label: '收款编号' },
      crm_account: { label: '客户' },
      crm_contract: { label: '销售合同' },
      crm_delivery_project: { label: '交付项目' },
      crm_invoice: { label: '关联发票' },
      method: {
        label: '收款方式',
        options: {
          bank_draft: '承兑汇票',
          bank_transfer: '银行转账',
          check: '支票',
          other: '其他',
        },
      },
      owner_id: { label: '经办人' },
      received_date: { label: '收款日期' },
    },
    _sections: {
      basic: { label: '收款信息' },
    },
    _views: {
      all_collections: { label: '全部收款' },
    },
  },
  crm_delivery_project: {
    _actions: {
      submit_approval: { confirmText: '确认发起交付项目审批？提交后记录将锁定，直到审批完成。', label: '发起审批', successMessage: '交付项目已发起审批，等待审批人处理。' },
    },
  },
  crm_invoice: {
    label: '开票',
    pluralLabel: '开票',
    description: '按交付项目登记的开票记录：发票信息、金额、状态，收款汇总后得出未收余额',
    fields: {
      description: { label: '说明' },
      amount: { help: '含税金额', label: '开票金额' },
      collected_amount: { label: '已收款金额' },
      crm_account: { label: '客户' },
      crm_contract: { label: '销售合同' },
      crm_delivery_project: { label: '交付项目' },
      due_date: { label: '到期日' },
      invoice_code: { label: '开票编号' },
      invoice_date: { label: '开票日期' },
      invoice_number: { label: '发票号码' },
      invoice_type: {
        label: '发票类型',
        options: { electronic: '电子发票', vat_general: '增值税普通发票', vat_special: '增值税专用发票' },
      },
      outstanding_amount: { label: '未收余额' },
      owner_id: { label: '经办人' },
      status: {
        label: '状态',
        options: {
          draft: '草稿',
          issued: '已开具',
          paid: '已收款',
          sent: '已寄出',
          void: '作废',
        },
      },
      tax_rate: { label: '税率 (%)' },
    },
    _sections: {
      basic: { label: '开票信息' },
      settlement: { label: '收款情况' },
    },
    _views: {
      all_invoices: { label: '全部开票' },
    },
  },
  crm_lead: {
    _actions: {
      submit_approval: { confirmText: '确认发起线索审批？提交后记录将锁定，直到审批完成。', label: '发起审批', successMessage: '线索已发起审批，等待审批人处理。' },
    },
  },
  crm_leave_request: {
    label: '请假申请',
    pluralLabel: '请假申请',
    description: '请假申请与审批；审批通过后自动同步到申请人当月工时表的请假工时',
    fields: {
      approval_status: {
        label: '审批状态',
        options: {
          approved: '已审批',
          draft: '草稿',
          pending: '审批中',
          rejected: '已驳回',
          submitted: '提交审批',
        },
      },
      approved_date: { label: '审批通过时间' },
      crm_delivery_project: { help: '可选：请假期间所在的交付项目', label: '影响项目' },
      days: { help: '按起止日期自动计算，只计周一至周五', label: '工作日天数' },
      end_date: { label: '结束日期' },
      hours: { label: '请假工时' },
      leave_code: { label: '请假单号' },
      leave_type: {
        label: '请假类型',
        options: {
          annual: '年假',
          compensatory: '调休',
          marriage: '婚假',
          maternity: '产假 / 陪产假',
          other: '其他',
          personal: '事假',
          sick: '病假',
        },
      },
      notes: { label: '备注' },
      owner_id: { label: '申请人' },
      reason: { label: '请假事由' },
      start_date: { label: '开始日期' },
    },
    _sections: {
      approval: { label: '审批' },
      basic: { label: '请假信息' },
    },
    _views: {
      all_leave_requests: { label: '全部请假申请' },
    },
    _actions: {
      submit_approval: { confirmText: '确认发起请假申请审批？提交后记录将锁定，直到审批完成。', label: '发起审批', successMessage: '请假申请已发起审批，等待审批人处理。' },
    },
  },
  crm_legal_entity: {
    label: '签约主体',
    pluralLabel: '签约主体',
    description: '我方签约主体（法人公司）主数据，供商机、合同选择',
    fields: {
      address: { label: '注册地址' },
      bank_account: { label: '银行账号' },
      bank_name: { label: '开户银行' },
      is_active: { label: '启用' },
      legal_representative: { label: '法定代表人' },
      name: { label: '主体名称' },
      notes: { label: '备注' },
      registration_number: { label: '统一社会信用代码' },
      short_name: { label: '简称' },
    },
    _sections: {
      bank: { label: '银行信息' },
      basic: { label: '主体信息' },
    },
    _views: {
      all_legal_entities: { label: '全部签约主体' },
    },
  },
  crm_opportunity: {
    _actions: {
      submit_approval: { confirmText: '确认发起商机立项审批？提交后记录将锁定，直到审批完成。', label: '发起立项审批', successMessage: '商机立项已发起审批，等待审批人处理。' },
    },
  },
  crm_presales_project: {
    _actions: {
      submit_approval: { confirmText: '确认发起售前项目审批？提交后记录将锁定，直到审批完成。', label: '发起审批', successMessage: '售前项目已发起审批，等待审批人处理。' },
    },
  },
  crm_purchase_contract: {
    label: '采购合同',
    pluralLabel: '采购合同',
    description: '交付项目下的分包、软件、硬件采购合同及付款进度',
    fields: {
      description: { label: '说明' },
      amount: { label: '合同金额' },
      category: {
        label: '采购类别',
        options: {
          hardware: '硬件采购',
          other: '其他',
          software: '软件采购',
          subcontract: '分包服务',
        },
      },
      contract_code: { label: '采购合同编号' },
      crm_delivery_project: { label: '交付项目' },
      end_date: { label: '结束日期' },
      name: { label: '合同名称' },
      owner_id: { label: '商务负责人' },
      paid_amount: { label: '已付款' },
      signed_date: { label: '签订日期' },
      start_date: { label: '开始日期' },
      status: {
        label: '状态',
        options: {
          active: '执行中',
          completed: '已完成',
          draft: '草稿',
          terminated: '已终止',
        },
      },
      unpaid_amount: { label: '未付款' },
      vendor_name: { label: '供应商' },
    },
    _sections: {
      basic: { label: '合同信息' },
      payment: { label: '付款情况' },
    },
    _views: {
      all_purchase_contracts: { label: '全部采购合同' },
    },
  },
  crm_rate_card: {
    label: '费率卡',
    pluralLabel: '费率卡',
    description: '岗位级别与费率标准：工时表和人工成本计划的单价来源',
    fields: {
      daily_rate: { help: '按 8 小时折算的参考值', label: '日费率' },
      effective_from: { label: '生效日期' },
      effective_to: { label: '失效日期' },
      grade_code: { label: '级别代码' },
      hourly_rate: { label: '小时费率' },
      is_active: { label: '启用' },
      name: { label: '岗位级别' },
      notes: { label: '备注' },
    },
    _sections: {
      basic: { label: '费率卡' },
    },
    _views: {
      all_rate_cards: { label: '全部费率卡' },
    },
  },
  crm_sales_order: {
    label: '销售订单',
    pluralLabel: '销售订单',
    description: '销售合同下的客户订单及交付、验收进度',
    fields: {
      description: { label: '说明' },
      acceptance_date: { label: '验收日期' },
      amount: { label: '订单金额' },
      crm_account: { label: '客户' },
      crm_contract: { label: '销售合同' },
      crm_delivery_project: { label: '交付项目' },
      delivery_status: {
        label: '交付状态',
        options: {
          accepted: '已验收',
          delivered: '已交付',
          in_progress: '交付中',
          pending: '待交付',
        },
      },
      name: { label: '订单名称' },
      order_code: { label: '订单编号' },
      order_date: { label: '下单日期' },
      owner_id: { label: '商务负责人' },
    },
    _sections: {
      basic: { label: '订单信息' },
    },
    _views: {
      all_sales_orders: { label: '全部销售订单' },
    },
  },
  crm_timesheet: {
    _actions: {
      submit_approval: { confirmText: '确认发起工时表审批？提交后记录将锁定，直到审批完成。', label: '发起审批', successMessage: '工时表已发起审批，等待审批人处理。' },
    },
  },
};
