// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { ObjectTranslationData } from '@objectstack/spec/system';

/**
 * zh-CN — the cost-plan family (steps 27–32): the versioned 成本计划, its four
 * typed line objects, the 月度分解行 ledger and the 差旅标准 master data, plus
 * the keys the redesign added to existing objects.
 */
const approval = {
  approval_status: { label: '审批状态', options: { draft: '草稿', submitted: '提交审批', pending: '审批中', approved: '已审批', rejected: '已驳回' } },
  approved_date: { label: '审批通过时间' },
};
const lineBase = {
  crm_cost_plan: { label: '成本计划' },
  description: { label: '说明' },
  start_month: { label: '起始月份', help: '分解的第一个月；按当月 1 日记。' },
  end_month: { label: '结束月份', help: '分解的最后一个月；留空表示只落在起始月份。' },
  planned_amount: { label: '计划金额', help: '本行各月度分解行金额之和，不能手填。' },
  notes: { label: '备注' },
};
const redecompose = {
  redecompose_months: { label: '重新分解', confirmText: '清除这条明细行上所有手工调整的月份，按人数、单价、起止月份重新分解？', successMessage: '月度分解已重新生成。' },
};
const EXPENSE_TYPES = { travel: '差旅', meeting: '会议费', training: '培训费', office: '办公费', communication: '通讯费', entertainment: '业务招待费', other: '其他报销' };

