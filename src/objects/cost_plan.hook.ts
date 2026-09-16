// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';
import type { HookApi } from './_hook-api';

/**
 * 成本计划 hooks (steps 27–32). Every handler closes over nothing — its helpers
 * are inline — so it lowers to a metadata-only body (`hook-body/not-lowerable`),
 * and `refuse()` is the inline copy every refusing hook carries (`_refusal.ts`).
 *
 * A `Hook.object` may be an ARRAY, so the rules the four line objects share
 * (the lock, the decomposition) are one hook each, dispatched by `ctx.object`.
 */
const LINE_OBJECTS = ['crm_labor_cost_line', 'crm_service_cost_line', 'crm_procurement_cost_line', 'crm_expense_cost_line'];

/**
 * A plan's phase follows the project it hangs off; a version number is handed
 * out when none is given; a frozen baseline stays frozen; an approved Bizcase
 * is the Bizcase in force; and when a version becomes current the project's
 * other versions stop being so (an approved one is stamped 已作废).
 *
 * The Bizcase rule (2026-09-16): a presales project has no step-32 budget
 * adjustment to put a version in force — the approval IS the decision — so
 * the `approved` stamp the approval flow writes makes a Bizcase current here,
 * and the presales project's four figures (rollups over `is_current`) carry
 * it from that moment. A delivery plan is unchanged: the adjustment that
 * names it puts it in force (`budget_adjustment_version_flip`).
 */
const costPlanDefaults: Hook = {
  name: 'cost_plan_defaults',
  object: 'crm_cost_plan',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  description: 'Phase from the project; version number when none is given; baseline frozen after import; an approved Bizcase becomes current; one current version per project.',
  handler: async (ctx: HookContext) => {
    function refuse(
      message: string,
      code: string,
      status: number,
      userMessage: string = message,
    ): Error {
      const err = new Error(message) as Error & {
        code: string;
        status: number;
        userMessage: string;
      };
      err.code = code;
      err.status = status;
      err.userMessage = userMessage;
      return err;
    }
    const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);
    const id = (v: unknown): string => (typeof v === 'string' && v !== '' ? v : '');
    const api = ctx.api as HookApi | undefined;
    const { input, previous } = ctx;
    if (!input) return;
    const delivery = id(input.crm_delivery_project !== undefined ? input.crm_delivery_project : previous?.crm_delivery_project);
    const presales = id(input.crm_presales_project !== undefined ? input.crm_presales_project : previous?.crm_presales_project);
    if (delivery || presales) input.phase = delivery ? 'delivery' : 'bizcase';
    const projectKey = delivery ? 'crm_delivery_project' : 'crm_presales_project';
    const projectId = delivery || presales;
    if (ctx.event === 'beforeUpdate' && ctx.session?.isSystem !== true && input.baseline_total !== undefined && num(previous?.baseline_total) > 0 && Math.abs(num(input.baseline_total) - num(previous?.baseline_total)) >= 0.005) {
      const name = typeof previous?.name === 'string' ? previous.name : '';
      throw refuse(
        `Cost plan ${name} carries a frozen baseline; it cannot be changed after import.`,
        'RECORD_LOCKED',
        409,
        `成本计划「${name}」的冻结基线来自 Bizcase 导入，不能修改；预算变动请走预算调整`,
      );
    }
    // An approved Bizcase is the version the presales project reads; the
    // block below then retires the Bizcase it replaces.
    if (presales && !delivery && input.approval_status === 'approved' && previous?.approval_status !== 'approved' && input.is_current === undefined && previous?.is_current !== true) {
      input.is_current = true;
    }
    if (!api || !projectId) return;
    if (ctx.event === 'beforeInsert' && num(input.version_no) <= 0) {
      input.version_no = (await api.object('crm_cost_plan').count({ where: { [projectKey]: projectId } })) + 1;
    }
    if (input.is_current === true && previous?.is_current !== true) {
      const others = await api.object('crm_cost_plan').find({ where: { [projectKey]: projectId, is_current: true }, fields: ['id', 'approval_status'] });
      for (const other of others) {
        const otherId = id(other.id);
        if (!otherId || otherId === id(previous?.id)) continue;
        const status = other.approval_status === 'approved' ? 'superseded' : other.approval_status;
        await api.object('crm_cost_plan').update({ id: otherId, is_current: false, approval_status: status }, { where: { id: otherId } });
      }
    }
  },
};

