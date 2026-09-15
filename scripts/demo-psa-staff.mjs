#!/usr/bin/env node
// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.
//
// Demo staffing for the PSA presales branch (epic #2): six Chinese-named
// colleagues, stamped into the role lookups a seed cannot name (a seed cannot
// reference a user — see `src/data/psa.seed.ts`).
//
//   pnpm dev                          # terminal 1 — leave it running
//   node scripts/demo-psa-staff.mjs   # terminal 2 — once, after the seeds replayed
//
// Idempotent: re-running finds the people by email and re-stamps the same roles.
// Creates REAL accounts through the auth admin surface (the pattern
// `scripts/demo-staff.ts` established), password `Demo12345!` — dev only.

const BASE = process.env.HOTCRM_URL ?? 'http://localhost:4001';
const ADMIN = { email: process.env.HOTCRM_ADMIN_EMAIL ?? 'admin@objectos.ai', password: process.env.HOTCRM_ADMIN_PASSWORD ?? 'admin123' };

const STAFF = [
  { name: '张伟', email: 'zhang.wei@it-services.example.com', role: '客户经理 (AR)' },
  { name: '李娜', email: 'li.na@it-services.example.com', role: '解决方案经理 (SR) · 资源报价负责人' },
  { name: '王强', email: 'wang.qiang@it-services.example.com', role: '交付经理 (FR) · 项目经理' },
  { name: '赵敏', email: 'zhao.min@it-services.example.com', role: '项目总监' },
  { name: '刘洋', email: 'liu.yang@it-services.example.com', role: '项目 QA / QA 负责人' },
  { name: '陈晨', email: 'chen.chen@it-services.example.com', role: '分包 TS 填写人 · 数据工程师' },
];

let cookie = '';
async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const set = res.headers.get('set-cookie');
  if (set) cookie = set.split(',').map((c) => c.split(';')[0]).join('; ');
  let json = null;
  try { json = await res.json(); } catch { /* empty body */ }
  return { status: res.status, json };
}
async function query(object, filters, fields) {
  const { status, json } = await call('POST', `/api/v1/data/${object}/query`, { filters, fields, top: 100 });
  if (status >= 300) throw new Error(`query ${object} → ${status} ${JSON.stringify(json).slice(0, 200)}`);
  return json.records ?? [];
}
async function patch(object, id, fields, label) {
  const { status, json } = await call('PATCH', `/api/v1/data/${object}/${id}`, fields);
  console.log(`  ${status === 200 ? '✓' : '✗'} ${label} (${object}) ${status === 200 ? '' : JSON.stringify(json).slice(0, 160)}`);
}

const login = await call('POST', '/api/v1/auth/sign-in/email', ADMIN);
if (login.status !== 200) throw new Error(`sign-in failed (${login.status}) — is \`pnpm dev\` running on ${BASE}?`);

console.log('People');
const U = {};
for (const m of STAFF) {
  const existing = await query('sys_user', [['email', '=', m.email]], ['id', 'email']);
  if (existing.length) { U[m.name] = existing[0].id; console.log(`  = ${m.name} already there`); continue; }
  const { status, json } = await call('POST', '/api/v1/auth/admin/create-user', { email: m.email, password: 'Demo12345!', name: m.name, mustChangePassword: false });
  const id = json?.data?.user?.id ?? json?.user?.id;
  if (status >= 300 || !id) throw new Error(`create-user ${m.name} → ${status} ${JSON.stringify(json).slice(0, 200)}`);
  U[m.name] = id; console.log(`  + ${m.name} — ${m.role}`);
}

