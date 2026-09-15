// Customer-facing deck for the 华信 presales demo (Chinese). Builds one .pptx from
// the screenshots under docs/demo/psa-presales.
//   cd docs/demo/psa-presales/deck && npm install pptxgenjs@3 && node build-deck.js
// pptxgenjs is not a repo dependency on purpose — the deck is a document, not the app.
const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const SHOTS = '/home/user/hotcrm/docs/demo/psa-presales';
const OUT = process.argv[2] || '/home/user/hotcrm/docs/demo/psa-presales/客户汇报-华信案例.pptx';
const img = (name) => { const p = path.join(SHOTS, name + '.png'); if (!fs.existsSync(p)) throw new Error('missing screenshot ' + p); return p; };

const C = { navy: '1B2A41', ink: '1F2937', muted: '5B6572', faint: '8A94A3', ice: 'E8EEF6', line: 'D9DFE6', amber: 'C8842E', amberSoft: 'F6EAD8', navySoft: 'E2E8F2', green: '2F7D4F', greenSoft: 'E4F3EA', red: 'B4232C', redSoft: 'FBE9EA', white: 'FFFFFF', frame: 'DDE3EA' };
const F = 'Microsoft YaHei';
const W = 13.333, H = 7.5;

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.author = 'HotCRM 售前团队';
pres.title = '项目型销售与项目管理一体化 — 华信案例演示汇报';
pres.lang = 'zh-CN';

// ── helpers ──────────────────────────────────────────────────────────────────
function light(slide) { slide.background = { color: C.white }; }
function dark(slide) { slide.background = { color: C.navy }; }
function title(slide, text, steps, opts = {}) {
  slide.addText(text, { x: 0.6, y: 0.42, w: steps ? 9.6 : 12.1, h: 0.9, fontFace: F, fontSize: 30, bold: true, color: opts.color || C.ink, isTextBox: true, margin: 0, valign: 'middle' });
  if (steps) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 10.55, y: 0.55, w: 2.2, h: 0.6, fill: { color: C.amberSoft }, line: { color: C.amberSoft }, rectRadius: 0.1 });
    slide.addText(steps, { x: 10.55, y: 0.55, w: 2.2, h: 0.6, fontFace: F, fontSize: 12, bold: true, color: C.amber, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  }
}
function shot(slide, name, x, y, w, caption) {
  const h = w / 1.6;
  slide.addShape(pres.shapes.RECTANGLE, { x: x - 0.05, y: y - 0.05, w: w + 0.1, h: h + 0.1, fill: { color: C.frame }, line: { color: C.frame } });
  slide.addImage({ path: img(name), x, y, w, h, sizing: { type: 'contain', w, h } });
  if (caption) slide.addText(caption, { x, y: y + h + 0.08, w, h: 0.32, fontFace: F, fontSize: 10.5, color: C.muted, isTextBox: true, margin: 0 });
  return h;
}
function bullets(slide, items, x, y, w, h, opts = {}) {
  const runs = items.map((t, i) => {
    const r = typeof t === 'string' ? { text: t } : t;
    return { text: r.text, options: { bullet: r.bullet === false ? false : { indent: 14 }, bold: !!r.bold, color: r.color || C.ink, fontSize: opts.fontSize || 14, fontFace: F, breakLine: i < items.length - 1, paraSpaceAfter: opts.gap || 8 } };
  });
  slide.addText(runs, { x, y, w, h, isTextBox: true, margin: 0, valign: 'top', fontFace: F });
}
function lead(slide, text, x, y, w, h) {
  slide.addText(text, { x, y, w, h, fontFace: F, fontSize: 15, bold: true, color: C.navy, isTextBox: true, margin: 0, valign: 'top' });
}
function chip(slide, text, x, y, w, fill, color, h = 0.42, size = 11) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill }, rectRadius: 0.08 });
  slide.addText(text, { x, y, w, h, fontFace: F, fontSize: size, bold: true, color, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}
function footer(slide, n) {
  slide.addText('HotCRM · 项目型销售与项目管理一体化 · 华信案例演示', { x: 0.6, y: H - 0.45, w: 8, h: 0.3, fontFace: F, fontSize: 9, color: C.faint, isTextBox: true, margin: 0 });
  slide.addText(String(n), { x: W - 1.2, y: H - 0.45, w: 0.6, h: 0.3, fontFace: 'Arial', fontSize: 9, color: C.faint, align: 'right', isTextBox: true, margin: 0 });
}
// Two screenshots side by side, sized so image + caption end above the footer.
function pair(slide, y, a, b) {
  const h = Math.min(3.44, 6.98 - 0.42 - y);
  const w = h * 1.6;
  const gap = 12.1 - 2 * w;
  shot(slide, a[0], 0.6, y, w, a[1]);
  shot(slide, b[0], 0.6 + w + gap, y, w, b[1]);
}
function trio(slide, y, items) {
  const w = 3.85, h = w / 1.6;
  items.forEach((it, i) => shot(slide, it[0], 0.6 + i * (w + 0.275), y, w, it[1]));
  return h;
}
let n = 0;
function slideLight(t, steps) { const s = pres.addSlide(); light(s); n += 1; title(s, t, steps); footer(s, n); return s; }

// ── 1 cover ──────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide(); dark(s); n += 1;
  s.addText('项目型销售与项目管理一体化', { x: 0.8, y: 1.5, w: 11.5, h: 1.2, fontFace: F, fontSize: 44, bold: true, color: C.white, isTextBox: true, margin: 0 });
  s.addText('基于贵司 40 步业务流程的落地演示 · 华信案例', { x: 0.8, y: 2.75, w: 11.5, h: 0.7, fontFace: F, fontSize: 22, color: 'CADCFC', isTextBox: true, margin: 0 });
  s.addText('HotCRM 平台 · 2026 年 9 月', { x: 0.8, y: 3.5, w: 11.5, h: 0.5, fontFace: F, fontSize: 14, color: '9FB3D1', isTextBox: true, margin: 0 });
  const stages = ['客户管理', '线索管理', '商机立项', '商机跟进', '售前立项', '交付立项', '成本计划', '成本执行', '项目报表'];
  stages.forEach((t, i) => chip(s, t, 0.8 + i * 1.32, 5.6, 1.22, i < 4 ? '2E4468' : C.amber, C.white, 0.5, 12));
  s.addText('CRM  ←  贵司需求表步骤 1–14', { x: 0.8, y: 6.2, w: 5.2, h: 0.35, fontFace: F, fontSize: 11, color: '9FB3D1', isTextBox: true, margin: 0 });
  s.addText('项管平台  ←  步骤 15–40', { x: 6.08, y: 6.2, w: 6, h: 0.35, fontFace: F, fontSize: 11, color: 'E8C9A0', isTextBox: true, margin: 0 });
  s.addNotes('开场：贵司给的是一张 40 步、9 个环节的流程表，表里自己就分了两个系统——CRM 和项管平台。今天演示的是这 40 步在同一个平台、同一套数据里跑通的样子。');
}