/**
 * 审批对比 — what the approver decides on. Submitting a plan snapshots the
 * amounts of the version CURRENTLY IN FORCE for the same project onto this
 * row, so the approver reads this version's figures against the ones the
 * project is executing on, and the `delta_*` formulas subtract the pair.
 *
 * Written at the submit transition and nowhere else: the plan's lines and
 * months freeze on that same transition (`cost_plan_lock`), so the two sides
 * of the comparison are the two the approver will decide between, and the row
 * stays the audit record of what was put in front of them — which is why the
 * comparison keeps showing after the decision, reading the version in force
 * AT SUBMIT TIME rather than today's.
 *
 * The version in force is taken as declared — `is_current: true` — with no
 * exception for the row being submitted. A plan that is ALREADY the current
 * version therefore snapshots its own amounts and every `delta_*` reads 0,
 * which is what 「与当前版本对比」 says on a record that IS the current version.
 * Excluding itself and calling the whole amount an increase read as a
 * 1,566,320 raise on a project whose plan had not changed at all. A project
 * with no current version at all (every version superseded) leaves
 * `compare_plan` empty and the snapshot at zero — there the whole amount IS
 * the increase.
 */
const costPlanCompare: Hook = {
  name: 'cost_plan_compare',
  object: 'crm_cost_plan',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 110,
  description: "Snapshot the in-force version's amounts onto a plan as it is submitted for approval.",
  handler: async (ctx: HookContext) => {
    const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);
    const id = (v: unknown): string => (typeof v === 'string' && v !== '' ? v : '');
    const api = ctx.api as HookApi | undefined;
    const { input, previous } = ctx;
    if (!input || !api) return;
    if (input.approval_status !== 'submitted' || previous?.approval_status === 'submitted') return;
    const delivery = id(input.crm_delivery_project !== undefined ? input.crm_delivery_project : previous?.crm_delivery_project);
    const presales = id(input.crm_presales_project !== undefined ? input.crm_presales_project : previous?.crm_presales_project);
    const projectId = delivery || presales;
    if (!projectId) return;
    // The visible totals are formulas (virtual), so the snapshot reads the
    // stored pairs behind them — the month-ledger column and the line-estimate
    // column — and adds each pair; exactly one side is non-zero on any plan.
    const parts = ['baseline_total', 'planned_month_total', 'labor_month_total', 'service_month_total', 'procurement_month_total', 'expense_month_total', 'travel_month_total', 'labor_line_total', 'service_line_total', 'procurement_line_total', 'expense_line_total', 'travel_line_total'];
    const current = await api.object('crm_cost_plan').findOne({
      where: { [delivery ? 'crm_delivery_project' : 'crm_presales_project']: projectId, is_current: true },
      fields: ['id', ...parts],
    });
    const sum = (keys: string[]): number => (current ? Math.round(keys.reduce((acc, k) => acc + num(current[k]), 0) * 100) / 100 : 0);
    input.compare_plan = current ? id(current.id) : null;
    input.current_baseline_total = sum(['baseline_total']);
    input.current_planned_total = sum(['planned_month_total', 'labor_line_total', 'service_line_total', 'procurement_line_total', 'expense_line_total']);
    input.current_labor_total = sum(['labor_month_total', 'labor_line_total']);
    input.current_service_total = sum(['service_month_total', 'service_line_total']);
    input.current_procurement_total = sum(['procurement_month_total', 'procurement_line_total']);
    input.current_expense_total = sum(['expense_month_total', 'expense_line_total']);
    input.current_travel_total = sum(['travel_month_total', 'travel_line_total']);
  },
};

