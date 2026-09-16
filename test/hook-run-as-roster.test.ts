// Copyright (c) 2026 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect } from 'vitest';
import { allHooks } from '../src/hooks';
import { extractSandboxBody } from './helpers/action-sandbox';

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
 * One entry. Adding a second is a decision someone has to make on purpose: the
 * first assertion goes red until the name is listed here, and the two after it
 * hold every listed hook to what makes this elevation the small one — it writes
 * nothing, and it scans nothing.
 */

type AnyRec = Record<string, any>;

/**
 * Hooks allowed to run elevated, each with the reason in one line.
 *
 * ⛔ Do not add a name to get a red build green. The entry is the SECOND half
 * of rule 11 — the first half is the argument beside the declaration, and a
 * name here without one is exactly the drift this file exists to catch.
 */
const ELEVATED: ReadonlyArray<{ hook: string; because: string }> = [
  {
    hook: 'timesheet_budget_gate',
    because:
      'Reads the project\'s WHOLE booked cost. `crm_timesheet` is private with ' +
      "`readScope: 'own'` on sales_rep, so under `inherit` the gate would sum only the " +
      'filing person\'s own sheets and wave through a create on a project that is already ' +
      'over budget — the budget it compares against is not scoped to the actor, so the ' +
      'actuals must not be either. Reads only; writes nothing.',
  },
];

/** Every hook the app registers, with its lowered body — what the artifact carries. */
const HOOKS: Array<{ name: string; runAs: string; source: string }> = (allHooks as AnyRec[]).map((h) => ({
  name: h.name as string,
  runAs: typeof h.runAs === 'string' ? h.runAs : 'inherit',
  source: extractSandboxBody(h.handler, `hook '${h.name}'`).source,
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
      [...rostered].sort(),
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

describe('what makes the rostered elevation the small one', () => {
  const bodies = HOOKS.filter((h) => rostered.has(h.name));

  it('found every rostered hook', () => {
    expect(bodies.map((b) => b.name).sort()).toEqual([...rostered].sort());
  });

  it.each([...rostered])('%s writes nothing under elevation', (name) => {
    // Rule 9 is about a WRITE that needs elevation. An elevated body that only
    // reads cannot produce one, and that is the whole safety argument beside
    // the declaration — so it is pinned here rather than trusted. `ctx.input`
    // is the other write surface a beforeInsert hook has; this gate throws or
    // returns and touches neither.
    const body = bodies.find((b) => b.name === name)!.source;
    expect(body, 'an elevated body performs a data write').not.toMatch(/\.(insert|update|delete|upsert)\s*\(/);
    expect(body, 'an elevated body assigns to ctx.input').not.toMatch(/input\.[A-Za-z_$][\w$]*\s*=[^=]/);
  });

  it.each([...rostered])('%s scans nothing — every read is pinned to one parent record', (name) => {
    // House rule 10 in the shape it takes here. An elevated read is not
    // organization-scoped by the platform, so an unpinned `find` would be a
    // cross-organization scan. Every query in this body carries a `where` that
    // names the project id, and a row of another organization cannot carry it.
    const body = bodies.find((b) => b.name === name)!.source;
    const reads = [...body.matchAll(/\.(find|findOne|count)\(\s*\{([^}]*\{[^}]*\}[^}]*)\}\s*\)/g)].map((m) => m[2]!);
    expect(reads.length, 'no reads were matched — the pin would be vacuous').toBeGreaterThan(0);
    for (const read of reads) {
      expect(read, `an unpinned read in ${name}: ${read.trim()}`).toMatch(/where:\s*\{[^}]*projectId/);
    }
  });
});
