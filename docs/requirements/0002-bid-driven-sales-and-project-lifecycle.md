# REQ-0002: Bid-driven sales process and project lifecycle (40-step customer process spec)

- **Status**: Triaged
- **Source**: Enterprise IT-services customer (systems integrator, bid/tender-driven B2B) — spreadsheet `CRM____.xlsx`, Sheet1, 40 rows
- **Raised**: 2026-09-14
- **Disposition**: **Mixed — triaged per step, see the table below.** The single largest finding is a **scope boundary the customer's own spec draws**: steps 15–40 are **D (out of scope for HotCRM)** — the spec's `系统路径` column places them on a separate `项管平台` (PSA) system, which the customer has since confirmed **does not exist yet** (see *Answers received*). Steps 1–14 are the CRM scope and triage to A / B / C individually.
- **Traceability**: this record only. Build-level records are to be cut per area once the customer confirms the open questions below; nothing is implemented yet.

## Raw requirement (verbatim)

> Customer's original spreadsheet, transcribed without interpretation. Column
> names and cell text are the customer's own. Where a cell's note spilled onto a
> continuation row in the source, the two are joined with `<br>` and nothing else
> is changed.

| 业务环节（场景） | 步骤序号 | 业务步骤 | 操作岗位 | 操作人 | 责任人 | 系统路径 | 备注说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 客户管理 | 1 | 新增客户基本信息录入 | 销售岗 | 销售人员 | 销售负责人 | CRM→客户管理→新增客户 | 1. 需填写客户名称、简称、社会信用代码、客户分类、组织层级、注册信息、行业、地址、企业规模等基础信息；<br>2. 客户分类：常规销售客户、招标代理公司、其他；招标代理及其他类客户仅可用于付款回款，无法发起商机、投标、销售合同。 |
| 客户管理 | 2 | 客户联系人信息维护 | 销售岗 | 销售人员 | 销售负责人 | CRM→客户管理→客户详情→联系人维护 | 维护联系人姓名、性别、部门、职务、角色、对我司态度、与销售关系强度、联系方式等信息。 |
| 客户管理 | 3 | 客户业务信息完善 | 销售岗 | 销售人员 | 销售负责人 | CRM→客户管理→客户详情→业务信息维护 | 填写当前主要服务商、本年度 IT 采购预算、付款周期、美国 EAR 管制清单、战略合作伙伴标识等信息。 |
| 客户管理 | 4 | 客户附件上传 | 销售岗 | 销售人员 | 销售负责人 | CRM→客户管理→客户详情→附件上传 | 上传客户资质文件、合作背景资料等相关附件。 |
| 客户管理 | 5 | 客户信息审批 | 审批岗 | 销售负责人 | 销售总监 | CRM→审批中心→待审批客户 | 客户信息提交后进入审批流，审批通过后客户正式生效，可关联商机、项目。 |
| 线索管理 | 6 | 线索信息录入 | 销售 / 市场岗 | 线索跟进人 | 销售负责人 | CRM→线索管理→新增线索 | 填写线索名称、线索来源、需求类型、销售负责人、客户信息、联系人信息、客户意向说明、预计金额等。 |
| 线索管理 | 7 | 线索审批 | 审批岗 | 销售负责人 | 销售总监 | CRM→审批中心→待审批线索 | 线索对应审批流程，审批通过后方可转化为正式商机。 |
| 商机立项 | 8 | 商机跟单信息填写 | 销售岗 | 销售人员 | 销售负责人 | CRM→商机管理→新增商机→跟单信息 | 填写是否投标、可控性、赢单概率、优先级、客户立项时间、预计招标 / 签约时间及金额、商机级别、分包信息等。 |
| 商机立项 | 9 | 商机主体信息关联 | 销售岗 | 销售人员 | 销售负责人 | CRM→商机管理→商机详情→主体信息 | 关联对应客户，选择软通签约主体、业务分类、项目名称、收入确认类型等。 |
| 商机立项 | 10 | 商机背景与附件补充 | 销售岗 | 销售人员 | 销售负责人 | CRM→商机管理→商机详情→其他信息 | 填写客户简介、项目背景、风险分析、付款条款、下包说明等，上传项目相关附件。 |
| 商机立项 | 11 | 商机立项审批 | 审批岗 | 销售负责人 / 事业部审批岗 | 事业部负责人 | CRM→审批中心→待立项商机 | 销售立项需走审批流程；新增商机可跟进，立项通过后方可更新阶段、投标、赢丢单操作。 |
| 商机跟进 | 12 | 商机日常跟进维护 | 销售岗 | 销售人员 | 销售负责人 | CRM→商机管理→已立项商机→跟进记录 | 更新商机阶段、跟进情况，动态维护赢单概率、预计金额、关键节点等信息。 |
| 商机跟进 | 13 | 商机状态变更（赢单 / 弃单 / 铁三角调整） | 销售岗 | 销售人员 | 销售负责人 | CRM→商机管理→商机详情→状态变更 | 发起赢单、弃单、调整铁三角等状态变更操作，填写变更原因与说明。 |
| 商机跟进 | 14 | 商机状态变更审批 | 审批岗 | 销售负责人 | 事业部负责人 | CRM→审批中心→待审批状态变更 | 重要状态变更需审批，通过后商机状态正式生效。 |
| 售前项目立项 | 15 | 关联 CRM 商机数据 | 售前 / 销售岗 | 售前负责人 | 事业部负责人 | 项管平台→售前立项→选择 CRM 商机编码 | 售前立项必须引用客户关系系统中已审批通过的商机数据。 |
| 售前项目立项 | 16 | 项目基本信息填报 | 售前 / 销售岗 | 售前负责人 | 事业部负责人 | 项管平台→售前立项→新增售前项目 | 填写项目名称、别名、项目类型、业务分类、计划起止日期、预计合同信息等。 |
| 售前项目立项 | 17 | 项目角色配置 | 售前 / 销售岗 | 售前负责人 | 事业部负责人 | 项管平台→售前立项→项目角色设置 | 配置客户经理、项目经理、项目总监、项目 QA、资源报价负责人等角色及对应人员。 |
| 售前项目立项 | 18 | 项目成本与报价测算 | 售前 / 报价岗 | 资源报价负责人 | 事业部负责人 | 项管平台→售前立项→成本测算 | 测算人工服务成本、第三方服务成本、第三方软硬件采购成本、项目费用，生成项目报价与毛利率。 |
| 售前项目立项 | 19 | 信息安全类别设置 | 售前 / 安全岗 | 安全责任人 | 信息安全负责人 | 项管平台→售前立项→信息安全设置 | 选择信息安全类别，填写安全备注说明。 |
| 售前项目立项 | 20 | 售前立项逐级审批 | 审批岗 | 成本中心负责人→事业部负责人→Bizcase 审核岗→事业本部负责人→事业群运营负责人 | 事业群运营负责人 | 项管平台→审批中心→待审批售前立项 | 审批流程：自定义流程审批。 |
| 交付项目立项 | 21 | 关联售前立项结果 | 交付岗 | 项目经理 | 交付负责人 | 项管平台→交付立项→选择售前项目 | 交付项目立项必须选择已审批通过的售前立项作为依据。 |
| 交付项目立项 | 22 | 项目基础信息完善 | 交付岗 | 项目经理 | 交付负责人 | 项管平台→交付立项→完善项目信息 | 完善项目名称、别名、项目类型、业务分类、计划起止日期等信息。 |
| 交付项目立项 | 23 | 成本中心与核算主体配置 | 交付 / 财务岗 | 项目经理 | 财务负责人 | 项管平台→交付立项→成本中心设置 | 选择实施成本中心、核算成本中心、对应部门。 |
| 交付项目立项 | 24 | 项目角色与组织配置 | 交付岗 | 项目经理 | 交付负责人 | 项管平台→交付立项→项目角色设置 | 配置项目经理、项目总监、资源报价负责人、分包 TS 填写人、各级 QA 等角色。 |
| 交付项目立项 | 25 | 信息安全设置与附件上传 | 交付 / 安全岗 | 项目经理 | 信息安全负责人 | 项管平台→交付立项→信息安全 + 附件管理 | 设置信息安全类别，上传开工确认单等项目附件。 |
| 交付项目立项 | 26 | 交付立项审批 | 审批岗 | 各级审批岗 | 事业部负责人 | 项管平台→审批中心→待审批交付立项 | 立项提交后进入审批流程，审批通过后项目正式启动。 |
| 成本计划管理 | 27 | 预算基线导入 | 成本 / 项目岗 | 成本管理员 | 财务负责人 | 项管平台→成本计划→导入 Bizcase 预算 | 以审批通过的 Bizcase 总成本作为考核基线，形成初始项目成本计划。 |
| 成本计划管理 | 28 | 人工服务成本计划编制 | 成本 / 项目岗 | 成本管理员 | 财务负责人 | 项管平台→成本计划→人工服务成本配置 | 按岗位级别、费率标准、工时、人数测算人工成本，分解至各月度。 |
| 成本计划管理 | 29 | 第三方服务成本计划编制 | 成本 / 项目岗 | 成本管理员 | 财务负责人 | 项管平台→成本计划→第三方服务成本配置 | 按服务名称、单价、人数、工期测算第三方服务成本，分解至各月度。 |
| 成本计划管理 | 30 | 第三方软硬件采购成本计划编制 | 成本 / 项目岗 | 成本管理员 | 财务负责人 | 项管平台→成本计划→第三方软硬件成本配置 | 按采购品类、数量、单价测算软硬件采购成本。 |
| 成本计划管理 | 31 | 项目费用（差旅等）计划编制 | 成本 / 项目岗 | 成本管理员 | 财务负责人 | 项管平台→成本计划→项目费用配置 | 编制差旅、报销类项目费用预算。 |
| 成本计划管理 | 32 | 成本计划调整与审批 | 成本 / 项目岗 | 成本管理员 | 财务负责人 | 项管平台→成本计划→预算调整→提交审批 | 预算不足时申请追加，填写调整原因、差异分析，走审批流程。 |
| 成本执行管理 | 33 | 月度工时填报（TS 填写） | 全体项目人员 | 项目参与人员 | 项目经理 | 项管平台→工时填写→TS 月度填写→选择对应项目 | 1. 销售填写售前项目 TS，交付填写交付项目 TS；<br>2. 按实际出勤填报工时，请假、加班申请同步后自动更新。 |
| 成本执行管理 | 34 | 工时审批 | 审批岗 | 项目经理 | 部门负责人 | 项管平台→工时审批→待审批工时 | 工时提交后由项目经理审批，通过后计入项目实际成本。 |
| 成本执行管理 | 35 | 差旅成本填报 | 项目人员 | 项目参与人员 | 项目经理 | 项管平台→成本执行→差旅报销→关联项目 | 差旅成本按项目归集，与人力成本对应，凭报销单据录入系统。 |
| 成本执行管理 | 36 | 成本超支预警与管控 | 成本 / 管理岗 | 成本管理员 | 财务负责人 | 项管平台→成本执行→成本监控 | 系统实时累计项目成本，成本超预算时限制工时填报，触发成本风险预警。 |
| 项目报表管理 | 37 | 项目综合信息查询 | 项目 / 管理岗 | 项目相关人员 | 项目经理 | 项管平台→项目报表→项目综合查询 | 可查询项目基本信息、预算、成本、进度、收入、开票、收款等全维度数据。 |
| 项目报表管理 | 38 | 项目财务数据查询 | 财务 / 项目岗 | 财务人员 / 项目经理 | 财务负责人 | 项管平台→项目报表→财务数据查询 | 查询项目合同额、总成本、毛利率、开票金额、收款金额等财务指标。 |
| 项目报表管理 | 39 | 项目成本跟踪监控 | 成本 / 管理岗 | 成本管理员 | 财务负责人 | 项管平台→项目报表→成本跟踪查询 | 监控预算执行率、成本消耗进度，对比基线与实际成本差异。 |
| 项目报表管理 | 40 | 项目合同与订单查询 | 商务 / 项目岗 | 商务人员 | 商务负责人 | 项管平台→项目报表→合同订单查询 | 查询销售合同、采购合同、订单执行情况。 |