/**
 * Lines and month rows are editable while their plan is a draft (or was sent
 * back); once it is submitted, approved or superseded they are frozen. A
 * system write (seed replay, the approval flow, a nested hook write under one)
 * passes — the cross-object gate the timesheet budget gate already has.
 */
const costPlanLock: Hook = {
  name: 'cost_plan_lock',
  object: [...LINE_OBJECTS, 'crm_cost_plan_month'],
  events: ['beforeInsert', 'beforeUpdate', 'beforeDelete'],
  priority: 50,
  description: 'Refuse a line or month write on a plan that is not a draft.',
  handler: async (ctx: HookContext) => {
    function refuse(
      message: string,
      code: string,
      status: number,
      userMessage: string = message,
    ): Error {
      const err = new Error(message) as Error & {
        code: string;
        status: number;
        userMessage: string;
      };
      err.code = code;
      err.status = status;
      err.userMessage = userMessage;
      return err;
    }
    const id = (v: unknown): string => (typeof v === 'string' && v !== '' ? v : '');
    const api = ctx.api as HookApi | undefined;
    if (ctx.session?.isSystem === true || !api) return;
    const planId = id(ctx.input?.crm_cost_plan) || id(ctx.previous?.crm_cost_plan);
    if (!planId) return;
    const plan = await api.object('crm_cost_plan').findOne({ where: { id: planId }, fields: ['name', 'approval_status'] });
    if (!plan) return;
    const status = typeof plan.approval_status === 'string' ? plan.approval_status : 'draft';
    if (status === 'draft' || status === 'rejected') return;
    const name = typeof plan.name === 'string' ? plan.name : '';
    throw refuse(
      `Cost plan ${name} is ${status}; its lines and months are frozen.`,
      'RECORD_LOCKED',
      409,
      `成本计划「${name}」已${status === 'superseded' ? '作废' : status === 'approved' ? '审批通过' : '提交审批'}，明细行与月度分解不能再修改；请新建计划版本后调整`,
    );
  },
};

/** A labor line's 费率标准 is the rate card's hourly rate — copied, never typed. */
const costLineRateFill: Hook = {
  name: 'cost_line_rate_fill',
  object: 'crm_labor_cost_line',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 90,
  description: 'Hourly rate from the rate card the labor line names.',
  handler: async (ctx: HookContext) => {
    const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);
    const api = ctx.api as HookApi | undefined;
    const { input, previous } = ctx;
    if (!input || !api) return;
    const cardId = typeof input.crm_rate_card === 'string' && input.crm_rate_card ? input.crm_rate_card : typeof previous?.crm_rate_card === 'string' ? previous.crm_rate_card : '';
    if (!cardId || (input.crm_rate_card === undefined && num(previous?.hourly_rate) > 0)) return;
    const card = await api.object('crm_rate_card').findOne({ where: { id: cardId }, fields: ['hourly_rate'] });
    if (card && num(card.hourly_rate) > 0) input.hourly_rate = num(card.hourly_rate);
  },
};

/**
 * 售前不按月拆分 — a Bizcase line carries its own whole-range figure and the
 * plan has NO month rows (2026-09-16, 「不需要在月度分解行中生成数据」). The
 * estimate is the line's factors priced exactly as `cost_line_decompose`
 * prices a delivery line's months — a labor line resolves the rate card
 * month by month and sums, a 人月 service is 单价 × 人数 × 工期, 人天 / 包干,
 * procurement and expenses are their totals — written to `estimate_amount`
 * on the line itself, which the plan's `*_line_total` summaries and the
 * presales project's four figures roll up. A delivery line's estimate is
 * cleared: its figure is the sum of its month rows (`allocated_amount`).
 */
