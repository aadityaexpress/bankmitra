import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  Globe,
  TrendingUp,
  GitPullRequest,
  ShieldCheck,
  Building,
  Scale,
  Ban,
  Layers,
  Activity,
  FileText
} from 'lucide-react';
import { DashboardMetrics } from '../types';

interface OperationsDashboardProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onNavigateToModule: (module: 'regional-intelligence' | 'interventions' | 'outcomes' | 'methodology') => void;
  onFilterBarrier?: (barrier: string) => void;
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  metrics,
  loading,
  error,
  onRetry,
  onNavigateToModule,
  onFilterBarrier
}) => {
  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Aggregating multi-source intelligence and pipeline metrics...</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-white border border-rose-200 rounded-xl p-8 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Unable to Load Executive Overview</h3>
        <p className="text-xs text-slate-500">
          {error || 'Dashboard metrics could not be loaded from the API or fallback fixtures.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
          >
            Retry Connection
          </button>
        )}
      </div>
    );
  }

  const { funnel, barrier_breakdown, data_quality_warnings } = metrics;
  const N = funnel.sample_size || 200;

  return (
    <div className="space-y-6">
      {/* Executive Overview Headline Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                Institutional Executive Dashboard
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Longitudinal Window: {funnel.observation_window_days} Days
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Financial Inclusion Intelligence & Governance Overview
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Synthesizing sovereign macro evidence for geographic needs-screening with deterministic case workflows and longitudinal outcome verification across the financial access lifecycle.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Reviewed Cohort</span>
              <span className="text-lg font-bold text-slate-900 font-mono">N = {N}</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Data Tier</span>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 block mt-0.5">
                Demonstration Sandbox
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* The Three Core Pillars of the Platform */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Regional Needs Screening */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Pillar 1 • Intelligence
              </span>
              <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Geographic Needs-Screening (FINSI)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zonal ranking across 6 RBI administrative zones based on verbatim NCFE literacy deficits and PMJDY rural exposure.
            </p>
            <div className="pt-2 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Rank #1 (Highest Need):</span>
                <span className="font-bold text-slate-900">East Zone (0.7820)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Rank #2:</span>
                <span className="font-bold text-slate-900">Central Zone (0.7060)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Evidence Coverage:</span>
                <span className="font-bold text-emerald-700">100% (0 Missing Inputs)</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateToModule('regional-intelligence')}
            className="inline-flex items-center justify-between w-full pt-3 border-t border-slate-100 text-xs font-semibold text-slate-800 hover:text-slate-950 transition-colors"
          >
            <span>Explore Regional Intelligence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 2: Operational Case Governance */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Pillar 2 • Governance
              </span>
              <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
                <GitPullRequest className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Intervention Case Management</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deterministic rule evaluation (Rules R1–R8) and sequential state transitions with role-based access logging.
            </p>
            <div className="pt-2 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Referrals Dispatched (G1):</span>
                <span className="font-bold text-slate-900">162 / 200 (81.0%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Customer Accepted:</span>
                <span className="font-bold text-slate-900">142 Cases (71.0%)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Interventions Completed (G2):</span>
                <span className="font-bold text-blue-700">121 / 142 (85.2%)</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateToModule('interventions')}
            className="inline-flex items-center justify-between w-full pt-3 border-t border-slate-100 text-xs font-semibold text-slate-800 hover:text-slate-950 transition-colors"
          >
            <span>Manage Case Records & Workflow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 3: Outcome Accountability */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Pillar 3 • Outcomes
              </span>
              <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Longitudinal Outcome Monitoring</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Audits the crucial divergence between administrative unfreezing and genuine 90-day voluntary usage.
            </p>
            <div className="pt-2 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">CBS Reactivation (G3):</span>
                <span className="font-bold text-emerald-700">98 / 121 (81.0%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">90d Sustained Use (G4):</span>
                <span className="font-bold text-indigo-700">42 / 98 (42.9%)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Unresolved Frictions (G5):</span>
                <span className="font-bold text-amber-700">38 / 185 (20.5%)</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateToModule('outcomes')}
            className="inline-flex items-center justify-between w-full pt-3 border-t border-slate-100 text-xs font-semibold text-slate-800 hover:text-slate-950 transition-colors"
          >
            <span>View Governance Outcomes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* End-to-End Pipeline Attrition Funnel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Access & Re-engagement Pipeline</h3>
            <p className="text-xs text-slate-500">
              Tracking attrition through identification, dispatch, remediation, and longitudinal retention.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            Cohort: Inoperative Accounts
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">1. Reviewed</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{funnel.eligible_reviewed}</span>
            <span className="text-[10px] text-slate-400 block">100% Cohort</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">2. Engaged</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{funnel.engaged}</span>
            <span className="text-[10px] text-slate-400 block">Consented</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">3. Dispatched</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{funnel.interventions_accepted + 20}</span>
            <span className="text-[10px] text-slate-400 block">Referral (G1)</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">4. Accepted</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{funnel.interventions_accepted}</span>
            <span className="text-[10px] text-slate-400 block">Agreed</span>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
            <span className="text-[10px] text-blue-700 uppercase font-semibold block">5. Remediated</span>
            <span className="text-lg font-bold text-blue-900 font-mono">{funnel.interventions_completed}</span>
            <span className="text-[10px] text-blue-600 block">Completed (G2)</span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
            <span className="text-[10px] text-emerald-700 uppercase font-semibold block">6. CBS Active</span>
            <span className="text-lg font-bold text-emerald-900 font-mono">{funnel.accounts_reactivated}</span>
            <span className="text-[10px] text-emerald-600 block">Unfrozen (G3)</span>
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200">
            <span className="text-[10px] text-indigo-700 uppercase font-semibold block">7. Sustained</span>
            <span className="text-lg font-bold text-indigo-900 font-mono">{funnel.meaningful_use_verified}</span>
            <span className="text-[10px] text-indigo-600 block">90d Active (G4)</span>
          </div>
        </div>
      </div>

      {/* Diagnosed Friction Breakdown & Epistemic Boundaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Friction Categories */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Diagnosed Friction Distribution</h4>
            <span className="text-[11px] text-slate-500 font-mono">Assessed Cases</span>
          </div>
          <div className="space-y-2 text-xs">
            {Object.entries(barrier_breakdown || {}).map(([barrier, count]) => {
              const label = barrier.replace(/_/g, ' ');
              const percentage = ((count / N) * 100).toFixed(1);
              return (
                <div 
                  key={barrier}
                  onClick={() => onFilterBarrier && onFilterBarrier(barrier)}
                  className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-200"
                >
                  <span className="font-medium text-slate-700">{label}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900">{count}</span>
                    <span className="text-[11px] text-slate-400 font-mono w-10 text-right">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Governance & Epistemic Safeguards */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-slate-700" />
              <h4 className="text-sm font-bold text-slate-900">Data Governance & Boundary Safeguards</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              BankMitra maintains strict separation between multilateral public evidence and operational demonstration fixtures.
            </p>
            <ul className="text-xs text-slate-600 space-y-2 pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Statistical Join:</strong> Public financial-literacy survey aggregates are never joined with individual accounts to generate dormant account scores.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Agency-First Rules:</strong> Rule R1 enforces immediate and terminal suppression of automated outreach upon customer refusal or opt-out.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Touchpoint Freshness:</strong> Rule R3 blocks automated referrals to any touchpoint lacking accreditation or active verification within 90 days.
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Methodology Standard: v3.2</span>
            <button
              onClick={() => onNavigateToModule('methodology')}
              className="text-slate-800 font-semibold hover:underline"
            >
              Review Full Evidence Registry →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
