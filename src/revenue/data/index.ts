// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Revenue seed data.
 *
 * `objectstack.composition.ts` collects these families into the single ordered
 * `CrmSeedData` union, which it cuts by owning package for the two package
 * stacks — see `src/sales/data/index.ts` for why the assembly and its order
 * live there rather than in a package barrel.
 */
export { products, catalogPrice, lineItemRecords } from './catalog.seed';
export { opportunityLineItems } from './opportunity-line-item.seed';
export { priceBooks, priceBookEntries } from './price-book.seed';
export { quotes, quoteLineItems } from './revenue.seed';
// Demo PSA catalogue and quotes (epic #2): the Chinese demo rows for the
// revenue-owned objects; `objectstack.composition.ts` folds them into the
// standard datasets so each object keeps exactly one.
export { industryProducts, industryPriceBookEntries, industryQuotes, industryQuoteLineItems } from './psa-industry.seed';