const costLineEstimate: Hook = {
  name: 'cost_line_estimate',
  object: [...LINE_OBJECTS],
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 95,
  description: "Write a Bizcase line's whole-range estimate from its factors; clear it on a delivery line.",
  handler: async (ctx: HookContext) => {
    const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);
    const id = (v: unknown): string => (typeof v === 'string' && v !== '' ? v : '');
    const round2 = (v: number): number => Math.round(v * 100) / 100;
    const monthOf = (value: unknown): string => {
      if (value === null || value === undefined || value === '') return '';
      const d = value instanceof Date ? value : new Date(String(value));
      if (Number.isNaN(d.getTime())) return '';
      return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-01';
    };
    const addMonths = (ym: string, n: number): string => {
      const y = Number(ym.slice(0, 4)); const m = Number(ym.slice(5, 7)) - 1 + n;
      return (y + Math.floor(m / 12)) + '-' + String((m % 12 + 12) % 12 + 1).padStart(2, '0') + '-01';
    };
    const covers = (row: Record<string, unknown>, ym: string): boolean => {
      const from = monthOf(row.effective_from); const to = monthOf(row.effective_to);
      return (!from || from <= ym) && (!to || to >= ym);
    };
    const api = ctx.api as HookApi | undefined;
    const { input, previous } = ctx;
    if (!input || !api) return;
    const factors = ['crm_cost_plan', 'start_month', 'end_month', 'headcount', 'hours_per_month', 'crm_rate_card', 'pricing_basis', 'unit_price', 'duration', 'quantity', 'expense_type', 'crm_travel_standard', 'trips', 'travelers', 'days', 'budget_amount'];
    if (ctx.event === 'beforeUpdate' && !factors.some((f) => input[f] !== undefined)) return;
    const line = { ...(previous ?? {}), ...input } as Record<string, unknown>;
    const object = typeof ctx.object === 'string' && ctx.object.endsWith('_cost_line') ? ctx.object : line.crm_rate_card !== undefined ? 'crm_labor_cost_line' : line.pricing_basis !== undefined ? 'crm_service_cost_line' : line.procurement_category !== undefined ? 'crm_procurement_cost_line' : 'crm_expense_cost_line';
    const planId = id(line.crm_cost_plan);
    const start = monthOf(line.start_month);
    if (!planId || !start) return;
    const plan = await api.object('crm_cost_plan').findOne({ where: { id: planId }, fields: ['phase', 'crm_presales_project'] });
    const bizcase = plan?.phase === 'bizcase' || (!plan?.phase && !!id(plan?.crm_presales_project));
    if (!bizcase) {
      if (num(previous?.estimate_amount) !== 0) input.estimate_amount = null;
      return;
    }
    const category = object === 'crm_labor_cost_line' ? 'labor' : object === 'crm_service_cost_line' ? 'third_party_service' : object === 'crm_procurement_cost_line' ? 'procurement' : 'expense';
    let end = monthOf(line.end_month) || start;
    if (category === 'third_party_service' && line.pricing_basis === 'per_month' && num(line.duration) > 0) end = addMonths(start, Math.ceil(num(line.duration)) - 1);
    if (end < start) end = start;
    const months: string[] = [];
    for (let ym = start; ym <= end && months.length < 120; ym = addMonths(ym, 1)) months.push(ym);
    const headcount = num(line.headcount) || 1;
    let total = 0;
    if (category === 'labor') {
      const card = await api.object('crm_rate_card').findOne({ where: { id: id(line.crm_rate_card) }, fields: ['name', 'rate_standard', 'hourly_rate'] });
      const where: Record<string, unknown> = { name: card?.name };
      if (card?.rate_standard) where.rate_standard = card.rate_standard;
      const rates = card ? await api.object('crm_rate_card').find({ where, fields: ['hourly_rate', 'effective_from', 'effective_to', 'is_active'] }) : [];
      for (const ym of months) {
        const live = rates.find((r) => r.is_active !== false && covers(r, ym)) ?? { hourly_rate: card?.hourly_rate };
        total = round2(total + round2(headcount * num(line.hours_per_month) * num(live?.hourly_rate)));
      }
    } else if (category === 'third_party_service') {
      total = line.pricing_basis === 'per_month' ? round2(num(line.unit_price) * headcount) * months.length : line.pricing_basis === 'per_day' ? num(line.unit_price) * headcount * num(line.duration) : num(line.unit_price);
    } else if (category === 'procurement') {
      total = num(line.quantity) * num(line.unit_price);
    } else if (line.expense_type === 'travel') {
      const std = await api.object('crm_travel_standard').findOne({ where: { id: id(line.crm_travel_standard) }, fields: ['lodging_per_day', 'meal_per_day', 'local_transport_per_day', 'fare_per_trip'] });
      const daily = num(std?.lodging_per_day) + num(std?.meal_per_day) + num(std?.local_transport_per_day);
      total = num(line.trips) * (num(line.travelers) || 1) * (num(std?.fare_per_trip) + num(line.days) * daily);
    } else {
      total = num(line.budget_amount);
    }
    input.estimate_amount = round2(total);
  },
};