## Answers received

Answers to the open questions at the foot of this record, logged as they arrive.
These are customer input, not analysis; the triage is re-read against each one.

### 2026-09-14 — Q1: `项管平台` does not exist yet

> 项管平台不是已有系统。

This rules out future (a) below. Steps 16–40 stay **D for this repo** — what
changes is the reason. It is no longer "pending an answer"; it is now "belongs
to an application that does not exist yet, whose chartering is a maintainer
decision". See **Why the D bucket is a scope question** for what that settles
and what it does not.

## Standard product analysis

### Finding 1 — the spec covers two systems, and says so in its own `系统路径` column

| Steps | `系统路径` prefix | Business areas | System |
| --- | --- | --- | --- |
| 1–14 | `CRM→…` | 客户管理 · 线索管理 · 商机立项 · 商机跟进 | **HotCRM** |
| 15–40 | `项管平台→…` | 售前项目立项 · 交付项目立项 · 成本计划管理 · 成本执行管理 · 项目报表管理 | **A separate PSA/PPM system** |

26 of 40 steps (65%) are not CRM steps. HotCRM authors none of the metadata they
need: there is no project, project-role, cost-plan, cost-centre, timesheet,
invoice or collection object anywhere in `src/objects/` — open
`src/objects/index.ts` for the roster this app actually authors. Building that
domain into this app would also cut against AGENTS.md's scope chapter, which
keeps HotCRM a CRM metadata application.

