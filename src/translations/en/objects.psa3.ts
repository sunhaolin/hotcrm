// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { ObjectTranslationData } from '@objectstack/spec/system';

/**
 * en — the keys the PSA rounds added to the STANDARD objects (account,
 * contact, opportunity) and the round-2 finance fields on the project family,
 * stated explicitly so `test/i18n-references.test.ts` finds every authored
 * label, help string, option and section heading in the en pack rather than
 * letting it fall back to the English in code (demo, epic #2). Merged over
 * `objects.psa.ts` / `objects.psa2.ts` at the locale root.
 */
export const psa3: Record<string, Partial<ObjectTranslationData>> = {
  crm_account: {
    fields: {
      primary_vendor: { label: 'Current Primary Vendor' },
      it_budget_current_year: { label: 'IT Budget (Current Year)' },
      payment_cycle: {
        label: 'Payment Cycle',
        options: { days_30: '30 days', days_60: '60 days', days_90: '90 days', days_180: '180 days', milestone: 'By milestone', other: 'Other' },
      },
      ear_status: {
        label: 'US EAR Entity List',
        help: 'A machine match is recorded as \'suspected\' and only warns; opportunities are blocked once a person confirms the listing.',
        options: { unknown: 'Not Checked', clear: 'Not Listed', suspected: 'Suspected (machine match)', confirmed: 'Confirmed Listed' },
      },
      is_strategic_partner: { label: 'Strategic Partner' },
    },
    _sections: { business_info: { label: 'Business Information' } },
  },
  crm_contact: {
    fields: {
      gender: { label: 'Gender', options: { male: 'Male', female: 'Female', other: 'Other' } },
      buying_influence: {
        label: 'Buying Influence',
        options: { decision_maker: 'Decision Maker', influencer: 'Influencer', end_user: 'End User', procurement: 'Procurement', technical_evaluator: 'Technical Evaluator', champion: 'Champion', other: 'Other' },
      },
      attitude: { label: 'Attitude Toward Us', options: { supportive: 'Supportive', neutral: 'Neutral', opposed: 'Opposed', unknown: 'Unknown' } },
      relationship_strength: { label: 'Relationship Strength', options: { strong: 'Strong', medium: 'Medium', weak: 'Weak', none: 'Not Established' } },
    },
  },
  crm_opportunity: {
    fields: {
      controllability: { label: 'Controllability', options: { high: 'High', medium: 'Medium', low: 'Low' } },
      customer_initiation_date: { label: 'Customer Initiation Date' },
      expected_bid_date: { label: 'Expected Bid Date' },
      subcontract_info: { label: 'Subcontract Information' },
      crm_legal_entity: { label: 'Contracting Entity' },
      business_category: {
        label: 'Business Category',
        options: { government_enterprise: 'Government & Enterprise', finance: 'Finance', manufacturing: 'Manufacturing', internet: 'Internet' },
      },
      revenue_recognition_type: {
        label: 'Revenue Recognition',
        options: { milestone: 'By milestone', time_and_material: 'Time & material', acceptance: 'On acceptance', periodic: 'Over the period' },
      },
    },
    _sections: { bid: { label: 'Bid & Contracting Entity' } },
  },
  crm_presales_project: {
    fields: {
      presales_hours: { label: 'Presales Hours' },
      presales_labor_actual: { label: 'Presales Labor Actual' },
    },
  },
  crm_delivery_project: {
    fields: {
      labor_actual: { label: 'Labor Actual', help: 'Approved timesheets only.' },
      budget_adjustment_total: { label: 'Approved Adjustments' },
      budget_current: { label: 'Current Budget', help: 'Budget baseline + approved adjustments.' },
      crm_contract: { label: 'Sales Contract' },
      contract_amount: { label: 'Contract Amount', help: 'Defaults from the sales contract value (delivery_project_defaults).' },
      progress_pct: { label: 'Progress %', help: '0–100, maintained by the project manager.' },
      revenue_recognized: { label: 'Revenue Recognized', help: 'Contract amount × progress %.' },
      invoiced_total: { label: 'Invoiced Total' },
      collected_total: { label: 'Collected Total' },
      receivable_balance: { label: 'Receivable Balance' },
      purchase_total: { label: 'Purchase Contracts Total' },
      order_total: { label: 'Sales Orders Total' },
      project_margin_pct: { label: 'Project Gross Margin %', help: '(Contract amount − actual cost) ÷ contract amount × 100.' },
    },
    _sections: { finance: { label: 'Contract & Finance' } },
  },
  crm_timesheet: {
    fields: {
      crm_rate_card: { label: 'Grade / Rate Card', help: 'Fills the hourly rate from the rate card (timesheet_rate_fill).' },
      standard_hours: { label: 'Standard Hours', help: 'Hours due this month; on a draft sheet hours = standard − leave + overtime.' },
      leave_hours: { label: 'Leave Hours', help: 'Synced from approved leave requests of the submitter for this month.' },
      overtime_hours: { label: 'Overtime Hours' },
    },
  },
  crm_travel_cost: {
    fields: {
      crm_business_trip: { label: 'Business Trip', help: 'The approved trip this cost belongs to; project, traveller and date default from it.' },
    },
  },
};