// ── 2 headline numbers ───────────────────────────────────────────────────────
{
  const s = slideLight('贵司的 40 步流程，在一个平台、一套数据里跑通');
  const tiles = [['40', '需求表步骤', '9 个业务环节'], ['39', '可演示步骤', '仅"商机状态变更审批"待定'], ['14', '业务对象', '5 个 CRM 扩展 + 9 个项目对象'], ['9', '条审批流', '同一个审批中心处理'], ['4', '处系统拦截', '招标代理 · EAR · 超预算 · 出差未批']];
  tiles.forEach((t, i) => {
    const x = 0.6 + i * 2.46;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.6, w: 2.26, h: 2.1, fill: { color: C.ice }, line: { color: C.ice }, rectRadius: 0.12 });
    s.addText(t[0], { x, y: 1.75, w: 2.26, h: 1.0, fontFace: 'Arial', fontSize: 48, bold: true, color: i === 4 ? C.red : C.navy, align: 'center', isTextBox: true, margin: 0 });
    s.addText(t[1], { x, y: 2.75, w: 2.26, h: 0.4, fontFace: F, fontSize: 14, bold: true, color: C.ink, align: 'center', isTextBox: true, margin: 0 });
    s.addText(t[2], { x: x + 0.1, y: 3.12, w: 2.06, h: 0.5, fontFace: F, fontSize: 10.5, color: C.muted, align: 'center', isTextBox: true, margin: 0 });
  });
  lead(s, '怎么做到的', 0.6, 4.2, 6, 0.4);
  bullets(s, [
    '不做两套系统做接口：CRM 与项目管理是同一个平台上的一组对象，商机编码是两侧的唯一锚点',
    '业务规则落在系统里而不是制度里：四处拦截由系统在保存时执行，存量数据不受影响',
    '汇总与公式实时计算：总成本、毛利率、计划总额、实际成本、预算消耗、应收余额都不用人算',
    '一个审批中心：客户、线索、商机立项、售前、交付、工时、预算调整、出差、请假九条流程在同一个收件箱处理；发起审批是记录页上的一个按钮',
    '演示数据是一家软件公司的一年：14 家客户、13 个商机（5 赢 1 丢）、6 份合同、8 个售前项目、7 个交付项目及其成本、工时、开票、收款',
  ], 0.6, 4.65, 12.1, 2.3, { fontSize: 14, gap: 6 });
  s.addNotes('先给结论再看细节：40 步里 39 步今天能点给你看；对象、审批流、拦截的数量说明这是真的系统，不是原型。');
}

