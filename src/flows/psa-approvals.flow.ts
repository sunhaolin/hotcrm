// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { P } from '@objectstack/spec';
import type * as Automation from '@objectstack/spec/automation';
type Flow = Automation.Flow;

/**
 * Demo approval flows (epic #2 / T5) — six one-tier copies of the shape in
 * `opportunity-approval.flow.ts`, driven by the demo's submit gesture: the user
 * sets the status field to `submitted`, the flow opens one approval request,
 * and stamps `approved` (+ date) or `rejected` on the decision.
 *
 * `runAs: 'system'` for the reference flow's measured reason — a user-less
 * writer otherwise bypasses a user-scoped gate — and `admin_rescue` so an empty
 * position bench lands every request on the admin, which is what the
 * single-login demo relies on (epic decision 3).
 */
type Spec = {
  name: string; label: string; objectName: string; approver: string;
  statusField: 'approval_status' | 'initiation_status'; dateField: string; noun: string;
};

// Two literal predicates rather than one interpolated template: `P` quotes
// interpolations as values, and the field NAME must stay bare.
const SUBMITTED: Record<Spec['statusField'], ReturnType<typeof P>> = {
  approval_status: P`has(record.approval_status) && record.approval_status == "submitted"`,
  initiation_status: P`has(record.initiation_status) && record.initiation_status == "submitted"`,
};

const approvalFlow = (s: Spec): Flow => ({
  name: s.name,
  label: s.label,
  description: `${s.noun}一级审批：记录提交后开启（demo, epic #2）。`,
  type: 'record_change',
  status: 'active',
  runAs: 'system',
  variables: [{ name: 'recordId', type: 'text', isInput: true, isOutput: false }],
  nodes: [
    { id: 'start', type: 'start', label: '开始',
      config: { objectName: s.objectName, triggerType: 'record-after-update', condition: SUBMITTED[s.statusField] } },
    { id: 'get_record', type: 'get_record', label: `读取${s.noun}`,
      config: { objectName: s.objectName, filter: { id: '{record.id}' }, outputVariable: 'rec' } },
    { id: 'review', type: 'approval', label: `${s.label}`,
      config: {
        // Demo (epic decision 3): the org owner is the dev admin, so every
        // request lands in one 待我审批. The `approver` position is kept on
        // the spec as the production routing the runbook names.
        approvers: [{ type: 'org_membership_level', value: 'owner' }],
        onEmptyApprovers: 'admin_rescue',
        behavior: 'first_response',
        lockRecord: true,
        approvalStatusField: s.statusField,
      } },
    { id: 'mark_approved', type: 'update_record', label: '标记为已审批',
      config: { objectName: s.objectName, filter: { id: '{record.id}' }, fields: { [s.statusField]: 'approved', [s.dateField]: '{NOW()}' } } },
    { id: 'notify_approved', type: 'notify', label: '通知负责人 — 已通过',
      config: { recipients: ['{rec.owner_id}'], channels: ['inbox', 'email'], topic: `${s.name}_approved`,
        title: `${s.noun}已审批通过`, message: `您提交的${s.noun}已审批通过。`, actionUrl: `/${s.objectName}/{record.id}` } },
    { id: 'mark_rejected', type: 'update_record', label: '标记为已驳回',
      config: { objectName: s.objectName, filter: { id: '{record.id}' }, fields: { [s.statusField]: 'rejected' } } },
    { id: 'notify_rejected', type: 'notify', label: '通知负责人 — 已驳回',
      config: { recipients: ['{rec.owner_id}'], channels: ['inbox', 'email'], severity: 'warning', topic: `${s.name}_rejected`,
        title: `${s.noun}已驳回`, message: `您提交的${s.noun}未通过审批，请修改后重新提交。`, actionUrl: `/${s.objectName}/{record.id}` } },
    { id: 'end', type: 'end', label: '结束' },
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'get_record', type: 'default' },
    { id: 'e2', source: 'get_record', target: 'review', type: 'default' },
    { id: 'e3', source: 'review', target: 'mark_approved', type: 'default', label: 'approve' },
    { id: 'e4', source: 'review', target: 'mark_rejected', type: 'default', label: 'reject' },
    { id: 'e5', source: 'mark_approved', target: 'notify_approved', type: 'default' },
    { id: 'e6', source: 'notify_approved', target: 'end', type: 'default' },
    { id: 'e7', source: 'mark_rejected', target: 'notify_rejected', type: 'default' },
    { id: 'e8', source: 'notify_rejected', target: 'end', type: 'default' },
  ],
});

export const AccountApprovalFlow: Flow = approvalFlow({ name: 'account_approval', label: '客户审批', objectName: 'crm_account', approver: 'sales_director', statusField: 'approval_status', dateField: 'approved_date', noun: '客户' });
export const LeadApprovalFlow: Flow = approvalFlow({ name: 'lead_approval', label: '线索审批', objectName: 'crm_lead', approver: 'sales_director', statusField: 'approval_status', dateField: 'approved_date', noun: '线索' });
export const OpportunityInitiationFlow: Flow = approvalFlow({ name: 'opportunity_initiation', label: '商机立项审批', objectName: 'crm_opportunity', approver: 'executive', statusField: 'initiation_status', dateField: 'initiated_date', noun: '商机立项' });
export const PresalesProjectApprovalFlow: Flow = approvalFlow({ name: 'presales_project_approval', label: '售前立项审批', objectName: 'crm_presales_project', approver: 'executive', statusField: 'approval_status', dateField: 'approved_date', noun: '售前项目' });
export const DeliveryProjectApprovalFlow: Flow = approvalFlow({ name: 'delivery_project_approval', label: '交付立项审批', objectName: 'crm_delivery_project', approver: 'executive', statusField: 'approval_status', dateField: 'approved_date', noun: '交付项目' });
export const TimesheetApprovalFlow: Flow = approvalFlow({ name: 'timesheet_approval', label: '工时审批', objectName: 'crm_timesheet', approver: 'sales_manager', statusField: 'approval_status', dateField: 'approved_date', noun: '工时表' });

export const psaApprovalFlows: Flow[] = [
  AccountApprovalFlow, LeadApprovalFlow, OpportunityInitiationFlow,
  PresalesProjectApprovalFlow, DeliveryProjectApprovalFlow, TimesheetApprovalFlow,
];
