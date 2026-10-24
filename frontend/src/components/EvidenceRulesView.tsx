import React from 'react';
import { BookOpen, ShieldCheck, AlertCircle, ExternalLink, Check, X, FileText } from 'lucide-react';

export const EvidenceRulesView: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
            Regulatory Framework & Evidence Register
          </span>
          <span className="text-xs text-slate-500 font-mono">Statutory Baseline: RBI / DFS Official Directives</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-1 tracking-tight">Evidence Register & Rules Framework</h2>
        <p className="text-xs text-slate-600 mt-0.5">
          BankMitra operates strictly within verified regulatory guidelines, separating empirical sovereign observations from operational workflow logic.
        </p>
      </div>

      {/* 8 Transparent Rules Engine */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">The 8 Deterministic Engine Rules</h3>
            <p className="text-xs text-slate-500">Inspectable, reproducible logic with explicit guardrails.</p>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-200 font-semibold">
            Deterministic Rule Verification (R1–R8)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              id: 'R1',
              title: 'Opt-Out & Agency Respect',
              cond: 'Customer declined contact, withdrew consent, or chose NO_FURTHER_CONTACT.',
              out: 'Suppress simulated outreach immediately. Log opt-out in compliance audit.',
              guard: 'No repeated nudges or penalty. Respecting customer agency outranks reactivation targets.'
            },
            {
              id: 'R2',
              title: 'Customer-Confirmed KYC Mismatch',
              cond: 'Customer-confirmed documentation or demographic detail mismatch.',
              out: 'Offer official bank activation path; non-home branch or authorised BC where available.',
              guard: 'Zero credentials collected. Prototype does not collect or process sensitive documents.'
            },
            {
              id: 'R3',
              title: 'Physical Access Friction',
              cond: 'Customer reports travel, transit cost, or branch hours friction.',
              out: 'Route to verified local BC kiosk or branch appointment; if stale, block referral.',
              guard: 'Never dispatch customer to an unverified or stale (>90 days) touchpoint.'
            },
            {
              id: 'R4',
              title: 'Unresolved Grievance / Trust',
              cond: 'Customer reports failed ATM transaction, unexpected charge, or unresolved complaint.',
              out: 'Route directly to Bank Customer Service Committee / Internal Ombudsman first.',
              guard: 'Referral is NOT resolution. Never push reactivation or promise monetary refunds.'
            },
            {
              id: 'R5',
              title: 'Changed / Concluded Utility',
              cond: 'Customer reports account was opened for one-time scheme (e.g. scholarship ended).',
              out: 'Provide neutral guidance on zero-balance rights, structured closure, or safe no-action.',
              guard: 'Never suggest artificial transactions, forced balances, or cross-selling.'
            },
            {
              id: 'R6',
              title: 'Unknown, Mixed, or System-Only Signal',
              cond: 'Telemetry signal only without customer confirmation, or contradictory evidence.',
              out: 'Hold in human review queue. Zero automated intervention without customer voice.',
              guard: 'Never guess customer motive from account balance or inactivity duration alone.'
            },
            {
              id: 'R7',
              title: 'Outcome Separation (Self-Report vs Verified)',
              cond: 'Customer reports barrier resolved, but no institutional verification exists.',
              out: 'Mark self-reported resolution; sustained meaningful use remains UNVERIFIED.',
              guard: 'Prevents false success claims by keeping audit and self-reported fields distinct.'
            },
            {
              id: 'R8',
              title: 'Operational Reactivation ≠ Customer Success',
              cond: 'Account operational status reactivated, but customer does NOT desire ongoing use.',
              out: 'Record operational status separately; strictly EXCLUDE from meaningful inclusion metrics.',
              guard: 'Eliminates perverse incentives for branch staff to force reactivations for targets.'
            }
          ].map((r) => (
            <div key={r.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Rule {r.id}: {r.title}
                </span>
              </div>
              <p className="text-slate-700"><strong>Trigger:</strong> {r.cond}</p>
              <p className="text-emerald-900 bg-emerald-50/80 p-2 rounded border border-emerald-100 font-medium">
                <strong>Action:</strong> {r.out}
              </p>
              <p className="text-slate-500 text-[11px] italic">
                <strong>Guardrail:</strong> {r.guard}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sourced Regulatory Facts Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Verified Official Regulatory Citations</h3>
          <p className="text-xs text-slate-500">Every statutory requirement audited against Reserve Bank of India and DFS sources.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Ref ID</th>
                <th className="py-2.5 px-3">Authority & Citation</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Verified Finding</th>
                <th className="py-2.5 px-3">Evidence Boundary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              <tr>
                <td className="py-2.5 px-3 font-bold text-emerald-800">R1</td>
                <td className="py-2.5 px-3 text-slate-800 font-sans">RBI Inoperative Accounts Revised Instructions</td>
                <td className="py-2.5 px-3 text-slate-600">01 Jan 2024</td>
                <td className="py-2.5 px-3 text-slate-700 font-sans">24-month inoperative threshold; annual tracing review; fee waivers.</td>
                <td className="py-2.5 px-3 text-slate-500 font-sans">Statutory baseline; BankMitra does not redefine rules.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-emerald-800">R2</td>
                <td className="py-2.5 px-3 text-slate-800 font-sans">RBI Inoperative Accounts & Facilitation</td>
                <td className="py-2.5 px-3 text-slate-600">02 Dec 2024</td>
                <td className="py-2.5 px-3 text-slate-700 font-sans">High inoperative volume; observed KYC pendency and detail mismatches.</td>
                <td className="py-2.5 px-3 text-slate-500 font-sans">Verifies friction exists; does NOT give national percentage breakdown.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-emerald-800">R3</td>
                <td className="py-2.5 px-3 text-slate-800 font-sans">RBI Activation Amendment on BC & Non-Home Branches</td>
                <td className="py-2.5 px-3 text-slate-600">12 Jun 2025</td>
                <td className="py-2.5 px-3 text-slate-700 font-sans">KYC for activation at non-home branches and through authorised BCs.</td>
                <td className="py-2.5 px-3 text-slate-500 font-sans">Requires bank authorization; BankMitra is not a KYC provider.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-emerald-800">R4/R5</td>
                <td className="py-2.5 px-3 text-slate-800 font-sans">RBI UDGAM Launch & FAQs</td>
                <td className="py-2.5 px-3 text-slate-600">Mar 2024</td>
                <td className="py-2.5 px-3 text-slate-700 font-sans">30 banks onboarded covering ~90% of 10-year DEA Fund deposits.</td>
                <td className="py-2.5 px-3 text-slate-500 font-sans">Covers 10-year unclaimed deposits; not 2-year inoperative accounts.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-emerald-800">R6/R7</td>
                <td className="py-2.5 px-3 text-slate-800 font-sans">DFS Annual Report 2024–25 & PMJDY Portal</td>
                <td className="py-2.5 px-3 text-slate-600">Jan 2025</td>
                <td className="py-2.5 px-3 text-slate-700 font-sans">54.50 crore accounts opened; ₹2.44 lakh crore balance; BC framework.</td>
                <td className="py-2.5 px-3 text-slate-500 font-sans">Documents macro reach; does not measure active daily usage.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Claims Register Guide (Safe vs Unsafe Phrasing) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Claims Register: Safe vs. Unsafe Wording</h3>
          <p className="text-xs text-slate-500">Rigorous guardrails governing all presentation and evaluation claims.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {[
            {
              topic: 'AI and Diagnosis',
              bad: 'Our AI model predicts why an account is dormant with 94% accuracy.',
              good: 'BankMitra uses deterministic, explainable rules (R1–R8) to map customer-confirmed barriers to verified official routes.'
            },
            {
              topic: 'National Inactivity Volume',
              bad: 'India has 10 crore dormant accounts holding ₹50,000 crore because of distance.',
              good: 'RBI observations confirm high inoperative volumes and process friction, but reliable national cause-by-cause breakdowns are not publicly available.'
            },
            {
              topic: 'Reactivation Impact',
              bad: 'We automatically reactivate dormant accounts and guarantee recovery.',
              good: 'The platform facilitates barrier diagnosis for authorised institutions; lawful reactivation authority remains exclusively with the bank under RBI rules.'
            },
            {
              topic: 'Customer Refusal',
              bad: 'Unresponsive or declining customers are failed leads to be retargeted.',
              good: 'Customer non-use or opt-out is an autonomous choice respected under Rule R1, with immediate cessation of outreach.'
            }
          ].map((c, i) => (
            <div key={i} className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
              <span className="font-bold text-slate-900 block text-xs">{c.topic}</span>
              <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-900 text-[11px] flex items-start gap-1.5">
                <X className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                <span><strong>Never Say:</strong> "{c.bad}"</span>
              </div>
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-[11px] flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Always Say:</strong> "{c.good}"</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