// ── 3 the customer's process ─────────────────────────────────────────────────
{
  const s = slideLight('贵司的流程：9 个环节、40 个步骤、两个系统', '来自需求表「系统路径」列');
  const crm = [['客户管理', '1–5', '录入 · 联系人 · 业务信息 · 附件 · 审批'], ['线索管理', '6–7', '录入 · 审批'], ['商机立项', '8–11', '跟单 · 主体 · 背景 · 立项审批'], ['商机跟进', '12–14', '跟进 · 状态变更 · 变更审批']];
  const psa = [['售前立项', '15–20', '关联商机 · 角色 · 成本测算 · 信息安全 · 逐级审批'], ['交付立项', '21–26', '关联售前 · 成本中心 · 角色 · 附件 · 审批'], ['成本计划', '27–32', '基线导入 · 四类成本计划 · 调整审批'], ['成本执行', '33–36', '工时 · 工时审批 · 差旅 · 超支管控'], ['项目报表', '37–40', '综合查询 · 财务 · 成本跟踪 · 合同订单']];
  const draw = (rows, y, fill, tag, tagColor) => {
    s.addText(tag, { x: 0.6, y, w: 1.4, h: 0.5, fontFace: F, fontSize: 13, bold: true, color: tagColor, isTextBox: true, margin: 0, valign: 'middle' });
    rows.forEach((r, i) => {
      const x = 2.1 + i * 2.2;
      s.addShape(pres.shapes.CHEVRON, { x, y, w: 2.12, h: 0.55, fill: { color: fill }, line: { color: fill } });
      s.addText(r[0], { x: x + 0.28, y, w: 1.6, h: 0.55, fontFace: F, fontSize: 12, bold: true, color: C.white, isTextBox: true, margin: 0, valign: 'middle', align: 'center' });
      s.addText('步骤 ' + r[1], { x, y: y + 0.6, w: 2.12, h: 0.3, fontFace: F, fontSize: 10.5, bold: true, color: C.muted, isTextBox: true, margin: 0, align: 'center' });
      s.addText(r[2], { x, y: y + 0.9, w: 2.12, h: 0.75, fontFace: F, fontSize: 9.5, color: C.muted, isTextBox: true, margin: 0, align: 'center', valign: 'top' });
    });
  };
  draw(crm, 1.65, '2E4468', 'CRM', C.navy);
  draw(psa, 3.85, C.amber, '项管平台', C.amber);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 5.9, w: 12.1, h: 1.0, fill: { color: C.ice }, line: { color: C.ice }, rectRadius: 0.1 });
  s.addText([
    { text: '关键发现：', options: { bold: true, color: C.navy } },
    { text: '26 步在项管平台侧，它需要读 CRM 的商机；14 步在 CRM 侧，其中三条规则是跨对象的门禁而不是字段。所以方案不是"两个系统对接"，而是同一个平台上的一组对象。', options: { color: C.ink } },
  ], { x: 0.85, y: 5.95, w: 11.6, h: 0.9, fontFace: F, fontSize: 13, isTextBox: true, margin: 0, valign: 'middle' });
  s.addNotes('这页把贵司的表画成图。两种颜色对应表里"系统路径"的两个前缀。强调：26 步在项管侧，靠商机编码挂回 CRM。');
}

// ── 4 architecture ───────────────────────────────────────────────────────────
{
  const s = slideLight('方案：一个平台，一套数据，三层能力');
  const band = (y, label, items, fill, chipFill, chipColor) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y, w: 12.1, h: 1.45, fill: { color: fill }, line: { color: fill }, rectRadius: 0.1 });
    s.addText(label, { x: 0.85, y: y + 0.12, w: 2.2, h: 1.2, fontFace: F, fontSize: 14, bold: true, color: C.ink, isTextBox: true, margin: 0, valign: 'middle' });
    items.forEach((t, i) => { const per = Math.min(9, items.length); const row = Math.floor(i / per); const col = i % per; chip(s, t, 3.1 + col * 1.05, y + 0.18 + row * 0.56, 0.98, chipFill, chipColor, 0.44, 10); });
  };
  band(1.55, '平台能力\n（现成，零开发）', ['审批中心', '附件', '活动时间线', '汇总字段', '公式字段', '权限集', '仪表板', '导入导出', '记录锁定'], C.ice, C.white, C.navy);
  band(3.2, 'CRM 对象\n（标准 + 扩展）', ['客户', '联系人', '线索', '商机', '销售合同', '签约主体', '任务 / 活动', '报价', '费率卡'], C.navySoft, '2E4468', C.white);
  band(4.85, '项目对象\n（本次新增）', ['售前项目', '交付项目', '成本计划行', '工时表', '差旅成本', '出差申请', '请假申请', '预算调整', '开票', '收款', '采购合同', '销售订单'], C.amberSoft, C.amber, C.white);
  s.addText('商机编码 OPP-xxxx 是 CRM 与项目侧唯一的关联锚点：售前项目必须挂在已立项的商机上，交付项目必须挂在已审批的售前项目上，成本、工时、差旅、开票、收款都挂在交付项目上。', { x: 0.6, y: 6.45, w: 12.1, h: 0.6, fontFace: F, fontSize: 12, color: C.muted, isTextBox: true, margin: 0 });
  s.addNotes('三层：平台自带的能力一分钱不用开发；CRM 对象是标准产品加字段；项目对象是本次为贵司流程新建的。都在同一套元数据里。');
}

