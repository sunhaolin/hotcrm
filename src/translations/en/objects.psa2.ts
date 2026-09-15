// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { ObjectTranslationData } from '@objectstack/spec/system';

/**
 * en — round 2 / 3 of the PSA family (demo, epic #2): the nine finance, trip and leave objects in full, plus the 发起审批 action and help keys merged over the base pack at the locale root.
 */
export const psa2: Record<string, Partial<ObjectTranslationData>> = {
  crm_account: {
    fields: {
      ear_status: { help: 'A machine match is recorded as \'suspected\' and only warns; opportunities are blocked once a person confirms the listing.' },
    },
    _actions: {
      submit_approval: { confirmText: 'Submit the account for approval? The record is locked until the approval completes.', label: 'Submit for Approval', successMessage: 'The account has been submitted for approval.' },
    },
  },
  crm_delivery_project: {
    label: 'Delivery Project',
    pluralLabel: 'Delivery Projects',
    fields: {
      budget_current: { help: 'Budget baseline + approved adjustments.' },
      labor_actual: { help: 'Approved timesheets only.' },
    },
    _views: {
      project_overview: { label: 'Project Overview' },
    },
    _actions: {
      submit_approval: { confirmText: 'Submit the delivery project for approval? The record is locked until the approval completes.', label: 'Submit for Approval', successMessage: 'The delivery project has been submitted for approval.' },
      import_bizcase_budget: { confirmText: 'Generate delivery cost plan v1 from the presales project\'s approved Bizcase cost plan and use it as the control baseline? The baseline cannot be changed once imported.', label: 'Import Bizcase Budget', successMessage: 'Bizcase budget imported: the baseline is frozen and cost plan v1 has been generated.' },
    },
  },
  crm_timesheet: {
    label: 'Timesheet',
    pluralLabel: 'Timesheets',
    fields: {
      standard_hours: { help: 'Hours due this month; on a draft sheet hours = standard − leave + overtime.' },
    },
    _actions: {
      submit_approval: { confirmText: 'Submit the timesheet for approval? The record is locked until the approval completes.', label: 'Submit for Approval', successMessage: 'The timesheet has been submitted for approval.' },
    },
  },
  crm_budget_adjustment: {
    label: 'Budget Adjustment',
    pluralLabel: 'Budget Adjustments',
    description: 'A request to add to or cut a delivery project\'s budget: amount, reason and variance analysis; counted into the current budget once approved',
    fields: {
      adjustment_number: { label: 'Adjustment #' },
      amount: { help: 'Positive to add, negative to cut; with a plan version attached, the system writes the difference between the version totals', label: 'Adjustment Amount' },
      analysis: { help: 'Why the budget falls short, the variance from baseline and its impact', label: 'Variance Analysis' },
      approval_status: {
        label: 'Approval Status',
        options: {
          approved: 'Approved',
          draft: 'Draft',
          pending: 'Pending',
          rejected: 'Rejected',
          submitted: 'Submitted',
        },
      },
      approved_date: { label: 'Approved Date' },
      crm_cost_plan: { help: 'The draft version produced by New Plan Version on the cost plan; once approved it becomes the current version, and the adjustment amount is the difference between the new and old version totals.', label: 'Adjusted Plan Version' },
      crm_delivery_project: { label: 'Delivery Project' },
      notes: { label: 'Notes' },
      owner_id: { label: 'Requester' },
      reason: {
        label: 'Reason',
        options: {
          other: 'Other',
          rate_change: 'Rate Change',
          risk_response: 'Risk Response',
          schedule_extension: 'Schedule Extension',
          scope_change: 'Scope Change',
        },
      },
    },
    _sections: {
      approval: { label: 'Approval' },
      basic: { label: 'Adjustment Request' },
    },
    _views: {
      all_budget_adjustments: { label: 'All Budget Adjustments' },
    },
    _actions: {
      submit_approval: { confirmText: 'Submit the budget adjustment for approval? The record is locked until the approval completes.', label: 'Submit for Approval', successMessage: 'The budget adjustment has been submitted for approval.' },
    },
  },
  crm_business_trip: {
    label: 'Business Trip',
    pluralLabel: 'Business Trips',
    description: 'Business trip requests and approval: destination, dates, purpose and estimated cost; travel costs booked to the trip roll up as its actual cost',
    fields: {
      actual_cost: { label: 'Actual Cost' },
      approval_status: {
        label: 'Approval Status',
        options: {
          approved: 'Approved',
          draft: 'Draft',
          pending: 'Pending',
          rejected: 'Rejected',
          submitted: 'Submitted',
        },
      },
      approved_date: { label: 'Approved Date' },
      crm_delivery_project: { label: 'Delivery Project' },
      crm_presales_project: { help: 'A presales-stage trip hangs off the presales project', label: 'Presales Project' },
      days: { help: 'Computed from the dates, both inclusive', label: 'Trip Days' },
      destination: { label: 'Destination' },
      end_date: { label: 'End Date' },
      estimated_cost: { label: 'Estimated Cost' },
      notes: { label: 'Notes' },
      owner_id: { label: 'Traveller' },
      purpose: { label: 'Purpose' },
      start_date: { label: 'Start Date' },
      subject: { label: 'Trip Subject' },
      transport: {
        label: 'Transport',
        options: {
          car: 'Car',
          flight: 'Flight',
          other: 'Other',
          train: 'Train',
        },
      },
      trip_code: { label: 'Trip #' },
    },
    _sections: {
      approval: { label: 'Approval' },
      basic: { label: 'Trip Information' },
      cost: { label: 'Cost' },
    },
    _views: {
      all_business_trips: { label: 'All Business Trips' },
    },
    _actions: {
      submit_approval: { confirmText: 'Submit the business trip for approval? The record is locked until the approval completes.', label: 'Submit for Approval', successMessage: 'The business trip has been submitted for approval.' },
    },
  },
  crm_collection: {
    label: 'Collection',
    pluralLabel: 'Collections',
    description: 'Collections recorded per delivery project and sales contract, optionally linked to an invoice',
    fields: {
      description: { label: 'Description' },
      amount: { label: 'Amount' },
      bank_reference: { label: 'Bank Reference' },
      collection_code: { label: 'Collection #' },
      crm_account: { label: 'Account' },
      crm_contract: { label: 'Sales Contract' },
      crm_delivery_project: { label: 'Delivery Project' },
      crm_invoice: { label: 'Invoice' },
      method: {
        label: 'Method',
        options: {
          bank_draft: 'Bank Draft',
          bank_transfer: 'Bank Transfer',
          check: 'Check',
          other: 'Other',
        },
      },
      owner_id: { label: 'Handled By' },
      received_date: { label: 'Received Date' },
    },
    _sections: {
      basic: { label: 'Collection Information' },
    },
    _views: {
      all_collections: { label: 'All Collections' },
    },
  },
  crm_invoice: {
    label: 'Invoice',
    pluralLabel: 'Invoices',
    description: 'Invoices recorded per delivery project: invoice details, amount and status; collections roll up to the outstanding balance',
    fields: {
      description: { label: 'Description' },
      amount: { help: 'Amount (incl. tax)', label: 'Invoice Amount' },
      collected_amount: { label: 'Collected Amount' },
      crm_account: { label: 'Account' },
      crm_contract: { label: 'Sales Contract' },
      crm_delivery_project: { label: 'Delivery Project' },
      due_date: { label: 'Due Date' },
      invoice_code: { label: 'Invoice #' },
      invoice_date: { label: 'Invoice Date' },
      invoice_number: { label: 'Invoice Number' },
      invoice_type: {
        label: 'Invoice Type',
        options: { electronic: 'Electronic Invoice', vat_general: 'VAT General Invoice', vat_special: 'VAT Special Invoice' },
      },
      outstanding_amount: { label: 'Outstanding' },
      owner_id: { label: 'Handled By' },
      status: {
        label: 'Status',
        options: {
          draft: 'Draft',
          issued: 'Issued',
          paid: 'Collected',
          sent: 'Sent',
          void: 'Void',
        },
      },
      tax_rate: { label: 'Tax Rate (%)' },
    },
    _sections: {
      basic: { label: 'Invoice Information' },
      settlement: { label: 'Collections' },
    },
    _views: {
      all_invoices: { label: 'All Invoices' },
    },
  },
  crm_lead: {
    _sections: {
      demand: { label: 'Demand & Approval' },
    },
    _actions: {
      submit_approval: { confirmText: 'Submit the lead for approval? The record is locked until the approval completes.', label: 'Submit for Approval', successMessage: 'The lead has been submitted for approval.' },
    },
  },
  crm_leave_request: {
    label: 'Leave Request',
    pluralLabel: 'Leave Requests',
    description: 'Leave requests and approval; once approved, the hours sync to the requester\'s timesheet for the month',
    fields: {
      approval_status: {
        label: 'Approval Status',
        options: {
          approved: 'Approved',
          draft: 'Draft',
          pending: 'Pending',
          rejected: 'Rejected',
          submitted: 'Submitted',
        },
      },
      approved_date: { label: 'Approved Date' },
      crm_delivery_project: { help: 'Optional: the delivery project affected by the leave', label: 'Affected Project' },
      days: { help: 'Computed from the dates, Monday to Friday only', label: 'Working Days' },
      end_date: { label: 'End Date' },
      hours: { label: 'Leave Hours' },
      leave_code: { label: 'Leave #' },
      leave_type: {
        label: 'Leave Type',
        options: {
          annual: 'Annual Leave',
          compensatory: 'Compensatory Leave',
          marriage: 'Marriage Leave',
          maternity: 'Maternity / Paternity Leave',
          other: 'Other',
          personal: 'Personal Leave',
          sick: 'Sick Leave',
        },
      },
      notes: { label: 'Notes' },
      owner_id: { label: 'Requester' },
      reason: { label: 'Reason' },
      start_date: { label: 'Start Date' },
    },
    _sections: {
      approval: { label: 'Approval' },
      basic: { label: 'Leave Information' },
    },
    _views: {
      all_leave_requests: { label: 'All Leave Requests' },
    },
    _actions: {
      submit_approval: { confirmText: 'Submit the leave request for approval? The record is locked until the approval completes.', label: 'Submit for Approval', successMessage: 'The leave request has been submitted for approval.' },
    },
  },
  crm_legal_entity: {
    label: 'Contracting Entity',
    pluralLabel: 'Contracting Entities',
    description: 'Master data of our contracting entities (legal companies), selected on opportunities and contracts',
    fields: {
      address: { label: 'Registered Address' },
      bank_account: { label: 'Bank Account' },
      bank_name: { label: 'Bank' },
      is_active: { label: 'Active' },
      legal_representative: { label: 'Legal Representative' },
      name: { label: 'Entity Name' },
      notes: { label: 'Notes' },
      registration_number: { label: 'Unified Social Credit Code' },
      short_name: { label: 'Short Name' },
    },
    _sections: {
      bank: { label: 'Bank Information' },
      basic: { label: 'Entity Information' },
    },
    _views: {
      all_legal_entities: { label: 'All Contracting Entities' },
    },
  },
  crm_opportunity: {
    _sections: {
      entity: { label: 'Contracting Entity' },
      initiation: { label: 'Initiation' },
    },
    _actions: {
      submit_approval: { confirmText: 'Submit the opportunity initiation for approval? The record is locked until the approval completes.', label: 'Submit for Initiation Approval', successMessage: 'The opportunity initiation has been submitted for approval.' },
    },
  },
  crm_presales_project: {
    label: 'Presales Project',
    pluralLabel: 'Presales Projects',
    _actions: {
      submit_approval: { confirmText: 'Submit the presales project for approval? The record is locked until the approval completes.', label: 'Submit for Approval', successMessage: 'The presales project has been submitted for approval.' },
    },
  },
  crm_purchase_contract: {
    label: 'Purchase Contract',
    pluralLabel: 'Purchase Contracts',
    description: 'Subcontract, software and hardware purchase contracts under a delivery project, with payment progress',
    fields: {
      description: { label: 'Description' },
      amount: { label: 'Contract Amount' },
      category: {
        label: 'Category',
        options: {
          hardware: 'Hardware',
          other: 'Other',
          software: 'Software',
          subcontract: 'Subcontract',
        },
      },
      contract_code: { label: 'Purchase Contract #' },
      crm_delivery_project: { label: 'Delivery Project' },
      end_date: { label: 'End Date' },
      name: { label: 'Contract Name' },
      owner_id: { label: 'Commercial Owner' },
      paid_amount: { label: 'Paid' },
      signed_date: { label: 'Signed Date' },
      start_date: { label: 'Start Date' },
      status: {
        label: 'Status',
        options: {
          active: 'Active',
          completed: 'Completed',
          draft: 'Draft',
          terminated: 'Terminated',
        },
      },
      unpaid_amount: { label: 'Unpaid' },
      vendor_name: { label: 'Vendor' },
    },
    _sections: {
      basic: { label: 'Contract Information' },
      payment: { label: 'Payment' },
    },
    _views: {
      all_purchase_contracts: { label: 'All Purchase Contracts' },
    },
  },
  crm_rate_card: {
    label: 'Rate Card',
    pluralLabel: 'Rate Cards',
    description: 'Grade × rate standard: the unit price source for timesheets and labor cost plans',
    fields: {
      daily_rate: { help: 'Reference value at 8 hours per day', label: 'Daily Rate' },
      effective_from: { label: 'Effective From' },
      effective_to: { label: 'Effective To' },
      grade_code: { label: 'Grade Code' },
      hourly_rate: { label: 'Hourly Rate' },
      is_active: { label: 'Active' },
      name: { label: 'Grade' },
      notes: { label: 'Notes' },
      rate_standard: {
        help: 'One grade may carry one row per standard; a labor cost line resolves the rate in force for each month by grade and standard.',
        label: 'Rate Standard',
        options: { discount: 'Discount', outsourced: 'Outsourced', standard: 'Standard' },
      },
    },
    _sections: {
      basic: { label: 'Rate Card' },
    },
    _views: {
      all_rate_cards: { label: 'All Rate Cards' },
    },
  },
  crm_sales_order: {
    label: 'Sales Order',
    pluralLabel: 'Sales Orders',
    description: 'Customer orders under a sales contract, with delivery and acceptance progress',
    fields: {
      description: { label: 'Description' },
      acceptance_date: { label: 'Acceptance Date' },
      amount: { label: 'Order Amount' },
      crm_account: { label: 'Account' },
      crm_contract: { label: 'Sales Contract' },
      crm_delivery_project: { label: 'Delivery Project' },
      delivery_status: {
        label: 'Delivery Status',
        options: {
          accepted: 'Accepted',
          delivered: 'Delivered',
          in_progress: 'In Delivery',
          pending: 'Pending Delivery',
        },
      },
      name: { label: 'Order Name' },
      order_code: { label: 'Order #' },
      order_date: { label: 'Order Date' },
      owner_id: { label: 'Commercial Owner' },
    },
    _sections: {
      basic: { label: 'Order Information' },
    },
    _views: {
      all_sales_orders: { label: 'All Sales Orders' },
    },
  },
  crm_travel_cost: {
    label: 'Travel Cost',
    pluralLabel: 'Travel Costs',
  },
};