/**
 * Month rows carry what the ledger needs regardless of who wrote them: the
 * month normalised to its first day, the category paired to the line lookup,
 * a description when none came (the decomposition passes the line's), the
 * amount when only its factors were given, the unique 分解键, and the 手工调整
 * flag when a person changed a figure.
 */
const costPlanMonthFill: Hook = {
  name: 'cost_plan_month_fill',
  object: 'crm_cost_plan_month',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  description: 'Normalise the month, pair the category to the line lookup, derive amount, description and the unique allocation key.',
  handler: async (ctx: HookContext) => {
    const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);
    const id = (v: unknown): string => (typeof v === 'string' && v !== '' ? v : '');
    const monthOf = (value: unknown): string => {
      if (value === null || value === undefined || value === '') return '';
      const d = value instanceof Date ? value : new Date(String(value));
      if (Number.isNaN(d.getTime())) return '';
      return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-01';
    };
    const { input, previous } = ctx;
    if (!input) return;
    const row = { ...(previous ?? {}), ...input };
    const month = monthOf(row.period_month);
    if (month && month !== row.period_month) input.period_month = month;
    const lines: Array<[string, string]> = [['labor', 'crm_labor_cost_line'], ['third_party_service', 'crm_service_cost_line'], ['procurement', 'crm_procurement_cost_line'], ['expense', 'crm_expense_cost_line']];
    const pair = lines.find(([, f]) => id(row[f])) ?? lines.find(([c]) => c === row.category);
    if (!pair) return;
    const [category, lineField] = pair;
    if (row.category !== category) input.category = category;
    const lineId = id(row[lineField]);
    if (!row.description && month) input.description = category + ' · ' + month.slice(0, 7);
    const factors = ['headcount', 'quantity', 'unit_price'];
    const touched = factors.some((f) => input[f] !== undefined);
    if (input.amount === undefined && (touched || ctx.event === 'beforeInsert') && num(row.unit_price) > 0) {
      input.amount = Math.round((num(row.headcount) || 1) * (num(row.quantity) || 1) * num(row.unit_price) * 100) / 100;
    }
    if (ctx.event === 'beforeUpdate' && input.is_manual === undefined && ['amount', 'period_month', ...factors].some((f) => input[f] !== undefined && input[f] !== previous?.[f])) {
      input.is_manual = true;
    }
    if (lineId && month) input.allocation_key = category + ':' + lineId + ':' + month.slice(0, 7);
  },
};

