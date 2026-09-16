// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * CRM Positions (ADR-0090 D3 — formerly the role hierarchy).
 *
 * Positions are deliberately FLAT: no parent, no hierarchy. The v1 role
 * tree's reporting lines belong on the business-unit tree / manager chain,
 * which this app does not model — so the old `parentRole` links were
 * dropped rather than translated.
 *
 * Flat also means visibility does NOT roll up: every rung that needs access to
 * a record carries its own sharing rule. That is why each leadership rung has
 * an explicit companion rule (`opportunity_executive_sharing`,
 * `case_director_sharing`, `campaign_leadership_*`) rather than inheriting the
 * manager's — a position that no sharing rule and no permission-set binding
 * names grants nothing at all (#488).
 */

/**
 * The administrator position — the other half of #488, and the reason the
 * app's own admin export grants reached nobody.
 *
 * `system-admin.profile.ts` authors `allowExport` on all five exportable
 * business objects. It has to: objectstack#8681 (maintainer ruling,
 * 2026-08-15) deliberately keeps `allowExport` OFF the platform's
 * `ADMIN_FULL_ACCESS_CAPABILITIES` wildcard — segregation of duties, so full
 * administrative access is not by itself bulk egress — and the ruling's stated
 * remedy is to "grant `allowExport` per object in an APP permission set".
 *
 * A pure-metadata app ships no `sys_position_permission_set` rows and no
 * `kernel:ready` binder, so it has exactly ONE spelling for binding a set to a
 * position: declare a POSITION OF THE SAME NAME (the full note is beside
 * `ServiceManagerProfile` in `src/profiles/service-agent.profile.ts`). Five of
 * the six app sets had theirs — `sales_rep`, `sales_manager`, `service_agent`,
 * `service_manager`, `marketing_user` — and `guest_portal` binds to the
 * platform `guest` anchor instead. `system_admin` had neither, so the admin
 * persona was declared and unreachable: holding it was impossible, and the
 * export grants it carries could not be exercised by anyone.
 *
 * ⚠️ The same-name fold is DEPRECATED, and this position inherits that. Platform
 * 17.4.0 still folds position names into permission-set names in
 * `resolvePermissionSetsForContext`, but a maintainer ruling (2026-08-31) makes
 * `sys_position_permission_set` the one governed channel and retires the fold;
 * 17.4.0 now logs a warning naming each ungoverned grant. Deleting the fold is
 * explicitly deferred upstream *because* it would silently revoke grants of
 * exactly this shape. So this is not a sixth exception being opened — it is the
 * sixth instance of a pattern this app already runs on, and when the junction
 * table becomes bindable from metadata all six move together.
 *
 * Declaring the position does NOT staff it. Nobody holds any position until a
 * human assigns one in Setup → Users; `src/sharing/demo-staffing.ts` says why
 * that stays a decision rather than a tidy-up (#640).
 */
export const SystemAdminPosition = { name: 'system_admin', label: 'System Administrator' };

/**
 * The SaaS composition's administrator position.
 *
 * `HOTCRM_COMPOSITION=saas` swaps `SystemAdminProfile` out of `permissions` for
 * `TenantAdminProfile`. The roster has to make the same swap or the two halves
 * of that composition contradict each other: a `system_admin` position no set
 * names (#488 — grants nothing), standing beside a `tenant_admin` set no
 * position can reach. `objectstack.config.ts` performs the swap by IDENTITY,
 * for the reason its permission filter already gives — a rename must not
 * quietly turn the swap into a no-op.
 *
 * It is NOT in `CrmPositions`: the default build must not carry a position
 * whose set it does not register, which is the same rule read the other way.
 */
export const TenantAdminPosition = { name: 'tenant_admin', label: 'Tenant Administrator' };

export const CrmPositions = [
  SystemAdminPosition,
  { name: 'executive',          label: 'Executive' },
  { name: 'sales_director',     label: 'Sales Director' },
  { name: 'sales_manager',      label: 'Sales Manager' },
  { name: 'sales_rep',          label: 'Sales Representative' },
  { name: 'service_director',   label: 'Service Director' },
  { name: 'service_manager',    label: 'Service Manager' },
  { name: 'service_agent',      label: 'Service Agent' },
  { name: 'marketing_director', label: 'Marketing Director' },
  { name: 'marketing_manager',  label: 'Marketing Manager' },
  { name: 'marketing_user',     label: 'Marketing User' },
  // Territory groupings referenced by the account sharing rules.
  { name: 'na_sales_team',      label: 'NA Sales Team' },
  { name: 'eu_sales_team',      label: 'EU Sales Team' },
];