// ── 5 coverage table ─────────────────────────────────────────────────────────
{
  const s = slideLight('覆盖总览：每个环节做到了什么', '40 步 · 39 步可演示');
  const hdr = ['环节', '步骤', '系统里的实现', '状态'];
  const rows = [
    ['客户管理', '1–5', '客户分类 / 简称 / 信用代码 / 业务信息（服务商、IT 预算、付款周期、EAR、战略伙伴）；联系人角色与态度；附件；客户审批', '已实现'],
    ['线索管理', '6–7', '预计金额、需求类型；线索审批（通过后再转商机）', '已实现'],
    ['商机立项', '8–11', '商机编码、是否投标、级别、优先级、可控性、立项 / 招标时间、分包；签约主体、业务分类、收入确认；背景说明；立项审批；招标代理与 EAR 拦截', '已实现'],
    ['商机跟进', '12–14', '阶段、任务、活动时间线；铁三角三角色；赢单 / 丢单原因', '状态变更审批待定'],
    ['售前立项', '15–20', '关联商机、项目信息、五个角色、四项成本 → 总成本与毛利率自动算、信息安全、审批', '审批为一级'],
    ['交付立项', '21–26', '关联售前项目、成本中心与部门、五个角色、信息安全与附件、审批；预算基线自动导入', '已实现'],
    ['成本计划', '27–32', '四类成本按月编制、费率卡带出单价、计划总额自动汇总；预算调整对象 + 审批，只有批准的调整计入当前预算', '已实现'],
    ['成本执行', '33–36', '工时 × 费率自动算成本；请假审批后自动同步工时；出差申请与差旅关联；实际成本与预算消耗实时汇总；超预算禁填工时', '已实现'],
    ['项目报表', '37–40', '项目综合查询（进度、预算、成本、收入、开票、收款）；项目成本与项目财务两个仪表板；开票、收款、采购合同、销售订单', '已实现（手工录入）'],
  ];
  const cell = (t, o = {}) => ({ text: t, options: Object.assign({ fontFace: F, fontSize: 10.5, color: C.ink, valign: 'middle', margin: [3, 6, 3, 6] }, o) });
  const data = [hdr.map((h) => cell(h, { bold: true, color: C.white, fill: { color: C.navy }, fontSize: 11 }))].concat(rows.map((r, i) => [
    cell(r[0], { bold: true, fill: { color: i % 2 ? C.white : 'F4F6F9' } }), cell(r[1], { fontFace: 'Arial', fill: { color: i % 2 ? C.white : 'F4F6F9' }, align: 'center' }),
    cell(r[2], { fill: { color: i % 2 ? C.white : 'F4F6F9' } }), cell(r[3], { bold: true, color: r[3].startsWith('已实现') ? C.green : C.amber, fill: { color: i % 2 ? C.white : 'F4F6F9' } }),
  ]));
  s.addTable(data, { x: 0.6, y: 1.5, w: 12.1, colW: [1.3, 0.8, 8.2, 1.8], border: { type: 'solid', pt: 0.5, color: C.line }, rowH: 0.5 });
  s.addNotes('总览表：逐环节说清做到了什么。两处"待定 / 一级"是刻意留给贵司决策的：状态变更是否单独审批、售前审批走几级。');
}

// ── 5b demo data: a software company ─────────────────────────────────────────
{
  const s = slideLight('演示数据：一家软件公司的一年', '以软件企业为目标客户');
  lead(s, '华软信息技术股份有限公司 —— 卖定制开发、实施、运维与咨询', 0.6, 1.45, 12.1, 0.4);
  const tiles = [['14', '客户', '制造 · 金融 · 医药 · 物流 · 能源 · 教育'], ['14', '线索', '新建 → 已联系 → 已确认 → 未通过'], ['13', '商机', '每个阶段都有，5 赢 1 丢'], ['6', '销售合同', '里程碑 · 3-4-3 · 按月结算'], ['8 / 7', '售前 / 交付项目', '启动、进行中、已关闭'], ['32', '工时表', '12 出差 · 5 请假 · 10 发票']];
  tiles.forEach((t, i) => {
    const x = 0.6 + i * 2.05;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.95, w: 1.9, h: 1.55, fill: { color: i % 2 ? C.ice : C.amberSoft }, line: { color: i % 2 ? C.ice : C.amberSoft }, rectRadius: 0.1 });
    s.addText(t[0], { x, y: 2.02, w: 1.9, h: 0.6, fontFace: 'Arial', fontSize: 28, bold: true, color: i % 2 ? C.navy : C.amber, align: 'center', isTextBox: true, margin: 0 });
    s.addText(t[1], { x, y: 2.62, w: 1.9, h: 0.32, fontFace: F, fontSize: 12, bold: true, color: C.ink, align: 'center', isTextBox: true, margin: 0 });
    s.addText(t[2], { x: x + 0.08, y: 2.95, w: 1.74, h: 0.5, fontFace: F, fontSize: 9, color: C.muted, align: 'center', isTextBox: true, margin: 0 });
  });
  pair(s, 3.75, ['R3-01-客户列表', '客户：14 家，行业与类型各不相同'], ['R3-03-商机列表', '进行中商机：谈判、提案、需求分析、资格审查、寻找客户']);
  s.addNotes('数据不是四条样例，而是一家软件公司一年的业务面：所有列表、仪表板、报表都有数。演示时可以随手点开任何一条。');
}
{
  const s = slideLight('数据到了仪表板：销售业绩与项目财务', '步骤 37–39');
  bullets(s, [
    '销售业绩：管道总额、本季度已成交 7,150,000、赢率 83%（5 赢 1 丢）、阶段管道分布、月度收入趋势——标准仪表板，数据一到就有',
    '项目财务：合同额合计 10,650,000、已开票 5,120,000、已收款 4,035,000、采购合同 990,000；七个交付项目的合同额 vs 开票 vs 收款',
    '交付项目列表一眼看出健康度：北辰二期 47%、长江 DMS 17%、天启 TMS 已关闭 87%、华信数据中台 132%（超支）',
  ], 0.6, 1.5, 12.1, 1.3, { fontSize: 12.5, gap: 5 });
  pair(s, 2.95, ['R3-09-销售仪表板', '销售业绩仪表板'], ['R3-06-交付项目列表', '交付项目：预算基线、实际成本、预算消耗']);
  s.addNotes('两张图都是平台原生数据集 + 组件；数据一多，仪表板自然就成型。');
}

