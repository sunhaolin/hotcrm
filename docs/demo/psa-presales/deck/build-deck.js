// Customer-facing deck for the 华信 presales demo (Chinese), v4 — rebuilt after
// the cost plan was reworked into versions / four line families / a month
// ledger (steps 27–32) and the approval button landed. Builds one .pptx from
// the screenshots under docs/demo/psa-presales and writes the spoken script
// (客户汇报-讲稿.md) from the same speaker notes.
//
//   NODE_PATH=<dir with pptxgenjs> node build-deck.js [out.pptx]
const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const SHOTS = path.resolve(__dirname, '..');
const OUT = process.argv[2] || path.join(SHOTS, '客户汇报-华信案例.pptx');
const img = (name) => { const p = path.join(SHOTS, name + '.png'); if (!fs.existsSync(p)) throw new Error('missing screenshot ' + p); return p; };

// ── palette: navy = CRM side, amber = 项管平台 side, one sharp red for gates ──
const C = {
  navy: '14213D', navy2: '2B3F6B', ink: '1F2937', muted: '5B6572', faint: '98A2B3',
  ice: 'EEF2F8', line: 'DDE3EB', white: 'FFFFFF', paper: 'F7F9FC',
  amber: 'C8842E', amberSoft: 'FBEFD9', amberDeep: '9A5F16',
  green: '2F7D4F', greenSoft: 'E3F2E8', red: 'B4232C', redSoft: 'FBE9EA',
  blue: '2E5AAC', blueSoft: 'E3EAF7', navySoft: 'E1E7F2', dim: '243559', sky: 'CADCFC', sand: 'E8C9A0', steel: '9FB3D1',
};
const F = 'Microsoft YaHei';
const FN = 'Arial';
const W = 13.333, H = 7.5, M = 0.6, CW = W - 2 * M;

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.author = 'HotCRM 售前团队';
pres.title = '项目型销售与项目管理一体化 — 华信案例演示汇报';
pres.lang = 'zh-CN';

const SCRIPT = [];
let n = 0;