### Finding 2 — steps 15–40 owe HotCRM exactly one thing, and it is currently missing

Step 15's note: *「售前立项必须引用客户关系系统中已审批通过的商机数据」*, path
`项管平台→售前立项→选择 CRM 商机编码`. That is the one integration point, and it
needs a stable, human-quotable opportunity code.

**`crm_opportunity` has no code field.** The headline objects carry a
`Field.autonumber` — `crm_account` `ACC-{000000}`, `crm_quote` `QTE-{0000}`,
`crm_contract` `CTR-{0000}` — and `crm_opportunity` is the one that does not
(grep `Field.autonumber` across `src/objects/*.object.ts` for the live set). Its
`nameField` is the free-text `name`, so today there is nothing for the PSA system
to select by. Read access itself is not a gap — ObjectQL/REST over
`crm_opportunity` is native platform capability.

### Finding 3 — what steps 1–14 already have

Already present and directly reusable:

- **Attachments (steps 4, 10)** — both objects the customer names, `crm_account`
  and `crm_opportunity`, already declare `enable.files: true`, and several of
  their neighbours do too (grep `files: true` for the live set). That flag is the
  doubly-enforced switch (`plugin-audit`'s `enforceFilesCapability` server-side,
  `RecordDetailView`'s Attachments panel client-side), so no metadata is owed.
  `crm_lead` deliberately omits it — see the canonical note in
  `src/objects/index.ts`.
- **The approval centre (steps 5, 7, 11, 14)** — `src/apps/crm.app.ts` already
  registers the platform approval inbox as a `component` nav item
  (`componentRef: 'approvals:inbox'`, guarded by `requiresObject:
  'sys_approval_request'`), and it ships My Pending / Submitted by me / All tabs
  plus a status filter. The customer's four named queues (待审批客户 / 待审批线索 /
  待立项商机 / 待审批状态变更) are filtered views of that one inbox.
