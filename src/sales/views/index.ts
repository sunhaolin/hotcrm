// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Sales (the app package) views barrel.
 *
 * The doctrine for this metadata type is written once, in
 * `src/sales/views/index.ts`; this file is the sales package's half of
 * the same file-by-file registration.
 */

export { LeadViews } from './lead.view';
export { AccountViews } from './account.view';
export { ContactViews } from './contact.view';
export { ContractViews } from './contract.view';
export { OpportunityViews } from './opportunity.view';
export { TaskViews } from './task.view';
export { EventViews } from './event.view';
export { EventAttendeeViews } from './event_attendee.view';
export { ForecastViews } from './forecast.view';
// Demo PSA views (epic #2)
export { PresalesProjectViews } from './presales_project.view';
export { DeliveryProjectViews } from './delivery_project.view';
export { CostPlanViews } from './cost_plan.view';
export { TravelStandardViews } from './travel_standard.view';
export { TimesheetViews } from './timesheet.view';
export { TravelCostViews } from './travel_cost.view';
// Round 2 (Chinese-only)
export { RateCardViews } from './rate_card.view';
export { LegalEntityViews } from './legal_entity.view';
export { BudgetAdjustmentViews } from './budget_adjustment.view';
export { InvoiceViews } from './invoice.view';
export { CollectionViews } from './collection.view';
export { PurchaseContractViews } from './purchase_contract.view';
export { SalesOrderViews } from './sales_order.view';
export { BusinessTripViews } from './business_trip.view';
export { LeaveRequestViews } from './leave_request.view';