/**
 * 分解至各月度 — after a line is saved, one month row per month in its range
 * (the line object is `ctx.object`, or is read off the line's own fields when
 * a runner hands the body no object name):
 * a labor month is 人数 × 工时 × the rate effective that month; a 人月 service
 * month is 单价 × 人数; a 人天 / 包干 service, a procurement and an expense total
 * are spread evenly, the last month taking the rounding remainder. Rows a
 * person marked 手工调整 are kept; rows that fell out of the range are removed.
 *
 * A Bizcase (售前) plan has NO month rows (2026-09-16, 「不需要在月度分解行中
 * 生成数据」): its line carries its figure itself (`cost_line_estimate`), so
 * on a Bizcase this hook writes nothing and removes whatever rows a line
 * still has from before the rule — 手工调整 or not, nothing on a Bizcase reads
 * the ledger. The month split happens on the delivery plan the Bizcase is
 * imported into.
 */
const costLineDecompose: Hook = {
  name: 'cost_line_decompose',
  object: [...LINE_OBJECTS],
  events: ['afterInsert', 'afterUpdate'],
  priority: 200,
  // A twelve-month line is twelve ledger writes, each cascading through the
  // line, plan and project roll-ups and their sandboxed hooks (measured at
  // ~2 s per month on SQLite); the default 30 s ceiling is a line's worth.
  timeoutMs: 180000,
  description: 'Generate, refresh and prune the month rows of a cost line from its factors and month range.',
  handler: async (ctx: HookContext) => {
    const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);
    const id = (v: unknown): string => (typeof v === 'string' && v !== '' ? v : '');
    const round2 = (v: number): number => Math.round(v * 100) / 100;
    const monthOf = (value: unknown): string => {
      if (value === null || value === undefined || value === '') return '';
      const d = value instanceof Date ? value : new Date(String(value));
      if (Number.isNaN(d.getTime())) return '';
      return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-01';
    };
    const addMonths = (ym: string, n: number): string => {
      const y = Number(ym.slice(0, 4)); const m = Number(ym.slice(5, 7)) - 1 + n;
      return (y + Math.floor(m / 12)) + '-' + String((m % 12 + 12) % 12 + 1).padStart(2, '0') + '-01';
    };
    const covers = (row: Record<string, unknown>, ym: string): boolean => {
      const from = monthOf(row.effective_from); const to = monthOf(row.effective_to);
      return (!from || from <= ym) && (!to || to >= ym);
    };
    const api = ctx.api as HookApi | undefined;
    const factors = ['description', 'start_month', 'end_month', 'headcount', 'hours_per_month', 'crm_rate_card', 'pricing_basis', 'unit_price', 'duration', 'quantity', 'procurement_category', 'expense_type', 'crm_travel_standard', 'trips', 'travelers', 'days', 'budget_amount'];
    if (ctx.event === 'afterUpdate' && !factors.some((f) => ctx.input?.[f] !== undefined)) return;
    const line = (ctx.event === 'afterInsert' ? ctx.result : { ...(ctx.previous ?? {}), ...(ctx.input ?? {}) }) as Record<string, unknown> | undefined;
    const object = typeof ctx.object === 'string' && ctx.object.endsWith('_cost_line') ? ctx.object : line?.crm_rate_card !== undefined ? 'crm_labor_cost_line' : line?.pricing_basis !== undefined ? 'crm_service_cost_line' : line?.procurement_category !== undefined ? 'crm_procurement_cost_line' : 'crm_expense_cost_line';
    const lineId = id(line?.id);
    const planId = id(line?.crm_cost_plan);
    const start = monthOf(line?.start_month);
    if (!api || !line || !lineId || !planId || !start) return;
    const category = object === 'crm_labor_cost_line' ? 'labor' : object === 'crm_service_cost_line' ? 'third_party_service' : object === 'crm_procurement_cost_line' ? 'procurement' : 'expense';
    let end = monthOf(line.end_month) || start;
    if (category === 'third_party_service' && line.pricing_basis === 'per_month' && num(line.duration) > 0) end = addMonths(start, Math.ceil(num(line.duration)) - 1);
    if (end < start) end = start;
    const months: string[] = [];
    for (let ym = start; ym <= end && months.length < 120; ym = addMonths(ym, 1)) months.push(ym);
    // Bizcase (售前): no month rows. A plan whose phase is not written yet is
    // read off the project it hangs on.
    const plan = await api.object('crm_cost_plan').findOne({ where: { id: planId }, fields: ['phase', 'crm_presales_project'] });
    if (plan?.phase === 'bizcase' || (!plan?.phase && !!id(plan?.crm_presales_project))) {
      const left = await api.object('crm_cost_plan_month').find({ where: { [object]: lineId }, fields: ['id'] });
      for (const row of left) await api.object('crm_cost_plan_month').delete({ where: { id: id(row.id) } });
      return;
    }
    const headcount = num(line.headcount) || 1;
    let total = 0;
    let rates: Array<Record<string, unknown>> = [];
    if (category === 'labor') {
      const card = await api.object('crm_rate_card').findOne({ where: { id: id(line.crm_rate_card) }, fields: ['name', 'rate_standard', 'hourly_rate'] });
      const where: Record<string, unknown> = { name: card?.name };
      if (card?.rate_standard) where.rate_standard = card.rate_standard;
      rates = card ? await api.object('crm_rate_card').find({ where, fields: ['hourly_rate', 'effective_from', 'effective_to', 'is_active'] }) : [];
      if (card) rates.push({ hourly_rate: card.hourly_rate, fallback: true });
    } else if (category === 'third_party_service') {
      total = line.pricing_basis === 'per_day' ? num(line.unit_price) * headcount * num(line.duration) : line.pricing_basis === 'lump_sum' ? num(line.unit_price) : 0;
    } else if (category === 'procurement') {
      total = num(line.quantity) * num(line.unit_price);
    } else if (line.expense_type === 'travel') {
      const std = await api.object('crm_travel_standard').findOne({ where: { id: id(line.crm_travel_standard) }, fields: ['lodging_per_day', 'meal_per_day', 'local_transport_per_day', 'fare_per_trip'] });
      const daily = num(std?.lodging_per_day) + num(std?.meal_per_day) + num(std?.local_transport_per_day);
      total = num(line.trips) * (num(line.travelers) || 1) * (num(std?.fare_per_trip) + num(line.days) * daily);
    } else {
      total = num(line.budget_amount);
    }
    const lineField = object;
    const existing = await api.object('crm_cost_plan_month').find({ where: { [lineField]: lineId }, fields: ['id', 'period_month', 'is_manual'] });
    const byMonth = new Map<string, Record<string, unknown>>();
    for (const row of existing) byMonth.set(monthOf(row.period_month), row);
    const kept = new Set<string>();
    const share = round2(total / months.length);
    let spread = 0;
    for (let i = 0; i < months.length; i += 1) {
      const ym = months[i]!;
      const found = byMonth.get(ym);
      kept.add(ym);
      if (found?.is_manual === true) continue;
      const row: Record<string, unknown> = { crm_cost_plan: planId, category, [lineField]: lineId, period_month: ym, is_manual: false, headcount, description: String(line.description ?? '') + ' · ' + ym.slice(0, 7) };
      if (category === 'labor') {
        const live = rates.find((r) => !r.fallback && r.is_active !== false && covers(r, ym)) ?? rates.find((r) => r.fallback);
        row.quantity = num(line.hours_per_month);
        row.unit_price = num(live?.hourly_rate);
        row.amount = round2(headcount * num(line.hours_per_month) * num(live?.hourly_rate));
      } else if (category === 'third_party_service' && line.pricing_basis === 'per_month') {
        row.quantity = 1;
        row.unit_price = num(line.unit_price);
        row.amount = round2(num(line.unit_price) * headcount);
      } else {
        const amount = i === months.length - 1 ? round2(total - spread) : share;
        spread = round2(spread + amount);
        row.quantity = category === 'procurement' ? num(line.quantity) : num(line.trips) || 1;
        row.unit_price = category === 'procurement' ? num(line.unit_price) : undefined;
        row.amount = amount;
        if (category === 'expense') row.expense_type = line.expense_type;
      }
      if (row.unit_price === undefined) delete row.unit_price;
      if (found) {
        const foundId = id(found.id);
        await api.object('crm_cost_plan_month').update({ id: foundId, ...row }, { where: { id: foundId } });
      } else {
        await api.object('crm_cost_plan_month').insert(row);
      }
    }
    for (const [ym, stale] of byMonth) {
      if (kept.has(ym) || stale.is_manual === true) continue;
      await api.object('crm_cost_plan_month').delete({ where: { id: id(stale.id) } });
    }
  },
};