- **Approval mechanics** — `src/flows/opportunity-approval.flow.ts` is a working
  reference for `type: 'approval'` nodes (ADR-0019), including the two lessons it
  paid for: `runAs: 'system'` (a user-less writer otherwise bypasses a
  user-scoped gate outright) and `onEmptyApprovers: 'admin_rescue'`.
- **Opportunity lifecycle (steps 12, 13)** — `stage` carries `trackHistory: true`,
  so the platform renders each change on the activity timeline with no hook code
  (ADR-0052 §5b.1); a `state_machine` validation already constrains transitions;
  `win_reason` / `loss_reason` / `loss_details` already exist for 赢单/弃单.
- **Follow-up records (step 12)** — `crm_task` + `crm_event` (+ platform feeds,
  `enable.feeds` defaulting true) plus the Activity nav group and the sales
  activity dashboard.

### Finding 4 — the real gaps in steps 1–14

Three are structural, not field lists:

1. **The account-classification gate (step 1).** *「招标代理及其他类客户仅可用于付款回款，
   无法发起商机、投标、销售合同」* is a **transition gate** across objects — creating a
   `crm_opportunity` / `crm_contract` must be refused when the *related account's*
   classification is not 常规销售客户. A CEL `validations[]` predicate only reads the
   record under write, so it cannot dereference the parent account; the sanctioned
   form is a `*.hook.ts` reading through `ctx.api`. Note also that 付款回款
   (payment / collection) is a finance domain HotCRM does not model at all — no
   invoice and no collection object exists.
