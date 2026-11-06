// Copyright (c) 2026 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Software-company demo catalogue and quotes (epic #2, round 3) — the
 * revenue-owned half of `src/sales/data/psa-industry.seed.ts`.
 *
 * A seed family is registered by the package that owns its object, and the
 * product, quote and quote line objects are the revenue package's, so these
 * three families live here rather than beside the rest of the industry demo.
 * The customer and deal names the quotes key on are the sales file's exports:
 * revenue may import from `src/sales/`, never the other way round.
 */
import { defineSeed } from '@objectstack/spec/data';
import { Product } from '../objects/product.object';
import { Quote } from '../objects/quote.object';
import { QuoteLineItem } from '../objects/quote_line_item.object';
import { PriceBookEntry } from '../objects/price_book_entry.object';
import { STANDARD_PRICE_BOOK } from './price-book.seed';
import { celDaysAgo, celDaysFromNow } from '../../sales/data/_shared';
import { JN, HD, OPP_JN, OPP_HD } from '../../sales/data/psa-industry.seed';

// ─── Catalogue and quotes ───────────────────────────────────────────────────
export const industryProducts = defineSeed(Product, {
  mode: 'ignore',
  externalId: 'name',
  records: [
    { name: '华软 MES 制造执行系统（企业版许可）', description: '离散制造 MES：工单、排程、质量、设备、追溯。', category: 'software', family: 'enterprise', sku: 'HR-MES-ENT', list_price: 1200000, cost: 300000, is_active: true },
    { name: '华软 GMP 质量管理系统（许可）', description: '偏差、变更、CAPA、审计追踪、电子签名。', category: 'software', family: 'enterprise', sku: 'HR-GMP-ENT', list_price: 1500000, cost: 400000, is_active: true },
    { name: '实施服务（人天）', description: '需求、配置、集成与上线支持，按人天计。', category: 'service', family: 'services', sku: 'HR-SVC-DAY', list_price: 8000, cost: 4800, is_active: true },
    { name: '运维服务（年）', description: '5×8 远程支持 + 季度巡检；7×24 值守另计。', category: 'support', family: 'services', sku: 'HR-OPS-YEAR', list_price: 120000, cost: 60000, is_active: true },
    { name: '培训服务（人天）', description: '关键用户与管理员培训。', category: 'service', family: 'services', sku: 'HR-TRN-DAY', list_price: 6000, cost: 3000, is_active: true },
  ],
});

/**
 * The demo catalogue's rows in the `Standard` price book, at each product's
 * `list_price` — the same shape as `priceBookEntries` in `price-book.seed.ts`,
 * which builds the book from the English catalogue alone. A quote line is
 * priced from its quote's book, or the organization's standard book when the
 * quote names none (`_line-item-price-fill.ts`), and a book with no active
 * price for the product REFUSES the line; the demo quotes below name no book,
 * so without these rows the seed replay fails on its first quote line.
 */
export const industryPriceBookEntries = defineSeed(PriceBookEntry, {
  mode: 'ignore',
  externalId: ['crm_price_book', 'crm_product'],
  records: industryProducts.records.map((product) => ({
    crm_price_book: STANDARD_PRICE_BOOK,
    crm_product: String(product.name),
    list_price: product.list_price,
    is_active: true,
  })),
});

// Quote totals are recomputed by `quote_total_rollup` from the lines below;
// the figures here equal what the rollup produces (subtotal − discount + tax).
export const industryQuotes = defineSeed(Quote, {
  mode: 'ignore',
  externalId: 'name',
  records: [
    { name: '江南医药 GMP 质量管理系统 — 报价', crm_account: JN, crm_contact: 'sun.li@jiangnan-pharma.example.com', crm_opportunity: OPP_JN, status: 'presented', quote_date: celDaysAgo(5), expiration_date: celDaysFromNow(25), subtotal: 2360000, discount: 0, discount_amount: 0, tax: 141600, shipping_handling: 0, total_price: 2501600, payment_terms: 'net_30', description: '软件许可 + 100 人天实施 + 10 人天培训；含税 6%。' },
    { name: '恒达建设项目管理平台 — 预算报价', crm_account: HD, crm_contact: 'zheng.hao@hengda-construction.example.com', crm_opportunity: OPP_HD, status: 'draft', quote_date: celDaysAgo(2), expiration_date: celDaysFromNow(28), subtotal: 1200000, discount: 5, discount_amount: 60000, tax: 68400, shipping_handling: 0, total_price: 1208400, payment_terms: 'net_60', description: '两个试点项目部：150 人天实施；预算报价，供客户立项参考。' },
  ],
});

export const industryQuoteLineItems = defineSeed(QuoteLineItem, {
  mode: 'ignore',
  externalId: ['crm_quote', 'crm_product'],
  records: [
    { crm_quote: '江南医药 GMP 质量管理系统 — 报价', crm_product: '华软 GMP 质量管理系统（许可）', description: 'GMP 质量管理系统企业版许可', quantity: 1, list_price: 1500000, unit_price: 1500000, discount: 0, line_number: 1 },
    { crm_quote: '江南医药 GMP 质量管理系统 — 报价', crm_product: '实施服务（人天）', description: '实施服务 100 人天', quantity: 100, list_price: 8000, unit_price: 8000, discount: 0, line_number: 2 },
    { crm_quote: '江南医药 GMP 质量管理系统 — 报价', crm_product: '培训服务（人天）', description: '关键用户培训 10 人天', quantity: 10, list_price: 6000, unit_price: 6000, discount: 0, line_number: 3 },
    { crm_quote: '恒达建设项目管理平台 — 预算报价', crm_product: '实施服务（人天）', description: '项目管理平台实施 150 人天', quantity: 150, list_price: 8000, unit_price: 8000, discount: 0, line_number: 1 },
  ],
});