export const costplan: Record<string, Partial<ObjectTranslationData>> = {
  crm_travel_standard: {
    label: '差旅标准',
    pluralLabel: '差旅标准',
    description: '城市级别的住宿、餐补、市内交通日标准与往返交通估算：差旅类项目费用的单价来源',
    fields: {
      name: { label: '标准名称' },
      city_tier: { label: '城市级别', options: { tier_1: '一线城市', tier_2: '二线城市', tier_3: '三线及以下', overseas: '海外' } },
      lodging_per_day: { label: '住宿标准 / 天' },
      meal_per_day: { label: '餐补标准 / 天' },
      local_transport_per_day: { label: '市内交通 / 天' },
      fare_per_trip: { label: '往返交通 / 人次' },
      daily_total: { label: '日标准合计' },
      effective_from: { label: '生效日期' },
      effective_to: { label: '失效日期' },
      is_active: { label: '启用' },
      notes: { label: '备注' },
    },
    _sections: { basic: { label: '差旅标准' } },
    _views: { all_travel_standards: { label: '全部差旅标准' } },
  },
  crm_cost_plan: {
    label: '成本计划',
    pluralLabel: '成本计划',
    description: '项目成本计划的一个版本：阶段、版本号、冻结基线，四类明细行与月度分解行的汇总',
    fields: {
      plan_number: { label: '计划编号' },
      name: { label: '计划名称' },
      owner_id: { label: '成本管理员' },
      crm_presales_project: { label: '售前项目', help: 'Bizcase 阶段的计划挂在售前项目上；与交付项目二选一。' },
      crm_delivery_project: { label: '交付项目', help: '交付阶段的计划挂在交付项目上；与售前项目二选一。' },
      phase: { label: '阶段', help: '保存时按所挂项目自动写入。', options: { bizcase: 'Bizcase（售前）', delivery: '交付' } },
      version_no: { label: '版本号', help: '同一项目下顺序递增；留空时保存自动编号。' },
      is_current: { label: '当前版本', help: '项目只读当前版本的金额；置为当前时其余版本自动作废。' },
      source_plan: { label: '克隆来源' },
      crm_budget_adjustment: { label: '触发本版本的预算调整' },
      baseline_total: { label: '冻结基线', help: '导入 Bizcase 预算时写入的考核基线，之后不可更改。' },
      planned_total: { label: '计划总额' },
      labor_total: { label: '人工服务合计' },
      service_total: { label: '第三方服务合计' },
      procurement_total: { label: '软硬件采购合计' },
      expense_total: { label: '项目费用合计' },
      travel_total: { label: '其中差旅' },
      compare_plan: { label: '对比的当前版本', help: '提交审批时正在执行的那个版本；为空表示本次是项目的首个版本，下面的差异即全额新增。' },
      current_baseline_total: { label: '当前版本冻结基线' },
      delta_baseline_total: { label: '冻结基线差异' },
      current_planned_total: { label: '当前版本计划总额' },
      delta_planned_total: { label: '计划总额差异', help: '本次审批的计划总额减去当前执行版本的计划总额；正数为增加，负数为核减。' },
      delta_planned_pct: { label: '计划总额差异率 %', help: '差异 ÷ 当前执行版本的计划总额 × 100。当前版本总额为 0 时读作 0。' },
      current_labor_total: { label: '当前版本人工服务合计' },
      delta_labor_total: { label: '人工服务合计差异' },
      current_service_total: { label: '当前版本第三方服务合计' },
      delta_service_total: { label: '第三方服务合计差异' },
      current_procurement_total: { label: '当前版本软硬件采购合计' },
      delta_procurement_total: { label: '软硬件采购合计差异' },
      current_expense_total: { label: '当前版本项目费用合计' },
      delta_expense_total: { label: '项目费用合计差异' },
      current_travel_total: { label: '当前版本其中差旅' },
      delta_travel_total: { label: '其中差旅差异' },
      approval_status: { label: '审批状态', options: { ...approval.approval_status.options, superseded: '已作废' } },
      approved_date: approval.approved_date,
      notes: { label: '备注' },
    },
    _sections: { basic: { label: '计划信息' }, totals: { label: '计划金额' }, comparison: { label: '与当前版本对比' }, approval: { label: '审批' } },
    _views: { all_cost_plans: { label: '全部成本计划' }, pending_cost_plan_approvals: { label: '待审批的成本计划' } },
    _actions: {
      submit_approval: { confirmText: '确认发起成本计划审批？提交后记录将锁定，直到审批完成。', label: '发起审批', successMessage: '成本计划已发起审批，等待审批人处理。' },
      create_plan_version: { label: '新建计划版本', confirmText: '以当前版本为底稿克隆一个新的草稿版本？新版本审批通过后才成为当前版本。', successMessage: '新计划版本已创建，请在新版本上调整明细行，再提交预算调整审批。' },
    },
    _validations: { one_project_per_plan: { message: '成本计划必须且只能挂在一个项目上：售前项目或交付项目' } },
  },
  crm_labor_cost_line: {
    label: '人工服务成本行',
    pluralLabel: '人工服务成本行',
    description: '人工计划行：岗位级别 × 费率 × 人数 × 每人每月工时，按月分解',
    fields: {
      ...lineBase,
      crm_rate_card: { label: '岗位级别 / 费率卡', help: '费率标准由费率卡带出，按月解析生效费率。' },
      hourly_rate: { label: '费率标准（小时）', help: '起始月份生效的费率卡小时费率，保存时自动带出。' },
      headcount: { label: '人数' },
      hours_per_month: { label: '每人每月工时' },
    },
    _sections: { basic: { label: '人工服务成本行' } },
    _actions: redecompose,
  },
  crm_service_cost_line: {
    label: '第三方服务成本行',
    pluralLabel: '第三方服务成本行',
    description: '第三方服务计划行：计价方式 × 单价 × 人数 × 工期，按月分解',
    fields: {
      ...lineBase,
      vendor: { label: '供应商' },
      pricing_basis: { label: '计价方式', options: { per_month: '人月', per_day: '人天', lump_sum: '包干' } },
      unit_price: { label: '单价', help: '人月 / 人天单价，或包干总价；来源为供应商报价。' },
      headcount: { label: '人数' },
      duration: { label: '工期', help: '人月计价按月数，人天计价按人天数；包干不填。' },
    },
    _sections: { basic: { label: '第三方服务成本行' } },
    _actions: redecompose,
  },
  crm_procurement_cost_line: {
    label: '软硬件采购成本行',
    pluralLabel: '软硬件采购成本行',
    description: '软硬件采购计划行：采购品类 × 数量 × 单价，落在到货月或按期分摊',
    fields: {
      ...lineBase,
      procurement_category: { label: '采购品类', options: { hardware: '硬件', software_license: '软件许可', cloud_service: '云服务', maintenance: '维保' } },
      crm_product: { label: '产品', help: '选了产品则单价从价目带出，否则手填。' },
      quantity: { label: '数量' },
      unit_price: { label: '单价' },
    },
    _sections: { basic: { label: '软硬件采购成本行' } },
    _actions: redecompose,
  },
  crm_expense_cost_line: {
    label: '项目费用成本行',
    pluralLabel: '项目费用成本行',
    description: '项目费用计划行：差旅按差旅标准计算，报销类直接填预算，按月分解',
    fields: {
      ...lineBase,
      expense_type: { label: '费用类型', options: EXPENSE_TYPES },
      crm_travel_standard: { label: '差旅标准' },
      trips: { label: '出差次数' },
      travelers: { label: '每次人数' },
      days: { label: '每次天数' },
      budget_amount: { label: '预算金额', help: '报销类费用直接填预算总额；差旅类按差旅标准计算，不填。' },
    },
    _sections: { basic: { label: '项目费用成本行' } },
    _actions: redecompose,
  },
  crm_cost_plan_month: {
    label: '月度分解行',
    pluralLabel: '月度分解行',
    description: '一条明细行在一个月份的计划金额：所有计划总额、项目汇总与报表都读这张表',
    fields: {
      crm_cost_plan: { label: '成本计划' },
      category: { label: '成本类别', options: { labor: '人工服务', third_party_service: '第三方服务', procurement: '软硬件采购', expense: '项目费用' } },
      crm_labor_cost_line: { label: '人工服务成本行' },
      crm_service_cost_line: { label: '第三方服务成本行' },
      crm_procurement_cost_line: { label: '软硬件采购成本行' },
      crm_expense_cost_line: { label: '项目费用成本行' },
      period_month: { label: '月份', help: '保存时归一到当月 1 日。' },
      description: { label: '说明', help: '明细行说明加年月，保存时自动写入。' },
      expense_type: { label: '费用类型', help: '费用行复制下来，供差旅与报销分开汇总。', options: EXPENSE_TYPES },
      headcount: { label: '人数' },
      quantity: { label: '数量 / 工时' },
      unit_price: { label: '单价 / 费率', help: '该月快照；人工行按月解析生效费率。' },
      amount: { label: '金额' },
      is_manual: { label: '手工调整', help: '标记后重新分解不覆盖这一行。' },
      allocation_key: { label: '分解键', help: '类别、明细行与年月，一行一个月。' },
    },
    _sections: { basic: { label: '月度分解行' } },
  },
  crm_rate_card: {
    fields: {
      rate_standard: { label: '费率标准', help: '同一岗位级别可按标准分行；人工成本行按级别与标准解析该月生效的费率。', options: { standard: '标准', discount: '优惠', outsourced: '外包' } },
    },
  },
  crm_budget_adjustment: {
    fields: {
      crm_cost_plan: { label: '调整后的计划版本', help: '在成本计划上「新建计划版本」得到的草稿版本；审批通过后成为当前版本，调整金额 = 新旧版本总额之差。' },
      amount: { label: '调整金额', help: '追加为正数，核减为负数；挂了计划版本时由系统按版本总额之差写入' },
    },
  },
  crm_delivery_project: {
    fields: {
      budget_baseline: { label: '预算基线', help: '审批通过的 Bizcase 总成本，即考核基线；新建时留空则默认取售前项目总成本，「导入 Bizcase 预算」连同成本计划 v1 一起写入。' },
      planned_total: { label: '计划总额', help: '当前成本计划版本的总额；草稿版本审批通过前不改变这里。' },
    },
    _actions: {
      import_bizcase_budget: { label: '导入 Bizcase 预算', confirmText: '以售前项目已审批的 Bizcase 成本计划作为考核基线，生成交付成本计划 v1？导入后基线不可更改。', successMessage: 'Bizcase 预算已导入：基线已冻结，成本计划 v1 已生成。' },
    },
  },
  crm_presales_project: {
    fields: {
      labor_cost: { label: '人工服务成本', help: '当前 Bizcase 成本计划的人工服务合计，不能手填。' },
      third_party_service_cost: { label: '第三方服务成本', help: '当前 Bizcase 成本计划的第三方服务合计，不能手填。' },
      procurement_cost: { label: '软硬件采购成本', help: '当前 Bizcase 成本计划的软硬件采购合计，不能手填。' },
      project_expense: { label: '项目费用', help: '当前 Bizcase 成本计划的项目费用合计，不能手填。' },
    },
  },
};
