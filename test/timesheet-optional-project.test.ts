// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ObjectKernel } from '@objectstack/core';
import { DefaultDatasourcePlugin, AppPlugin } from '@objectstack/runtime';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { MetadataPlugin } from '@objectstack/metadata';
import {
  SecurityPlugin,
  appDefaultPermissionSetName,
  buildContextForUser,
} from '@objectstack/plugin-security';
import { SharingServicePlugin } from '@objectstack/plugin-sharing';
import { tenancyProbe } from './helpers/tenancy-probe';
import stack from '../objectstack.config';

/**
 * 「交付项目 不要必填」 — a timesheet without a delivery project, measured
 * against the real enforcement stack (2026-09-15).
 *
 * The delivery project on `crm_timesheet` is optional, which the docs promised
 * from the first day the object shipped ("Delivery Project *or* Presales
 * Project", "use the presales project for bid work") while the metadata refused
 * it: the field was a `masterDetail` and the object `controlled_by_parent`.
 *
 * ### Why the two halves are one decision, and why this file measures it
 *
 * An optional master-detail is not a shape the platform has, and dropping the
 * field's `required: true` does not make one. ABLATED both ways while this file
 * was written, on @objectstack/* 17.4.0:
 *
 *   - `masterDetail` + `required: true` → `ValidationError: Delivery Project is
 *     required`, in `beforeAll`, on the first sheet with no project.
 *   - `masterDetail` with the flag DELETED → the same error, verbatim.
 *     `Field.masterDetail()` stamps `required: true` on the field it returns,
 *     so the type is the requirement; the flag was only ever spelling it out.
 *
 * Behind that stands ADR-0055, which is why the sharing model moves with the
 * field rather than after it: `computeControlledByParentFilter` returns
 * `crm_delivery_project IN (<projects the caller can read>)`, and a row whose
 * FK is NULL matches no `$in` list — a sheet with no project would be invisible
 * to everyone, its own submitter included — while
 * `assertControlledByParentWrite` refuses a detail whose master reference is
 * empty (`MasterReferenceMissingError`, 422 MISSING_REQUIRED_FIELD).
 *
 * So the sheet gives up the derivation: `lookup` + `sharingModel: 'private'`,
 * anchored on its own `owner_id` — the shape `crm_leave_request` and
 * `crm_business_trip` already have, and the one a person's monthly record wants.
 * That is a change in WHO SEES WHAT, not only in what is required, and the two
 * cases below are what it comes to for an ordinary `sales_rep`: their own
 * sheets, whether or not a project is named, and nobody else's.
 *
 * Both cases fail on the old metadata — the fixture cannot even be built, since
 * validation refuses the first sheet with no project, and were it built the read
 * case would come back with the sheets on projects the rep OWNS rather than the
 * sheets the rep FILED. `test/parent-derived-reach.test.ts` is the sibling
 * measurement for the objects that DID keep the derivation; this file is
 * deliberately in the same shape, boot and all.
 */

type AnyRec = Record<string, any>;

process.env.OS_REGISTRY_LOG ??= 'silent';

const SYS = { isSystem: true } as AnyRec;

let kernel: AnyRec;
let ql: AnyRec;
/** ids, by role in the fixture. */
const id: Record<string, string> = {};
/** The `sales_rep` execution context under test. */
let repCtx: AnyRec;

/** Insert as the system, returning the new row's id. */
const insert = async (object: string, doc: AnyRec): Promise<string> => {
  const row = await ql.insert(object, doc, { context: SYS });
  return String(row?.id ?? row?.record?.id);
};

/** Insert as the rep — the path the write gate judges. */
const repInserts = async (object: string, doc: AnyRec): Promise<string> => {
  const row = await ql.insert(object, doc, { context: repCtx });
  return String(row?.id ?? row?.record?.id);
};

/** Ids of `object` visible to the rep, as fixture labels. */
const repSees = async (object: string): Promise<string[]> => {
  const rows = await ql.find(object, { where: {} }, { context: repCtx });
  const byId = new Map(Object.entries(id).map(([label, value]) => [value, label]));
  return (Array.isArray(rows) ? rows : [])
    .map((r: AnyRec) => byId.get(String(r.id)) ?? String(r.id))
    .sort();
};