2. **铁三角 (step 13).** `crm_opportunity` has exactly one `owner_id`, and
   opportunity sharing is **criteria-based by position**
   (`src/sharing/opportunity.sharing.ts` grants `sales_director` / `executive`),
   not per-record team membership. There is no opportunity-team junction object.
   Whether a junction row can grant record-level access is a **platform**
   question; if it cannot, AGENTS.md scope rule 2 applies — file upstream and
   wait, ⛔ do not hand-roll a predicate here.
3. **The lead model mismatch (step 6).** `crm_lead` is *person-shaped*
   (`salutation` / `first_name` / `last_name` / `company`, `nameField:
   'full_name'`). The customer's 线索 is *demand-shaped*: a named requirement with
   a 需求类型 and a 预计金额. Adding a subject field is small; changing what a lead
   is *called* is a `nameField` decision affecting the lookup picker, global
   search and every list — not a field add.

Everything else in steps 1–14 is additive fields on existing objects, plus
approval flows built on mechanics that already exist.

## Disposition & rationale

Per-step triage. **A** = already supported (config + docs only) · **B** = standard
enhancement into core `src/` · **C** = customer overlay package, never core ·
**D** = out of scope.

| Step | Business step | Disposition | Rationale |
| --- | --- | --- | --- |
| 1 | 新增客户基本信息录入 | **B + C** | `简称`, a generic `registration_number` and 付款周期 are generic account attributes → B. The 客户分类 taxonomy (常规销售客户 / 招标代理公司 / 其他) is **C**: `crm_account.type` already exists on a different axis (prospect/customer/partner/former — lifecycle), and this axis is "what may be transacted", specific to a bid-driven go-to-market. 注册信息 (注册资本 / 成立日期 / 法人代表) → C. The 18-char USCC checksum, if wanted, → C. |
| 1 (gate) | 招标代理客户不可发起商机/投标/合同 | **C** | Enforced by a cross-object `*.hook.ts` on `crm_opportunity` / `crm_contract` insert. A **transition gate**, not an invariant (semantics rule 7) — pre-existing rows must pass. |
| 2 | 客户联系人信息维护 | **B + C** | `gender` (⚠️ `salutation` is not gender) and a buying-role picklist are standard B2B CRM primitives → B. 对我司态度 / 与销售关系强度 encode a relationship-selling model → C, with a re-triage trigger if other customers ask. |
| 3 | 客户业务信息完善 | **B + C** | 当前主要服务商 (incumbent vendor), account-level 付款周期 and a 战略合作伙伴 boolean are generic → B. 本年度 IT 采购预算 is IT-services-specific → C. **美国 EAR 管制清单 → C**, and under semantics rule 8 a machine screening hit may only **warn** (`suspected`); only a value a person wrote down (`confirmed`) may block a write, and ⛔ no override escape hatch is built. |
| 4 | 客户附件上传 | **A** | `crm_account` already declares `enable.files: true`. Zero metadata; document the admin/user steps. |
| 5 | 客户信息审批 | **B** | Approving master data before it can be transacted against is broadly valuable, and every mechanism exists. Adds `approval_status` to `crm_account` + `src/flows/account-approval.flow.ts`. The "生效后方可关联商机、项目" unlock is the same cross-object hook as the step-1 gate — build once. |
| 6 | 线索信息录入 | **B + C** | A lead subject and a 预计金额 are generic → B (see Finding 4.3 on `nameField`). 需求类型 → C. If lead attachments are wanted, that is the "revisit on demand" the `src/objects/index.ts` note names → B (flip `enable.files`). |
| 7 | 线索审批 | **B/C** | Same mechanics as step 5. ⚠️ The "审批通过方可转化" gate must be enforced in the hook, not only in the `convert_lead` action's `visible` predicate — **hiding a button is not a control**. |
| 8 | 商机跟单信息填写 | **B + C** | `优先级` and `商机级别` are generic → B (`forecast_category` is a different axis). 是否投标 / 可控性 / 客户立项时间 / 预计招标时间 / 分包信息 are a bid/tender model HotCRM does not have → C. |
| 9 | 商机主体信息关联 | **C** | 业务分类 and 收入确认类型 → C. **签约主体 needs care**: it is a *business* legal-entity lookup, ⛔ **not** the tenant dimension — semantics rule 10 forbids declaring `organization_id` or adding a tenant dimension object by object. Model it as a `crm_legal_entity` lookup in the overlay, never by re-using the injected org column. |
| 10 | 商机背景与附件补充 | **A + B + C** | Attachments → **A** (`crm_opportunity` already has `enable.files: true`). 付款条款 aligned with `crm_quote` / `crm_contract` `payment_terms` → B. 客户简介 / 项目背景 / 风险分析 / 下包说明 → C (a markdown field group). |
| 11 | 商机立项审批 | **C** | `approval_status` and the approval-node pattern exist, but the **semantics differ**: core today is an *amount-tiered* gate (≥ $100K manager, > $500K director); the customer wants a *blanket* 立项 gate on every opportunity that then unlocks 阶段更新 / 投标 / 赢丢单. Replacing the tiers in core would change behaviour for every other install. The unlock is `readonlyWhen` (rule 7); ⛔ never elevate a whole flow to make `readonly` take effect (rule 9). |
| 12 | 商机日常跟进维护 | **A** | `stage` + `probability` + `amount` updates with `trackHistory` timeline rendering, plus `crm_task` / `crm_event` / feeds. **Open question**: does the customer need a dedicated 跟进记录 object carrying a stage snapshot? If yes → B/C. |
| 13 | 商机状态变更（赢单/弃单/铁三角调整） | **B + C + platform** | 赢单/弃单 are **A** (already modelled). A generic **opportunity team** junction is a standard CRM primitive (Salesforce `OpportunityTeamMember`) → B; the 铁三角 role taxonomy itself → C. ⚠️ Record-level sharing from a junction row is a **platform capability question** (Finding 4.2) — if unsupported, file upstream and wait (scope rule 2). |
| 14 | 商机状态变更审批 | **B/C** | Same approval mechanics; the trigger predicate is the customer's policy. |
| 15 | 关联 CRM 商机数据 | **B (the integration point)** | The only thing steps 15–40 owe HotCRM: add `opportunity_number: Field.autonumber({ format: 'OPP-{0000}' })` to `crm_opportunity` (Finding 2) and expose it in `searchableFields` / `highlightFields`; add an `approved_opportunities` list view; grant a PSA service account a read permission set. Broadly valuable — every other headline object already has a code. |
| 16–40 | 售前立项 · 交付立项 · 成本计划 · 成本执行 · 项目报表 | **D — out of scope** | The customer's own `系统路径` column puts them on `项管平台`. This is a PSA/PPM domain (project, project role, cost centre, cost plan, TS timesheet, travel cost, budget-overrun control, project & financial reporting) that HotCRM models nowhere. ⛔ Do not build it into this app. |

