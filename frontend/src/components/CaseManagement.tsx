import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  Ban,
  ArrowRight,
  UserCheck,
  Building,
  RefreshCw
} from 'lucide-react';
import { CaseItem, CaseDetail, CustomerDecision, AccountStatusAfter, MeaningfulUseStatus, WorkflowStage } from '../types';
import { fetchCases, fetchCaseDetail, updateCustomerDecision, updateCaseOutcome, transitionWorkflowStage } from '../api';
import { ReviewQueue } from './ReviewQueue';
import { ServiceDirectoryView } from './ServiceDirectoryView';

interface CaseManagementProps {
  initialBarrier?: string;
  onRefreshMetrics: () => void;
  activeRole?: string;
}

export const CaseManagement: React.FC<CaseManagementProps> = ({
  initialBarrier = 'ALL',
  onRefreshMetrics,
  activeRole = 'BRANCH_OFFICER'
}) => {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'cases' | 'review' | 'touchpoints'>('cases');

  // Filters
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [selectedBarrier, setSelectedBarrier] = useState(initialBarrier);
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [reviewFilter, setReviewFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 25;

  // Selected Case Detail Modal
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [selectedActorRole, setSelectedActorRole] = useState(activeRole);
  const [transitionNotes, setTransitionNotes] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setSelectedActorRole(activeRole);
  }, [activeRole]);

  useEffect(() => {
    loadCases();
  }, [selectedRegion, selectedStage, selectedBarrier, selectedChannel, reviewFilter, searchQuery, offset]);

  useEffect(() => {
    if (activeCaseId) {
      loadCaseDetail(activeCaseId);
    }
  }, [activeCaseId]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const reviewNeededParam = reviewFilter === 'REVIEW_NEEDED' ? true : reviewFilter === 'NORMAL' ? false : undefined;
      const data = await fetchCases({
        region: selectedRegion,
        workflow_stage: selectedStage,
        barrier: selectedBarrier,
        channel: selectedChannel,
        review_needed: reviewNeededParam,
        search: searchQuery,
        limit,
        offset
      });
      setCases(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCaseDetail = async (id: string) => {
    setDetailLoading(true);
    setActionMessage(null);
    setTransitionError(null);
    try {
      const data = await fetchCaseDetail(id);
      setCaseDetail(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleWorkflowTransition = async (targetStage: WorkflowStage) => {
    if (!caseDetail) return;
    setIsTransitioning(true);
    setTransitionError(null);
    setActionMessage(null);
    try {
      const res = await transitionWorkflowStage(caseDetail.case.case_id, {
        target_stage: targetStage,
        actor_role: selectedActorRole,
        notes: transitionNotes || `Stage changed to ${targetStage} by ${selectedActorRole}`
      });
      setActionMessage(res.message);
      setTransitionNotes('');
      await loadCaseDetail(caseDetail.case.case_id);
      await loadCases();
      onRefreshMetrics();
    } catch (err: any) {
      setTransitionError(err.message || 'Workflow transition rejected by policy engine.');
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleDecision = async (decision: string) => {
    if (!caseDetail) return;
    try {
      const res = await updateCustomerDecision(caseDetail.case.case_id, decision);
      setActionMessage(res.message || `Customer decision recorded: ${decision}`);
      await loadCaseDetail(caseDetail.case.case_id);
      await loadCases();
      onRefreshMetrics();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOutcomeUpdate = async (payload: {
    barrier_resolved_self_reported?: boolean;
    barrier_resolved_verified?: boolean;
    account_status_after?: string;
    meaningful_use_status?: string;
  }) => {
    if (!caseDetail) return;
    try {
      await updateCaseOutcome(caseDetail.case.case_id, payload);
      setActionMessage('Outcome updated successfully. Refreshed audit trail.');
      await loadCaseDetail(caseDetail.case.case_id);
      await loadCases();
      onRefreshMetrics();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                Operational Workspace
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Cohort N = {total} Inoperative Cases
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Intervention Management & Procedural Workflow
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Deterministic rule evaluation (Rules R1–R8), verified touchpoint routing, and sequential state transitions with immutable audit trails.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Environment:</span>
            <span className="font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold text-[11px]">
              Synthetic Sandbox Fixtures
            </span>
          </div>
        </div>

        {/* Sub-Tabs: Cases, Review Queue, Touchpoint Directory */}
        <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold pt-2">
          <button
            onClick={() => setActiveSubTab('cases')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeSubTab === 'cases'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Active Case Registry ({total})
          </button>
          <button
            onClick={() => setActiveSubTab('review')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'review'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Compliance Review Queue</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              Held
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('touchpoints')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeSubTab === 'touchpoints'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Accredited Touchpoint Directory
          </button>
        </div>
      </div>

      {activeSubTab === 'review' && (
        <ReviewQueue onSelectCase={(id) => { setActiveCaseId(id); setActiveSubTab('cases'); }} />
      )}

      {activeSubTab === 'touchpoints' && (
        <ServiceDirectoryView />
      )}

      {activeSubTab === 'cases' && (
        <>
          {/* Search and Filters Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Case ID (e.g. CASE-0012) or Customer Token..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOffset(0);
              }}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Region filter */}
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setOffset(0);
              }}
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Regions (All 6 Zones)</option>
              <option value="Central Zone">Central Zone</option>
              <option value="East Zone">East Zone</option>
              <option value="South Zone">South Zone</option>
              <option value="North Zone">North Zone</option>
              <option value="West Zone">West Zone</option>
              <option value="North-East Zone">North-East Zone</option>
            </select>

            {/* Workflow Stage filter */}
            <select
              value={selectedStage}
              onChange={(e) => {
                setSelectedStage(e.target.value);
                setOffset(0);
              }}
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Workflow Stages</option>
              <option value="ASSESSMENT">Assessment</option>
              <option value="REFERRAL">Referral Dispatched</option>
              <option value="ACCEPTED_INTERVENTION">Intervention Accepted</option>
              <option value="COMPLETED">Completed Remediation</option>
              <option value="VERIFIED_REACTIVATION">CBS Reactivated</option>
              <option value="SUSTAINED_USAGE">Sustained 90d Usage</option>
              <option value="UNRESOLVED_BARRIERS">Unresolved Barriers</option>
              <option value="OPTED_OUT">Opted Out (Suppressed)</option>
            </select>

            {/* Barrier filter */}
            <select
              value={selectedBarrier}
              onChange={(e) => {
                setSelectedBarrier(e.target.value);
                setOffset(0);
              }}
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Barriers (All Categories)</option>
              <option value="KYC_MISMATCH">KYC / Detail Mismatch</option>
              <option value="PHYSICAL_ACCESS">Physical Access Friction</option>
              <option value="TRUST_GRIEVANCE">Trust / Unresolved Grievance</option>
              <option value="CHANGED_UTILITY">Changed / Concluded Utility</option>
              <option value="DIGITAL_FRICTION">Digital / Transaction Friction</option>
              <option value="UNKNOWN_OR_CONTRADICTORY">Unknown / Unconfirmed</option>
            </select>

            {/* Channel filter */}
            <select
              value={selectedChannel}
              onChange={(e) => {
                setSelectedChannel(e.target.value);
                setOffset(0);
              }}
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Preferred Channels</option>
              <option value="AUTHORISED_BC">Authorised BC / Bank Mitra</option>
              <option value="BRANCH_VISIT">Bank Branch Visit</option>
              <option value="PLAIN_SMS_GUIDE">Plain-Language Guide</option>
              <option value="NO_FURTHER_CONTACT">Opted Out / No Contact</option>
            </select>

            {/* Review status filter */}
            <select
              value={reviewFilter}
              onChange={(e) => {
                setReviewFilter(e.target.value);
                setOffset(0);
              }}
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Review Statuses</option>
              <option value="REVIEW_NEEDED">Review Queue Flagged Only</option>
              <option value="NORMAL">Standard Pathway Cases</option>
            </select>

            <button
              onClick={() => {
                setSelectedRegion('ALL');
                setSelectedStage('ALL');
                setSelectedBarrier('ALL');
                setSelectedChannel('ALL');
                setReviewFilter('ALL');
                setSearchQuery('');
                setOffset(0);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-2 underline"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
          <span>
            Showing <strong className="text-slate-800">{cases.length}</strong> of{' '}
            <strong className="text-slate-800">{total}</strong> synthetic cases
          </span>
          <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
            Synthetic Demonstration Cases Only
          </span>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Case ID, Token & Region</th>
                <th className="py-3 px-4">Inactivity & Origin</th>
                <th className="py-3 px-4">Primary Barrier</th>
                <th className="py-3 px-4">Evidence Source</th>
                <th className="py-3 px-4">Workflow Stage</th>
                <th className="py-3 px-4">Channel & Destination</th>
                <th className="py-3 px-4">Outcome State</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading cases...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No synthetic cases match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.case_id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Case ID, Token and Region */}
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-slate-900">{c.case_id}</div>
                      <div className="text-[11px] text-slate-500">{c.customer_token}</div>
                      <div className="text-[10px] text-emerald-700 font-sans font-semibold mt-0.5">
                        {c.region || 'Central Zone'}
                      </div>
                    </td>

                    {/* Inactivity and Origin */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {c.inactivity_band.replace(/_/g, ' ')}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {c.account_origin.replace(/_/g, ' ')}
                      </div>
                    </td>

                    {/* Primary Barrier */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">
                        {c.barrier_primary ? c.barrier_primary.replace(/_/g, ' ') : 'UNASSESSED'}
                      </div>
                      {c.barrier_secondary && (
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]" title={c.barrier_secondary}>
                          {c.barrier_secondary.replace(/_/g, ' ')}
                        </div>
                      )}
                    </td>

                    {/* Evidence Source & Customer Confirmed */}
                    <td className="py-3 px-4">
                      {c.customer_confirmed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertCircle className="w-3 h-3" /> System Signal
                        </span>
                      )}
                    </td>

                    {/* Workflow Stage */}
                    <td className="py-3 px-4 font-mono">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.workflow_stage === 'ASSESSMENT' ? 'bg-slate-100 text-slate-700' :
                        c.workflow_stage === 'REFERRAL' ? 'bg-blue-100 text-blue-800' :
                        c.workflow_stage === 'ACCEPTED_INTERVENTION' ? 'bg-indigo-100 text-indigo-800' :
                        c.workflow_stage === 'COMPLETED' ? 'bg-cyan-100 text-cyan-800' :
                        c.workflow_stage === 'VERIFIED_REACTIVATION' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        c.workflow_stage === 'SUSTAINED_USAGE' ? 'bg-emerald-700 text-white font-extrabold shadow-xs' :
                        c.workflow_stage === 'OPTED_OUT' ? 'bg-purple-100 text-purple-800 font-bold' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {c.workflow_stage || 'ASSESSMENT'}
                      </span>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">Rule {c.rule_id || 'R6'}</div>
                    </td>

                    {/* Channel & Destination */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">
                        {c.preferred_channel.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {c.completion_status === 'BLOCKED_UNVERIFIED' ? (
                          <span className="text-rose-600 font-semibold flex items-center gap-1">
                            <Ban className="w-3 h-3" /> Stale/Blocked Route
                          </span>
                        ) : (
                          <span className="text-slate-500">Verified Destination</span>
                        )}
                      </div>
                    </td>

                    {/* Outcome State */}
                    <td className="py-3 px-4">
                      {c.opt_out ? (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                          OPT-OUT RESPECTED
                        </span>
                      ) : c.meaningful_use_status === 'VERIFIED_VOLUNTARY_USE' ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                          VOLUNTARY USE VERIFIED
                        </span>
                      ) : c.meaningful_use_status === 'NO_FURTHER_USE_WANTED' ? (
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          NO USE WANTED (R8)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          {c.account_status_after ? c.account_status_after.replace(/_/g, ' ') : 'INOPERATIVE'}
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setActiveCaseId(c.case_id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-200 text-xs">
          <span className="text-slate-500">
            Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit) || 1}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Case Detail & Workflow Drawer / Modal */}
      {activeCaseId && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex justify-end backdrop-blur-xs transition-opacity">
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl p-6 flex flex-col justify-between">
            {detailLoading || !caseDetail ? (
              <div className="py-40 text-center">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-slate-500">Fetching explainable case profile...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold font-mono text-slate-900">{caseDetail.case.case_id}</h3>
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {caseDetail.case.customer_token}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Origin: {caseDetail.case.account_origin.replace(/_/g, ' ')} • Review Date: {caseDetail.case.review_date}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveCaseId(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Status Alert Banner */}
                {actionMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center justify-between">
                    <span>{actionMessage}</span>
                    <button onClick={() => setActionMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">×</button>
                  </div>
                )}

                {/* Section 1: Customer Agency & Permission */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Consent & Contact Permission:</span>
                    {caseDetail.case.contact_permission ? (
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                        ACTIVE PERMISSION
                      </span>
                    ) : (
                      <span className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-bold">
                        CONTACT SUPPRESSED (OPT-OUT)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Preferred Contact Channel: <strong className="text-slate-800">{caseDetail.case.preferred_channel.replace(/_/g, ' ')}</strong>
                  </p>
                </div>

                {/* Section: Workflow Progression & State Machine Transitions */}
                <div className="bg-slate-900 text-white rounded-xl p-4 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                        Workflow Stage Control & RBAC
                      </span>
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Current: {caseDetail.case.workflow_stage || 'ASSESSMENT'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Region: {caseDetail.case.region || 'Central Zone'}
                    </span>
                  </div>

                  {/* Linear Progression Indicator */}
                  <div className="grid grid-cols-6 gap-1 text-[10px] text-center pt-1">
                    {['ASSESSMENT', 'REFERRAL', 'ACCEPTED_INTERVENTION', 'COMPLETED', 'VERIFIED_REACTIVATION', 'SUSTAINED_USAGE'].map((st, i) => {
                      const isCurrent = caseDetail.case.workflow_stage === st;
                      const isPast = ['ASSESSMENT', 'REFERRAL', 'ACCEPTED_INTERVENTION', 'COMPLETED', 'VERIFIED_REACTIVATION', 'SUSTAINED_USAGE'].indexOf(caseDetail.case.workflow_stage || '') > i;
                      return (
                        <div key={st} className={`p-1.5 rounded border transition-colors ${
                          isCurrent ? 'bg-emerald-600 border-emerald-400 text-white font-bold shadow-sm' :
                          isPast ? 'bg-slate-800 border-slate-700 text-emerald-400 font-medium' :
                          'bg-slate-950/60 border-slate-800 text-slate-500'
                        }`}>
                          <span>{i + 1}. {st === 'ACCEPTED_INTERVENTION' ? 'ACCEPTED' : st === 'VERIFIED_REACTIVATION' ? 'REACTIVATED' : st === 'SUSTAINED_USAGE' ? 'SUSTAINED' : st}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Transition Error Alert */}
                  {transitionError && (
                    <div className="p-2.5 rounded bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">State Machine / Policy Rejection:</strong>
                        <span>{transitionError}</span>
                      </div>
                    </div>
                  )}

                  {/* RBAC Role Selector & Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Actor Role (RBAC):</label>
                      <select
                        value={selectedActorRole}
                        onChange={(e) => setSelectedActorRole(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      >
                        <option value="BRANCH_OFFICER">BRANCH_OFFICER (Branch Operations)</option>
                        <option value="BC_AGENT">BC_AGENT (Kiosk / Bank Mitra)</option>
                        <option value="COMPLIANCE_AUDITOR">COMPLIANCE_AUDITOR (Audit & Oversight)</option>
                        <option value="POLICY_LEAD">POLICY_LEAD (Governance Admin)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Transition Audit Note:</label>
                      <input
                        type="text"
                        placeholder="Enter verification notes / CBS ledger ref..."
                        value={transitionNotes}
                        onChange={(e) => setTransitionNotes(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-400 block font-semibold">Permitted Sequential Transitions:</span>
                    <div className="flex flex-wrap gap-2">
                      {caseDetail.case.workflow_stage === 'ASSESSMENT' && (
                        <button
                          onClick={() => handleWorkflowTransition('REFERRAL')}
                          disabled={isTransitioning}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                        >
                          Dispatch Referral (G1)
                        </button>
                      )}

                      {caseDetail.case.workflow_stage === 'REFERRAL' && (
                        <button
                          onClick={() => handleWorkflowTransition('ACCEPTED_INTERVENTION')}
                          disabled={isTransitioning}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                        >
                          Customer Confirms Acceptance
                        </button>
                      )}

                      {caseDetail.case.workflow_stage === 'ACCEPTED_INTERVENTION' && (
                        <button
                          onClick={() => handleWorkflowTransition('COMPLETED')}
                          disabled={isTransitioning}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                        >
                          Confirm Intervention Completed (G2)
                        </button>
                      )}

                      {caseDetail.case.workflow_stage === 'COMPLETED' && (
                        <button
                          onClick={() => handleWorkflowTransition('VERIFIED_REACTIVATION')}
                          disabled={isTransitioning}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                        >
                          Verify Core Banking Status: Reactivated (G3)
                        </button>
                      )}

                      {caseDetail.case.workflow_stage === 'VERIFIED_REACTIVATION' && (
                        <button
                          onClick={() => handleWorkflowTransition('SUSTAINED_USAGE')}
                          disabled={isTransitioning}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-xs shadow-sm transition-colors"
                        >
                          Verify 90-Day Sustained Voluntary Use (G4)
                        </button>
                      )}

                      {/* Exceptions and Fallbacks */}
                      {caseDetail.case.workflow_stage !== 'UNRESOLVED_BARRIERS' && caseDetail.case.workflow_stage !== 'OPTED_OUT' && caseDetail.case.workflow_stage !== 'SUSTAINED_USAGE' && (
                        <button
                          onClick={() => handleWorkflowTransition('UNRESOLVED_BARRIERS')}
                          disabled={isTransitioning}
                          className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white rounded text-xs font-semibold transition-colors"
                        >
                          Flag Unresolved Barriers / Dispute (G5)
                        </button>
                      )}

                      {caseDetail.case.workflow_stage !== 'OPTED_OUT' && (
                        <button
                          onClick={() => handleWorkflowTransition('OPTED_OUT')}
                          disabled={isTransitioning}
                          className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Customer Opt-Out (Rule R1)
                        </button>
                      )}

                      {/* Invalid jump demonstration button to demonstrate rejection */}
                      {caseDetail.case.workflow_stage === 'ASSESSMENT' && (
                        <button
                          onClick={() => handleWorkflowTransition('SUSTAINED_USAGE')}
                          disabled={isTransitioning}
                          title="Attempt invalid jump to verify 422 procedural rejection"
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded text-[10px] font-mono border border-slate-700"
                        >
                          [Test Invalid Jump → 422]
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Diagnosed Barrier & Evidence */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Diagnosed Barrier & Evidence</h4>
                  <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Primary Category:</span>
                      <span className="font-bold text-slate-900">
                        {caseDetail.assessment?.barrier_primary.replace(/_/g, ' ') || 'UNASSESSED'}
                      </span>
                    </div>
                    {caseDetail.assessment?.barrier_secondary && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Specific Blocker:</span>
                        <span className="text-slate-800 font-mono">
                          {caseDetail.assessment.barrier_secondary.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Evidence Source:</span>
                      <span className="font-semibold text-slate-800">
                        {caseDetail.assessment?.evidence_source.replace(/_/g, ' ') || 'UNKNOWN'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Customer Confirmed:</span>
                      <span className={caseDetail.assessment?.customer_confirmed ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                        {caseDetail.assessment?.customer_confirmed ? 'YES (Customer Stated)' : 'NO (Telemetry Flag Only)'}
                      </span>
                    </div>
                    {caseDetail.assessment?.notes && (
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 italic">
                        "{caseDetail.assessment.notes}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: Explainable Rule Card */}
                {caseDetail.rule_evaluation && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Transparent Rule Engine Output</h4>
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded font-mono font-bold bg-emerald-700 text-white text-xs">
                          {caseDetail.rule_evaluation.rule_id} — {caseDetail.rule_evaluation.intervention_type}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-800">
                          Assigned: {caseDetail.rule_evaluation.assigned_channel}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px]">Triggering Evidence:</span>
                        <p className="text-slate-800 font-medium">{caseDetail.rule_evaluation.triggering_evidence}</p>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px]">Reason for Recommendation:</span>
                        <p className="text-slate-800">{caseDetail.rule_evaluation.reason}</p>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px]">Required Verification:</span>
                        <p className="text-slate-700 italic">{caseDetail.rule_evaluation.required_verification}</p>
                      </div>

                      <div className="bg-white/80 p-2.5 rounded border border-emerald-200">
                        <span className="text-slate-500 block text-[11px] font-bold text-emerald-900">Suggested Next Step:</span>
                        <p className="text-emerald-950 font-medium">{caseDetail.rule_evaluation.suggested_next_step}</p>
                      </div>

                      <div className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded border border-amber-200">
                        <strong>Guardrail Limitation:</strong> {caseDetail.rule_evaluation.limitations}
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 4: Service Directory Point Check */}
                {caseDetail.service_point && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Assigned Resolution Touchpoint</h4>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{caseDetail.service_point.location_label}</span>
                        {caseDetail.service_point.authorised_status ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                            AUTHORISED POINT
                          </span>
                        ) : (
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">
                            UNAUTHORISED / BLOCKED
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600">{caseDetail.service_point.institution} ({caseDetail.service_point.service_type})</p>
                      <p className="text-slate-500 text-[11px]">Last Audited: {caseDetail.service_point.last_verified_at.slice(0, 10)}</p>
                      <p className="text-slate-500 text-[11px] font-mono">{caseDetail.service_point.contact_route}</p>
                    </div>
                  </div>
                )}

                {/* Section 5: Interactive Customer Decision Simulator */}
                <div className="space-y-2 bg-slate-900 text-white p-4 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Simulate Customer Agency & Decision Workflow
                  </h4>
                  <p className="text-xs text-slate-300">
                    Record customer response. Refusal or opt-out immediately suppresses outreach under Rule R1.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => handleDecision('ACCEPTED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-sm"
                    >
                      Customer Accepts Intervention
                    </button>

                    <button
                      onClick={() => handleDecision('REQUESTED_NO_ACTION')}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-semibold"
                    >
                      Prefers No Action (Rule R5)
                    </button>

                    <button
                      onClick={() => handleDecision('OPTED_OUT')}
                      className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded text-xs font-semibold flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Customer Opts Out (Rule R1)
                    </button>
                  </div>

                  {/* Outcome updates */}
                  <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                    <span className="text-slate-400 block font-semibold">Simulate Outcome Reassessment:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOutcomeUpdate({
                          barrier_resolved_self_reported: true,
                          barrier_resolved_verified: true,
                          account_status_after: 'REACTIVATED_OPERATIONAL',
                          meaningful_use_status: 'VERIFIED_VOLUNTARY_USE'
                        })}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-left border border-slate-700"
                      >
                        <span className="font-bold text-emerald-400 block">Verified Success</span>
                        <span className="text-[10px] text-slate-400">Barrier resolved + Voluntary use</span>
                      </button>

                      <button
                        onClick={() => handleOutcomeUpdate({
                          barrier_resolved_self_reported: true,
                          barrier_resolved_verified: true,
                          account_status_after: 'REACTIVATED_OPERATIONAL',
                          meaningful_use_status: 'NO_FURTHER_USE_WANTED'
                        })}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-left border border-slate-700"
                      >
                        <span className="font-bold text-amber-400 block">Reactivated Only (R8)</span>
                        <span className="text-[10px] text-slate-400">Reactivated but no use wanted</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section 6: Audit History */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Immutable Case Audit Trail</h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {caseDetail.audit_history.map((evt) => (
                      <div key={evt.event_id} className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] font-mono">
                        <div className="flex justify-between text-slate-500">
                          <span className="font-semibold text-slate-800">{evt.action}</span>
                          <span>{evt.timestamp.slice(0, 19).replace('T', ' ')}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{evt.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveCaseId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