/**
 * Step 32 on top of versions. An adjustment that names a plan version takes
 * its amount from the version totals (new − current); when it is approved the
 * named version becomes current and approved, and `cost_plan_defaults`
 * retires the version it replaces.
 */
const budgetAdjustmentAmount: Hook = {
  name: 'budget_adjustment_amount',
  object: 'crm_budget_adjustment',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  description: 'Adjustment amount = named plan version total − current version total.',
  handler: async (ctx: HookContext) => {
    const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);
    const id = (v: unknown): string => (typeof v === 'string' && v !== '' ? v : '');
    const api = ctx.api as HookApi | undefined;
    const { input, previous } = ctx;
    if (!input || !api) return;
    const planId = id(input.crm_cost_plan !== undefined ? input.crm_cost_plan : previous?.crm_cost_plan);
    if (!planId || (input.crm_cost_plan === undefined && input.amount !== undefined)) return;
    // `planned_total` is a formula (virtual); the version total is its stored
    // parts — the month ledger plus the four line estimates, one side zero.
    const parts = ['planned_month_total', 'labor_line_total', 'service_line_total', 'procurement_line_total', 'expense_line_total'];
    const totalOf = (row: Record<string, unknown> | null | undefined): number => parts.reduce((acc, k) => acc + num(row?.[k]), 0);
    const plan = await api.object('crm_cost_plan').findOne({ where: { id: planId }, fields: [...parts, 'crm_delivery_project'] });
    if (!plan) return;
    const projectId = id(plan.crm_delivery_project) || id(input.crm_delivery_project !== undefined ? input.crm_delivery_project : previous?.crm_delivery_project);
    if (!projectId) return;
    const current = await api.object('crm_cost_plan').findOne({ where: { crm_delivery_project: projectId, is_current: true }, fields: parts });
    if (!id(input.crm_delivery_project) && !id(previous?.crm_delivery_project)) input.crm_delivery_project = projectId;
    input.amount = Math.round((totalOf(plan) - totalOf(current)) * 100) / 100;
  },
};

const budgetAdjustmentVersionFlip: Hook = {
  name: 'budget_adjustment_version_flip',
  object: 'crm_budget_adjustment',
  events: ['afterUpdate'],
  priority: 200,
  onError: 'log',
  description: 'An approved adjustment puts the plan version it names in force.',
  handler: async (ctx: HookContext) => {
    const id = (v: unknown): string => (typeof v === 'string' && v !== '' ? v : '');
    const api = ctx.api as HookApi | undefined;
    const { input, previous } = ctx;
    if (!api || !input || input.approval_status !== 'approved' || previous?.approval_status === 'approved') return;
    const planId = id(input.crm_cost_plan !== undefined ? input.crm_cost_plan : previous?.crm_cost_plan);
    if (!planId) return;
    await api.object('crm_cost_plan').update({ id: planId, is_current: true, approval_status: 'approved', approved_date: new Date().toISOString() }, { where: { id: planId } });
  },
};

export default [costPlanDefaults, costPlanCompare, costPlanLock, costLineRateFill, costLineEstimate, costPlanMonthFill, costLineDecompose, budgetAdjustmentAmount, budgetAdjustmentVersionFlip];
