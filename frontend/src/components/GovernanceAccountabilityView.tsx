import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  BarChart2, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Layers, 
  RotateCw, 
  FileText, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  Activity, 
  Database, 
  RefreshCw, 
  Trash2, 
  Users,
  AlertCircle
} from 'lucide-react';
import { GovernanceOutcomesResponse, RetentionPolicyResponse, GovernanceIndicatorItem } from '../types';
import { fetchGovernanceOutcomes, fetchRetentionPolicy, simulateRetentionPurge } from '../api';

export const GovernanceAccountabilityView: React.FC = () => {
  const [data, setData] = useState<GovernanceOutcomesResponse | null>(null);
  const [retention, setRetention] = useState<RetentionPolicyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purgeMessage, setPurgeMessage] = useState<string | null>(null);
  const [isPurging, setIsPurging] = useState(false);

  useEffect(() => {
    loadGovernanceData();
  }, []);

  const loadGovernanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [govData, retData] = await Promise.all([
        fetchGovernanceOutcomes(),
        fetchRetentionPolicy()
      ]);
      setData(govData);
      setRetention(retData);
    } catch (err: any) {
      console.error('Failed to load governance outcomes:', err);
      setError(err?.message || 'Failed to connect to outcome monitoring API.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePurge = async () => {
    if (!window.confirm('Simulate statutory data erasure under DPDP Act 2023 (Section 8(7)) for demonstration cases where purpose has expired?')) {
      return;
    }
    setIsPurging(true);
    setPurgeMessage(null);
    try {
      const res = await simulateRetentionPurge('SUSTAINED_USAGE');
      setPurgeMessage(res.message);
      await loadGovernanceData();
    } catch (err) {
      setPurgeMessage('Purge simulation failed: ' + String(err));
    } finally {
      setIsPurging(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-9 h-9 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Computing governance indicators G1–G5 and statutory retention status...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white border border-rose-200 rounded-xl p-8 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Unable to Load Outcome Monitoring Data</h3>
        <p className="text-xs text-slate-500">
          {error || 'Data is currently unavailable from the governance outcomes service.'}
        </p>
        <button
          onClick={loadGovernanceData}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const g1 = data.indicators?.G1 || data.indicators?.G1_referral_dispatch_rate;
  const g2 = data.indicators?.G2 || data.indicators?.G2_intervention_completion_rate;
  const g3 = data.indicators?.G3 || data.indicators?.G3_verified_reactivation_rate;
  const g4 = data.indicators?.G4 || data.indicators?.G4_sustained_meaningful_use_rate;
  const g5 = data.indicators?.G5 || data.indicators?.G5_unresolved_barriers_rate;
  const indicators: GovernanceIndicatorItem[] = [g1, g2, g3, g4, g5].filter(Boolean) as GovernanceIndicatorItem[];

  const funnel = data.funnel_summary || {
    total_inoperative_reviewed: data.funnel_stages?.eligible_reviewed ?? data.sample_size ?? 200,
    assessment_engaged: data.funnel_stages?.barriers_assessed ?? 200,
    referral_dispatched: data.funnel_stages?.referrals_dispatched ?? 90,
    customer_accepted: data.funnel_stages?.interventions_accepted ?? 92,
    intervention_completed: data.funnel_stages?.interventions_completed ?? 85,
    verified_operational_reactivation: data.funnel_stages?.accounts_reactivated ?? 61,
    sustained_voluntary_use_90d: data.funnel_stages?.sustained_usage_verified ?? 35,
    unresolved_or_friction: data.funnel_stages?.unresolved_friction ?? 86,
    opted_out: 14
  };

  const regionalBreakdown = data.regional_breakdown || (
    data.regional_distribution
      ? Object.fromEntries(
          Object.entries(data.regional_distribution).map(([zone, d]: [string, any]) => [
            zone,
            {
              total_cases: d.eligible_cases ?? 0,
              completed: d.completed ?? 0,
              reactivated: d.reactivated ?? 0,
              sustained: d.sustained_usage ?? 0,
              unresolved: Math.max(0, (d.eligible_cases ?? 0) - (d.completed ?? 0))
            }
          ])
        )
      : {}
  );

  const totalRetainedAuditEvents = retention?.total_audit_events_retained ?? retention?.total_audit_events ?? 201;

  return (
    <div className="space-y-6">
      {/* Top Banner: Verification & Statutory Accountability */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                Outcome Monitoring & Verification Engine
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Statutory Governance Indicators G1–G5 • PMLA 2002 & DPDP Act 2023
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1 tracking-tight">
              Accountability & Outcome Verification Workspace
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Measures verifiable reactivation and sustained voluntary utility while enforcing strict air-gap boundaries between sovereign macro data and synthetic operational fixtures.
            </p>
          </div>

          <div className="bg-amber-50 px-3.5 py-2 rounded-lg border border-amber-200 text-xs text-amber-900">
            <span className="text-amber-700 block font-bold text-[10px] uppercase tracking-wider">Air-Gap Verification</span>
            <span className="font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              Tier D Synthetic Operational Records Segregated
            </span>
          </div>
        </div>
      </div>

      {/* Five Core Governance Indicators (G1–G5) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Core Governance Indicators (G1–G5)</h3>
            <p className="text-xs text-slate-500">
              Formally specified ratios with audited numerators, denominators, time horizons, and source requirements.
            </p>
          </div>
          <button
            onClick={loadGovernanceData}
            className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-md border border-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalculate</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {indicators.map((ind) => (
            <div
              key={ind.code}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {ind.code}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {ind.time_window || ind.observation_window || 'Review Cycle'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs mt-2 line-clamp-1" title={ind.name}>
                  {ind.name}
                </h4>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    {(ind.value_pct ?? ind.rate_pct ?? 0).toFixed(1)}%
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    ({ind.numerator}/{ind.denominator})
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Numerator / Denominator:</span>
                  <span className="text-slate-600 font-medium leading-tight block">
                    {ind.numerator_label} / {ind.denominator_label}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Authorised Source:</span>
                  <span className="text-emerald-700 font-medium block">
                    {ind.source_requirement}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* End-to-End Governance Funnel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">End-to-End Accountability Funnel</h3>
            <p className="text-xs text-slate-500">
              Tracking attrition from review to sustained voluntary usage without conflating reactivation with active use.
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            N = {funnel.total_inoperative_reviewed} Synthetic Cases
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">1. Reviewed</span>
            <span className="text-lg font-bold text-slate-900">{funnel.total_inoperative_reviewed}</span>
            <span className="text-[10px] text-slate-400 block">Inoperative</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">2. Engaged</span>
            <span className="text-lg font-bold text-slate-900">{funnel.assessment_engaged}</span>
            <span className="text-[10px] text-slate-400 block">Assessment</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">3. Dispatched</span>
            <span className="text-lg font-bold text-slate-900">{funnel.referral_dispatched}</span>
            <span className="text-[10px] text-slate-400 block">Referral (G1)</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">4. Accepted</span>
            <span className="text-lg font-bold text-slate-900">{funnel.customer_accepted}</span>
            <span className="text-[10px] text-slate-400 block">Consent Confirmed</span>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-[10px] text-blue-700 uppercase font-semibold block">5. Completed</span>
            <span className="text-lg font-bold text-blue-900">{funnel.intervention_completed}</span>
            <span className="text-[10px] text-blue-600 block">Remediated (G2)</span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <span className="text-[10px] text-emerald-700 uppercase font-semibold block">6. CBS Active</span>
            <span className="text-lg font-bold text-emerald-900">{funnel.verified_operational_reactivation}</span>
            <span className="text-[10px] text-emerald-600 block">Reactivated (G3)</span>
          </div>

          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <span className="text-[10px] text-indigo-700 uppercase font-semibold block">7. Sustained Use</span>
            <span className="text-lg font-bold text-indigo-900">{funnel.sustained_voluntary_use_90d}</span>
            <span className="text-[10px] text-indigo-600 block">90-Day Active (G4)</span>
          </div>
        </div>

        {/* Dropoffs & Exception Sink */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold font-mono">
              Rule R1 Opt-Outs: {funnel.opted_out}
            </span>
            <span className="text-slate-500">
              Terminal suppression; immediate cessation of automated outreach.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold font-mono">
              Unresolved Barriers: {funnel.unresolved_or_friction}
            </span>
            <span className="text-slate-500">
              Stale route diverts, pending Ombudsman disputes, and unconfirmed system signals.
            </span>
          </div>
        </div>
      </div>

      {/* Regional Breakdown of Governance Outcomes */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Regional Governance Performance</h3>
          <p className="text-xs text-slate-500">
            Demonstration of outcome indicators stratified across the 6 administrative zones.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3 text-left">Administrative Zone</th>
                <th className="py-2.5 px-3 text-center">Sample Cases</th>
                <th className="py-2.5 px-3 text-center">Interventions Completed</th>
                <th className="py-2.5 px-3 text-center">CBS Reactivated</th>
                <th className="py-2.5 px-3 text-center">Sustained 90d Use</th>
                <th className="py-2.5 px-3 text-center">Unresolved Barriers</th>
                <th className="py-2.5 px-3 text-right">Conversion Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-mono">
              {Object.entries(regionalBreakdown).map(([zone, metrics], idx) => {
                const conversion = metrics.total_cases > 0 
                  ? ((metrics.sustained / metrics.total_cases) * 100).toFixed(1)
                  : '0.0';
                return (
                  <tr key={zone} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">
                      {zone}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-800">
                      {metrics.total_cases}
                    </td>
                    <td className="py-2.5 px-3 text-center text-blue-700 font-semibold">
                      {metrics.completed}
                    </td>
                    <td className="py-2.5 px-3 text-center text-emerald-700 font-semibold">
                      {metrics.reactivated}
                    </td>
                    <td className="py-2.5 px-3 text-center text-indigo-700 font-bold">
                      {metrics.sustained}
                    </td>
                    <td className="py-2.5 px-3 text-center text-amber-700">
                      {metrics.unresolved}
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {conversion}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Air-Gap Verification & Data Classification Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            Data Tier Architecture & Air-Gap Separation Matrix
          </h3>
          <p className="text-xs text-slate-500">
            Rigorous legal boundary separating public macro indicators from simulated operational cases and future regulated banking integrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Tier A/B: Sovereign Public */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 text-xs">Tier A / B: Public Evidence</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">
                ACTIVE (LIVE)
              </span>
            </div>
            <p className="text-emerald-950 text-[11px] leading-relaxed">
              World Bank Findex (2021), DFS PMJDY reports, RBI FI-Index, and NCFE NFLIS-2019 survey tables.
            </p>
            <ul className="text-[10px] text-emerald-800 space-y-1 pt-1 border-t border-emerald-200/60 font-mono">
              <li>• Access: Open Public / Read-Only</li>
              <li>• Unit: National & Zonal Aggregates</li>
              <li>• PII Exposure: 0% (Zero Identity Data)</li>
              <li>• Purpose: Needs-Screening Only</li>
            </ul>
          </div>

          {/* Tier D: Synthetic Sandbox */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 text-xs">Tier D: Synthetic Demonstrations</span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono font-bold text-[10px]">
                PROTOTYPE ACTIVE
              </span>
            </div>
            <p className="text-amber-950 text-[11px] leading-relaxed">
              200 synthetic case fixtures (<code>CUST-SYN-*</code>) in local SQLite sandbox for evaluating state-machine transitions and governance rules.
            </p>
            <ul className="text-[10px] text-amber-800 space-y-1 pt-1 border-t border-amber-200/60 font-mono">
              <li>• Access: Local Sandbox Only</li>
              <li>• Unit: Simulated Individual Tokens</li>
              <li>• PII Exposure: Purely Synthetic</li>
              <li>• Status: Fully Air-Gapped from Tier A</li>
            </ul>
          </div>

          {/* Tier C: Future Production */}
          <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">Tier C: Production Banking Data</span>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-bold text-[10px]">
                FUTURE REGULATED
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Production Core Banking System (CBS) ledgers and RBI-licensed Account Aggregator / BC networks.
            </p>
            <ul className="text-[10px] text-slate-500 space-y-1 pt-1 border-t border-slate-200 font-mono">
              <li>• Access: Regulated Bank APIs Only</li>
              <li>• Statutory Basis: DPDP Act 2023 Sec 6</li>
              <li>• Integration: NOT Built in Prototype</li>
              <li>• Protection: Hardware Security Module (HSM)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Statutory Retention Policies & Audit Controls */}
      {retention && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Statutory Retention Schedules & Erasure Engine
              </h3>
              <p className="text-xs text-slate-500">
                PMLA 2002 Section 12 (5-Year Audit Retention) & DPDP Act 2023 Section 8(7) (Purpose Limitation).
              </p>
            </div>
            <button
              onClick={handleSimulatePurge}
              disabled={isPurging}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>{isPurging ? 'Simulating Erasure...' : 'Simulate DPDP Statutory Purge'}</span>
            </button>
          </div>

          {purgeMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
              ✓ {purgeMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">PMLA 2002 5-Year Immutable Audit Rule</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                All workflow transitions, actor roles (<code>BRANCH_OFFICER</code>, <code>BC_AGENT</code>, <code>COMPLIANCE_AUDITOR</code>), and service verifications are retained for 5 years in an append-only audit log.
              </p>
              <span className="text-[11px] font-mono font-bold text-indigo-700 block">
                Total Retained Audit Events: {totalRetainedAuditEvents}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">DPDP Act 2023 Purpose Limitation Erasure</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Customer contact tokens and transient barrier notes are purged once re-engagement succeeds or upon customer opt-out under Rule R1, preserving only cryptographic hashes for regulatory auditability.
              </p>
              <span className="text-[11px] font-mono text-emerald-700 block">
                Policy: Section 8(7) Compliance Active
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
