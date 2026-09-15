// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * CRM Seed Data — the aggregating export.
 *
 * Demo records for all core CRM objects, authored per object family in the
 * `*.seed.ts` modules below and collected here as the single `CrmSeedData`
 * array `objectstack.config.ts` registers. Uses `defineSeed()` for type-safe
 * field name checking at compile time.
 *
 * The families were one 100KB module until #635: it sat ~1.5KB under the
 * `pnpm hygiene` byte cap, so the next demo record — the billing addresses of
 * #638 — would have failed the build, and the cheapest way out would have been
 * deleting the explanatory comments the cap exists to protect. Where to add a
 * record now follows from the object:
 *
 *   - `_shared.ts`      seed doctrine + helpers used by more than one family
 *   - `catalog.seed.ts` products, and the catalogue price lookup
 *   - `sales.seed.ts`   accounts, contacts, leads, opportunities, opp lines
 *   - `service.seed.ts` tasks, cases, knowledge articles, events + attendees
 *   - `marketing.seed.ts` campaigns, campaign members
 *   - `revenue.seed.ts` contracts, quotes, quote lines, forecasts
 */
import type { Seed } from '@objectstack/spec/data';
import { products } from './catalog.seed';
import { accounts, contacts, leads, opportunities, opportunityLineItems } from './sales.seed';
import {
  tasks,
  cases,
  knowledgeArticles,
  events,
  eventAttendeesFromContacts,
  eventAttendeesFromLeads,
} from './service.seed';
import { campaigns, campaignMembersFromLeads, campaignMembersFromContacts } from './marketing.seed';
import { contracts, quotes, quoteLineItems, forecasts } from './revenue.seed';
import {
  psaAccounts, psaContacts, psaLeads, psaOpportunities, psaTasks, psaEvents,
  presalesProjects, deliveryProjects, costPlanLines, timesheets, travelCosts,
} from './psa.seed';
import {
  rateCards, legalEntities, psaContracts, budgetAdjustments, invoices, collections,
  purchaseContracts, salesOrders, businessTrips, leaveRequests,
} from './psa-round2.seed';
import {
  industryAccounts, industryContacts, industryLeads, industryOpportunities, industryContracts,
  industryPresalesProjects, industryDeliveryProjects, industryBusinessTrips, industryCostPlanLines,
  industryTimesheets, industryTravelCosts, industryBudgetAdjustments, industryInvoices, industryCollections,
  industryPurchaseContracts, industrySalesOrders, industryLeaveRequests, industryProducts, industryQuotes,
  industryQuoteLineItems, industryTasks, industryEvents,
} from './psa-industry.seed';

/**
 * Ownership and CRM positions are NOT seeded here — they can't be.
 *
 * A seed can't name a user. Lookup values are resolved against the target's
 * externalId and that only works for objects in the app's own graph, so
 * `owner_id: 'Dev Admin'` would store the literal string rather than an id (verified:
 * a `sys_user_position` row seeded that way is unmatchable by the real user
 * id), and `cel\`os.user.id\`` inside a seed evaluates to nothing. The id does
 * not exist until first boot.
 *
 * The `demo_bootstrap` scheduled flow (`src/flows/demo-bootstrap.flow.ts`)
 * does it at the only moment it can: once the first real user exists, its
 * periodic sweep claims every ownerless seeded record for that user.
 *
 * That sweep owns the app's ONE ownership column, `owner_id` (#548 retired the
 * app-authored `owner` lookup that used to sit beside it — the #622 split).
 * Seed writes run under `{ isSystem: true }`, which short-circuits the security
 * middleware, so its insert-time auto-stamp of `owner_id` never fires — "seeds
 * either declare those fields explicitly per record" — and per the paragraph
 * above these seeds cannot declare it. So a seeded row reaches the database
 * owned by nobody at the PLATFORM level (`owner_id` null), and under
 * `sharingModel: 'private'` such a row is editable by no one at all, admin
 * included. Nothing here should grow an `owner_id` seed value to paper over
 * that: the sweep is the mechanism, and `test/flow-scheduled.test.ts` holds it
 * to leaving no claimed object ownerless.
 */

/**
 * One dataset per object, whatever the composition.
 *
 * The Chinese demo families (`psa.seed.ts`, `psa-round2.seed.ts`,
 * `psa-industry.seed.ts`) author rows for objects the standard families also
 * seed — accounts, contacts, leads, opportunities, tasks, events, contracts,
 * products, quotes. Registering them as SEPARATE datasets would work at boot
 * (the loader replays each in turn), but `test/seed-consistency.test.ts` reads
 * every family through `one(object)` — "exactly one dataset per object" is the
 * invariant that lets a test say "the accounts" without knowing how many files
 * author them. So the families are folded here, per object, into the dataset
 * the standard file declares: same `object`, same `mode`, same `externalId`
 * (checked below, because an upsert keyed on a different column would silently
 * duplicate rows on every replay), with the Chinese records appended.
 */
