// Copyright (c) 2026 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect } from 'vitest';
import { allHooks } from '../objectstack.composition';
import { extractHookBody } from '@objectstack/cli/hook-body';

/**
 * The roster of elevated hooks — house rule 11's other half.
 *
 * House rule 9 is "elevate as little as possible", so a hook that declares
 * `runAs: 'system'` is a deliberate deviation, and rule 11 says a deviation is
 * written down TWICE: a comment beside the code, and an entry in the roster of
 * the guard that would otherwise tidy it away. This file is that guard. Without
 * it the rule has no teeth here: `runAs` is one word in a hook literal, it
 * ships silently, and nothing anywhere would notice a second one appearing —
 * least of all on a hook that also WRITES, which is the case rule 9 is actually
 * about.
 *
 * ## What elevation does, measured rather than assumed (17.4.0)
 *
 * `installRunAsApi` swaps `ctx.api` alone, for the duration of the handler, and
 * `ScopedContext.withRunAs('system')` returns `sudo()` —
 * `{ ...triggering context, isSystem: true }`. Two consequences the cases below
 * pin, because both are load-bearing and neither is visible in the one word:
 *
 *  - **`ctx.session` is NOT elevated.** It is built separately, by
 *    `buildSession(opCtx.context)` off the triggering write. So a hook that
 *    branches on `ctx.session?.isSystem` — `timesheet_budget_gate` exempts seed
 *    replay that way — still reads the CALLER's flag, and its own declaration
 *    cannot satisfy its own exemption.
 *  - **Row-level security comes off every read the body makes.** That is the
 *    point of the one entry below, and the hazard everywhere else.
 *
 * ## The roster
 *
 * Three fork entries, of two kinds. Adding one is a decision someone has to
 * make on purpose: the first assertion goes red until the name is listed here,
 * and the pins after it hold every listed hook to what makes its elevation the
 * small one. A READER (`writes: false`) writes nothing and scans nothing. A
 * WRITER (`writes: true`) is the case rule 9 is actually about — a write that
 * needs elevation because the field is readonly and belongs to another record
 * (`hook-api-update-readonly-field` strips it on a user trigger) — so it is
 * held to the narrowest write there is: `update` only, never insert, delete or
 * upsert, and every call addressed to ONE record by id; its reads, if any,
 * are pinned like a reader's. The hooks upstream ships elevated are listed
 * separately below: they are argued beside their own declarations in
 * objectstack-ai/hotcrm, and the pins here are the fork's, not theirs.
 */

type AnyRec = Record<string, any>;

/**
 * Hooks allowed to run elevated, each with the reason in one line.
 *
 * ⛔ Do not add a name to get a red build green. The entry is the SECOND half
 * of rule 11 — the first half is the argument beside the declaration, and a
 * name here without one is exactly the drift this file exists to catch.
 */
const ELEVATED: ReadonlyArray<{ hook: string; writes: boolean; because: string }> = [
  {
    hook: 'timesheet_budget_gate',
    writes: false,
    because:
      'Reads the project\'s WHOLE booked cost. `crm_timesheet` is private with ' +
      "`readScope: 'own'` on sales_rep, so under `inherit` the gate would sum only the " +
      'filing person\'s own sheets and wave through a create on a project that is already ' +
      'over budget — the budget it compares against is not scoped to the actor, so the ' +
      'actuals must not be either. Reads only; writes nothing.',
  },
  {
    hook: 'cost_plan_defaults',
    writes: true,
    because:
      'When a version becomes current it retires the project\'s OTHER versions, stamping ' +
      "an approved one `superseded` on `approval_status` — readonly, the approval flow's " +
      'field. The trigger is a person (the next version, a Bizcase approval on a submit), ' +
      'so under `inherit` the write is stripped and the retired version keeps reading ' +
      'approved; no `ctx.input` stamp reaches another record. Reads pinned to the project ' +
      'id; every write names one record by id.',
  },
  {
    hook: 'budget_adjustment_version_flip',
    writes: true,
    because:
      'An approved adjustment stamps the plan version it names `approved` / `approved_date`, ' +
      "both readonly on `crm_cost_plan` (the approval flow's fields). The trigger is the " +
      'adjustment\'s own approval landing, so under `inherit` the version would flip to ' +
      'current while still reading its old status; the record being saved is the ' +
      'adjustment, not the plan. Reads nothing; the one write names the plan by id.',
  },
];

/**
 * Owned upstream (objectstack-ai/hotcrm): each of these is argued beside its
 * declaration there, and the fork does not re-litigate them. They are named
 * here only so the first assertion stays exact — a NEW elevation, fork or
 * upstream, still goes red until someone lists it on purpose. The fork's
 * pins below hold only the fork's own entries.
 */
const UPSTREAM_ELEVATED: ReadonlyArray<string> = [
  'article_feedback_metrics_refresh',
  'campaign_attribution_refresh',
  'campaign_lead_conversion_refresh',
  'campaign_member_metrics_refresh',
  'campaign_member_optout_sync',
  'campaign_metrics_refresh',
  'case_close_escalation_task',
  'case_escalation_reassign',
  'case_resolution_account_activity',
  'event_activity_bubble',
  'lead_duplicate_check',
  'line_item_product_title_backfill',
  'opportunity_account_capability',
  'opportunity_line_item_line_number',
  'opportunity_promote_account',
  'product_standard_price',
  'product_title_mirror',
  'quote_accepted_contract_draft',
  'quote_line_item_line_number',
  'task_activity_bubble',
];