// ── 6 客户管理 ────────────────────────────────────────────────────────────────
{
  const s = slideLight('客户管理：分类、业务信息、附件、审批', '步骤 1–5');
  lead(s, '录入即分类，分类即规则', 0.6, 1.5, 4.6, 0.4);
  bullets(s, [
    '客户编码自动分配；客户分类（常规销售客户 / 招标代理公司 / 其他）、客户简称、统一社会信用代码',
    '业务信息：当前主要服务商、本年度 IT 采购预算、付款周期、美国 EAR 管制清单、战略合作伙伴',
    '联系人：性别、角色（决策者 / 影响者 / 采购…）、对我司态度、与销售关系强度',
    '附件页签直接上传资质与合作背景资料',
    '客户信息提交审批 → 记录锁定 → 通过后正式生效，可关联商机与项目',
  ], 0.6, 1.95, 4.6, 4.6, { fontSize: 12.5, gap: 7 });
  shot(s, 'S01b-客户详情-基本信息', 5.5, 1.5, 7.2, '客户详情：客户分类、简称、统一社会信用代码');
  s.addNotes('打开华信科技：分类、简称、信用代码在基本信息；业务信息分组里有 EAR 四态。招标代理客户后面会被拦下。');
}

// ── 7 线索与商机立项 ──────────────────────────────────────────────────────────
{
  const s = slideLight('线索到商机：需求形线索、跟单信息、立项审批', '步骤 6–11');
  bullets(s, [
    '线索：预计金额、需求类型（软件开发 / 实施 / 运维 / 咨询），审批通过后才转商机',
    '商机编码 OPP-xxxx 自动编号，是项管平台关联的锚点；是否投标、级别、优先级、可控性、客户立项时间、预计招标时间、分包信息',
    '签约主体（独立主数据）、业务分类、收入确认类型；客户简介 / 项目背景 / 风险 / 付款条款写在背景说明里',
    '立项审批独立于标准产品的金额分档审批；立项通过后才允许更新阶段、投标、赢丢单',
  ], 0.6, 1.5, 12.1, 1.6, { fontSize: 12.5, gap: 5 });
  pair(s, 3.2, ['S06c-线索-预计金额与需求类型', '线索：需求类型、预计金额、审批状态'], ['R2-06-商机-招投标与签约主体', '商机：跟单信息与签约主体']);
  s.addNotes('线索是"需求形"的：金额和需求类型是贵司要的。商机上的编码是后面售前立项要选的那个"CRM 商机编码"。');
}

// ── 8 gates ──────────────────────────────────────────────────────────────────
{
  const s = slideLight('系统拦截：招标代理与 EAR 客户不能发起商机', '步骤 1 备注 · 步骤 3');
  bullets(s, [
    '招标代理及其他类客户仅可用于付款回款——新建商机时系统读取客户分类，直接拒绝并说明原因',
    'EAR 管制清单：机器比对命中记为"疑似"，只提示不阻断；人工确认在列后，商机被拦截——机器不拦人，人拍板才拦',
    '两条规则都是跨对象的门禁：读的是客户上的数据，作用在商机上；存量数据不受影响',
  ], 0.6, 1.5, 12.1, 1.3, { fontSize: 12.5, gap: 5 });
  pair(s, 2.95, ['S01d-拦截-招标代理不可发起商机', '拦截 ①：招标代理客户'], ['R2-23-拦截-EAR确认在列不能发起商机', '拦截 ③：EAR 人工确认在列']);
  s.addNotes('现场演示：新建商机选中招国际 → 被拒。再把东方联合银行 EAR 改成人工确认 → 被拒；改回机器疑似 → 放行。');
}

// ── 9 approval center ────────────────────────────────────────────────────────
{
  const s = slideLight('一个审批中心：九条流程，一个收件箱', '步骤 5 · 7 · 11 · 20 · 26 · 32 · 34');
  bullets(s, [
    '发起的手势统一：记录页顶部「发起审批」按钮 → 确认；审批状态字段只读，不能手改；记录随即锁定并显示"审批中"',
    '处理的手势统一：待我审批 → 勾选 → 通过 N 条 → 确认；通过后回写状态与审批时间，并通知负责人',
    '转签、退回修改、退回补充、催办、撤回都在同一个面板；快捷键 x 选择 · a 通过 · r 拒绝',
    '客户 · 线索 · 商机立项 · 售前立项 · 交付立项 · 工时 · 预算调整 · 出差 · 请假，共九条，可按贵司组织层级扩为多级',
  ], 0.6, 1.5, 12.1, 1.55, { fontSize: 12.5, gap: 5 });
  pair(s, 3.2, ['S05-07-11-审批中心-待我审批', '待我审批：七条流程的请求在同一个收件箱'], ['S05-07-11c-勾选后批量通过', '勾选后批量通过']);
  s.addNotes('演示里七条请求一起批。生产形态：售前立项五级链按组织层级路由，同一个机制。');
}

// ── 9b the submit button ─────────────────────────────────────────────────────
{
  const s = slideLight('发起审批是一个按钮，不是一次编辑', '步骤 5 · 7 · 11 · 20 · 26 · 32 · 34');
  bullets(s, [
    '每个可审批对象的记录页都有「发起审批」（商机是「发起立项审批」）；只在草稿或已驳回时出现，点击后确认即提交',
    '审批状态、审批通过时间是只读字段：表单里看得到、改不了，状态只由按钮和审批流写',
    '提交后记录锁定、显示"审批中"，审批人在同一条记录上通过 / 拒绝 / 退回；驳回后按钮重新出现，修改后再发起',
  ], 0.6, 1.5, 12.1, 1.3, { fontSize: 12.5, gap: 5 });
  trio(s, 2.95, [['S05-客户-发起审批', '记录页顶部的「发起审批」'], ['S05-客户-发起审批-确认', '确认后提交'], ['S05-客户提交审批-审批中', '审批中已锁定']]);
  s.addText('编辑表单里的审批状态是灰色只读——想改状态，只有这个按钮一条路。', { x: 0.6, y: 5.9, w: 12.1, h: 0.5, fontFace: F, fontSize: 12.5, color: C.muted, isTextBox: true, margin: 0 });
  s.addNotes('贵司反馈"审批的发起应该是一个按钮"——已改：按钮 + 只读状态。九个对象同一个机制。');
}