const union = (base: Seed, ...more: Seed[]): Seed => {
  for (const extra of more) {
    if (extra.object !== base.object) {
      throw new Error(`seed union: ${extra.object} folded into ${base.object}`);
    }
    if (JSON.stringify(extra.externalId) !== JSON.stringify(base.externalId) || extra.mode !== base.mode) {
      throw new Error(`seed union: ${base.object} datasets disagree on externalId/mode`);
    }
  }
  return { ...base, records: [...base.records, ...more.flatMap((d) => d.records)] };
};

// The Chinese demo rows, one dataset per object. Order matters to the loader:
// master data (rate cards, legal entities) and contracts before the projects
// that reference them; trips before the travel costs booked to them; leave
// after the timesheets it syncs into; quote lines after quotes and products.
const zhAccounts = union(psaAccounts, industryAccounts);
const zhContacts = union(psaContacts, industryContacts);
const zhLeads = union(psaLeads, industryLeads);
const zhOpportunities = union(psaOpportunities, industryOpportunities);
const zhTasks = union(psaTasks, industryTasks);
const zhEvents = union(psaEvents, industryEvents);
const zhContracts = union(psaContracts, industryContracts);
const zhPresalesProjects = union(presalesProjects, industryPresalesProjects);
const zhDeliveryProjects = union(deliveryProjects, industryDeliveryProjects);
const zhBusinessTrips = union(businessTrips, industryBusinessTrips);
const zhCostPlanLines = union(costPlanLines, industryCostPlanLines);
const zhTimesheets = union(timesheets, industryTimesheets);
const zhTravelCosts = union(travelCosts, industryTravelCosts);
const zhBudgetAdjustments = union(budgetAdjustments, industryBudgetAdjustments);
const zhInvoices = union(invoices, industryInvoices);
const zhCollections = union(collections, industryCollections);
const zhPurchaseContracts = union(purchaseContracts, industryPurchaseContracts);
const zhSalesOrders = union(salesOrders, industrySalesOrders);
const zhLeaveRequests = union(leaveRequests, industryLeaveRequests);

/**
 * The Chinese-only demo set: what `HOTCRM_COMPOSITION=zh-demo` replays.
 *
 * A software company's year (华软股份) — 14 accounts, 13 opportunities, the
 * presales and delivery projects behind them, and the finance trail. Nothing
 * from the English storytelling families, so a demo audience never meets Acme
 * Corporation between two Chinese customers. `docs/demo/psa-presales/RUNBOOK.md`
 * is the only consumer; every build, test and CI job assembles `default`.
 */
export const ZhDemoSeedData: Seed[] = [
  zhAccounts,
  zhContacts,
  zhLeads,
  zhOpportunities,
  industryProducts,
  zhTasks,
  zhEvents,
  rateCards,
  legalEntities,
  zhContracts,
  industryQuotes,
  industryQuoteLineItems,
  zhPresalesProjects,
  zhDeliveryProjects,
  zhBusinessTrips,
  zhCostPlanLines,
  zhTimesheets,
  zhTravelCosts,
  zhBudgetAdjustments,
  zhInvoices,
  zhCollections,
  zhPurchaseContracts,
  zhSalesOrders,
  zhLeaveRequests,
];

/** All CRM seed datasets — the standard families, each carrying its Chinese rows. */
export const CrmSeedData: Seed[] = [
  union(accounts, zhAccounts),
  union(contacts, zhContacts),
  union(leads, zhLeads),
  union(opportunities, zhOpportunities),
  union(products, industryProducts),
  opportunityLineItems,
  union(tasks, zhTasks),
  cases,
  // Events come after the five objects their `related_to_*` lookups resolve
  // against (accounts, contacts, leads, opportunities, cases); the attendee
  // junctions come after the events they hang off.
  union(events, zhEvents),
  eventAttendeesFromContacts,
  eventAttendeesFromLeads,
  campaigns,
  campaignMembersFromLeads,
  campaignMembersFromContacts,
  rateCards,
  legalEntities,
  union(contracts, zhContracts),
  union(quotes, industryQuotes),
  union(quoteLineItems, industryQuoteLineItems),
  forecasts,
  knowledgeArticles,
  zhPresalesProjects,
  zhDeliveryProjects,
  zhBusinessTrips,
  zhCostPlanLines,
  zhTimesheets,
  zhTravelCosts,
  zhBudgetAdjustments,
  zhInvoices,
  zhCollections,
  zhPurchaseContracts,
  zhSalesOrders,
  zhLeaveRequests,
];

// ─────────────────────────────────────── the SaaS / multi-org composition ──

