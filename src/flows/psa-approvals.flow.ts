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
  description: `One-tier approval for ${s.noun}: opened when the record is submitted (demo, epic #2).`,
  type: 'record_change',
  status: 'active',
  runAs: 'system',
  variables: [{ name: 'recordId', type: 'text', isInput: true, isOutput: false }],
  nodes: [
    { id: 'start', type: 'start', label: 'Start',
      config: { objectName: s.objectName, triggerType: 'record-after-update', condition: SUBMITTED[s.statusField] } },
    { id: 'get_record', type: 'get_record', label: `Get ${s.noun}`,
      config: { objectName: s.objectName, filter: { id: '{record.id}' }, outputVariable: 'rec' } },
    { id: 'review', type: 'approval', label: `${s.label} Review`,
      config: {
        approvers: [{ type: 'position', value: s.approver }],
        onEmptyApprovers: 'admin_rescue',
        behavior: 'first_response',
        lockRecord: true,
        approvalStatusField: s.statusField,
      } },
    { id: 'mark_approved', type: 'update_record', label: 'Mark Approved',
      config: { objectName: s.objectName, filter: { id: '{record.id}' }, fields: { [s.statusField]: 'approved', [s.dateField]: '{NOW()}' } } },
    { id: 'notify_approved', type: 'notify', label: 'Notify Owner — Approved',
      config: { recipients: ['{rec.owner_id}'], channels: ['inbox', 'email'], topic: `${s.name}_approved`,
        title: `${s.noun} approved`, message: `Your ${s.noun} has been approved.`, actionUrl: `/${s.objectName}/{record.id}` } },
    { id: 'mark_rejected', type: 'update_record', label: 'Mark Rejected',
      config: { objectName: s.objectName, filter: { id: '{record.id}' }, fields: { [s.statusField]: 'rejected' } } },
    { id: 'notify_rejected', type: 'notify', label: 'Notify Owner — Rejected',
      config: { recipients: ['{rec.owner_id}'], channels: ['inbox', 'email'], severity: 'warning', topic: `${s.name}_rejected`,
        title: `${s.noun} rejected`, message: `Your ${s.noun} was not approved. Review and resubmit.`, actionUrl: `/${s.objectName}/{record.id}` } },
    { id: 'end', type: 'end', label: 'End' },
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

export const AccountApprovalFlow: Flow = approvalFlow({ name: 'account_approval', label: 'Account Approval', objectName: 'crm_account', approver: 'sales_director', statusField: 'approval_status', dateField: 'approved_date', noun: 'account' });
export const LeadApprovalFlow: Flow = approvalFlow({ name: 'lead_approval', label: 'Lead Approval', objectName: 'crm_lead', approver: 'sales_director', statusField: 'approval_status', dateField: 'approved_date', noun: 'lead' });
export const OpportunityInitiationFlow: Flow = approvalFlow({ name: 'opportunity_initiation', label: 'Opportunity Initiation', objectName: 'crm_opportunity', approver: 'executive', statusField: 'initiation_status', dateField: 'initiated_date', noun: 'opportunity initiation' });
export const PresalesProjectApprovalFlow: Flow = approvalFlow({ name: 'presales_project_approval', label: 'Presales Project Approval', objectName: 'crm_presales_project', approver: 'executive', statusField: 'approval_status', dateField: 'approved_date', noun: 'presales project' });
export const DeliveryProjectApprovalFlow: Flow = approvalFlow({ name: 'delivery_project_approval', label: 'Delivery Project Approval', objectName: 'crm_delivery_project', approver: 'executive', statusField: 'approval_status', dateField: 'approved_date', noun: 'delivery project' });
export const TimesheetApprovalFlow: Flow = approvalFlow({ name: 'timesheet_approval', label: 'Timesheet Approval', objectName: 'crm_timesheet', approver: 'sales_manager', statusField: 'approval_status', dateField: 'approved_date', noun: 'timesheet' });

export const psaApprovalFlows: Flow[] = [
  AccountApprovalFlow, LeadApprovalFlow, OpportunityInitiationFlow,
  PresalesProjectApprovalFlow, DeliveryProjectApprovalFlow, TimesheetApprovalFlow,
];