// ── 10 跟进与铁三角 ───────────────────────────────────────────────────────────
{
  const s = slideLight('商机跟进：阶段、任务、活动时间线与铁三角', '步骤 12–13');
  lead(s, '跟进不靠记忆', 0.6, 1.5, 4.6, 0.4);
  bullets(s, [
    '阶段条直接推进阶段，赢单概率、预计金额随时改；每次变更自动写入活动时间线',
    '待办任务与活动（现场调研、方案汇报、投标答疑）挂在商机上，右侧任务卡常驻',
    '铁三角：客户经理（AR）、解决方案经理（SR）、交付经理（FR）三个角色就地调整',
    '赢单 / 丢单必须填原因：赢单原因、丢单原因、赢丢单详情',
    '生产形态：铁三角做成商机团队对象 + 记录级共享，团队成员自动获得可见性',
  ], 0.6, 1.95, 4.6, 4.6, { fontSize: 12.5, gap: 7 });
  shot(s, 'S13-铁三角', 5.5, 1.5, 7.2, '商机详情：铁三角与赢单 / 输单分组');
  s.addNotes('北辰 MES 二期是已成交商机，赢单原因"客户关系"。');
}

// ── 11 售前立项 ───────────────────────────────────────────────────────────────
{
  const s = slideLight('售前立项：关联商机、角色、成本测算、审批', '步骤 15–20');
  bullets(s, [
    '售前项目必须挂在已立项的商机上（选 CRM 商机编码），客户随之带出；编号 PSP-xxxx',
    '五个角色：客户经理、项目经理、项目总监、项目 QA、资源报价负责人',
    '四项成本（人工 / 第三方服务 / 软硬件采购 / 项目费用）→ 总成本自动算；报价 → 毛利率自动算：100 万成本、140 万报价、28.57%',
    '信息安全类别（公开 / 内部 / 秘密 / 机密）与安全备注；审批通过后才能立交付项目',
  ], 0.6, 1.5, 12.1, 1.55, { fontSize: 12.5, gap: 5 });
  pair(s, 3.2, ['S15b-售前项目-关联商机', '售前项目：关联商机、报价、毛利率'], ['S18-成本测算与报价', '成本测算与报价：总成本自动汇总']);
  s.addNotes('改任一项成本，总成本和毛利率当场变——这是公式字段，不是报表。');
}

// ── 12 交付立项 ───────────────────────────────────────────────────────────────
{
  const s = slideLight('交付立项：关联售前、成本中心、角色、附件、审批', '步骤 21–26');
  bullets(s, [
    '交付项目必须选一个已审批的售前项目；预算基线自动取售前 Bizcase 总成本；关联销售合同后合同额自动带出',
    '实施成本中心、核算成本中心、对应部门可以不同（试点项目：实施华东、核算华北）',
    '角色：项目经理、项目总监、资源报价负责人、分包 TS 填写人、QA 负责人；信息安全类别；附件上传开工确认单',
    '交付立项审批通过后项目正式启动，成本计划、工时、差旅、开票、收款都挂在它下面',
  ], 0.6, 1.5, 12.1, 1.55, { fontSize: 12.5, gap: 5 });
  pair(s, 3.2, ['S21b-交付项目-关联售前项目', '交付项目：关联售前项目、预算基线、实际成本、预算消耗'], ['S23-成本中心与部门', '成本中心与部门、项目角色']);
  s.addNotes('顶部四个数字：基线、实际成本、预算消耗，都是平台汇总，不用人算。');
}

// ── 13 成本计划与预算调整 ─────────────────────────────────────────────────────
{
  const s = slideLight('成本计划：四类成本按月编制，预算调整走审批', '步骤 27–32');
  bullets(s, [
    '成本计划行：人工服务 / 第三方服务 / 软硬件采购 / 项目费用 × 月份；数量 × 单价 = 计划金额；人工行选费率卡自动带出单价',
    '计划总额自动汇总到交付项目；预算基线来自售前 Bizcase',
    '预算调整：调整金额、原因（范围变更 / 工期延长 / 费率变化…）、差异分析，提交审批；只有已批准的调整计入"当前预算"',
    '演示：追加 15 万通过后，当前预算 100 万 → 115 万，预算消耗 53.4% → 46.5%',
  ], 0.6, 1.5, 12.1, 1.55, { fontSize: 12.5, gap: 5 });
  pair(s, 3.2, ['S28-31b-成本计划行列表', '成本计划行：类别 × 月份 × 计划金额'], ['R2-10-交付项目-当前预算-调整后', '预算调整通过后：当前预算 1,150,000']);
  s.addNotes('费率卡是主数据：岗位级别 × 小时费率，工时表和成本计划都从这里取价。');
}