console.log('Roles');
// Every deal, presales project and delivery project gets the same six people —
// the demo has one team. Closed deals are skipped: `opportunity_lifecycle`
// freezes a won / lost opportunity to its narrative fields, so 铁三角 there
// can only be set while the deal is open.
const listAll = (object, fields) => query(object, [], ['id', ...fields]);
const short = (v) => String(v ?? '').slice(0, 28);
for (const opp of await listAll('crm_opportunity', ['name', 'stage'])) {
  if (opp.stage === 'closed_won' || opp.stage === 'closed_lost') { console.log(`  · ${short(opp.name)} — 已关闭，铁三角保持原样`); continue; }
  await patch('crm_opportunity', opp.id, { account_manager: U['张伟'], solution_manager: U['李娜'], delivery_manager: U['王强'], owner_id: U['张伟'] }, `铁三角 · ${short(opp.name)}`);
}
for (const psp of await listAll('crm_presales_project', ['name'])) {
  await patch('crm_presales_project', psp.id, { owner_id: U['张伟'], account_manager: U['张伟'], project_manager: U['王强'], project_director: U['赵敏'], project_qa: U['刘洋'], pricing_owner: U['李娜'] }, `项目角色 · ${short(psp.name)}`);
}
for (const dlv of await listAll('crm_delivery_project', ['name'])) {
  await patch('crm_delivery_project', dlv.id, { owner_id: U['王强'], project_manager: U['王强'], project_director: U['赵敏'], pricing_owner: U['李娜'], subcontract_ts_owner: U['陈晨'], qa_lead: U['刘洋'] }, `项目角色 · ${short(dlv.name)}`);
}
// Account and lead owners: the two sellers share the book.
let i = 0;
for (const acc of await listAll('crm_account', ['name'])) {
  await patch('crm_account', acc.id, { owner_id: U[i++ % 2 ? '李娜' : '张伟'] }, `客户负责人 · ${short(acc.name)}`);
}
for (const lead of await listAll('crm_lead', ['last_name', 'company'])) {
  await patch('crm_lead', lead.id, { owner_id: U[i++ % 2 ? '李娜' : '张伟'] }, `线索负责人 · ${short(lead.company)}`);
}
for (const row of await listAll('crm_contract', ['description'])) await patch('crm_contract', row.id, { owner_id: U['张伟'] }, `合同负责人 · ${short(row.description)}`);
for (const row of await listAll('crm_quote', ['name'])) await patch('crm_quote', row.id, { owner_id: U['张伟'] }, `报价负责人 · ${short(row.name)}`);

// Timesheet submitters follow the role named in the sheet's note; the trip,
// leave and finance rows follow a keyword, with a default person per object.
// A leave request is re-saved with its owner so `leave_timesheet_sync` pushes
// its hours onto that person's sheets for the month (this month's draft sheet
// for 王强 is the one the script demos).
console.log('People on the records');
const stampBy = async (object, field, matches, label, fallback) => {
  for (const row of await query(object, [], ['id', field])) {
    const text = String(row[field] ?? '');
    const hit = matches.find(([needle]) => text.includes(needle));
    const who = hit ? hit[1] : fallback;
    if (who) await patch(object, row.id, { owner_id: U[who] }, `${label} · ${short(text)}`);
  }
};
await stampBy('crm_timesheet', 'notes', [['项目经理', '王强'], ['架构师', '李娜'], ['顾问', '李娜'], ['高级工程师', '刘洋'], ['数据工程师', '陈晨'], ['驻场工程师', '陈晨'], ['工程师', '陈晨']], '填报人', '刘洋');
await stampBy('crm_business_trip', 'subject', [['需求调研', '王强'], ['上线演练', '刘洋'], ['试点评审', '陈晨'], ['投标答疑', '李娜'], ['开工会议', '王强'], ['产线调研', '刘洋'], ['启动会', '王强'], ['上线支持', '陈晨'], ['验收评审', '王强'], ['蓝图汇报', '李娜'], ['商务谈判', '张伟'], ['质量部演示', '李娜']], '出差人', '王强');
await stampBy('crm_leave_request', 'reason', [['李娜', '李娜'], ['陈晨', '陈晨'], ['年假', '王强'], ['病假', '刘洋']], '申请人', '刘洋');
await stampBy('crm_budget_adjustment', 'analysis', [['AI 审批助手', '王强'], ['上线窗口', '王强'], ['费率', '赵敏']], '申请人', '王强');
await stampBy('crm_invoice', 'invoice_number', [], '经办人', '张伟');
await stampBy('crm_collection', 'bank_reference', [], '经办人', '张伟');
await stampBy('crm_purchase_contract', 'name', [], '商务负责人', '李娜');
await stampBy('crm_sales_order', 'name', [], '商务负责人', '张伟');
await stampBy('crm_travel_cost', 'description', [['需求调研', '王强'], ['上线演练', '刘洋'], ['试点评审', '陈晨'], ['开工会议', '王强'], ['产线调研', '刘洋'], ['启动会', '王强'], ['上线切换', '陈晨'], ['验收评审', '王强'], ['蓝图汇报', '李娜']], '报销人', '王强');
for (const leave of await query('crm_leave_request', [['approval_status', '=', 'approved']], ['id', 'reason', 'owner_id'])) {
  await patch('crm_leave_request', leave.id, { owner_id: leave.owner_id }, `同步请假工时 · ${String(leave.reason).slice(0, 16)}`);
}
console.log('Done. Sign in as any of them with password Demo12345! (dev only).');
