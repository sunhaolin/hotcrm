// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Action Definitions Barrel
 *
 * Exports CRM action metadata. Every action ships an inline metadata
 * `body` (sandboxed JS) so the AppPlugin auto-binds the handler at
 * boot — no imperative `engine.registerAction(...)` wiring is needed.
 *
 * `ConvertLeadAction` is the only exception: it is a `flow`-typed
 * action and the screen flow under `src/sales/flows/lead-conversion.flow.ts`
 * carries the implementation.
 */
export { AddContactToCampaignAction, MarkPrimaryContactAction, SendEmailAction } from './contact.actions';
// Activity logging: one registration per (kind × object). Every export
// forwarded from here must be ONE Action — the stack is built from
// `Object.values(actions)`, so an exported array arrives as a nested list and
// fails the schema parse. ⛔ Never re-export `activityActionsFor` (the factory)
// from here; the `crm_case` triple it also builds is service's and is forwarded
// by `src/service/actions/index.ts`.
export {
  LeadLogCallAction, LeadLogMeetingAction, LeadScheduleMeetingAction,
  ContactLogCallAction, ContactLogMeetingAction, ContactScheduleMeetingAction,
  AccountLogCallAction, AccountLogMeetingAction, AccountScheduleMeetingAction,
  OpportunityLogCallAction, OpportunityLogMeetingAction, OpportunityScheduleMeetingAction,
} from './activity-actions';
export { ConvertLeadAction, CreateCampaignAction, ScheduleFollowUpAction } from './lead.actions';
export { CloneOpportunityAction, MassUpdateStageAction, GenerateQuoteAction } from './opportunity.actions';
// Demo (epic #2): 发起审批 — one per approvable object, see the factory's note.
export {
  LeadSubmitApprovalAction, OpportunitySubmitInitiationAction,
  PresalesProjectSubmitApprovalAction, DeliveryProjectSubmitApprovalAction, TimesheetSubmitApprovalAction,
  BudgetAdjustmentSubmitApprovalAction, BusinessTripSubmitApprovalAction, LeaveRequestSubmitApprovalAction,
  CostPlanSubmitApprovalAction,
} from './psa-approval.actions';
// Cost plan (steps 27 / 32): 导入 Bizcase 预算, 新建计划版本, 重新分解 on each line object.
export {
  ImportBizcaseBudgetAction, CreatePlanVersionAction,
  LaborLineRedecomposeAction, ServiceLineRedecomposeAction, ProcurementLineRedecomposeAction, ExpenseLineRedecomposeAction,
} from './cost_plan.actions';
// A declarative update (`operation: 'update'`): no body, the platform writes
// its `patch` as the caller.
export { CompleteTaskAction } from './task.actions';
// Print Contract (#2317): an `api` action on the print service's door.
export { PrintContractAction } from './contract.actions';