### Why the D bucket is a scope question, not a refusal

Two futures were on the table. **Q1's answer rules out the first.**

- ~~**(a) `项管平台` already exists as a separate system**~~ → ruled out
  2026-09-14. Had it held, HotCRM's whole obligation would have been step 15's
  integration point.
- **(b) It has to be built** → it is a **separate metadata application**, not
  HotCRM's `src/`. `objectstack.manifest.json` declares exactly one app
  (`manifestId: app.objectstack.hotcrm`), so a PSA domain means a second
  manifest and its own `src/` tree, not a wing of this one. Chartering it is a
  maintainer-level decision under AGENTS.md's scope chapter, ⛔ not a seat's call.

So steps 16–40 stay **D for HotCRM**, and the work does not disappear — it moves.
What it would take is sketched below so that decision is made against a size
rather than a shrug.

#### What the PSA application would have to carry

Read off the customer's own steps, not invented:

| Area | Steps | What it needs |
| --- | --- | --- |
| 售前项目 | 15–20 | A presales-project object keyed to the CRM opportunity code; a project-role junction (客户经理 / 项目经理 / 项目总监 / 项目 QA / 资源报价负责人); a four-part cost estimate (人工服务 · 第三方服务 · 第三方软硬件 · 项目费用) yielding 报价 and 毛利率; an information-security classification; and a **five-tier** approval chain (成本中心负责人 → 事业部负责人 → Bizcase 审核 → 事业本部负责人 → 事业群运营负责人) |
| 交付项目 | 21–26 | A delivery-project object gated on an approved presales project; 实施/核算成本中心 and 对应部门; a wider role set (分包 TS 填写人, 各级 QA); attachments (开工确认单); its own approval |
| 成本计划 | 27–32 | A cost-plan object baselined on the approved Bizcase total, four cost-detail children, **monthly decomposition** of the labour and third-party-service lines, and a budget-adjustment flow carrying 调整原因 / 差异分析 through approval |
| 成本执行 | 33–36 | Monthly timesheets (TS) split presales/delivery, timesheet approval, travel cost booked to the project, running actual-cost accumulation, and a hard cross-object gate: **成本超预算时限制工时填报** |
| 项目报表 | 37–40 | Datasets and dashboards over budget vs actual, 预算执行率, 毛利率, and contract/order execution |

