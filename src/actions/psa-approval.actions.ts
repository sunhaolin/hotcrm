// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Action } from '@objectstack/spec/ui';
import { P } from '@objectstack/spec';

/**
 * 发起审批 — one record-header button per approvable demo object (epic #2).
 *
 * The first cut of the demo submitted by hand: 编辑 → 审批状态 = 提交审批 →
 * 保存. The customer's read was the right one — starting an approval is an
 * ACT, not a field edit — so the status fields are now `readonly` on their
 * objects (rendered, never typed) and this button is the only user-side
 * writer. Its body writes the object's status field to `submitted`, which is
 * exactly the transition the one-tier flows in
 * `src/flows/psa-approvals.flow.ts` listen for (`record-after-update` +
 * `status == "submitted"`), so the approval request, the record lock and the
 * approved / rejected write-back are unchanged.
 *
 * Generated per object because the runtime keys the action registry on
 * `<objectName>:<action.name>` (see the note on `global.actions.ts`): one
 * `submit_approval` per object, each reachable from that object's record
 * header and list-row menu. The three objects with a custom record page
 * (`account_detail` / `lead_detail` / `opportunity_detail`) also name it in
 * their header `actions` list — a custom page replaces the synthesized header,
 * so an action it does not name is unreachable from the record (#592).
 *
 * `visible` is TOTAL (AGENTS.md → "Validation predicates must be TOTAL"): the
 * record page evaluates it against an empty record before the row lands, so
 * every `record.x` read carries `has(record.x)` and fails closed. The button
 * shows on a draft or a rejected record and nowhere else; the body re-checks
 * the same states so a stale page cannot double-submit.
 */
type Spec = {
  objectName: string;
  statusField: 'approval_status' | 'initiation_status';
  /** Chinese noun for the confirm / success copy: 客户, 线索, 商机立项 … */
  noun: string;
  label?: string;
};

// Two literal predicates rather than one interpolated template: `P` quotes
// interpolations as values, and the field NAME must stay bare.
const SUBMITTABLE: Record<Spec['statusField'], ReturnType<typeof P>> = {
  approval_status: P`has(record.approval_status) && (record.approval_status == "draft" || record.approval_status == "rejected")`,
  initiation_status: P`has(record.initiation_status) && (record.initiation_status == "draft" || record.initiation_status == "rejected")`,
};

const submitApprovalAction = (s: Spec): Action => ({
  name: 'submit_approval',
  label: s.label ?? '发起审批',
  objectName: s.objectName,
  icon: 'send',
  type: 'script',
  body: {
    language: 'js',
    source: `
      const id = ctx.recordId;
      if (!id) throw new Error('submit_approval requires a recordId');
      // ctx.record is seeded by the runner for record-scoped dispatches (the
      // same source clone_opportunity reads). Guard the states the button is
      // hidden for, so a stale tab cannot re-submit a record already in flight.
      const current = ctx.record ? ctx.record['${s.statusField}'] : undefined;
      if (current === 'submitted' || current === 'pending') {
        throw new Error('该${s.noun}已在审批中，不能重复发起。');
      }
      if (current === 'approved') {
        throw new Error('该${s.noun}已审批通过，无需再次发起。');
      }
      // \`update(doc, { where })\` — the engine repo facade; see mass_update_stage.
      const row = await ctx.api.object('${s.objectName}').update(
        { id: id, ${s.statusField}: 'submitted' },
        { where: { id: id } },
      );
      if (!row) throw new Error('submit_approval: 记录不存在或无权限。');
      return { id: id, ${s.statusField}: 'submitted' };
    `,
    capabilities: ['api.write'],
    timeoutMs: 5000,
  },
  locations: ['record_header', 'list_item'],
  visible: SUBMITTABLE[s.statusField],
  // A confirm earns its click here: submitting locks the record until the
  // approver decides, and there is no follow-up screen to cancel from.
  confirmText: `确认发起${s.noun}审批？提交后记录将锁定，直到审批完成。`,
  successMessage: `${s.noun}已发起审批，等待审批人处理。`,
  refreshAfter: true,
});

export const AccountSubmitApprovalAction: Action = submitApprovalAction({ objectName: 'crm_account', statusField: 'approval_status', noun: '客户' });
export const LeadSubmitApprovalAction: Action = submitApprovalAction({ objectName: 'crm_lead', statusField: 'approval_status', noun: '线索' });
export const OpportunitySubmitInitiationAction: Action = submitApprovalAction({ objectName: 'crm_opportunity', statusField: 'initiation_status', noun: '商机立项', label: '发起立项审批' });
export const PresalesProjectSubmitApprovalAction: Action = submitApprovalAction({ objectName: 'crm_presales_project', statusField: 'approval_status', noun: '售前项目' });
export const DeliveryProjectSubmitApprovalAction: Action = submitApprovalAction({ objectName: 'crm_delivery_project', statusField: 'approval_status', noun: '交付项目' });
export const TimesheetSubmitApprovalAction: Action = submitApprovalAction({ objectName: 'crm_timesheet', statusField: 'approval_status', noun: '工时表' });
export const BudgetAdjustmentSubmitApprovalAction: Action = submitApprovalAction({ objectName: 'crm_budget_adjustment', statusField: 'approval_status', noun: '预算调整' });
export const BusinessTripSubmitApprovalAction: Action = submitApprovalAction({ objectName: 'crm_business_trip', statusField: 'approval_status', noun: '出差申请' });
export const LeaveRequestSubmitApprovalAction: Action = submitApprovalAction({ objectName: 'crm_leave_request', statusField: 'approval_status', noun: '请假申请' });