beforeAll(async () => {
  kernel = new ObjectKernel({ logger: { level: 'silent' } } as never);
  await kernel.use(new DefaultDatasourcePlugin({ driver: 'memory', config: {} } as never));
  await kernel.use(new MetadataPlugin({ watch: false, artifactWatch: false, environmentId: 'proj_test' } as never));
  await kernel.use(new ObjectQLPlugin({ environmentId: 'proj_test' } as never));
  await kernel.use(new AppPlugin(stack as never, undefined as never, { skipSeedData: true } as never));
  await kernel.use(
    new SecurityPlugin({
      fallbackPermissionSet: appDefaultPermissionSetName((stack as AnyRec).permissions),
    } as never),
  );
  await kernel.use(tenancyProbe('single') as never);
  await kernel.use(new SharingServicePlugin());
  await kernel.bootstrap();
  ql = kernel.getService('objectql');

  // ── principals ────────────────────────────────────────────────────────
  // The first human user is auto-promoted to platform admin at boot, and an
  // admin bypasses every filter this file measures — burn that on a throwaway.
  await insert('sys_user', { name: 'Platform Admin', email: 'admin@timesheet-optional.test' });
  id.rep = await insert('sys_user', { name: 'Consultant', email: 'rep@timesheet-optional.test' });
  id.other = await insert('sys_user', { name: 'Colleague', email: 'other@timesheet-optional.test' });

  await insert('sys_user_position', { user_id: id.rep, position: 'sales_rep' });
  const sets = await ql.find('sys_permission_set', { where: {} }, { context: SYS });
  const salesRepSet = (sets as AnyRec[]).find((s) => s.name === 'sales_rep');
  await insert('sys_user_permission_set', { user_id: id.rep, permission_set_id: salesRepSet?.id });

  repCtx = await buildContextForUser(ql, id.rep);

  // ── a delivery project the rep does NOT own ───────────────────────────
  // Owned by the colleague on purpose: under the old derivation this project
  // was the rep's only route to any sheet booked on it, so a sheet the rep
  // filed here is exactly the row whose visibility the change moves. No
  // `budget_baseline`, so `timesheet_budget_gate` stands down (it refuses only
  // a project whose actuals already meet a positive baseline).
  const account = await insert('crm_account', {
    name: 'Delivery Customer', type: 'customer', is_active: true, owner_id: id.other,
  });
  const opportunity = await insert('crm_opportunity', {
    name: 'Platform Rollout', crm_account: account, stage: 'negotiation',
    amount: 500_000, close_date: '2026-12-01', owner_id: id.other,
  });
  const presales = await insert('crm_presales_project', {
    name: '售前立项', crm_opportunity: opportunity, owner_id: id.other,
  });
  id.project = await insert('crm_delivery_project', {
    name: '试点交付', crm_presales_project: presales, owner_id: id.other,
  });

  // ── the sheets ────────────────────────────────────────────────────────
  // Filed BY THE REP, through the rep's own context, so that every gate the
  // change touches is on the path: required-field validation, which is what
  // refuses a sheet with no project on the old metadata, and — for the sheet on
  // someone else's project — the record-level write gate. A system insert would
  // walk past both.
  id.sheet_attendance = await repInserts('crm_timesheet', {
    owner_id: id.rep, period_month: '2026-09-01', standard_hours: 160,
  });
  id.sheet_presales = await repInserts('crm_timesheet', {
    owner_id: id.rep, crm_presales_project: presales, period_month: '2026-08-01', standard_hours: 160,
  });
  id.sheet_on_project = await repInserts('crm_timesheet', {
    owner_id: id.rep, crm_delivery_project: id.project, period_month: '2026-07-01', standard_hours: 160,
  });
  // The colleague's sheet on the SAME project — the negative control. While the
  // sheet was parent-derived this row and the one above stood or fell together,
  // because neither belonged to the reader; own-scope separates them.
  id.sheet_other = await insert('crm_timesheet', {
    owner_id: id.other, crm_delivery_project: id.project, period_month: '2026-07-01', standard_hours: 160,
  });
}, 120_000);

afterAll(async () => {
  await kernel?.shutdown?.();
});

describe('a sheet no longer needs a delivery project', () => {
  it('the rep filed all three of their sheets, two of them with no delivery project', () => {
    // The fixture inserts are the assertion: each ran through the rep's own
    // context, and the two without a project are the writes that answered
    // `ValidationError: Delivery Project is required` while the field was a
    // master-detail — with or without the `required` flag (see the ablation in
    // the header). Guard the guard: an insert that silently returned nothing
    // would leave these labels undefined and let `repSees` below compare raw
    // id strings against nothing.
    for (const label of ['sheet_attendance', 'sheet_presales', 'sheet_on_project']) {
      expect(id[label], `${label} was not created`).toMatch(/\S/);
      expect(id[label], `${label} has no id`).not.toBe('undefined');
    }
  });

  it('the stored sheets keep the project the caller gave them, NULL included', async () => {
    const read = async (label: string): Promise<unknown> => {
      const row = await ql.findOne('crm_timesheet', { where: { id: id[label] } }, { context: SYS });
      return (row as AnyRec)?.crm_delivery_project ?? null;
    };
    expect(await read('sheet_attendance'), 'an attendance-only sheet acquired a project').toBeNull();
    expect(await read('sheet_presales'), 'a presales sheet acquired a delivery project').toBeNull();
    expect(await read('sheet_on_project')).toBe(id.project);
  });
});

describe('the sheets a rep reads are their own', () => {
  it('own sheets, project or no project — and not a colleague’s', async () => {
    // `sheet_on_project` is the positive control for the change of anchor: the
    // rep owns neither that delivery project nor any share on it, so under the
    // parent derivation this row was NOT readable and `sheet_other` was equally
    // not — the two moved together. Now the submitter's own three come back and
    // the colleague's does not, which is `private` + `readScope: 'own'` doing
    // exactly what `crm_leave_request` has always done.
    expect(
      await repSees('crm_timesheet'),
      'the sheet stopped being the submitter’s own record',
    ).toEqual(['sheet_attendance', 'sheet_on_project', 'sheet_presales']);
  });
});