Three of the spec's requirements are **not metadata** and need an owner named
before any of it is built:

- **请假 / 加班同步 (step 33)** — an HR/attendance integration, not an authored object.
- **差旅报销单据 (step 35)** — an expense/reimbursement integration.
- **开票 / 收款 (steps 1, 37, 38)** — invoicing and collections. **Neither HotCRM
  nor the PSA app models them**, yet the spec reads them in project reporting and
  leans on them in the 客户分类 rule (「仅可用于付款回款」). That is a third system
  the spec never names — this is Q3, and Q1's answer makes it sharper, not moot.

In rough size this is a **second application of HotCRM's own magnitude** —
comparable object count, heavier on multi-tier approval and period-based
calculation, lighter on UI. It is not an increment to this repo.

## Product response

### Already supported — configuration and documentation only (A)

Steps 4, 10 (attachments), 12 (follow-up via tasks/events/feeds), and the
approval-centre navigation behind steps 5/7/11/14. Owed: user-facing pages under
`content/docs/` (English first, then `.zh-Hans.mdx` / `.zh-Hant.mdx`), no `src/`
change.

### Standard enhancements into core `src/` (B)

Roughly one new object, ~16 fields across three existing objects, three approval
flows, one cross-object gate hook, plus views:

- `src/objects/opportunity.object.ts` — `opportunity_number` (autonumber),
  `priority`, `level`, `payment_terms`; `searchableFields` / `highlightFields`.
