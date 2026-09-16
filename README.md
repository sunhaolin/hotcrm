<p align="center">
  <img src="assets/icon.svg" alt="HotCRM" width="128" height="128"/>
</p>

# HotCRM

> **The reference app for AI-written enterprise software.** A complete CRM —
> 38 objects, 39 flows, 7 dashboards, 6 AI skills, 4 languages — carries its
> whole business semantics (objects, flows, actions, hooks) in **~118k tokens**
> of typed [ObjectStack](https://github.com/objectstack-ai/objectstack) metadata,
> and its whole interaction layer (views, pages, dashboards, app shell) in
> another **~48k**. An agent holds every business rule of a real enterprise CRM
> in a fraction of one context window — and the entire authored app still fits
> comfortably — so it can reason about the system whole and refactor it safely.
> **Install it online in one click, or fork it and build & ask with Claude
> Code** — it's the reference implementation every marketplace app forks from.
>
> <sub>Measured, not estimated: `node scripts/check-source-token-ratchet.mjs`
> prints both figures and CI fails when either grows past its committed ceiling.
> Comments and blank lines are stripped; translations and seed data are outside
> the count — a fifth locale is not business logic.</sub>

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Manifest](https://img.shields.io/badge/manifest-app.objectstack.hotcrm-blueviolet)](objectstack.config.ts)
[![Version](https://img.shields.io/badge/version-3.0.0-brightgreen)](CHANGELOG.md)
[![Marketplace](https://img.shields.io/badge/marketplace-cloud.objectos.app-orange)](https://cloud.objectos.app)

HotCRM is a complete, opinionated CRM built as the **first official application** on the [ObjectStack](https://cloud.objectos.app) marketplace. Install it into any ObjectStack environment in one click and get a working CRM in 30 seconds — or fork it as the canonical example of how to build your own marketplace app.

---

## 📸 Screenshots

| Qualified lead workspace | Sales pipeline |
|---|---|
| ![Qualified lead workspace](assets/screenshots/hotcrm/lead-detail/en.png) | ![Sales pipeline](assets/screenshots/hotcrm/sales-pipeline/en.png) |

| Strategic account 360 | Quote lifecycle |
|---|---|
| ![Strategic account 360](assets/screenshots/hotcrm/customer-360/en.png) | ![Quote lifecycle](assets/screenshots/hotcrm/quote-pipeline/en.png) |

| Campaign lifecycle and ROI | Sales performance dashboard |
|---|---|
| ![Campaign lifecycle and ROI](assets/screenshots/hotcrm/campaign-detail/en.png) | ![Sales performance dashboard](assets/screenshots/hotcrm/sales-dashboard/en.jpg) |

> The current, locale-specific screenshots live in `assets/screenshots/hotcrm/<screen>/<locale>.png`, with a colocated `meta.yaml` for purpose, alt text, capture context, and lifecycle. This README uses English; the documentation site also publishes `zh-Hans` variants. Bundled runtime translations: en, zh-CN, es-ES, ja-JP.

---

## ✨ What you get

**38 business objects** spanning the full Lead-to-Cash cycle, plus the project (PSA) family a software or services company runs its delivery on:

| Sales | Service | Marketing | Revenue | Projects (PSA) |
|---|---|---|---|---|
| `crm_lead` | `crm_case` | `crm_campaign` | `crm_contract` | `crm_presales_project` |
| `crm_account` | `crm_knowledge_article` | `crm_campaign_member` | `crm_quote` | `crm_delivery_project` |
| `crm_contact` | `crm_task` | `crm_article_feedback` | `crm_quote_line_item` | `crm_cost_plan_line` |
| `crm_opportunity` | | | | `crm_budget_adjustment` |
| `crm_opportunity_line_item` | | | | `crm_timesheet` |
| `crm_product` | | | | `crm_leave_request` |
| `crm_forecast` | | | | `crm_business_trip` |
| `crm_event` | | | | `crm_travel_cost` |
| `crm_event_attendee` | | | | `crm_invoice` |
| | | | | `crm_collection` |
| | | | | `crm_purchase_contract` |
| | | | | `crm_sales_order` |
| | | | | `crm_rate_card` |
| | | | | `crm_legal_entity` |

Plus **6 AI skills** (a skills-only surface — HotCRM defines no agents of its own; the skills attach to the platform `ask` assistant), **7 dashboards**, **39 flows**, **47 actions**, **11 datasets**, **4 language bundles** (en, zh-CN, es-ES, ja-JP), **6 permission profiles**, **13 positions**, and **9 sharing rules**.

> **Business reader?** The ObjectStack docs tour every one of these capabilities in plain business language — [What Can It Do?](https://objectstack.ai/docs/capabilities) — with HotCRM as the running example on every page.

---

## 🚀 Install from the marketplace (recommended)

1. Sign in at [cloud.objectos.app](https://cloud.objectos.app).
2. Open **Marketplace → HotCRM** and click **Install** into your environment.
3. Open your environment URL — HotCRM is wired into the Studio shell. Done.

> First-time on ObjectStack? Create an environment from the **Starter** template first, then install HotCRM on top.

---

## 🛠 Run locally (development / fork it)

```bash
git clone https://github.com/objectstack-ai/hotcrm.git
cd hotcrm
pnpm install
pnpm dev                    # ObjectStack runtime starts at http://localhost:4001
```

```bash
pnpm typecheck              # strict TypeScript
pnpm build                  # produces dist/objectstack.json (the publishable artifact)
```

The compiled `dist/objectstack.json` **is** the package — that's what gets uploaded to the marketplace.

---

## 📦 Publish a fork to the marketplace

After you've forked, customized, and renamed the package:

```bash
# 1. Authenticate once (writes ~/.objectstack/cloud.json)
objectstack cloud login

# 2. Build the artifact
pnpm build

# 3. Publish a new version
objectstack package publish dist/objectstack.json \
  --manifest-id app.acme.crm \
  --version 2.2.2 \
  --display-name "Acme CRM" \
  --category crm \
  --visibility marketplace \
  --note "Initial release"
```

The CLI is idempotent: re-running with the same `--manifest-id` updates the package; new `--version` values create immutable versioned snapshots.

See [docs: Publishing your first marketplace app](content/docs/marketplace/publishing-your-first-app.mdx) for the full walkthrough.

---

## 🏗 Repository layout

```
hotcrm/
├── objectstack.config.ts         # manifest + defineStack() — single source of truth
├── src/
│   ├── objects/                  # *.object.ts — data model (38 objects)
│   ├── actions/                  # *.actions.ts — server actions + AI tools (47)
│   ├── flows/                    # *.flow.ts — visual flows (39): screen, record-change, scheduled & subflow
│   ├── hooks/                    # hook registry barrel
│   ├── skills/                   # *.skill.ts — AI skills (6) — skills-only surface, no agents
│   ├── datasets/                 # *.dataset.ts — analytics semantic layer (11)
│   ├── dashboards/, reports/     # analytics UI
│   ├── pages/, views/, apps/     # UI definitions
│   ├── profiles/, sharing/       # security
│   ├── translations/             # en / zh-CN / es-ES / ja-JP
│   └── data/                     # seed data
├── apps/docs/                    # Fumadocs site — standalone, own lockfile (not a pnpm workspace member)
└── content/docs/                 # Documentation content
```

Every file follows the **`<entity>.<kind>.ts`** convention (actions are the one plural: `<entity>.actions.ts`, one file bundling that entity's actions). The `crm_` prefix on object names is explicit in source — no runtime magic. Both rules are required for marketplace acceptance.

---

## 📚 Documentation

- **Live docs:** start `pnpm -C apps/docs install && pnpm -C apps/docs dev -p 3001`, then open <http://localhost:3001/docs>
- **For business users:** Sales, Service, Marketing, Revenue, AI Copilot guides
- **For developers:** Architecture, Customization, API reference, Testing & CI
- **For publishers:** Marketplace publishing guide

---

## 🤝 Why fork HotCRM?

Because it's the reference for every ObjectStack convention you'll encounter:

- ✅ `crm_` namespace prefix on every object (explicit, grep-able, marketplace-safe)
- ✅ Strict `*.object.ts` / `*.hook.ts` / `*.actions.ts` separation of concerns
- ✅ All metadata validated against `@objectstack/spec` schemas
- ✅ ObjectQL only — no raw SQL anywhere
- ✅ AI-Native — every entity has an `*.actions.ts` that's also an AI tool
- ✅ Four-language i18n out of the box
- ✅ Production-shaped sharing rules, profiles, and positions

If you want to ship an HR app, a project tracker, a help-desk — start by reading HotCRM's structure, then change names.

---

## 📄 License

Apache-2.0. See [LICENSE](LICENSE).
