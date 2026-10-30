import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveModule } from './components/Sidebar';
import { OperationsDashboard } from './components/OperationsDashboard';
import { CaseManagement } from './components/CaseManagement';
import { EvidenceRulesView } from './components/EvidenceRulesView';
import { AuditTrailView } from './components/AuditTrailView';
import { MacroEvidenceView } from './components/MacroEvidenceView';
import { GovernanceAccountabilityView } from './components/GovernanceAccountabilityView';
import { DashboardMetrics } from './types';
import { fetchMetrics, fetchReviewQueue, seedDatabase } from './api';
import { ShieldCheck, UserCheck, Bell, Database, Lock } from 'lucide-react';

export function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('overview');
  const [activeRole, setActiveRole] = useState('BRANCH_OFFICER');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [reseedLoading, setReseedLoading] = useState(false);
  const [selectedBarrierFilter, setSelectedBarrierFilter] = useState('ALL');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const [m, rq] = await Promise.all([
        fetchMetrics(),
        fetchReviewQueue()
      ]);
      setMetrics(m);
      setReviewCount(rq.count);
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
      setMetricsError(err?.message || 'Unable to load platform intelligence metrics.');
    } finally {
      setMetricsLoading(false);
    }
  };

  const handleReseed = async () => {
    if (!window.confirm('Reset the demonstration database and reseed 200 synthetic evaluation cases?')) {
      return;
    }
    setReseedLoading(true);
    try {
      await seedDatabase();
      await loadAllData();
      alert('Demonstration database re-seeded successfully with 200 synthetic cases.');
    } catch (err) {
      alert('Failed to reseed database: ' + String(err));
    } finally {
      setReseedLoading(false);
    }
  };

  const handleNavigateFromOverview = (module: 'regional-intelligence' | 'interventions' | 'outcomes' | 'methodology') => {
    setActiveModule(module);
  };

  const handleFilterBarrier = (barrier: string) => {
    setSelectedBarrierFilter(barrier);
    setActiveModule('interventions');
  };

  const getModuleTitle = (mod: ActiveModule) => {
    switch (mod) {
      case 'overview':
        return {
          title: 'Executive Overview',
          subtitle: 'Institutional metrics, inclusion pipeline health, and operational safeguards'
        };
      case 'regional-intelligence':
        return {
          title: 'Regional Intelligence & Needs Prioritization',
          subtitle: 'Macro evidence explorer, provisional FINSI index rankings, and sensitivity analysis'
        };
      case 'interventions':
        return {
          title: 'Intervention Management',
          subtitle: 'Individual barrier assessment, human compliance review, and accredited touchpoint directory'
        };
      case 'outcomes':
        return {
          title: 'Outcome Monitoring & Accountability',
          subtitle: 'Dual-rate reactivation tracking, sustained 90-day meaningful use, and attrition modeling'
        };
      case 'methodology':
        return {
          title: 'Evidence & Methodology',
          subtitle: 'Statutory citations (RBI/DFS), deterministic rules engine (R1–R8), and claims boundaries'
        };
      case 'audit':
        return {
          title: 'Audit Trail & Compliance',
          subtitle: 'Immutable event logs, role-based action tracking, and purpose-limited data governance'
        };
    }
  };

  const currentInfo = getModuleTitle(activeModule);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Primary Left Navigation Sidebar */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        reviewCount={reviewCount}
        onReseed={handleReseed}
        reseedLoading={reseedLoading}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 sticky top-0 z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  {currentInfo.title}
                </h1>
                <span className="text-slate-300">/</span>
                <span className="text-xs text-slate-500 font-medium">BankMitra Platform</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentInfo.subtitle}
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              {/* Synthetic Environment Pill */}
              <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md border border-amber-200 font-mono text-[11px]">
                <Database className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-semibold">SANDBOX FIXTURES</span>
              </div>

              {/* Active RBAC Persona Pill */}
              <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200 font-mono text-[11px]">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>ROLE: <strong className="text-slate-900">{activeRole}</strong></span>
              </div>

              {/* Compliance Status */}
              <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200 text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>R1–R8 Active</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Module Content View */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeModule === 'overview' && (
            <OperationsDashboard
              metrics={metrics}
              loading={metricsLoading}
              error={metricsError}
              onRetry={loadAllData}
              onNavigateToModule={handleNavigateFromOverview}
              onFilterBarrier={handleFilterBarrier}
            />
          )}

          {activeModule === 'regional-intelligence' && (
            <MacroEvidenceView />
          )}

          {activeModule === 'interventions' && (
            <CaseManagement
              initialBarrier={selectedBarrierFilter}
              onRefreshMetrics={loadAllData}
              activeRole={activeRole}
            />
          )}

          {activeModule === 'outcomes' && (
            <GovernanceAccountabilityView />
          )}

          {activeModule === 'methodology' && (
            <EvidenceRulesView />
          )}

          {activeModule === 'audit' && (
            <AuditTrailView />
          )}
        </main>

        {/* Enterprise Governance Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 text-slate-600">
              <span className="font-bold text-slate-900 tracking-tight">BankMitra</span>
              <span className="text-slate-300">•</span>
              <span>Financial Inclusion Intelligence & Governance Platform</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-slate-400">Research & Operational Framework</span>
            </div>
            <div className="flex items-center space-x-4 text-[11px] text-slate-500 font-mono">
              <span className="flex items-center space-x-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>DPDP Act 2023 Purpose Limitation</span>
              </span>
              <span className="text-slate-300">•</span>
              <span>RBI Inoperative Accounts 2024 Alignment</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