// ── 14 工时、请假、出差 ───────────────────────────────────────────────────────
{
  const s = slideLight('成本执行：工时、请假、出差与差旅', '步骤 33–35');
  bullets(s, [
    '工时表：选费率卡自动带出费率，工时 × 费率 = 人工成本；标准工时 / 请假工时 / 加班工时',
    '请假申请审批通过后，自动同步到申请人当月工时表：请假 16 小时 → 工时 176 变 160，成本重算',
    '出差申请：目的地、起止日期（天数自动算）、事由、预计费用、审批；差旅成本关联出差单后自动带出项目、出差人、日期，实际费用汇总回出差单',
    '人工实际成本只计已审批的工时表；工时经项目经理审批后才计入项目成本',
  ], 0.6, 1.5, 12.1, 1.55, { fontSize: 12.5, gap: 5 });
  pair(s, 3.2, ['R2-21-工时表-请假同步', '工时表：请假工时 16、工时 160、成本 144,000'], ['R2-18-出差申请', '出差申请：天数、预计费用、实际费用汇总']);
  s.addNotes('贵司步骤 33 写的"请假、加班申请同步后自动更新"，就是这条：请假审批过了，工时表自己变。');
}

// ── 15 成本管控 ───────────────────────────────────────────────────────────────
{
  const s = slideLight('成本管控：实时汇总，超预算即拦截', '步骤 36');
  lead(s, '系统盯着预算，而不是月底对账', 0.6, 1.5, 4.6, 0.4);
  bullets(s, [
    '交付项目实时汇总人工实际、差旅实际 → 实际成本、预算消耗 %、预算差异',
    '试点项目：基线 20 万，实际 26.4 万，预算消耗 132%',
    '拦截 ②：实际成本 ≥ 当前预算的项目，系统拒绝新的工时填报，并说明数字',
    '拦截 ④：出差申请未审批通过，不能登记差旅成本',
    '预算追加走预算调整审批，批准后当前预算上调，填报自动放开',
  ], 0.6, 1.95, 4.6, 4.6, { fontSize: 12.5, gap: 7 });
  shot(s, 'S36-试点项目-超预算132', 5.5, 1.5, 7.2, '超预算项目：132%');
  s.addNotes('两处拦截的截图在下一页；这里先看数字：132%。');
}
{
  const s = slideLight('两处成本侧拦截', '步骤 35 · 36');
  pair(s, 1.6, ['S36b-拦截-超预算禁填工时', '拦截 ②：项目成本已超预算，工时填报已限制'], ['R2-22-拦截-出差未审批不能报差旅', '拦截 ④：出差申请尚未审批通过，不能登记差旅成本']);
  s.addText('两条提示都是系统在保存那一刻给出的，写明项目、实际与基线的数字或未审批的出差单；换一个健康项目或已审批的出差单即可保存。', { x: 0.6, y: 5.8, w: 12.1, h: 0.8, fontFace: F, fontSize: 12.5, color: C.muted, isTextBox: true, margin: 0 });
  s.addNotes('现场演示：工时表新建选试点项目 → 被拒；差旅成本关联草稿出差单 → 被拒。');
}

// ── 17 合同与财务 ─────────────────────────────────────────────────────────────
{
  const s = slideLight('合同与财务：开票、收款、采购合同、销售订单', '步骤 37 · 38 · 40');
  bullets(s, [
    '交付项目"合同与财务"分组：销售合同、合同额、项目进度 → 已确认收入；已开票、已收款、应收余额；采购合同总额、销售订单总额；项目毛利率',
    '开票：发票类型、号码、金额、税率、状态；收款汇总到发票，未收余额自动算。收款：方式、流水号、关联发票',
    '采购合同：供应商、类别（分包 / 软件 / 硬件）、已付 / 未付；销售订单：交付状态、验收日期',
    '本阶段手工录入；财务、费控、考勤系统对接放在后续阶段',
  ], 0.6, 1.5, 12.1, 1.55, { fontSize: 12.5, gap: 5 });
  pair(s, 3.2, ['R2-11-交付项目-合同与财务', '交付项目：合同与财务分组'], ['R2-13-开票', '开票列表：收款汇总与未收余额']);
  s.addNotes('一期：合同 140 万，已开票 98 万，已收款 42 万，应收 56 万，毛利率 61.8%。');
}

// ── 18 报表 ───────────────────────────────────────────────────────────────────
{
  const s = slideLight('项目报表：综合查询与两个仪表板', '步骤 37–39');
  bullets(s, [
    '交付项目列表的"项目综合查询"视图：进度、当前预算、实际成本、预算消耗、合同额、已确认收入、已开票、已收款、应收余额、毛利率一行看全，可筛选、分组、导出',
    '项目成本仪表板：总预算 / 人工实际 / 差旅实际 / 进行中项目，各项目基线 vs 计划 vs 实际，预算消耗表',
    '项目财务仪表板：合同额 / 已开票 / 已收款 / 采购合同，各项目合同额 vs 开票 vs 收款，开票率与回款率',
  ], 0.6, 1.5, 12.1, 1.3, { fontSize: 12.5, gap: 5 });
  pair(s, 2.95, ['R3-10-项目成本仪表板', '项目成本仪表板：七个交付项目'], ['R3-11-项目财务仪表板', '项目财务仪表板：合同额、开票、收款']);
  s.addNotes('两个仪表板都是平台原生的数据集 + 组件，改指标不用写代码。');
}

// ── 19 主数据 ─────────────────────────────────────────────────────────────────
{
  const s = slideLight('主数据：费率卡与签约主体', '步骤 9 · 18 · 28');
  bullets(s, [
    '费率卡：岗位级别 × 小时费率 / 日费率，带生效日期与启用开关；工时表、人工成本计划行选了费率卡就自动取价，费率变更集中管理',
    '签约主体：我方法人公司主数据（名称、信用代码、法定代表人、开户行），商机与合同上选择，不是租户维度',
    '两者都在导航"主数据"组，管理员维护，业务人员只选不填',
  ], 0.6, 1.5, 12.1, 1.3, { fontSize: 12.5, gap: 5 });
  pair(s, 2.95, ['R2-02-费率卡', '费率卡'], ['R2-03-签约主体', '签约主体']);
  s.addNotes('贵司步骤 18 / 28 的"岗位级别、费率标准"就是费率卡；步骤 9 的"软通签约主体"就是签约主体。');
}