// ── helpers (every call builds fresh option objects: pptxgenjs mutates them) ──
const shadow = () => ({ type: 'outer', blur: 6, offset: 2, angle: 90, color: '1B2A41', opacity: 0.16 });
function light(s) { s.background = { color: C.white }; }
function dark(s) { s.background = { color: C.navy }; }
function footer(s) {
  s.addText('HotCRM · 项目型销售与项目管理一体化 · 华信案例演示 · 2026 年 9 月', { x: M, y: H - 0.45, w: 8, h: 0.3, fontFace: F, fontSize: 9, color: C.faint, isTextBox: true, margin: 0 });
  s.addText(String(n), { x: W - 1.2, y: H - 0.45, w: 0.6, h: 0.3, fontFace: FN, fontSize: 9, color: C.faint, align: 'right', isTextBox: true, margin: 0 });
}
function title(s, text, steps) {
  s.addText(text, { x: M, y: 0.42, w: steps ? 9.7 : CW, h: 0.85, fontFace: F, fontSize: 27, bold: true, color: C.ink, isTextBox: true, margin: 0, valign: 'middle' });
  if (steps) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 10.45, y: 0.58, w: 2.28, h: 0.52, fill: { color: C.amberSoft }, line: { color: C.amberSoft }, rectRadius: 0.26 });
    s.addText(steps, { x: 10.45, y: 0.58, w: 2.28, h: 0.52, fontFace: F, fontSize: 11.5, bold: true, color: C.amberDeep, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  }
}
function slide(t, steps) { const s = pres.addSlide(); light(s); n += 1; title(s, t, steps); footer(s); s.__title = t; return s; }
function notes(s, text) { s.addNotes(text); SCRIPT.push({ n, title: s.__title || '', text }); }
function shot(s, name, x, y, w, caption) {
  const h = w / 1.6;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x - 0.06, y: y - 0.06, w: w + 0.12, h: h + 0.12, fill: { color: C.white }, line: { color: C.line, width: 0.75 }, rectRadius: 0.06, shadow: shadow() });
  s.addImage({ path: img(name), x, y, w, h, sizing: { type: 'contain', w, h } });
  if (caption) s.addText(caption, { x, y: y + h + 0.1, w, h: 0.3, fontFace: F, fontSize: 10.5, color: C.muted, isTextBox: true, margin: 0 });
  return h;
}
function bullets(s, items, x, y, w, h, opts = {}) {
  const runs = items.map((t, i) => {
    const r = typeof t === 'string' ? { text: t } : t;
    return { text: r.text, options: { bullet: r.bullet === false ? false : { indent: 15 }, bold: !!r.bold, color: r.color || C.ink, fontSize: r.size || opts.fontSize || 13, fontFace: F, breakLine: i < items.length - 1, paraSpaceAfter: opts.gap || 7 } };
  });
  s.addText(runs, { x, y, w, h, isTextBox: true, margin: 0, valign: 'top', fontFace: F });
}
function lead(s, text, x, y, w, size = 15) { s.addText(text, { x, y, w, h: 0.42, fontFace: F, fontSize: size, bold: true, color: C.navy, isTextBox: true, margin: 0, valign: 'top' }); }
function para(s, text, x, y, w, h, opts = {}) { s.addText(text, { x, y, w, h, fontFace: F, fontSize: opts.size || 12, color: opts.color || C.muted, isTextBox: true, margin: 0, valign: opts.valign || 'top', bold: !!opts.bold, align: opts.align || 'left' }); }
function chip(s, text, x, y, w, fill, color, h = 0.42, size = 11, bold = true) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill }, rectRadius: Math.min(0.5, h / 2) });
  s.addText(text, { x, y, w, h, fontFace: F, fontSize: size, bold, color, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}
function box(s, text, x, y, w, h, fill, color, size = 11, opts = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: opts.line || fill, width: 0.75 }, rectRadius: 0.08, ...(opts.shadow ? { shadow: shadow() } : {}) });
  const runs = Array.isArray(text) ? text.map((t, i) => ({ text: t, options: { fontSize: i === 0 ? size : size - 2, bold: i === 0, color, fontFace: F, breakLine: i < text.length - 1 } })) : text;
  s.addText(runs, { x: x + 0.05, y, w: w - 0.1, h, fontFace: F, fontSize: size, bold: !Array.isArray(text), color, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}
function card(s, x, y, w, h, fill, opts = {}) { s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: opts.line || fill, width: 0.75 }, rectRadius: 0.12, ...(opts.shadow ? { shadow: shadow() } : {}) }); }
function arrow(s, x1, y1, x2, y2, opts = {}) {
  const o = { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), line: { color: opts.color || C.faint, width: opts.width || 1.25, endArrowType: 'triangle', ...(opts.dash ? { dashType: 'dash' } : {}) } };
  if (x2 < x1) o.flipH = true;
  if (y2 < y1) o.flipV = true;
  s.addShape(pres.shapes.LINE, o);
}
function numTile(s, x, y, w, h, big, label, sub, color, fill) {
  card(s, x, y, w, h, fill || C.ice);
  s.addText(big, { x, y: y + 0.1, w, h: h * 0.5, fontFace: FN, fontSize: h > 1.4 ? 40 : 30, bold: true, color, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText(label, { x, y: y + h * 0.58, w, h: 0.34, fontFace: F, fontSize: 13, bold: true, color: C.ink, align: 'center', isTextBox: true, margin: 0 });
  if (sub) s.addText(sub, { x: x + 0.1, y: y + h * 0.58 + 0.34, w: w - 0.2, h: h - h * 0.58 - 0.38, fontFace: F, fontSize: 9.5, color: C.muted, align: 'center', isTextBox: true, margin: 0, valign: 'top' });
}
function pair(s, y, a, b, maxH = 3.5) {
  const h = Math.min(maxH, 6.95 - 0.42 - y);
  const w = h * 1.6; const gap = CW - 2 * w;
  shot(s, a[0], M, y, w, a[1]);
  shot(s, b[0], M + w + gap, y, w, b[1]);
  return h;
}
function trio(s, y, items) {
  const w = 3.85, h = w / 1.6;
  items.forEach((it, i) => shot(s, it[0], M + i * (w + 0.29), y, w, it[1]));
  return h;
}
function table(s, hdr, rows, x, y, w, colW, opts = {}) {
  const fs = opts.fontSize || 10.5;
  const cell = (t, o = {}) => ({ text: t, options: Object.assign({ fontFace: F, fontSize: fs, color: C.ink, valign: 'middle', margin: [3, 6, 3, 6] }, o) });
  const data = [hdr.map((h) => cell(h, { bold: true, color: C.white, fill: { color: C.navy }, fontSize: fs + 0.5 }))]
    .concat(rows.map((r, i) => r.map((t, j) => {
      const fill = { color: i % 2 ? C.white : C.paper };
      if (opts.status && j === opts.status) {
        const color = t.startsWith('已实现') ? C.green : t.startsWith('部分') ? C.amberDeep : C.red;
        return cell(t, { bold: true, color, fill });
      }
      return cell(t, { bold: j === 0, fill, ...(opts.center && opts.center.includes(j) ? { align: 'center', fontFace: FN } : {}) });
    })));
  s.addTable(data, { x, y, w, colW, border: { type: 'solid', pt: 0.5, color: C.line }, rowH: opts.rowH || 0.46 });
}
const STAGES = ['客户管理', '线索管理', '商机立项', '商机跟进', '售前立项', '交付立项', '成本计划', '成本执行', '项目报表'];
function rail(s, y, x0 = 0.8, active) {
  STAGES.forEach((t, i) => { const on = active === undefined || active.includes(i); chip(s, t, x0 + i * 1.3, y, 1.2, on ? (i < 4 ? C.navy2 : C.amber) : C.dim, on ? C.white : C.steel, 0.46, 11.5); });
}
function section(num, kicker, t, sub, active) {
  const s = pres.addSlide(); dark(s); n += 1; s.__title = t;
  s.addText(num, { x: 9.2, y: 0.9, w: 3.6, h: 2.2, fontFace: FN, fontSize: 130, bold: true, color: C.dim, align: 'right', isTextBox: true, margin: 0 });
  s.addText(kicker, { x: 0.8, y: 2.2, w: 8, h: 0.4, fontFace: F, fontSize: 14, color: C.sand, isTextBox: true, margin: 0 });
  s.addText(t, { x: 0.8, y: 2.65, w: 11, h: 1.0, fontFace: F, fontSize: 38, bold: true, color: C.white, isTextBox: true, margin: 0 });
  s.addText(sub, { x: 0.8, y: 3.7, w: 11, h: 0.5, fontFace: F, fontSize: 15, color: C.sky, isTextBox: true, margin: 0 });
  rail(s, 5.4, 0.8, active);
  return s;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1 · cover
{
  const s = pres.addSlide(); dark(s); n += 1; s.__title = '封面';
  s.addText('项目型销售与项目管理一体化', { x: 0.8, y: 1.45, w: 11.5, h: 1.2, fontFace: F, fontSize: 44, bold: true, color: C.white, isTextBox: true, margin: 0 });
  s.addText('基于贵司 40 步业务流程的落地演示 · 华信案例', { x: 0.8, y: 2.7, w: 11.5, h: 0.7, fontFace: F, fontSize: 22, color: C.sky, isTextBox: true, margin: 0 });
  s.addText('HotCRM 平台 · 2026 年 9 月 · 第 4 版（成本计划按设计完整实现）', { x: 0.8, y: 3.45, w: 11.5, h: 0.5, fontFace: F, fontSize: 14, color: C.steel, isTextBox: true, margin: 0 });
  rail(s, 5.55);
  s.addText('CRM  ←  贵司需求表步骤 1–14', { x: 0.8, y: 6.15, w: 5.2, h: 0.35, fontFace: F, fontSize: 11, color: C.steel, isTextBox: true, margin: 0 });
  s.addText('项管平台  ←  步骤 15–40', { x: 6.0, y: 6.15, w: 6, h: 0.35, fontFace: F, fontSize: 11, color: C.sand, isTextBox: true, margin: 0 });
  notes(s, '各位好。今天这场演示只讲一件事：贵司给我们的那张 40 步、9 个环节的业务流程表，怎样在一个平台、一套数据里从头跑到尾。表里把它分成了 CRM 和项管平台两个系统，今天大家会看到，它们其实是同一个系统里的两组业务对象。和上次汇报相比，这一版有两个大变化：一是成本计划不再简化，按贵司的要求做成了带版本、四类明细、按月分解的完整形态；二是审批的发起改成了记录上的一个按钮。下面 40 分钟我按贵司流程表的顺序走，每一页右上角都标着对应的步骤号。');
}

// 2 · headline numbers
{
  const s = slide('贵司的 40 步流程：36 步已实现，3 步部分实现，1 步待贵司决策');
  const row1 = [['40', '需求表步骤', '9 个业务环节 · 两个系统', C.navy], ['36', '已实现', '现场可逐步点给各位看', C.green], ['3', '部分实现', '五级审批（20）· 版本调整的预算联动（32）· 加班同步（33）', C.amberDeep], ['1', '待贵司决策', '商机状态变更审批（14）是否单独走审批', C.red]];
  row1.forEach((t, i) => numTile(s, M + i * 3.07, 1.45, 2.9, 1.65, t[0], t[1], t[2], t[3]));
  const row2 = [['20', '新建业务对象', '17 个项目对象 + 3 项主数据', C.navy], ['10', '条审批流', '同一个审批中心、同一套手势', C.navy], ['4 + 2', '处系统拦截 + 冻结', '招标代理 · EAR · 超预算 · 出差未批 ｜ 已审批的计划、冻结基线不可改', C.red]];
  row2.forEach((t, i) => numTile(s, M + i * 4.1, 3.3, 3.93, 1.42, t[0], t[1], t[2], t[3], C.paper));
  lead(s, '怎么做到的', M, 4.95, 6);
  bullets(s, [
    '不做两套系统再做接口：CRM 与项目管理是同一个平台上的一组业务对象，商机编码是两侧唯一的关联锚点',
    '业务规则落在系统里而不是制度里：拦截与冻结由系统在保存那一刻执行，存量数据不受影响',
    '汇总与公式实时计算：Bizcase 总成本、毛利率、计划总额、实际成本、预算消耗、应收余额都不用人算',
    '一个审批中心：客户、线索、商机立项、售前、交付、成本计划、预算调整、工时、出差、请假十条流程在同一个收件箱处理',
  ], M, 5.38, CW, 1.55, { fontSize: 12.5, gap: 4 });
  notes(s, '先给结论。40 步里 36 步今天能现场点给各位看；3 步是部分实现——售前审批今天是一级、生产上走五级，成本计划新版本的预算调整通过后「当前预算」的联动还在收尾，加班工时还是手填；只有「商机状态变更审批」这一步留给贵司决策要不要单独审批。为此新建了 20 个业务对象、10 条审批流、4 处系统拦截加 2 处冻结，全部跑在同一个审批中心里。怎么做到的：不做两套系统再做接口，而是把项目管理长在 CRM 的对象上，商机编码是两侧唯一的锚点；业务规则落在系统里而不是制度里；汇总和公式都是实时算的。');
}

// 3 · the customer's process
{
  const s = slide('贵司的流程：9 个环节、40 个步骤、两个系统', '来自需求表「系统路径」列');
  const crm = [['客户管理', '1–5', '录入 · 联系人 · 业务信息 · 附件 · 审批'], ['线索管理', '6–7', '录入 · 审批'], ['商机立项', '8–11', '跟单 · 主体 · 背景 · 立项审批'], ['商机跟进', '12–14', '跟进 · 状态变更 · 变更审批']];
  const psa = [['售前立项', '15–20', '关联商机 · 角色 · 成本测算 · 信息安全 · 逐级审批'], ['交付立项', '21–26', '关联售前 · 成本中心 · 角色 · 附件 · 审批'], ['成本计划', '27–32', '基线导入 · 四类成本计划 · 调整审批'], ['成本执行', '33–36', '工时 · 工时审批 · 差旅 · 超支管控'], ['项目报表', '37–40', '综合查询 · 财务 · 成本跟踪 · 合同订单']];
  const draw = (rows, y, fill, tag, tagColor) => {
    s.addText(tag, { x: M, y, w: 1.4, h: 0.55, fontFace: F, fontSize: 13, bold: true, color: tagColor, isTextBox: true, margin: 0, valign: 'middle' });
    rows.forEach((r, i) => {
      const x = 2.1 + i * 2.15;
      s.addShape(pres.shapes.CHEVRON, { x, y, w: 2.08, h: 0.55, fill: { color: fill }, line: { color: fill } });
      s.addText(r[0], { x: x + 0.28, y, w: 1.55, h: 0.55, fontFace: F, fontSize: 12, bold: true, color: C.white, isTextBox: true, margin: 0, valign: 'middle', align: 'center' });
      s.addText('步骤 ' + r[1], { x, y: y + 0.62, w: 2.08, h: 0.28, fontFace: F, fontSize: 10.5, bold: true, color: C.muted, isTextBox: true, margin: 0, align: 'center' });
      s.addText(r[2], { x, y: y + 0.9, w: 2.08, h: 0.7, fontFace: F, fontSize: 9.5, color: C.muted, isTextBox: true, margin: 0, align: 'center', valign: 'top' });
    });
  };
  draw(crm, 1.7, C.navy2, 'CRM', C.navy);
  draw(psa, 3.75, C.amber, '项管平台', C.amberDeep);
  card(s, M, 5.75, CW, 1.05, C.paper, { line: C.line });
  para(s, '关键发现：26 步在项管平台侧，每一步都要读 CRM 里的商机；14 步在 CRM 侧，其中三条规则是跨对象的门禁而不是字段。所以方案不是"两个系统对接"，而是同一个平台上的一组业务对象——这决定了后面所有设计。', M + 0.25, 5.88, CW - 0.5, 0.85, { size: 12.5, color: C.ink });
  notes(s, '这页是把贵司的表画成图：深蓝是 CRM 的 4 个环节 14 步，橙色是项管平台的 5 个环节 26 步。我们读表时发现一件事：26 步在项管侧，但每一步都要读 CRM 里的商机；而 CRM 侧有三条规则其实是跨对象的门禁，不是字段。所以方案不是「两个系统对接」，而是同一个平台上的一组业务对象——这决定了后面所有设计。');
}

// 4 · end-to-end swimlane (native shapes)
{
  const s = slide('端到端业务流程：从线索到回款，一条数据链', '步骤 1–40 · 泳道图');
  const lanes = [['销售', C.navySoft], ['售前', C.amberSoft], ['交付', C.amberSoft], ['财务', C.greenSoft], ['审批中心', C.paper]];
  const y0 = 1.45, lh = 0.98, gap = 0.06, lx = M + 1.15, lw = CW - 1.15;
  lanes.forEach((l, i) => {
    const y = y0 + i * (lh + gap);
    s.addShape(pres.shapes.RECTANGLE, { x: M, y, w: 1.05, h: lh, fill: { color: i < 1 ? C.navy2 : i < 3 ? C.amber : i < 4 ? C.green : C.muted }, line: { color: C.white } });
    s.addText(l[0], { x: M, y, w: 1.05, h: lh, fontFace: F, fontSize: 12, bold: true, color: C.white, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: lx, y, w: lw, h: lh, fill: { color: l[1] }, line: { color: C.white } });
  });
  const bw = 2.45, bh = 0.7, by = (i) => y0 + i * (lh + gap) + (lh - bh) / 2;
  const B = (lane, col, txt, fill, color, extra) => { const x = lx + 0.2 + col * (bw + 0.22); box(s, txt, x, by(lane), bw, bh, fill, color, 11); if (extra) chip(s, extra, x + bw - 1.05, by(lane) - 0.16, 1.0, C.red, C.white, 0.28, 8.5); return x; };
  // lane 0 sales
  const s0 = B(0, 0, ['线索', '录入 · 审批'], C.navy2, C.white);
  const s1 = B(0, 1, ['客户', '业务信息 · 审批'], C.navy2, C.white);
  const s2 = B(0, 2, ['商机立项', '招投标 · 签约主体'], C.navy2, C.white, '拦截 ①③');
  const s3 = B(0, 3, ['商机跟进', '铁三角 · 赢单'], C.navy2, C.white);
  arrow(s, s0 + bw, by(0) + bh / 2, s1, by(0) + bh / 2); arrow(s, s1 + bw, by(0) + bh / 2, s2, by(0) + bh / 2); arrow(s, s2 + bw, by(0) + bh / 2, s3, by(0) + bh / 2);
  // lane 1 presales
  const p0 = B(1, 2, ['售前项目', '关联已立项商机'], C.amber, C.white);
  const p1 = B(1, 3, ['Bizcase 成本计划', '四类明细 · 报价 · 毛利率'], C.amber, C.white);
  arrow(s, s2 + bw / 2, by(0) + bh, p0 + bw / 2, by(1)); arrow(s, p0 + bw, by(1) + bh / 2, p1, by(1) + bh / 2);
  // lane 2 delivery
  const d0 = B(2, 0, ['交付项目', '挂已审批售前 · 导入 Bizcase 预算'], C.amber, C.white);
  const d1 = B(2, 1, ['成本计划版本', '按月分解 · 冻结基线'], C.amber, C.white);
  const d2 = B(2, 2, ['工时 · 差旅', '实际成本 · 预算消耗'], C.amber, C.white, '拦截 ②④');
  const d3 = B(2, 3, ['预算调整', '新版本 · 审批后生效'], C.amber, C.white);
  arrow(s, d0 + bw, by(2) + bh / 2, d1, by(2) + bh / 2); arrow(s, d1 + bw, by(2) + bh / 2, d2, by(2) + bh / 2); arrow(s, d2 + bw, by(2) + bh / 2, d3, by(2) + bh / 2);
  // lane 3 finance
  const f0 = B(3, 0, ['销售合同（赢单后）', '合同额 · 进度 → 已确认收入'], C.green, C.white);
  const f1 = B(3, 1, ['开票 → 收款', '应收余额'], C.green, C.white);
  const f2 = B(3, 2, ['采购合同 · 销售订单', '项目毛利率'], C.green, C.white);
  const f3 = B(3, 3, ['项目报表', '综合查询 · 两个仪表板'], C.green, C.white);
  arrow(s, f0 + bw, by(3) + bh / 2, f1, by(3) + bh / 2); arrow(s, f1 + bw, by(3) + bh / 2, f2, by(3) + bh / 2); arrow(s, f2 + bw, by(3) + bh / 2, f3, by(3) + bh / 2);
  // lane 4 approvals
  const flows = ['客户', '线索', '商机立项', '售前立项', '交付立项', '成本计划', '预算调整', '工时', '出差', '请假'];
  flows.forEach((t, i) => chip(s, t, lx + 0.2 + i * 1.07, by(4) + 0.14, 1.0, C.white, C.navy, 0.42, 10.5));
  para(s, '箭头 = 字段关联（不是接口）· 红标 = 系统拦截 · 售前项目挂已立项商机，交付项目挂已审批售前项目，销售合同在赢单后签订 · 商机编码是两侧唯一的锚点', M, 6.72, CW, 0.3, { size: 10 });
  notes(s, '这张泳道图把 40 步压成一条数据链，五条泳道是五种角色。销售泳道是 CRM：线索、客户、商机立项、商机跟进；商机立项那里标着拦截①③——招标代理客户和 EAR 确认在列的客户发不起商机。售前泳道是售前项目和它的 Bizcase 成本计划：四类明细、报价、毛利率都在计划上。交付泳道从交付项目开始：点「导入 Bizcase 预算」得到交付成本计划第 1 版并冻结基线，明细按月分解；工时和差旅是实际成本——拦截②④在这里：超预算不能填工时，出差没审批不能登记差旅；预算要变就做新版本、走预算调整审批。财务泳道从赢单后的销售合同开始，合同额乘进度得到已确认收入，开票收款得到应收余额，采购和订单进毛利率，最后落到项目报表。最下面是审批中心：十条流程一个收件箱。请各位记住一件事：这条链上每一个箭头都是字段关联，不是接口——商机编码是唯一的锚点。');
}

// 5 · three layers
{
  const s = slide('方案：一个平台，一套数据，三层能力');
  const band = (y, h, label, items, fill, chipFill, chipColor, per, cw = 0.99, step = 1.06) => {
    card(s, M, y, CW, h, fill);
    s.addText(label, { x: M + 0.25, y, w: 2.2, h, fontFace: F, fontSize: 13.5, bold: true, color: C.ink, isTextBox: true, margin: 0, valign: 'middle' });
    items.forEach((t, i) => { const row = Math.floor(i / per); const col = i % per; chip(s, t, 3.05 + col * step, y + 0.15 + row * 0.55, cw, chipFill, chipColor, 0.44, 10); });
  };
  band(1.45, 0.75, '平台能力\n（现成，零开发）', ['审批中心', '附件', '活动时间线', '汇总字段', '公式字段', '权限集', '仪表板', '导入导出', '记录锁定'], C.ice, C.white, C.navy, 9);
  band(2.32, 0.75, 'CRM 对象\n（标准 + 扩展）', ['客户', '联系人', '线索', '商机', '销售合同', '任务 / 活动', '报价', '产品', '审批请求'], C.navySoft, C.navy2, C.white, 9);
  band(3.19, 1.85, '项目对象\n（本次新增 17 个）', ['售前项目', '交付项目', '成本计划', '人工服务成本行', '第三方服务成本行', '软硬件采购成本行', '项目费用成本行', '月度分解行', '工时表', '差旅成本', '出差申请', '请假申请', '预算调整', '开票', '收款', '采购合同', '销售订单'], C.amberSoft, C.amber, C.white, 6, 1.5, 1.6);
  band(5.16, 0.75, '主数据\n（本次新增 3 项）', ['费率卡', '差旅标准', '签约主体'], C.paper, C.muted, C.white, 9);
  para(s, '商机编码 OPP-xxxx 是 CRM 与项目侧唯一的关联锚点：售前项目必须挂在已立项的商机上，交付项目必须挂在已审批的售前项目上；成本计划、工时、差旅、开票、收款都挂在交付项目下。', M, 6.05, CW, 0.65, { size: 12, color: C.ink });
  notes(s, '三层。最上面是平台自带的能力：审批中心、附件、活动时间线、汇总字段、公式字段、权限、仪表板、导入导出、记录锁定——这一层零开发。中间是 CRM 的标准对象加字段：客户、联系人、线索、商机、销售合同这些。底下是本次为贵司流程新建的 17 个项目对象——比上次多出来的是成本计划、四类成本明细行和月度分解行——再加费率卡、差旅标准、签约主体三项主数据。串起三层的是商机编码：售前项目必须挂在已立项的商机上，交付项目必须挂在已审批的售前项目上，成本、工时、差旅、开票、收款都挂在交付项目下。');
}

// 6 · coverage table
{
  const s = slide('覆盖总览：每个环节做到了什么', '40 步 · 36 已实现 · 3 部分 · 1 待定');
  table(s, ['环节', '步骤', '系统里做到了什么', '状态'], [
    ['客户管理', '1–5', '客户分类 / 简称 / 统一社会信用代码 / 业务信息（主要服务商、IT 预算、付款周期、EAR、战略伙伴）；联系人角色与态度；附件；客户审批', '已实现'],
    ['线索管理', '6–7', '预计金额、需求类型；线索审批，通过后才转商机', '已实现'],
    ['商机立项', '8–11', '商机编码、是否投标、级别、优先级、可控性、立项 / 招标时间、分包；签约主体、业务分类、收入确认；背景说明；立项审批；招标代理与 EAR 拦截', '已实现'],
    ['商机跟进', '12–14', '阶段、任务、活动时间线；铁三角三个角色；赢单 / 丢单原因。状态变更不单独审批（待贵司确认）', '部分实现（14 未实现）'],
    ['售前立项', '15–20', '关联已立项商机、项目信息、五个角色、Bizcase 成本计划 → 四项成本、总成本、毛利率自动算、信息安全、审批', '部分实现（20 为一级审批）'],
    ['交付立项', '21–26', '关联已审批售前项目、成本中心与部门、五个角色、信息安全与附件、审批；「导入 Bizcase 预算」一键生成成本计划 v1 并冻结基线', '已实现'],
    ['成本计划', '27–32', '成本计划带版本；四类明细行各有算法与单价来源；系统按月分解；计划总额自动汇总；新建版本 + 预算调整审批，通过后新版本生效、旧版作废', '部分实现（32 当前预算联动收尾中）'],
    ['成本执行', '33–36', '工时选费率卡自动取价、工时 × 费率算成本；请假审批后自动同步工时；出差申请与差旅关联；实际成本与预算消耗实时汇总；超预算禁填工时', '部分实现（33 加班同步未实现）'],
    ['项目报表', '37–40', '项目综合查询（进度、预算、成本、收入、开票、收款）；项目成本与项目财务两个仪表板；开票、收款、采购合同、销售订单（手工录入）', '已实现'],
  ], M, 1.45, CW, [1.25, 0.75, 7.6, 2.53], { status: 3, center: [1], rowH: 0.52, fontSize: 10 });
  notes(s, '这张表逐环节说清做到了什么，各位可以对照自己那张表看。绿色是已实现；橙色是部分实现，三处：商机状态变更今天不单独审批，等贵司确认；售前审批今天是一级，生产上按贵司组织层级走五级；成本计划的新版本预算调整审批通过后，新版本已经生效、计划总额也跟着变了，但交付项目上「当前预算」这一个数的联动还在收尾；成本执行里请假同步已经做了，加班同步还是手填。项目报表环节的开票、收款是手工录入，对接财务系统放在后续阶段。接下来按环节一个个看。');
}

// 7 · demo data
{
  const s = slide('演示数据：一家软件公司的一年', '以软件企业为目标客户');
  lead(s, '华软信息技术股份有限公司 —— 卖定制开发、实施、运维与咨询', M, 1.42, CW, 14);
  const tiles = [['14', '客户', '制造 · 金融 · 医药 · 物流 · 能源 · 教育'], ['14', '线索', '新建 → 已联系 → 已确认 → 未通过'], ['13', '商机', '每个阶段都有，5 赢 1 丢'], ['6', '销售合同', '里程碑 · 3-4-3 · 按月结算'], ['8 / 7', '售前 / 交付项目', '每个项目一份带版本的成本计划'], ['31', '工时表', '12 出差 · 5 请假 · 10 发票 · 7 收款']];
  tiles.forEach((t, i) => numTile(s, M + i * 2.05, 1.9, 1.9, 1.5, t[0], t[1], t[2], i % 2 ? C.navy : C.amberDeep, i % 2 ? C.ice : C.amberSoft));
  pair(s, 3.65, ['R3-01-客户列表', '客户：14 家，行业与类型各不相同'], ['R3-03-商机列表', '进行中商机：谈判、提案、需求分析、资格审查、寻找客户'], 2.85);
  notes(s, '演示环境里是一家叫华软股份的软件公司一年的业务：14 家客户横跨制造、金融、医药、物流、能源、教育；14 条线索从新建到未通过都有；13 个商机每个阶段都有，5 赢 1 丢；6 份合同、8 个售前 Bizcase、7 个交付项目，每个项目都带一份有版本的成本计划，还有它们的工时、出差、请假、开票、收款。意思是各位待会儿看到的每张列表、每个仪表板都有数，讲到哪里都可以随手点开。');
}

// 8 · dashboards overview
{
  const s = slide('数据到了仪表板：销售业绩与项目健康度', '步骤 37–39');
  bullets(s, [
    '销售业绩：本季度已成交 7,150,000、赢率 83%（5 赢 1 丢）、阶段管道分布、月度收入趋势——标准仪表板，数据一到就有',
    '项目财务：合同额合计 10,650,000、已开票 5,120,000、已收款 4,035,000、采购合同 990,000',
    '交付项目列表一眼看出健康度：北辰二期 47.65%、长江 DMS 16.85%、天启 TMS 已关闭 77.21%、华信数据中台 132%（超支）',
  ], M, 1.45, CW, 1.3, { fontSize: 12.5, gap: 5 });
  pair(s, 2.9, ['R4-33-销售业绩仪表板', '销售业绩仪表板'], ['R4-16-交付项目列表', '交付项目：预算基线、实际成本、预算消耗']);
  notes(s, '数据一多，仪表板自然就成型。左边是标准的销售业绩仪表板：本季度已成交 715 万、赢率 83%、阶段分布、月度收入趋势——这些都是平台原生的，数据一到就有。右边是交付项目列表，健康度一眼看出：北辰二期消耗 47.65%、长江 DMS 刚开始 16.85%、天启 TMS 已关闭 77.21%，华信数据中台 132% 是超支的那个，后面成本管控环节会用到它。');
}

// ═══════════════════════════════════════════════════════════════════════════
// 9 · section — CRM
{
  const s = section('01', '第一部分 · CRM', '客户 · 线索 · 商机 · 跟进', '贵司需求表步骤 1–14：录入、审批、立项、跟单', [0, 1, 2, 3]);
  notes(s, '第一部分是 CRM 侧的 14 步：客户管理、线索管理、商机立项、商机跟进。这一段大多是标准 CRM 能力加贵司要的字段和审批，重点看三处系统拦截和审批的手势。');
}

// 10 · 客户管理
{
  const s = slide('客户管理：分类、业务信息、附件、审批', '步骤 1–5');
  lead(s, '录入即分类，分类即规则', M, 1.5, 4.6);
  bullets(s, [
    '客户编码自动分配；客户分类（常规销售客户 / 招标代理公司 / 其他）、客户简称、统一社会信用代码',
    '业务信息分组：当前主要服务商、本年度 IT 采购预算、付款周期、美国 EAR 管制清单、战略合作伙伴',
    '联系人：性别、角色（决策者 / 影响者 / 采购…）、对我司态度、与销售关系强度',
    '附件页签直接上传资质与合作背景资料',
    '记录页顶部「发起审批」→ 记录锁定 → 通过后正式生效，才能关联商机与项目',
  ], M, 2.0, 4.6, 4.6, { fontSize: 12.5, gap: 8 });
  shot(s, 'S01b-客户详情-基本信息', 5.5, 1.5, 7.23, '客户详情：客户分类、客户简称、统一社会信用代码');
  notes(s, '进入第一个环节，步骤 1 到 5。此时切到系统，打开华信科技这家客户。客户编码自动分配；基本信息里有贵司要的客户分类、客户简称、统一社会信用代码。往下是业务信息分组：当前主要服务商、本年度 IT 采购预算、付款周期、美国 EAR 管制清单、战略合作伙伴。联系人多了性别、角色、对我司态度、与销售关系强度四个字段。附件页签直接拖资料进来。客户点「发起审批」后记录锁定，通过后才正式生效——审批怎么发起，第 14 页专门讲。');
}

// 11 · 线索到商机
{
  const s = slide('线索到商机：需求形线索、跟单信息、立项审批', '步骤 6–11');
  bullets(s, [
    '线索：预计金额、需求类型（软件开发 / 实施 / 运维 / 咨询），审批通过后才能转成商机',
    '商机编码 OPP-xxxx 自动编号，是项管平台关联的锚点；跟单信息：是否投标、商机级别、优先级、可控性、客户立项时间、预计招标时间、分包信息',
    '签约主体（独立主数据）、业务分类、收入确认类型；客户简介 / 项目背景 / 风险分析 / 付款条款按结构写在背景说明里',
    '「发起立项审批」独立于标准产品按金额分档的审批；立项通过后才允许更新阶段、投标、赢丢单',
  ], M, 1.45, CW, 1.45, { fontSize: 12.5, gap: 5 });
  pair(s, 3.0, ['S06c-线索-预计金额与需求类型', '线索：需求类型、预计金额、审批状态'], ['R2-06-商机-招投标与签约主体', '商机：跟单信息与签约主体']);
  notes(s, '步骤 6 到 11。线索是「需求形」的：预计金额、需求类型是贵司要的，审批通过后才转商机。商机上最重要的是商机编码——它是项管平台关联的锚点。跟单信息里有是否投标、商机级别、优先级、可控性、客户立项时间、预计招标时间、分包信息；签约主体是独立主数据，业务分类、收入确认类型都在。客户简介、项目背景、风险、付款条款按结构写在背景说明里。「发起立项审批」独立于标准产品按金额分档的审批，立项通过后才允许更新阶段、投标和赢丢单。');
}

// 12 · gates ①③
{
  const s = slide('系统拦截：招标代理与 EAR 客户不能发起商机', '步骤 1 备注 · 步骤 3');
  bullets(s, [
    '招标代理及其他类客户仅可用于付款回款——新建商机时系统读取客户分类，直接拒绝并说明原因',
    'EAR 管制清单：机器比对命中记为"疑似"，只提示不阻断；人工确认在列后，商机被拦截——机器不拦人，人拍板才拦',
    '两条规则都是跨对象的门禁：读的是客户上的数据，作用在商机上；存量数据不受影响',
  ], M, 1.45, CW, 1.2, { fontSize: 12.5, gap: 5 });
  pair(s, 2.8, ['S01d-拦截-招标代理不可发起商机', '拦截 ①：招标代理客户'], ['R2-23-拦截-EAR确认在列不能发起商机', '拦截 ③：EAR 人工确认在列']);
  notes(s, '这页是两条规则由系统执行的样子。现场演示：新建商机，所属客户选中招国际——招标代理公司——点创建，系统直接拒绝，提示写明「仅可用于付款回款，无法发起商机」。第二条是 EAR：机器比对命中只记为「疑似」，只提示不阻断；把东方联合银行改成「人工确认在列」再建商机，就被拦下。一句话：机器不拦人，人拍板才拦。两条规则读的是客户上的数据，作用在商机上，存量数据不受影响。');
}

// 13 · approval center
{
  const s = slide('一个审批中心：十条流程，一个收件箱', '步骤 5 · 7 · 11 · 20 · 26 · 32 · 34');
  bullets(s, [
    '发起的手势统一：记录页顶部「发起审批」→ 确认；审批状态只读，不能手改；记录随即锁定并显示"审批中"',
    '处理的手势统一：待我审批 → 勾选 → 通过 N 条 → 确认；通过后回写状态与审批时间，并通知负责人；转签、退回、催办、撤回都在同一个面板',
    '十条流程：客户 · 线索 · 商机立项 · 售前立项 · 交付立项 · 成本计划 · 预算调整 · 工时 · 出差 · 请假——收件箱里每一行都写着记录和金额',
  ], M, 1.45, CW, 1.25, { fontSize: 12.5, gap: 5 });
  pair(s, 2.85, ['R4-35-待我审批-成本计划与预算调整', '待我审批：成本计划审批与预算调整审批在同一个收件箱'], ['S05-07-11c-勾选后批量通过', '勾选后批量通过']);
  notes(s, '所有审批的手势都一样。发起：记录页顶部点「发起审批」、确认。处理：我的工作 → 待我审批，勾选，通过 N 条，确认；通过后系统回写状态和审批时间，并通知负责人。转签、退回修改、退回补充、催办、撤回都在同一个面板。今天十条流程——客户、线索、商机立项、售前立项、交付立项、成本计划、预算调整、工时、出差、请假——全在这一个收件箱里；左图就是成本计划审批和预算调整审批并排等着处理，每一行都写着记录和金额。生产上按贵司组织层级扩成多级。');
}

// 14 · the submit button
{
  const s = slide('发起审批是一个按钮，不是一次编辑', '步骤 5 · 7 · 11 · 20 · 26 · 32 · 34');
  bullets(s, [
    '每个可审批对象的记录页都有「发起审批」（商机是「发起立项审批」）；只在草稿或已驳回时出现，点击后确认即提交',
    '审批状态、审批通过时间是只读字段：表单里看得到、改不了，状态只由按钮和审批流写',
    '提交后记录锁定、显示"审批中"，审批人在同一条记录上通过 / 拒绝 / 退回；驳回后按钮重新出现，修改后再发起',
  ], M, 1.45, CW, 1.2, { fontSize: 12.5, gap: 5 });
  trio(s, 2.8, [['S05-客户-发起审批', '记录页顶部的「发起审批」'], ['S05-客户-发起审批-确认', '确认后提交'], ['S05-客户提交审批-审批中', '审批中已锁定']]);
  para(s, '编辑表单里的审批状态是灰色只读——想改状态，只有这个按钮一条路。', M, 5.75, CW, 0.4, { size: 12.5, color: C.ink, bold: true });
  notes(s, '这一页回应贵司上次的反馈：审批的发起应该是一个按钮，而不是编辑记录去改状态。现在每个可审批对象的记录页顶部都有「发起审批」，商机上叫「发起立项审批」；按钮只在草稿或已驳回时出现，点了弹确认框，确认后记录立刻锁定、显示审批中。审批状态和审批通过时间是只读字段——表单里看得到、改不了，只由按钮和审批流来写。驳回后按钮重新出现，改完再发起。');
}

// 15 · approval swimlane (native)
{
  const s = slide('审批：一个按钮发起，一个收件箱处理', '十条流程 · 同一套手势');
  const lanes = [['发起人', C.navySoft, C.navy2], ['系统', C.paper, C.muted], ['审批人', C.greenSoft, C.green]];
  const y0 = 1.45, lh = 1.2, gap = 0.08, lx = M + 1.15, lw = CW - 1.15, bw = 2.05, bh = 0.8;
  lanes.forEach((l, i) => {
    const y = y0 + i * (lh + gap);
    s.addShape(pres.shapes.RECTANGLE, { x: M, y, w: 1.05, h: lh, fill: { color: l[2] }, line: { color: C.white } });
    s.addText(l[0], { x: M, y, w: 1.05, h: lh, fontFace: F, fontSize: 12, bold: true, color: C.white, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: lx, y, w: lw, h: lh, fill: { color: l[1] }, line: { color: C.white } });
  });
  const cx = (i) => lx + 0.2 + i * 2.15, by = (i) => y0 + i * (lh + gap) + (lh - bh) / 2, mid = (i) => by(i) + bh / 2;
  const B = (lane, col, txt, fill, color) => box(s, txt, cx(col), by(lane), bw, bh, fill, color, 11);
  B(0, 0, ['打开记录', '草稿或已驳回'], C.navy2, C.white); B(0, 1, ['点「发起审批」', '商机：发起立项审批'], C.navy2, C.white); B(0, 2, ['确认提交', '记录锁定 · 审批中'], C.navy2, C.white); B(0, 4, ['收到通知', '通过 / 驳回'], C.navy2, C.white);
  B(1, 2, ['状态 → 已提交', '记录锁定'], C.white, C.ink); B(1, 3, ['生成审批请求', '路由到审批人'], C.white, C.ink); B(1, 4, ['回写状态与日期', '解锁记录 · 通知负责人'], C.white, C.ink);
  B(2, 3, ['待我审批', '勾选 · 通过 N 条'], C.green, C.white); box(s, '通过', cx(4), by(2), 0.95, bh, C.green, C.white, 12); box(s, '拒绝', cx(4) + 1.1, by(2), 0.95, bh, C.red, C.white, 12);
  arrow(s, cx(0) + bw, mid(0), cx(1), mid(0)); arrow(s, cx(1) + bw, mid(0), cx(2), mid(0));
  arrow(s, cx(2) + bw / 2, by(0) + bh, cx(2) + bw / 2, by(1)); arrow(s, cx(2) + bw, mid(1), cx(3), mid(1));
  arrow(s, cx(3) + bw / 2, by(1) + bh, cx(3) + bw / 2, by(2)); arrow(s, cx(3) + bw, mid(2), cx(4), mid(2));
  arrow(s, cx(4) + bw / 2, by(2), cx(4) + bw / 2, by(1) + bh); arrow(s, cx(4) + bw / 2, by(1), cx(4) + bw / 2, by(0) + bh);
  chip(s, '驳回：修改后再次发起', cx(3), by(0) + 0.18, bw, C.white, C.navy2, 0.44, 10.5);
  arrow(s, cx(4), mid(0), cx(3) + bw, mid(0), { dash: true, color: C.navy2 });
  card(s, M, 5.4, CW, 1.4, C.paper, { line: C.line });
  para(s, '两条设计原则：① 审批状态字段只读——表单改不了，接口也写不进，只有这个按钮和审批流能改它，所以"状态"永远等于"审批结果"。② 十条流程共用同一个审批中心和同一套手势：发起 = 按钮 + 确认；处理 = 待我审批 → 勾选 → 通过 N 条。审批期间记录锁定，通过后回写审批日期，驳回后可修改再提。', M + 0.25, 5.52, CW - 0.5, 1.2, { size: 12, color: C.ink });
  notes(s, '这页把审批画成三条泳道：发起人、系统、审批人。发起人只做三件事——打开记录、点「发起审批」、确认；商机上这个按钮叫「发起立项审批」。系统把状态置为已提交、锁定记录、生成审批请求并路由到审批人。审批人在待我审批里勾选、通过 N 条或拒绝。系统随后回写审批状态与审批日期、解锁记录、通知负责人；驳回的记录可以修改后再次发起。要强调两条原则：第一，审批状态字段是只读的，表单和接口都改不了，只有按钮和审批流能改它，所以状态永远等于审批结果，不会出现"手工改成已通过"的漏洞；第二，十条流程共用一个审批中心、一套手势，审批人不需要学十种操作。');
}

// 16 · 商机跟进与铁三角
{
  const s = slide('商机跟进：阶段、任务、活动时间线与铁三角', '步骤 12–14');
  lead(s, '跟进不靠记忆', M, 1.5, 4.6);
  bullets(s, [
    '阶段条直接推进阶段，赢单概率、预计金额随时改；每次变更自动写入活动时间线',
    '待办任务与活动（现场调研、方案汇报、投标答疑）挂在商机上，右侧任务卡常驻',
    '铁三角：客户经理（AR）、解决方案经理（SR）、交付经理（FR）三个角色就地调整',
    '赢单 / 丢单必须填原因：赢单原因、丢单原因、赢丢单详情',
    { text: '步骤 14 商机状态变更审批：未实现——赢单 / 弃单 / 铁三角调整今天不单独走审批，待贵司确认是否需要', color: C.amberDeep, bold: true },
    '生产形态：铁三角做成商机团队对象 + 记录级共享，团队成员自动获得可见性',
  ], M, 2.0, 4.6, 4.7, { fontSize: 12, gap: 7 });
  shot(s, 'S13-铁三角', 5.5, 1.5, 7.23, '商机详情：铁三角与赢单 / 输单分组');
  notes(s, '步骤 12 到 14。跟进不靠记忆：阶段条直接推进阶段，每次变更自动写进活动时间线；待办任务和活动挂在商机上，右侧任务卡常驻。铁三角——客户经理、解决方案经理、交付经理——三个角色就地调整。赢单、丢单必须填原因。北辰 MES 二期是已成交商机，赢单原因是客户关系。步骤 14 的状态变更审批今天没有做：赢单、弃单、调整铁三角不单独走审批，立项审批已经管住了最关键的那一步，要不要再加一道，请贵司定。生产形态下铁三角会做成商机团队对象加记录级共享，团队成员自动获得可见性。');
}

// 17 · section — 项管平台
{
  const s = section('02', '第二部分 · 项管平台', '售前 · 交付 · 成本计划 · 成本执行 · 报表', '贵司需求表步骤 15–40：立项、成本计划、成本执行与管控、项目报表', [4, 5, 6, 7, 8]);
  notes(s, '第二部分是项管平台侧的 26 步，也是本次新增的部分：售前立项、交付立项、成本计划、成本执行、项目报表。每一步都读 CRM 的商机，这是把它们放在同一个平台上的原因。这一部分和上次最大的不同在成本计划：不再是几行简化的成本计划行，而是带版本、四类明细、按月分解的完整形态。');
}

// 18 · 售前立项
{
  const s = slide('售前立项：关联商机、角色、Bizcase 成本计划、审批', '步骤 15–20');
  bullets(s, [
    '售前项目必须挂在已立项的商机上（选商机编码），所属客户随之带出；编号 PSP-xxxx；五个角色：客户经理、项目经理、项目总监、项目 QA、资源报价负责人',
    '成本测算不再手填：人工服务成本、第三方服务成本、软硬件采购成本、项目费用四个数是 Bizcase 成本计划的汇总——华信这单 656,000 + 250,000 + 100,000 + 48,320 = 总成本 1,054,320',
    '项目报价 1,400,000 一填，毛利率 24.69% 自动算；改 Bizcase 里任何一条明细，四项成本、总成本、毛利率当场跟着变',
    '信息安全类别（公开 / 内部 / 秘密 / 机密）与安全备注；审批通过后才能立交付项目——今天一级审批，生产上按组织层级走五级（部分实现）',
  ], M, 1.45, CW, 1.55, { fontSize: 12.5, gap: 5 });
  pair(s, 3.1, ['R4-02-售前项目-成本测算与报价-来自Bizcase计划', '售前项目：四项成本来自 Bizcase 成本计划，总成本与毛利率自动算'], ['R4-04-Bizcase成本计划-计划金额', 'Bizcase 成本计划：四类合计与其中差旅']);
  notes(s, '进入项管平台，步骤 15 到 20。售前项目必须挂在已立项的商机上，选商机编码，客户随之带出，编号 PSP。五个角色齐全。和上次不一样的是成本测算：四项成本不再是手填的四个数，而是这个售前项目下 Bizcase 成本计划的汇总——人工服务 65.6 万、第三方服务 25 万、软硬件采购 10 万、项目费用 4.8 万，总成本 105.4 万；报价 140 万，毛利率 24.69% 自动算出来。现场可以打开 Bizcase 计划改任何一条明细，回到售前项目，四项成本、总成本、毛利率都跟着变，这是汇总和公式，不是报表。信息安全类别和安全备注在下面。审批通过后才能立交付项目——今天演示一级审批，五级路由留到生产配置，所以这一步算部分实现。');
}

// 19 · 交付立项
{
  const s = slide('交付立项：关联售前、导入 Bizcase 预算、审批', '步骤 21–26');
  bullets(s, [
    '交付项目必须选一个已审批的售前项目，关联商机、所属客户自动带出；编号 DLV-xxxx',
    '预算基线默认取售前 Bizcase 总额；页头「导入 Bizcase 预算」一键把已审批的 Bizcase 克隆成交付成本计划 v1 并冻结基线——之后基线不可改，已有计划的项目会拒绝第二次导入',
    '实施成本中心、核算成本中心、对应部门可以不同（试点项目：实施华东、核算华北）；角色：项目经理、项目总监、资源报价负责人、分包 TS 填写人、QA 负责人',
    '信息安全类别、附件上传开工确认单；交付立项审批通过后项目正式启动，成本计划、工时、差旅、开票、收款都挂在它下面',
  ], M, 1.45, CW, 1.55, { fontSize: 12.5, gap: 5 });
  pair(s, 3.1, ['R4-12-交付项目-页头-导入Bizcase预算按钮', '交付项目页头：「导入 Bizcase 预算」、预算基线、实际成本、预算消耗'], ['S23-成本中心与部门', '成本中心与部门、项目角色']);
  notes(s, '步骤 21 到 26。交付项目必须选一个已审批的售前项目，商机和客户自动带出。预算基线默认取售前 Bizcase 的总额；真正把它定下来的是页头这个「导入 Bizcase 预算」按钮：点一下，已审批的 Bizcase 被整套克隆成交付成本计划第 1 版，基线同时冻结——之后谁也改不了基线，已经有计划的项目再点会被拒绝。实施成本中心、核算成本中心、对应部门可以不同——试点项目就是实施华东、核算华北。角色、信息安全、附件都在。页头的基线、实际成本、预算消耗三个数字是平台汇总的，不用人算。');
}

// 20 · cost plan: three layers
{
  const s = slide('成本计划：一个版本、四类明细、按月分解', '步骤 27–31');
  const L = [
    ['成本计划（一个版本）', '挂在售前项目（Bizcase）或交付项目上；版本号、当前版本、冻结基线；计划总额和四类合计全部是汇总，没有一个是手填的', C.amber, C.white],
    ['四类明细行', '人工服务 · 第三方服务 · 软硬件采购 · 项目费用——每一类有自己的输入项和单价来源，各带说明、起止月份、计划金额', C.amberSoft, C.ink],
    ['月度分解行', '保存一条明细行，系统按起止月份自动生成"一行一个月"的台账；改过的月份标为手工调整、重新分解时保留；所有合计和报表都读这张台账', C.ice, C.ink],
  ];
  L.forEach((l, i) => {
    const y = 1.5 + i * 1.65;
    card(s, M, y, 5.0, 1.4, l[2]);
    s.addText(l[0], { x: M + 0.25, y: y + 0.12, w: 4.5, h: 0.4, fontFace: F, fontSize: 14.5, bold: true, color: l[3], isTextBox: true, margin: 0 });
    s.addText(l[1], { x: M + 0.25, y: y + 0.52, w: 4.5, h: 0.85, fontFace: F, fontSize: 10.5, color: l[3], isTextBox: true, margin: 0, valign: 'top' });
    if (i < 2) arrow(s, M + 2.5, y + 1.42, M + 2.5, y + 1.63, { color: C.amberDeep, width: 1.5 });
  });
  chip(s, '每个项目一份带版本的计划：Bizcase v1 · 交付 v1 · v2 …', M, 6.5, 5.0, C.paper, C.muted, 0.36, 10);
  shot(s, 'R4-08-交付成本计划v1-相关-月度分解行', 5.9, 1.5, 6.83, '交付成本计划 v1：月度分解行按成本类别、月份、金额逐行可查，改过的月份标"手工调整"');
  notes(s, '步骤 27 到 31，成本计划是这一版最大的变化，三层。最上面是成本计划本身，它是"一个版本"：挂在售前项目上就是 Bizcase，挂在交付项目上就是交付计划；有版本号、当前版本、冻结基线；计划总额和人工、第三方、采购、费用四类合计全是汇总出来的，没有一个是手填的。中间是四类明细行，贵司需求表里四个配置界面对应四个对象，因为四类成本的算法和单价来源各不相同，下一页展开。最底下是月度分解行：保存一条明细行，系统按起止月份自动生成一行一个月的台账，右边截图就是华信一期交付计划的台账——成本类别、月份、金额逐行可查；改过某个月，它就标成手工调整，重新分解也不会覆盖。所有合计、售前项目的四项成本、交付项目的计划总额、项目成本仪表板，读的都是这张台账。');
}

// 21 · four line families
{
  const s = slide('四类成本各有自己的算法与单价来源，系统按月分解', '步骤 28–31');
  table(s, ['明细行', '填什么', '单价从哪里来', '每个月怎么算'], [
    ['人工服务成本行', '岗位级别 / 费率卡、人数、每人每月工时、起止月份', '费率卡：费率标准自动带出（不能手填），并按每个月生效的费率重新解析', '人数 × 工时 × 当月费率'],
    ['第三方服务成本行', '供应商、计价方式（人月 / 人天 / 包干）、单价、人数、工期', '供应商报价（手填），报价文件作为附件挂在计划上', '人月：单价 × 人数逐月；人天 / 包干：平均摊到各月'],
    ['软硬件采购成本行', '采购品类（硬件 / 软件许可 / 云服务 / 维保）、产品、数量、单价、到货月份', '选了产品，单价从产品价目带出；否则手填', '一次性落在到货月；填了结束月份则平均分摊'],
    ['项目费用成本行', '费用类型；差旅填差旅标准、出差次数、每次人数、每次天数；报销类填预算金额', '差旅标准：住宿、餐补、市内交通日标准 + 往返交通', '出差次数 × 每次人数 ×（往返交通 + 天数 × 日标准）'],
  ], M, 1.45, 7.35, [1.45, 2.2, 2.05, 1.65], { rowH: 0.98, fontSize: 9.5 });
  shot(s, 'R4-10-人工服务成本行-费率卡带出费率', 8.25, 1.45, 4.48, '人工服务成本行：费率标准 800 由费率卡带出');
  card(s, 8.25, 4.85, 4.48, 1.85, C.amberSoft);
  s.addText([
    { text: '现场算一遍', options: { bold: true, fontSize: 12, color: C.amberDeep, breakLine: true, fontFace: F } },
    { text: '高级工程师 × 2 · 每人每月 160 小时 · 费率 800 元\n每月 2 × 160 × 800 = 256,000\n8 月、9 月两行 → 计划金额 512,000\n改人数或月份，各月金额与计划总额当场重算', options: { fontSize: 10.5, color: C.ink, fontFace: F } },
  ], { x: 8.45, y: 4.95, w: 4.1, h: 1.65, isTextBox: true, margin: 0, valign: 'top' });
  notes(s, '四类明细行为什么是四个对象——因为四类成本的算法和单价来源各不相同。人工服务：填岗位级别、人数、每人每月工时和起止月份，费率标准从费率卡自动带出、不能手填，而且每个月按当月生效的费率解析，项目中途调整费率卡，后面的月份自动按新费率算。第三方服务：供应商报价手填，计价方式人月、人天或包干，人月是单价乘人数逐月落，人天和包干平均摊。软硬件采购：品类、数量、单价，选了产品单价从价目带出，一次性采购落在到货月，维保或订阅填了结束月份就平均分摊。项目费用：差旅按差旅标准算——出差次数乘每次人数，乘往返交通加天数乘日标准；会议、培训这些报销类直接填预算金额。右边现场算一遍：高级工程师两人、每人每月 160 小时、费率 800，每月 25.6 万，8、9 两个月就是 51.2 万；改人数或月份，各月金额和计划总额当场重算。');
}

// 22 · step 27 import + step 32 versions
{
  const s = slide('预算变动做成「新版本 + 审批」，基线永远冻结', '步骤 27 · 32');
  bullets(s, [
    '步骤 27：交付项目页头「导入 Bizcase 预算」→ 以已审批的 Bizcase 克隆出交付成本计划 v1，基线冻结；已有计划的项目会拒绝第二次导入',
    '步骤 32：已审批的计划不能改——在成本计划上「新建计划版本」得到 v2 草稿，在 v2 上增减明细行（华信一期：追加高级工程师 1 人 × 2 个月、两次现场差旅，共 270,160）',
    '预算调整挂在 v2 上：调整金额由系统按"新版本总额 − 当前版本总额"写入，填调整原因与差异分析，「发起审批」',
    { text: '审批通过后 v2 成为当前版本、v1 标为已作废，交付项目的计划总额跟着变成 1,324,480；交付项目上「当前预算」的自动上调正在收尾——部分实现（手填金额的预算调整已正常联动）', color: C.amberDeep, bold: true },
  ], M, 1.45, CW, 1.65, { fontSize: 12, gap: 5 });
  pair(s, 3.2, ['R4-20-成本计划-新建计划版本-确认', '「新建计划版本」：以当前版本为底稿克隆一个草稿版本'], ['R4-28-预算调整-挂计划版本-金额自动', '预算调整挂在 v2 上：调整金额 270,160 由系统按版本总额之差写入'], 3.35);
  notes(s, '步骤 27 和 32 放在一起讲，因为它们是同一件事的两头。27 是起点：交付项目页头点「导入 Bizcase 预算」，已审批的 Bizcase 整套克隆成交付计划第 1 版，基线冻结，之后基线永远不变，考核就有了尺子。32 是变动：已审批的计划不能改，要变就在成本计划上点「新建计划版本」，得到 v2 草稿——左图是那个确认框。在 v2 上增减明细，华信一期追加了高级工程师一人两个月和两次现场差旅，一共 27 万。然后建一条预算调整挂在 v2 上：右图，调整金额 270,160 不是人填的，是系统按新版本总额减当前版本总额写进去的；填原因和差异分析，发起审批。通过之后 v2 成为当前版本、v1 作废，交付项目的计划总额跟着变成 132.4 万。这里要如实说一句：交付项目上「当前预算」这个数的自动上调还在收尾，所以这一步我们写的是部分实现；手填金额的预算调整审批通过后，当前预算是正常上调的。');
}

// 23 · what the approver sees
{
  const s = slide('审批一份成本计划，审的是差异，不是一个孤立的数字', '步骤 32');
  bullets(s, [
    '发起审批那一刻，系统记下同一项目正在执行的版本，把它的各项金额抄到被提交的计划上：冻结基线、计划总额、四类合计、其中差旅',
    '每一项都给出"本版本 / 当前执行版本 / 差异"三个数，计划总额还给出差异率：华信一期 v2 比 v1 多 270,160，差异率 25.62%，全部来自人工服务和差旅',
    '差异由这一对金额算出，永远不会和上面的数字对不上；快照取在提交那一刻，记录就是"当时摆在审批人面前的是什么"',
    '「待审批的成本计划」视图把在审的计划铺成一个队列，每类成本的差异都在行上，领导不用逐份打开就能排轻重缓急',
  ], M, 1.45, CW, 1.55, { fontSize: 12.5, gap: 5 });
  pair(s, 3.1, ['R4-27-成本计划v2-与当前版本对比', '成本计划 v2「与当前版本对比」：本版本 / 当前执行版本 / 差异'], ['R4-30-待审批的成本计划', '「待审批的成本计划」：在审的版本一行一个，差异都在行上']);
  notes(s, '领导审一份成本计划，真正要判断的是这一版和项目当下正在执行的那一版差在哪里。所以发起审批那一刻，系统记下同一项目正在执行的版本，把它的各项金额抄到被提交的计划上——冻结基线、计划总额、四类合计、其中差旅，每一项给出本版本、当前执行版本、差异三个数，计划总额还给差异率。左图：华信一期 v2 比 v1 多 27 万，差异率 25.62%，全部来自人工服务和差旅，第三方和采购差异为零。差异由这一对金额算出，永远不会和上面的数对不上；快照取在提交那一刻，也正是明细行和月份被冻结的那一刻，记录就是"当时摆在审批人面前的是什么"。右图是「待审批的成本计划」视图，在审的版本一行一个，差异都在行上，领导不用逐份打开就能排轻重缓急。项目的第一份计划没有可比对象，差异就是全额新增。');
}

// 24 · cost loop diagram (native)
{
  const s = slide('成本闭环：从 Bizcase 到预算门禁', '步骤 18 · 27–36');
  const bw = 2.75, bh = 0.92, X = (i) => M + i * 3.12, Y = [1.5, 3.02, 4.54];
  const P = (r, c, txt, fill, color) => box(s, txt, X(c), Y[r], bw, bh, fill, color, 11.5);
  P(0, 0, ['Bizcase 成本计划', '四类明细 · 报价 → 毛利率'], C.amber, C.white);
  P(0, 1, ['导入 Bizcase 预算', '交付成本计划 v1 · 冻结基线'], C.amber, C.white);
  P(0, 2, ['月度分解行', '一行一个月 · 费率逐月解析'], C.amber, C.white);
  P(0, 3, ['计划总额', '= Σ 各月金额，自动汇总'], C.amber, C.white);
  P(1, 0, ['工时表', '工时 × 费率 · 只计已审批'], C.navy2, C.white);
  P(1, 1, ['差旅成本', '必须挂已审批的出差单'], C.navy2, C.white);
  P(1, 2, ['实际成本', '= 人工实际 + 差旅实际'], C.navy2, C.white);
  P(1, 3, ['预算消耗 %', '= 实际成本 ÷ 当前预算'], C.navy2, C.white);
  P(2, 3, ['实际 ≥ 当前预算？', '每次填报工时时比较'], C.redSoft, C.red);
  P(2, 2, ['拦截 ②', '拒绝新的工时填报，提示写明数字'], C.red, C.white);
  P(2, 1, ['新建计划版本 → 预算调整', '金额 = 新版本 − 当前版本 · 发起审批'], C.amberSoft, C.ink);
  P(2, 0, ['审批通过', '新版本生效 · 旧版作废 · 计划总额跟随'], C.green, C.white);
  const mid = (r) => Y[r] + bh / 2;
  arrow(s, X(0) + bw, mid(0), X(1), mid(0)); arrow(s, X(1) + bw, mid(0), X(2), mid(0)); arrow(s, X(2) + bw, mid(0), X(3), mid(0));
  arrow(s, X(0) + bw, mid(1), X(1), mid(1)); arrow(s, X(1) + bw, mid(1), X(2), mid(1)); arrow(s, X(2) + bw, mid(1), X(3), mid(1));
  arrow(s, X(3) + bw / 2, Y[1] + bh, X(3) + bw / 2, Y[2]);
  arrow(s, X(3), mid(2), X(2) + bw, mid(2), { color: C.red }); arrow(s, X(2), mid(2), X(1) + bw, mid(2)); arrow(s, X(1), mid(2), X(0) + bw, mid(2));
  chip(s, '是', X(3) - 0.42, mid(2) - 0.16, 0.34, C.red, C.white, 0.3, 9); chip(s, '否 → 继续执行', X(3) + 0.6, Y[2] + bh + 0.12, 1.55, C.greenSoft, C.green, 0.3, 9.5);
  chip(s, '冻结基线 = 考核的尺子，之后不动', X(1) + 0.2, Y[0] + bh + 0.16, bw - 0.4, C.amberSoft, C.amberDeep, 0.28, 9);
  card(s, M, 5.8, CW, 0.95, C.paper, { line: C.line });
  para(s, '步骤 36 的现场提示：项目「华信数据中台 — 试点交付」成本已超预算（实际 264,000 ≥ 预算 200,000），工时填报已限制。整个闭环没有一步是月底对账，都是保存那一刻算的。* 版本化调整通过后「当前预算」的自动上调正在收尾；手填金额的预算调整已联动。', M + 0.25, 5.9, CW - 0.5, 0.8, { size: 11.5, color: C.ink });
  notes(s, '成本闭环一共三段。第一段是计划：Bizcase 成本计划在交付立项时通过「导入 Bizcase 预算」成为交付计划第 1 版，基线冻结——这把尺子之后不动；明细按月分解，计划总额自动汇总。第二段是执行：工时表用工时乘费率算人工成本，只有审批通过的才计入；差旅成本必须挂在审批通过的出差申请上；两者相加是实际成本，除以当前预算是预算消耗。第三段是控制：系统在每次填报工时时比较实际和当前预算，超过就拒绝，这就是步骤 36 现场会看到的那条提示；出路是新建计划版本、走预算调整审批，通过后新版本生效、旧版作废，计划总额跟着新版本走，填报自动放开。整个闭环没有一步是月底对账，都是保存时计算。当前预算那一个数的联动还在收尾，我在上一页说过了。');
}

// ═══════════════════════════════════════════════════════════════════════════
// 25 · 成本执行
{
  const s = slide('成本执行：工时、请假、出差与差旅', '步骤 33–35');
  bullets(s, [
    '工时表：选岗位级别 / 费率卡，费率标准自动带出、不能手填；工时 × 费率 = 人工成本；标准工时 / 请假工时 / 加班工时三个数',
    '请假申请审批通过后自动同步到申请人当月工时表：王强 3 天年假 → 请假工时 24、工时 176 → 152、人工成本 136,800（项目经理 900 元 / 小时）；加班工时目前手填（部分实现）',
    '出差申请：目的地、起止日期（天数自动算）、事由、预计费用、审批；差旅成本关联出差单后自动带出项目、出差人、日期，实际费用汇总回出差单',
    '交付项目不再是工时表的必填项——售前工时、考勤工时也能填；人工实际成本只计已审批的工时表',
  ], M, 1.45, CW, 1.6, { fontSize: 12.5, gap: 5 });
  pair(s, 3.15, ['R4-41-工时表-请假同步-费率带出', '工时表 TS-0007：请假工时 24、工时 152、人工成本 136,800'], ['R2-18-出差申请', '出差申请：天数、预计费用、实际费用汇总']);
  notes(s, '步骤 33 到 35。工时表选岗位级别，费率标准自动从费率卡带出，不能手填；工时乘费率就是人工成本，还有标准工时、请假工时、加班工时三个数。贵司写的「请假、加班申请同步后自动更新」，请假这一半做了：王强 3 天年假审批通过后，他当月工时表的请假工时自动变 24，工时 176 变 152，成本重算成 136,800；加班工时目前还是手填，所以这一步算部分实现。出差申请有目的地、起止日期、事由、预计费用，差旅成本关联出差单后自动带出项目、出差人、日期，实际费用汇总回出差单。工时表不再要求必须挂交付项目，售前工时也能填；人工实际成本只计已审批的工时表。');
}

// 26 · 成本管控
{
  const s = slide('成本管控：实时汇总，超预算即拦截', '步骤 36');
  lead(s, '系统盯着预算，而不是月底对账', M, 1.5, 4.6);
  bullets(s, [
    '交付项目实时汇总人工实际成本、差旅实际成本 → 实际成本、预算消耗 %、预算差异',
    '试点项目：基线 200,000，实际 264,000，预算消耗 132%',
    '拦截 ②：实际成本 ≥ 当前预算的项目，系统拒绝新的工时填报，并把数字写在提示里',
    '拦截 ④：出差申请未审批通过，不能登记差旅成本',
    '预算追加走"新建计划版本 + 预算调整审批"，通过后填报自动放开',
  ], M, 2.0, 4.6, 4.6, { fontSize: 12.5, gap: 8 });
  shot(s, 'S36-试点项目-超预算132', 5.5, 1.5, 7.23, '超预算项目：预算消耗 132%');
  notes(s, '步骤 36。系统盯着预算，而不是月底对账：交付项目实时汇总人工实际和差旅实际，得出实际成本、预算消耗、预算差异。试点项目基线 20 万，实际 26.4 万，消耗 132%。对这样的项目，拦截②：新填工时被拒，并把数字写在提示里；拦截④：出差没审批通过，差旅成本登记不了。预算追加走新建计划版本加预算调整审批，通过后填报自动放开。');
}

// 27 · two cost-side gates
{
  const s = slide('两处成本侧拦截', '步骤 35 · 36');
  pair(s, 1.55, ['S36b-拦截-超预算禁填工时', '拦截 ②：项目成本已超预算，工时填报已限制'], ['R2-22-拦截-出差未审批不能报差旅', '拦截 ④：出差申请尚未审批通过，不能登记差旅成本']);
  card(s, M, 5.6, CW, 1.05, C.paper, { line: C.line });
  para(s, '两条提示都是系统在保存那一刻给出的，写明项目、实际与预算的数字或未审批的出差单；换一个健康项目或已审批的出差单即可保存。', M + 0.25, 5.75, CW - 0.5, 0.8, { size: 12.5, color: C.ink });
  notes(s, '两张截图就是现场会看到的提示。左边：新建工时表选试点项目，系统写明「实际 264,000 大于等于预算 200,000，工时填报已限制」。右边：差旅成本关联一张草稿出差单，系统提示「尚未审批通过，不能登记差旅成本」。两条提示都是保存那一刻由系统给出的，换一个健康项目或已审批的出差单即可保存。');
}

// 28 · 合同与财务
{
  const s = slide('合同与财务：开票、收款、采购合同、销售订单', '步骤 37 · 38 · 40');
  bullets(s, [
    '交付项目「合同与财务」分组：销售合同、合同额、项目进度 → 已确认收入；已开票、已收款、应收余额；采购合同总额、销售订单总额；项目毛利率',
    '华信一期：合同额 1,400,000、进度 55% → 已确认收入 770,000；已开票 980,000、已收款 420,000、应收余额 560,000；项目毛利率 62.29%',
    '开票：发票类型、号码、金额、税率、状态，收款汇总到发票、未收余额自动算；收款：收款方式、流水号、关联发票与销售合同',
    '采购合同：供应商、类别（分包 / 软件 / 硬件）、已付 / 未付；销售订单：交付状态、验收日期。本阶段手工录入，财务系统对接放在后续阶段',
  ], M, 1.45, CW, 1.6, { fontSize: 12, gap: 5 });
  pair(s, 3.05, ['R4-14-交付项目-合同与财务', '交付项目：合同与财务分组'], ['R2-13-开票', '开票列表：收款汇总与未收余额'], 3.4);
  notes(s, '步骤 37、38、40。交付项目的「合同与财务」分组一页看全：销售合同、合同额、项目进度推出已确认收入；已开票、已收款、应收余额；采购合同总额、销售订单总额；项目毛利率。华信一期：合同 140 万，进度 55%，已确认收入 77 万；已开票 98 万，已收款 42 万，应收 56 万；毛利率 62.29%。开票、收款、采购合同、销售订单都是独立对象，收款还关联到销售合同；本阶段手工录入，对接财务、费控、考勤放在后续阶段。');
}

// 29 · finance chain diagram (native)
{
  const s = slide('财务链路：合同、开票、收款、采购，一张表看全', '步骤 37–40');
  const bw = 2.55, bh = 0.82, X = (i) => M + i * 2.85, Y = [1.5, 2.62, 3.74, 4.86];
  const P = (r, c, txt, fill, color) => box(s, txt, X(c), Y[r], bw, bh, fill, color, 11);
  const mid = (r) => Y[r] + bh / 2;
  P(0, 0, ['销售合同', '合同额'], C.navy2, C.white); P(0, 1, ['项目进度 %', '项目经理维护'], C.amber, C.white); P(0, 2, ['已确认收入', '= 合同额 × 进度'], C.green, C.white);
  arrow(s, X(0) + bw, mid(0), X(1), mid(0)); arrow(s, X(1) + bw, mid(0), X(2), mid(0));
  P(1, 0, ['开票（作废不计）', '→ 已开票金额'], C.amber, C.white); P(1, 1, ['收款（对着发票核销）', '→ 已收款金额'], C.amber, C.white); P(1, 2, ['应收余额', '= 已开票 − 已收款'], C.green, C.white);
  arrow(s, X(0) + bw, mid(1), X(1), mid(1)); arrow(s, X(1) + bw, mid(1), X(2), mid(1));
  P(2, 0, ['采购合同（终止不计）', '→ 采购合同总额'], C.amber, C.white); P(2, 1, ['销售订单', '→ 销售订单总额'], C.amber, C.white);
  P(3, 0, ['实际成本', '人工实际 + 差旅实际（见成本闭环）'], C.navy2, C.white); P(3, 1, ['项目毛利率', '=（合同额 − 实际成本）÷ 合同额'], C.green, C.white);
  arrow(s, X(0) + bw, mid(3), X(1), mid(3)); arrow(s, X(0) + bw / 2, Y[0] + bh, X(0) + bw / 2, Y[1] - 0.02, { dash: true });
  // where it lands
  const rx = 9.45, rw = 3.28;
  s.addText('汇到哪里', { x: rx, y: 1.45, w: rw, h: 0.35, fontFace: F, fontSize: 12.5, bold: true, color: C.navy, isTextBox: true, margin: 0 });
  const dest = ['交付项目「合同与财务」分组', '交付项目列表「项目综合查询」视图', '项目财务仪表板：合同额 · 已开票 · 已收款 · 采购', '项目成本仪表板：基线 · 实际 · 消耗'];
  dest.forEach((t, i) => box(s, t, rx, 1.9 + i * 0.95, rw, 0.78, C.ice, C.navy, 11));
  arrow(s, X(2) + bw, mid(0), rx, 1.9 + 0.39); arrow(s, X(2) + bw, mid(1), rx, 1.9 + 0.95 + 0.39); arrow(s, X(1) + bw, mid(2), rx, 1.9 + 1.9 + 0.39); arrow(s, X(1) + bw, mid(3), rx, 1.9 + 2.85 + 0.39);
  const legend = [['CRM 对象', C.navy2], ['项目财务对象（手工录入）', C.amber], ['系统汇总 / 公式', C.green]];
  legend.forEach((l, i) => { s.addShape(pres.shapes.RECTANGLE, { x: M + i * 3.2, y: 6.05, w: 0.3, h: 0.22, fill: { color: l[1] }, line: { color: l[1] } }); para(s, l[0], M + i * 3.2 + 0.4, 6.02, 2.7, 0.3, { size: 10.5 }); });
  notes(s, '财务链路四行。第一行：销售合同的合同额乘项目进度得到已确认收入，进度由项目经理维护。第二行：开票汇总成已开票金额，作废的不算；收款对着发票核销，汇总成已收款金额；两者之差是应收余额。第三行：采购合同和销售订单各自汇总，终止的采购合同不算。第四行：成本闭环里算出来的实际成本和合同额算出项目毛利率。右边是这些数汇到哪里——交付项目的「合同与财务」分组、项目综合查询视图、项目财务仪表板和项目成本仪表板。这四种财务单据今天是手工录入，生产环境接财务系统。');
}

// 30 · 项目报表
{
  const s = slide('项目报表：综合查询与两个仪表板', '步骤 37–39');
  bullets(s, [
    '交付项目列表的「项目综合查询」视图：进度、当前预算、实际成本、预算消耗、合同额、已确认收入、已开票、已收款、应收余额、毛利率一行看全，可筛选、分组、导出',
    '项目成本仪表板：总预算 7,541,020 / 人工实际 3,440,800 / 差旅实际 97,200 / 进行中项目 5；各项目预算基线 vs 计划总额 vs 人工实际，预算消耗表',
    '项目财务仪表板：合同额合计 10,650,000 / 已开票 5,120,000 / 已收款 4,035,000 / 采购合同 990,000；各项目合同额 vs 开票 vs 收款，开票率与回款率',
  ], M, 1.45, CW, 1.4, { fontSize: 12.5, gap: 5 });
  trio(s, 2.95, [['R4-17-项目综合查询', '项目综合查询：十项指标一行看全'], ['R4-31-项目成本仪表板', '项目成本仪表板：七个交付项目'], ['R4-32-项目财务仪表板', '项目财务仪表板：合同额、开票、收款']]);
  card(s, M, 5.95, CW, 0.75, C.paper, { line: C.line });
  para(s, '两个仪表板都是平台原生的数据集加组件：改指标、加磁贴不用写代码；列表视图可筛选、分组、导出，也能另存成贵司自己的查询视图。', M + 0.25, 6.08, CW - 0.5, 0.55, { size: 12, color: C.ink });
  notes(s, '步骤 37 到 39。交付项目列表切到「项目综合查询」视图：进度、当前预算、实际成本、预算消耗、合同额、已确认收入、开票、收款、应收、毛利率一行看全，可筛选、分组、导出。项目成本仪表板看基线、计划、实际和消耗率——总预算 754 万、人工实际 344 万；项目财务仪表板看合同额、开票、收款和采购——合同额 1065 万、已开票 512 万、已收款 403.5 万。两个仪表板都是平台原生的数据集加组件，改指标不用写代码。');
}

// 31 · master data
{
  const s = slide('主数据：费率卡、差旅标准与签约主体', '步骤 9 · 18 · 28 · 31');
  bullets(s, [
    '费率卡：岗位级别 × 费率标准 × 生效区间一行，带小时费率、日费率与启用开关；工时表和人工服务成本行选了它就自动取价，费率变更集中管理、按月生效',
    '差旅标准：按城市级别（一线 / 二线 / 三线 / 海外）给出住宿、餐补、市内交通的日标准与往返交通估算，差旅类项目费用按它计算',
    '签约主体：我方法人公司主数据（名称、信用代码、法定代表人、开户行），商机与合同上选择；三者都在导航"主数据"组，管理员维护，业务人员只选不填',
  ], M, 1.45, CW, 1.4, { fontSize: 12.5, gap: 5 });
  trio(s, 2.95, [['R4-19-费率卡-费率标准', '费率卡：岗位级别、费率标准、小时费率、生效区间'], ['R4-18-差旅标准', '差旅标准：城市级别的日标准与往返交通'], ['R2-03-签约主体', '签约主体']]);
  card(s, M, 5.95, CW, 0.75, C.paper, { line: C.line });
  para(s, '主数据集中维护、按生效区间取值：费率卡调价后，之后月份的人工计划与工时成本自动按新价算，历史月份不变——这就是贵司说的"岗位级别 × 费率标准"落在系统里的样子。', M + 0.25, 6.08, CW - 0.5, 0.55, { size: 12, color: C.ink });
  notes(s, '贵司步骤 18、28 说的岗位级别和费率标准，就是费率卡：岗位级别乘费率标准乘生效区间一行，带小时费率、日费率和启用开关，工时表和人工服务成本行选了它就自动取价，费率变更集中管理、按月生效。步骤 31 的差旅预算靠差旅标准：按城市级别给出住宿、餐补、市内交通的日标准和往返交通估算，差旅类项目费用按它算。步骤 9 说的签约主体是我方法人公司的主数据——名称、信用代码、法定代表人、开户行——商机和合同上选择。三者都在导航的「主数据」组，管理员维护，业务人员只选不填。');
}

// 32 · section — boundaries
{
  const s = section('03', '第三部分 · 边界与路线', '简化说明 · 待答事项 · 推进路线', '把演示里的简化说在前面，把落地的三个阶段说清楚');
  notes(s, '最后一部分说边界：今天演示里哪些是刻意简化的、生产形态是什么、需要贵司回答哪几件事，以及建议的三阶段路线。');
}

// 33 · simplifications
{
  const s = slide('本次演示的简化与后续形态');
  table(s, ['需求', '本次演示', '后续形态'], [
    ['五级售前审批（20）', '一级审批（部分实现）', '五个审批节点串联，按组织层级自动路由'],
    ['商机状态变更审批（14）', '未单独审批（未实现）', '赢单 / 弃单 / 铁三角调整走审批流——待贵司确认是否需要'],
    ['预算调整联动（32）', '版本化调整通过后新版本生效、计划总额更新；「当前预算」联动收尾中（部分实现）', '收尾后同一按钮、同一收件箱；手填金额的调整已正常联动'],
    ['铁三角（13）', '商机上三个人员字段', '商机团队对象 + 记录级共享'],
    ['请假 / 加班同步（33）', '请假按工作日 × 8 小时自动同步；加班手填（部分实现）', '对接考勤系统'],
    ['报销单据（35）', '差旅成本记报销单据号，手工录入', '对接费控系统'],
    ['开票 / 收款（37 / 38）', '系统内对象，手工录入', '对接财务系统'],
    ['审批发起', '记录页「发起审批」按钮，审批状态只读', '同一机制，按对象配置审批人与层级'],
    ['演示数据', '一家软件公司：14 客户 / 13 商机 / 7 交付项目 / 15 份成本计划', '导入贵司真实客户、项目、费率卡与差旅标准'],
  ], M, 1.45, CW, [2.9, 4.9, 4.33], { rowH: 0.5, fontSize: 11 });
  notes(s, '把简化说在前面。售前审批今天一级，生产五级串联、按组织层级自动路由；商机状态变更审批待贵司确认；成本计划版本化的预算调整，审批通过后新版本已经生效、计划总额也更新了，「当前预算」这一个数的联动还在收尾；铁三角做成团队对象加共享；请假同步今天按工作日乘 8 小时算，加班手填，后续对接考勤；报销单据、开票收款后续对接费控和财务。审批发起已经改成按钮加只读状态。演示数据是一家软件公司的样子，上线时换成贵司真实的客户、项目、费率卡和差旅标准。');
}

// 34 · roadmap
{
  const s = slide('建议的推进路线');
  const cols = [
    ['阶段一 · 试点上线', '本次演示范围', ['贵司确认五个待答事项：跟进记录形态、开票 / 回款归属、线索形态、EAR 判定方式、立项审批与金额审批的关系', '收尾预算调整的「当前预算」联动；按贵司组织与岗位配置审批人、权限、费率卡、差旅标准、签约主体', '一个事业部、一批真实项目试运行：先把 Bizcase 编进成本计划，再导入交付项目']],
    ['阶段二 · 深化', '规则与协同', ['五级售前审批按组织层级路由；商机状态变更审批', '铁三角商机团队与记录级共享', '预算多级审批、费率卡版本、售前工时口径']],
    ['阶段三 · 集成', '打通外部系统', ['考勤：请假 / 加班自动同步', '费控：报销单据回写差旅成本', '财务：开票、收款自动进系统；合同额、收入口径统一']],
  ];
  cols.forEach((c, i) => {
    const x = M + i * 4.1;
    card(s, x, 1.5, 3.93, 5.2, i === 0 ? C.amberSoft : C.ice);
    s.addText(c[0], { x: x + 0.3, y: 1.7, w: 3.35, h: 0.5, fontFace: F, fontSize: 17, bold: true, color: i === 0 ? C.amberDeep : C.navy, isTextBox: true, margin: 0 });
    s.addText(c[1], { x: x + 0.3, y: 2.2, w: 3.35, h: 0.35, fontFace: F, fontSize: 11.5, color: C.muted, isTextBox: true, margin: 0 });
    bullets(s, c[2], x + 0.3, 2.7, 3.35, 3.85, { fontSize: 12, gap: 8 });
  });
  notes(s, '三个阶段。阶段一试点上线，就是今天演示的范围，前提是贵司确认五个待答事项：跟进记录形态、开票回款归属、线索形态、EAR 判定方式、立项审批与金额审批的关系；我们这边收尾预算调整的当前预算联动，然后按组织和岗位配置审批人、权限、费率卡、差旅标准、签约主体，选一个事业部一批真实项目试运行——先把 Bizcase 编进成本计划，再导入交付项目。阶段二做规则和协同：五级审批、状态变更审批、铁三角共享、预算多级审批。阶段三打通考勤、费控、财务三个外部系统。');
}

// 35 · closing
{
  const s = pres.addSlide(); dark(s); n += 1; s.__title = '收尾';
  s.addText('贵司 40 步流程里，客户、线索、商机、审批中心、附件、跟进、赢丢单是现成的 CRM 能力；售前立项、交付立项、成本计划、工时与差旅、财务与报表这 26 步，是在同一个平台、同一套数据里长出来的。', { x: 0.8, y: 1.5, w: 11.7, h: 2.4, fontFace: F, fontSize: 22, color: C.white, isTextBox: true, margin: 0, valign: 'top' });
  s.addText('成本计划按贵司要求做成了带版本、四类明细、按月分解的完整形态——这也是它能成为软件行业项目型销售标准模板的原因。', { x: 0.8, y: 4.0, w: 11.7, h: 0.9, fontFace: F, fontSize: 18, color: C.sand, isTextBox: true, margin: 0 });
  s.addText('下一步：确认五个待答事项 → 划定试点范围 → 给出排期', { x: 0.8, y: 5.6, w: 11.7, h: 0.5, fontFace: F, fontSize: 14, color: C.steel, isTextBox: true, margin: 0 });
  notes(s, '收尾一句话：贵司 40 步流程里，客户、线索、商机、审批中心、附件、跟进、赢丢单是现成的 CRM 能力；售前立项、交付立项、成本计划、工时与差旅、财务与报表这 26 步，是在同一个平台、同一套数据里长出来的；成本计划按贵司要求做成了带版本、四类明细、按月分解的完整形态——这也是它能成为软件行业项目型销售标准模板的原因。下一步三个动作：确认五个待答事项，划定试点范围，我们给出排期。谢谢大家，欢迎提问。');
}

// ── write the deck, then the spoken script from the same notes ──────────────
pres.writeFile({ fileName: OUT }).then((f) => {
  let md = '# 客户汇报 — 讲稿（逐页讲解）\n\n> 与 `客户汇报-华信案例.pptx` 每页的演讲者备注一致；放映时开启「演示者视图」即可看到。第 4 版（2026 年 9 月）：成本计划按设计完整实现、十条审批流、状态按"已实现 / 部分实现 / 未实现"如实标注。\n\n';
  for (const e of SCRIPT) md += `## 第 ${e.n} 页 · ${e.title}\n\n${e.text}\n\n`;
  fs.writeFileSync(path.join(path.dirname(OUT), '客户汇报-讲稿.md'), md, 'utf8');
  console.log('wrote', f, 'slides', n);
});