/**
 * Which SHAPE of this app a build assembles (#1361).
 *
 * `default` is the community/single-org app and is what every build produces
 * unless something asks otherwise — the demo org, its storytelling data, and
 * the `demo_bootstrap` sweep that binds that data to the first user.
 *
 * `saas` is the shape a multi-org operator deploys on the enterprise runtime
 * under a walled tenancy posture (`OS_TENANCY_POSTURE=isolated`). The two
 * differ ONLY by what the composition registers; no code branches at runtime,
 * nothing is decided per tenant, and no enterprise package is imported. See
 * {@link SaasTenantSeedData} for why the seed set shrinks and
 * `objectstack.config.ts` for the flow/permission halves.
 *
 * `zh-demo` is the community app with ONLY the Chinese demo rows — the same
 * flows and permission sets as `default`, a smaller seed set. See
 * {@link ZhDemoSeedData}.
 */
export type HotCrmComposition = 'default' | 'saas' | 'zh-demo';

/** The environment variable {@link resolveComposition} reads. */
export const COMPOSITION_ENV_VAR = 'HOTCRM_COMPOSITION';

/** Every value {@link resolveComposition} accepts, for diagnostics and tests. */
export const HOTCRM_COMPOSITIONS: readonly HotCrmComposition[] = ['default', 'saas', 'zh-demo'];

/**
 * Resolve the composition from the environment — and REFUSE anything else.
 *
 * The refusal is the point, and it is why this is a function rather than a
 * `=== 'saas'` comparison at the one call site. The failure mode a silent
 * default produces is not "the build is a bit wrong": `HOTCRM_COMPOSITION=sass`
 * would assemble the FULL demo union, and the operator would only find out when
 * every tenant they onboard receives nine accounts named after other people's
 * companies — a data-shape mistake that is expensive to unwind once tenants
 * have edited those rows. An unrecognised value therefore throws at
 * config-load time, where a build fails loudly and nothing has shipped.
 *
 * Unset and empty both mean `default`, deliberately: "no opinion" is the
 * community app, so no existing build, script or CI job changes behaviour by
 * saying nothing (`pnpm build`, `objectstack validate`, the cloud EE rigs'
 * `scripts/build-hotcrm-artifact.sh`).
 */
export function resolveComposition(
  raw: string | undefined = process.env[COMPOSITION_ENV_VAR],
): HotCrmComposition {
  const value = (raw ?? '').trim();
  if (value === '') return 'default';
  if ((HOTCRM_COMPOSITIONS as readonly string[]).includes(value)) {
    return value as HotCrmComposition;
  }
  throw new Error(
    `${COMPOSITION_ENV_VAR}="${value}" is not a HotCRM composition. ` +
      `Expected one of: ${HOTCRM_COMPOSITIONS.join(', ')} (or leave it unset for 'default').`,
  );
}

/**
 * The seed datasets a SaaS tenant gets: the product CATALOGUE, and nothing else.
 *
 * Maintainer ruling, 2026-08-27 (objectstack#12701, quoted untranslated):
 * 「每个租户应该各自使用各自的数据吧」 — every tenant uses its own data, the
 * product catalogue included; and 「种子也不应该是全局的呀，因为种子数据不同的客户
 * 都是要改的呀，只是参考呀，租户要自己删除呀」 — a seed is a per-tenant
 * REFERENCE copy the tenant edits and deletes.
 *
 * The platform already replays per tenant: `@objectstack/runtime`'s
 * `seed-replayer` replays the registered dataset union into each newly founded
 * organization stamped with that organization's id. What it has no notion of is
 * WHICH families to replay — it always replays the whole union — so the
 * selection is made HERE, once, at composition time. That is also the shape the
 * ruling wants: uniform for every tenant, with no per-tenant opt-in mechanism
 * to author, mis-set, or support.
 *
 * Why the catalogue and only the catalogue:
 *
 *  - A catalogue is the one family that is genuinely a starting point. A new
 *    tenant needs priceable products before they can quote anything, and the
 *    rows are theirs to rename, re-price and delete.
 *  - `sales` / `service` / `marketing` / `revenue` are STORYTELLING: Acme
 *    Corporation's pipeline, nine escalated cases, a finished campaign. Landing
 *    those in a paying tenant's org is not a helpful head start, it is someone
 *    else's data in their CRM.
 *  - It is also the family with no outgoing references, so the shrink cannot
 *    strand a lookup: `catalog.seed.ts` resolves nothing against another
 *    object, while every other family points at accounts, contacts or products
 *    by natural key.
 *
 * ⛔ Not a place to grow a "starter data" bundle. A family added here ships
 * into every tenant of every SaaS deployment; the bar is "a tenant cannot
 * operate without it", not "it looks nice on day one".
 */
export const SaasTenantSeedData: Seed[] = [products];

/** The seed datasets a composition registers. */
export const seedDataFor = (composition: HotCrmComposition): Seed[] => {
  if (composition === 'saas') return SaasTenantSeedData;
  if (composition === 'zh-demo') return ZhDemoSeedData;
  return CrmSeedData;
};