/** Every hook the app registers, with its lowered body — what the artifact carries. */
const HOOKS: Array<{ name: string; runAs: string; source: string }> = (allHooks as AnyRec[]).map((h) => ({
  name: h.name as string,
  runAs: typeof h.runAs === 'string' ? h.runAs : 'inherit',
  source: extractHookBody(h.handler as never, `hook '${h.name}'`).source,
}));

const rostered = new Set(ELEVATED.map((e) => e.hook));

describe('every elevated hook is on the roster (house rules 9 and 11)', () => {
  it('swept a real set of hooks — the anti-vacuity half', () => {
    // A sweep that silently found nothing would make every assertion below
    // vacuously true, which is the failure mode a roster guard is worst at
    // noticing about itself.
    expect(HOOKS.length).toBeGreaterThan(20);
    expect(HOOKS.every((h) => h.source.length > 0)).toBe(true);
  });

  it('the elevated set is exactly the roster', () => {
    const elevated = HOOKS.filter((h) => h.runAs === 'system').map((h) => h.name).sort();
    expect(elevated, 'a hook declares `runAs: \'system\'` without an entry in ELEVATED above (or vice versa)').toEqual(
      [...rostered, ...UPSTREAM_ELEVATED].sort(),
    );
  });

  it('declares nothing but system or inherit — `user` on a hook is an unscoped refusal waiting to happen', () => {
    // `withRunAs('user')` with no `userId` on the triggering context hands the
    // body an `UnscopedHookApi` whose every data door throws
    // HOOK_UNSCOPED_DATA_ACCESS — a pin, not a scope. Nothing here wants it,
    // and a hook that acquires it should be a decision, not a typo.
    expect(HOOKS.filter((h) => h.runAs === 'user').map((h) => h.name)).toEqual([]);
  });
});

const readers = ELEVATED.filter((e) => !e.writes).map((e) => e.hook);
const writers = ELEVATED.filter((e) => e.writes).map((e) => e.hook);

describe('what makes the rostered elevation the small one', () => {
  const bodies = HOOKS.filter((h) => rostered.has(h.name));

  it('found every rostered hook', () => {
    expect(bodies.map((b) => b.name).sort()).toEqual([...rostered].sort());
  });

  it('rosters both kinds — a roster of readers alone would pin nothing about a write', () => {
    expect(readers.length).toBeGreaterThan(0);
    expect(writers.length).toBeGreaterThan(0);
  });

  it.each(readers)('%s writes nothing under elevation', (name) => {
    // Rule 9 is about a WRITE that needs elevation. An elevated body that only
    // reads cannot produce one, and that is the whole safety argument beside
    // the declaration — so it is pinned here rather than trusted. `ctx.input`
    // is the other write surface a beforeInsert hook has; this gate throws or
    // returns and touches neither.
    const body = bodies.find((b) => b.name === name)!.source;
    expect(body, 'an elevated body performs a data write').not.toMatch(/\.(insert|update|delete|upsert)\s*\(/);
    expect(body, 'an elevated body assigns to ctx.input').not.toMatch(/input\.[A-Za-z_$][\w$]*\s*=[^=]/);
  });

  it.each(readers)('%s scans nothing — every read is pinned to one parent record', (name) => {
    // House rule 10 in the shape it takes here. An elevated read is not
    // organization-scoped by the platform, so an unpinned `find` would be a
    // cross-organization scan. Every query in this body carries a `where` that
    // names the project id, and a row of another organization cannot carry it.
    const body = bodies.find((b) => b.name === name)!.source;
    const reads = pinnedReads(body);
    expect(reads.length, 'no reads were matched — the pin would be vacuous').toBeGreaterThan(0);
    for (const read of reads) {
      expect(read, `an unpinned read in ${name}: ${read.trim()}`).toMatch(/where:\s*\{[^}]*projectId/);
    }
  });

  it.each(writers)('%s updates one record by id and does nothing else to the data', (name) => {
    // The writer's elevation exists for ONE write — a readonly field on another
    // record — so the body is held to exactly that shape: `update` is the only
    // data verb, and every `update` carries `{ where: { id: <one id> } }` as
    // its second argument. An elevated insert, a delete, an upsert, or an
    // update addressed by anything but a single id is a scope, not a stamp.
    const body = bodies.find((b) => b.name === name)!.source;
    expect(body, 'an elevated writer performs a write other than update').not.toMatch(/\.(insert|delete|upsert)\s*\(/);
    const updates = body.match(/\.update\s*\(/g) ?? [];
    expect(updates.length, 'no update was matched — the pin would be vacuous').toBeGreaterThan(0);
    const byId = body.match(/\.update\s*\(\s*\{[^{}]*\}\s*,\s*\{\s*where:\s*\{\s*id:\s*[A-Za-z_$][\w$]*\s*\}\s*\}\s*\)/g) ?? [];
    expect(byId.length, `an update in ${name} is not addressed to one record by id`).toBe(updates.length);
  });

  it.each(writers)('%s scans nothing — any read is pinned to one parent record', (name) => {
    // Same pin as the readers', minus the anti-vacuity floor: a writer may
    // read nothing at all (`budget_adjustment_version_flip` does not).
    const body = bodies.find((b) => b.name === name)!.source;
    for (const read of pinnedReads(body)) {
      expect(read, `an unpinned read in ${name}: ${read.trim()}`).toMatch(/where:\s*\{[^}]*projectId/);
    }
  });
});

/** The argument object of every `find` / `findOne` / `count` in a lowered body. */
function pinnedReads(body: string): string[] {
  return [...body.matchAll(/\.(find|findOne|count)\(\s*\{([^}]*\{[^}]*\}[^}]*)\}\s*\)/g)].map((m) => m[2]!);
}
