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
const one = async (object, field, value) => {
  const rows = await query(object, [[field, '=', value]], ['id']);
  if (!rows.length) throw new Error(`no ${object} where ${field} = ${value} — replay the seeds first`);
  return rows[0].id;
};
await patch('crm_opportunity', await one('crm_opportunity', 'name', '华信科技核心业务系统升级项目'),
  { account_manager: U['张伟'], solution_manager: U['李娜'], delivery_manager: U['王强'] }, '铁三角 · 华信科技核心业务系统升级项目');
await patch('crm_presales_project', await one('crm_presales_project', 'name', '华信核心系统升级 — 售前'),
  { account_manager: U['张伟'], project_manager: U['王强'], project_director: U['赵敏'], project_qa: U['刘洋'], pricing_owner: U['李娜'] }, '项目角色 · 售前项目');
for (const name of ['华信核心系统升级 — 一期交付', '华信数据中台 — 试点交付']) {
  await patch('crm_delivery_project', await one('crm_delivery_project', 'name', name),
    { project_manager: U['王强'], project_director: U['赵敏'], pricing_owner: U['李娜'], subcontract_ts_owner: U['陈晨'], qa_lead: U['刘洋'] }, `项目角色 · ${name}`);
}
// Timesheet submitters: 一期 architects/engineers → 王强 / 刘洋, 试点 data engineer → 陈晨.
for (const ts of await query('crm_timesheet', [], ['id', 'notes'])) {
  const notes = String(ts.notes ?? '');
  const owner = notes.includes('试点') ? U['陈晨'] : notes.includes('架构师') ? U['王强'] : notes.includes('高级工程师') ? U['刘洋'] : null;
  if (owner) await patch('crm_timesheet', ts.id, { owner_id: owner }, `填报人 · ${notes}`);
}
// Round 2: trips, leave, budget adjustment, invoices / collections / purchases /
// orders and this month's draft sheet — each gets its person, and the approved
// leave is re-saved so its hours land on that person's draft timesheet.
console.log('Round 2 owners');
const stampBy = async (object, field, matches, label) => {
  for (const row of await query(object, [], ['id', field])) {
    const text = String(row[field] ?? '');
    const hit = matches.find(([needle]) => text.includes(needle));
    if (hit) await patch(object, row.id, { owner_id: U[hit[1]] }, `${label} · ${text.slice(0, 24)}`);
  }
};
await stampBy('crm_business_trip', 'subject', [['需求调研', '王强'], ['上线演练', '刘洋'], ['试点评审', '陈晨'], ['投标答疑', '李娜']], '出差人');
await stampBy('crm_leave_request', 'reason', [['年假', '王强'], ['病假', '刘洋']], '申请人');
await stampBy('crm_budget_adjustment', 'analysis', [['AI 审批助手', '王强']], '申请人');
await stampBy('crm_invoice', 'invoice_number', [['HX2026', '张伟']], '经办人');
await stampBy('crm_collection', 'bank_reference', [['CMB', '张伟']], '经办人');
await stampBy('crm_purchase_contract', 'name', [['分包', '李娜'], ['许可', '李娜']], '商务负责人');
await stampBy('crm_sales_order', 'name', [['一期订单', '张伟']], '商务负责人');
await stampBy('crm_timesheet', 'notes', [['本月', '王强']], '填报人');
// Re-save the approved leave with its owner: leave_timesheet_sync then pushes
// the leave hours onto 王强's draft sheet for this month.
for (const leave of await query('crm_leave_request', [['approval_status', '=', 'approved']], ['id', 'reason', 'owner_id'])) {
  await patch('crm_leave_request', leave.id, { owner_id: leave.owner_id }, `同步请假工时 · ${String(leave.reason).slice(0, 16)}`);
}
console.log('Done. Sign in as any of them with password Demo12345! (dev only).');