- `src/objects/account.object.ts` — `short_name`, `registration_number`,
  `is_strategic_partner`, `incumbent_vendor`, `payment_terms`, `approval_status`.
- `src/objects/contact.object.ts` — `gender`, `contact_role`.
- `src/objects/lead.object.ts` — subject field, `estimated_amount`,
  `approval_status`; `enable.files` if confirmed.
- New junction object for the generic opportunity team (**pending the platform
  answer in Finding 4.2**), with its sharing rule.
- `src/flows/` — `account-approval.flow.ts`, `lead-approval.flow.ts`, and the
  opportunity status-change approval, all modelled on
  `opportunity-approval.flow.ts` (`runAs: 'system'`, `onEmptyApprovers:
  'admin_rescue'`).
- `src/objects/*.hook.ts` — one cross-object gate serving both the step-1
  classification rule and the step-5 "approved account only" rule.
- `src/views/` — `approved_opportunities` and the approval queues.

### Customer overlay package (C) — ⛔ never committed into HotCRM core

The bid/tender model, the 客户分类 taxonomy, 注册信息, the relationship-selling
fields, EAR screening, 需求类型, 业务分类, 收入确认类型, `crm_legal_entity`, the
blanket 立项 gate, and the 铁三角 role taxonomy. Author them as an ObjectStack
customization overlay with its own `packageId` (framework ADR-0005 / ADR-0048 /
ADR-0010), so core stays generic and upgrade-safe.

### Cross-cutting obligations for anything landing in core

Non-negotiable per AGENTS.md, and they are a real share of the effort:

- `crm_` prefix written out on every new object, everywhere it is referenced.
- i18n in **all four** packs (`src/translations/{en,zh-CN,es-ES,ja-JP}.ts`) —
  label, pluralLabel, every field and option label, view and navigation labels.
- A user-facing `content/docs/` page per new object or feature, English first,
  then `.zh-Hans.mdx` and `.zh-Hant.mdx`; ⛔ zh-Hant coins no Traditional
  translation of a UI noun.
- Every authored CEL predicate **TOTAL** — a `has(record.x)` guard on every read
  (`test/object-validation-predicates.test.ts` enforces it).
- Every new file exported from its `src/{type}/index.ts` barrel — **a file
  missing from its barrel is validated by nothing** and `pnpm validate` stays
  green while ignoring it.
- `pnpm verify` green, and a changeset on every PR.

## Open questions for the customer

1. ~~**Is `项管平台` an existing separate system, or expected to be built?**~~
   **Answered 2026-09-14 — it does not exist yet.** The follow-on decision is a
   maintainer's rather than the customer's: is the PSA domain chartered as a
   separate ObjectStack application, and by whom?
2. **Step 12** — is a dedicated 跟进记录 object needed, or do tasks / events /
   record comments satisfy 跟进记录?
3. **Step 1** — 付款回款 implies invoicing and collections, which HotCRM does not
   model. Which system owns them?
4. **Step 6** — should 线索 be renamed/reshaped to a demand-shaped record, or does
   a subject field on the person-shaped `crm_lead` suffice?
5. **Step 3** — is EAR screening a machine list check (warn only, per semantics
   rule 8) or a human-confirmed determination (may block)?
6. **Step 11** — does the customer want the blanket 立项 gate *instead of*, or *on
   top of*, the existing amount-tiered approval?

## Acceptance

This record is Triaged, not built. It is satisfied when the open questions above
all carry an answer (Q1 does, as of 2026-09-14; five remain) and each accepted
item has been cut into its own build record (`0003-…` onward) carrying its own
disposition, metadata list and acceptance. Nothing enters `src/` on the strength
of this record alone, and nothing in the D bucket enters it at all.
