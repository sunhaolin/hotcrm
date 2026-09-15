// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect } from 'vitest';
import { TimesheetViews } from '../src/views/timesheet.view';
import { Timesheet } from '../src/objects/timesheet.object';

/**
 * A timesheet's PRICE is derived, so it is not authored.
 *
 * Customer ruling, verbatim: 「人工成本字段在新建和编辑时不显示，费率标准也不显示。
 * 计算人工成本时使用的费率从选择的岗位级别 / 费率卡中获取。」
 *
 * ## What made this a defect rather than polish
 *
 * `hourly_rate` and `cost` sat on `TimesheetViews.form`, which the console
 * resolves for BOTH `/new` and every later edit — so every sheet created
 * through the UI posted the two empty boxes as `hourly_rate: 0`, and
 * `timesheet_rate_fill`'s old guard (`input.hourly_rate !== undefined`) read
 * that zero as a rate the author had chosen and declined to price the sheet
 * from its rate card. A sheet with a grade picked and 160 hours booked stored a
 * cost of `0.00`, and `crm_delivery_project.labor_actual` summed it as such.
 *
 * ## What this suite pins — BOTH directions
 *
 * 1. REMOVAL — neither derived column is on the form, and the form's
 *    AUTHORABLE set is closed, so a newly added hook-written column fails here
 *    too rather than quietly appearing at intake.
 * 2. RETENTION — each column removed from the form keeps the surfaces it
 *    legitimately belongs to. A pin that only checked the removal would go
 *    green on a change that deleted the columns from the list view as well,
 *    which is the failure `test/case-create-form-narrowing.test.ts` names for
 *    the same narrowing on `crm_case`.
 *
 * ⚠️ The retention side reads `fieldGroups`, not a page file: `crm_timesheet`
 * authors no `src/pages/*.page.ts`, so its detail page is the one the console
 * SYNTHESIZES from the object's groups — the path `test/field-groups-coverage.test.ts`
 * measures. That is why `readonly` and not `hidden` is the declaration on the
 * two columns: `hidden` would take them off that page too.
 */

type AnyRec = Record<string, any>;

/** A form section's `fields` entry is either a bare name or `{ field }`. */
const fieldNamesOf = (section: AnyRec): string[] =>
  (section.fields ?? []).map((f: any) => (typeof f === 'string' ? f : f?.field)).filter(Boolean);

const formFields = (): string[] =>
  ((TimesheetViews as AnyRec).form?.sections ?? []).flatMap(fieldNamesOf);

const objectFields = (Timesheet as AnyRec).fields as Record<string, AnyRec>;

/**
 * What a person filling in a timesheet actually has in hand. CLOSED on
 * purpose: adding a field to this form is a decision, and it should be made
 * here as well as in the view.
 *
 * `timesheet_number`, `approval_status` and `approved_date` are on the form and
 * absent from this set because they are `readonly: true` on the object — the
 * renderer disables them, so they are shown and never authored.
 */
const AUTHORABLE = new Set([
  'crm_delivery_project',
  'crm_presales_project',
  'owner_id',
  'period_month',
  'crm_rate_card',
  'standard_hours',
  'leave_hours',
  'overtime_hours',
  'hours',
  'notes',
]);

/**
 * The columns `timesheet.hook.ts` derives, with the writer that owns each and
 * the surfaces it must keep. Both are `readonly: true`, so the engine strips a
 * caller's own value on either write path and a hook's value survives.
 */
const HOOK_DERIVED: Record<string, { why: string; keeps: string[] }> = {
  hourly_rate: {
    why: '`timesheet_rate_fill` copies it from the rate card the sheet names',
    keeps: ['list.columns', 'detail.groups'],
  },
  cost: {
    why: '`timesheet_cost_fill` writes hours × rate; the delivery project sums it',
    keeps: ['list.columns', 'detail.groups', 'object.highlightFields'],
  },
};

/** Field names reachable on each named surface OUTSIDE the create/edit form. */
const surfaces = (): Record<string, Set<string>> => {
  const v = TimesheetViews as AnyRec;
  const o = Timesheet as AnyRec;
  const columns = new Set<string>(
    ((v.list?.columns ?? []) as any[]).map((c) => (typeof c === 'string' ? c : c?.field)).filter(Boolean),
  );
  // The synthesized detail page's sections are the object's `fieldGroups`, and
  // a field joins one by naming it in `group:`.
  const grouped = new Set<string>(
    Object.entries(objectFields)
      .filter(([, def]) => typeof def?.group === 'string' && def.group.length > 0 && def.hidden !== true)
      .map(([name]) => name),
  );
  const highlights = new Set<string>(
    ((o.highlightFields ?? []) as any[]).map((f) => (typeof f === 'string' ? f : f?.name)).filter(Boolean),
  );
  return { 'list.columns': columns, 'detail.groups': grouped, 'object.highlightFields': highlights };
};

describe('crm_timesheet form — removal direction', () => {
  it('is the create form: one form serves both create and edit', () => {
    // If a create-only form ever becomes authorable, this assertion is where
    // the reader is told the premise of this suite changed.
    const v = TimesheetViews as AnyRec;
    expect(v.form, '`form` is what the console resolves for /new and the + New modal').toBeTruthy();
    expect(v.formViews?.default, 'no `formViews.default` — the fallback branch is unused').toBeUndefined();
  });

  it('offers neither derived price column', () => {
    const present = formFields().filter((f) => f in HOOK_DERIVED);
    expect(
      present,
      `the timesheet form offers hook-derived column(s): ${present
        .map((f) => `${f} (${HOOK_DERIVED[f].why})`)
        .join('; ')}. An empty box for a value the engine strips prices sheets at zero — see the note on src/views/timesheet.view.ts`,
    ).toEqual([]);
  });

  it('its authorable set is exactly the set a submitter has in hand', () => {
    const authorable = formFields().filter((f) => objectFields[f]?.readonly !== true);
    expect(new Set(authorable)).toEqual(AUTHORABLE);
  });

  it('declares both derived columns readonly — the write-side half of the ruling', () => {
    for (const name of Object.keys(HOOK_DERIVED)) {
      expect(
        objectFields[name]?.readonly,
        `${name} must be readonly: taking it off the form hides the box, but an API caller ` +
          'can still post a rate the rate card did not set unless the column says so',
      ).toBe(true);
    }
  });

  it('keeps the rate card itself authorable — it is what the price is read from', () => {
    expect(formFields(), 'no rate card on the form means no rate at all').toContain('crm_rate_card');
    expect(objectFields.crm_rate_card?.readonly).not.toBe(true);
  });
});

describe('crm_timesheet form — retention direction', () => {
  const s = surfaces();

  for (const [field, { why, keeps }] of Object.entries(HOOK_DERIVED)) {
    it(`${field} keeps ${keeps.join(' + ')}`, () => {
      for (const surface of keeps) {
        expect(s[surface], `unknown surface "${surface}" in the roster`).toBeDefined();
        expect(
          Array.from(s[surface]),
          `${field} left ${surface} — narrowing the form must not strip the read surfaces (${why})`,
        ).toContain(field);
      }
    });
  }

  it('neither column is `hidden` — that would take it off the synthesized detail page too', () => {
    for (const name of Object.keys(HOOK_DERIVED)) {
      expect(
        objectFields[name]?.hidden,
        `${name} is a figure the project manager reads; only its INPUT was retired`,
      ).not.toBe(true);
    }
  });
});
