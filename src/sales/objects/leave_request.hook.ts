// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';
import type { HookApi } from './_hook-api';

/**
 * 请假申请 — round 2 (step 33 「请假、加班申请同步后自动更新」).
 *
 * `leave_days_fill` — working days (Mon–Fri) between the two dates, written
 * on every insert/update that carries either date.
 *
 * `leave_timesheet_sync` — once a leave is approved (or an approved leave is
 * withdrawn, rejected or re-dated), every timesheet of the same person for
 * the months the leave touches is re-saved with the recomputed leave hours;
 * `timesheet_attendance_sync` (timesheet.hook.ts) then rewrites `hours` and
 * `cost` on sheets that are still drafts.
 *
 * Both handlers keep their calendar helpers inline so they lower to metadata.
 */
const leaveDaysFill: Hook = {
  name: 'leave_days_fill',
  object: 'crm_leave_request',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  description: 'Working days between start and end (Mon–Fri).',
  handler: async (ctx: HookContext) => {
    const toUtcDay = (value: unknown): Date | null => {
      if (value === null || value === undefined || value === '') return null;
      const d = value instanceof Date ? value : new Date(String(value));
      if (Number.isNaN(d.getTime())) return null;
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    };
    const { input, previous } = ctx;
    if (!input) return;
    if (input.start_date === undefined && input.end_date === undefined) return;
    const a = toUtcDay(input.start_date !== undefined ? input.start_date : previous?.start_date);
    const b = toUtcDay(input.end_date !== undefined ? input.end_date : previous?.end_date);
    let n = 0;
    if (a && b && b >= a) {
      for (let t = a.getTime(); t <= b.getTime(); t += 86_400_000) {
        const dow = new Date(t).getUTCDay();
        if (dow !== 0 && dow !== 6) n += 1;
      }
    }
    input.days = n;
  },
};

const leaveTimesheetSync: Hook = {
  name: 'leave_timesheet_sync',
  object: 'crm_leave_request',
  events: ['afterInsert', 'afterUpdate'],
  priority: 200,
  description: 'Re-save the submitter\'s timesheets for the months an approved leave touches, so their leave hours follow.',
  handler: async (ctx: HookContext) => {
    const toUtcDay = (value: unknown): Date | null => {
      if (value === null || value === undefined || value === '') return null;
      const d = value instanceof Date ? value : new Date(String(value));
      if (Number.isNaN(d.getTime())) return null;
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    };
    const api = ctx.api as HookApi | undefined;
    const { input, previous } = ctx;
    if (!api || !input) return;
    const merged: Record<string, unknown> = { ...(previous ?? {}), ...input };
    const wasApproved = previous?.approval_status === 'approved';
    const isApproved = merged.approval_status === 'approved';
    const datesTouched = input.start_date !== undefined || input.end_date !== undefined || input.owner_id !== undefined;
    if (!isApproved && !wasApproved) return;
    if (isApproved && wasApproved && !datesTouched) return;

    const owner = typeof merged.owner_id === 'string' ? merged.owner_id : '';
    if (!owner) return;
    const start = toUtcDay(merged.start_date); const end = toUtcDay(merged.end_date);
    const prevStart = toUtcDay(previous?.start_date); const prevEnd = toUtcDay(previous?.end_date);
    const lo = [start, prevStart].filter((d): d is Date => !!d).sort((a, b) => a.getTime() - b.getTime())[0];
    const hi = [end, prevEnd].filter((d): d is Date => !!d).sort((a, b) => b.getTime() - a.getTime())[0];
    if (!lo || !hi) return;

    const sheets = await api.object('crm_timesheet').find({ where: { owner_id: owner }, fields: ['id', 'period_month', 'leave_hours'] });
    for (const sheet of sheets) {
      const m = toUtcDay(sheet.period_month);
      if (!m) continue;
      const monthStart = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), 1));
      const monthEnd = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 0));
      if (monthEnd < lo || monthStart > hi) continue;
      await api.object('crm_timesheet').update({ id: String(sheet.id), leave_hours: sheet.leave_hours ?? 0 }, { where: { id: sheet.id } });
    }
  },
};

export default [leaveDaysFill, leaveTimesheetSync];