// ── 20 演示口径 ───────────────────────────────────────────────────────────────
{
  const s = slideLight('本次演示的简化与后续形态');
  const hdr = ['需求', '本次演示', '后续形态'];
  const rows = [
    ['五级售前审批（20）', '一级审批', '五个审批节点串联，按组织层级自动路由'],
    ['商机状态变更审批（14）', '未单独审批', '赢单 / 弃单 / 铁三角调整走审批流'],
    ['铁三角（13）', '商机上三个人员字段', '商机团队对象 + 记录级共享'],
    ['请假 / 加班同步（33）', '请假按工作日 × 8 小时自动同步；加班手填', '对接考勤系统'],
    ['报销单据（35）', '差旅成本记单据号', '对接费控系统'],
    ['开票 / 收款（37 / 38）', '系统内对象，手工录入', '对接财务系统'],
    ['售前工时（33）', '按已审批口径汇总到售前项目', '—'],
    ['审批发起', '记录页「发起审批」按钮，审批状态只读', '同一机制，按对象配置审批人与层级'],
    ['演示数据', '一家软件公司：14 客户 / 13 商机 / 7 交付项目', '导入贵司真实客户、项目与费率'],
  ];
  const cell = (t, o = {}) => ({ text: t, options: Object.assign({ fontFace: F, fontSize: 11.5, color: C.ink, valign: 'middle', margin: [4, 8, 4, 8] }, o) });
  const data = [hdr.map((h) => cell(h, { bold: true, color: C.white, fill: { color: C.navy } }))].concat(rows.map((r, i) => r.map((t, j) => cell(t, { bold: j === 0, fill: { color: i % 2 ? C.white : 'F4F6F9' } }))));
  s.addTable(data, { x: 0.6, y: 1.5, w: 12.1, colW: [3.2, 4.4, 4.5], border: { type: 'solid', pt: 0.5, color: C.line }, rowH: 0.44 });
  s.addNotes('把简化说在前面：审批级数、铁三角共享、三个外部系统对接，都是明确的后续项，不是做不到。');
}

// ── 21 roadmap ───────────────────────────────────────────────────────────────
{
  const s = slideLight('建议的推进路线');
  const cols = [
    ['阶段一 · 试点上线', '本次演示范围', ['贵司确认五个待答事项：跟进记录形态、开票 / 回款归属、线索形态、EAR 判定方式、立项审批与金额审批的关系', '按贵司组织与岗位配置审批人、权限、费率卡、签约主体', '一个事业部、一批真实项目试运行']],
    ['阶段二 · 深化', '规则与协同', ['五级售前审批按组织层级路由；商机状态变更审批', '铁三角商机团队与记录级共享', '预算多级审批、费率卡版本、售前工时口径']],
    ['阶段三 · 集成', '打通外部系统', ['考勤：请假 / 加班自动同步', '费控：报销单据回写差旅成本', '财务：开票、收款自动进系统；合同额、收入口径统一']],
  ];
  cols.forEach((c, i) => {
    const x = 0.6 + i * 4.1;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.55, w: 3.9, h: 5.2, fill: { color: i === 0 ? C.amberSoft : C.ice }, line: { color: i === 0 ? C.amberSoft : C.ice }, rectRadius: 0.12 });
    s.addText(c[0], { x: x + 0.3, y: 1.75, w: 3.3, h: 0.5, fontFace: F, fontSize: 17, bold: true, color: i === 0 ? C.amber : C.navy, isTextBox: true, margin: 0 });
    s.addText(c[1], { x: x + 0.3, y: 2.25, w: 3.3, h: 0.35, fontFace: F, fontSize: 11.5, color: C.muted, isTextBox: true, margin: 0 });
    bullets(s, c[2], x + 0.3, 2.75, 3.3, 3.8, { fontSize: 12, gap: 8 });
  });
  s.addNotes('排期与贵司确认范围后给出。阶段一的前提是五个待答事项。');
}

// ── 22 closing ───────────────────────────────────────────────────────────────
{
  const s = pres.addSlide(); dark(s); n += 1;
  s.addText('贵司 40 步流程里，客户、线索、商机、审批中心、附件、跟进、赢丢单是现成的 CRM 能力；售前立项、交付立项、成本计划、工时与差旅、财务与报表这 26 步，是在同一个平台、同一套元数据里长出来的。', { x: 0.8, y: 1.6, w: 11.7, h: 2.4, fontFace: F, fontSize: 22, color: C.white, isTextBox: true, margin: 0, valign: 'top' });
  s.addText('这也是它能成为软件行业项目型销售标准模板的原因。', { x: 0.8, y: 4.1, w: 11.7, h: 0.6, fontFace: F, fontSize: 18, color: 'E8C9A0', isTextBox: true, margin: 0 });
  s.addText('下一步：确认五个待答事项 → 划定试点范围 → 给出排期', { x: 0.8, y: 5.6, w: 11.7, h: 0.5, fontFace: F, fontSize: 14, color: '9FB3D1', isTextBox: true, margin: 0 });
  s.addNotes('收尾一句话，留下三个动作。');
}

pres.writeFile({ fileName: OUT }).then((f) => console.log('wrote', f, 'slides', n));
