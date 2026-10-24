import React from 'react';
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  MapPin, 
  BookOpen, 
  History, 
  RotateCcw,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  reviewCount: number;
  onReseed: () => void;
  reseedLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  reviewCount,
  onReseed,
  reseedLoading
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      {/* Top Evidence & Synthetic Banner */}
      <div className="bg-amber-600 text-amber-50 text-xs px-4 py-1.5 font-medium flex items-center justify-between shadow-inner">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-200 animate-pulse flex-shrink-0" />
          <span>
            <strong>SYNTHETIC DEMONSTRATION DATA</strong> • Fictional records only. Zero real customer PII or live core banking system access.
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-3 text-amber-100 text-[11px]">
          <span>BankMitra Platform | Financial Inclusion Intelligence</span>
          <span className="bg-amber-700/60 px-2 py-0.5 rounded text-white font-mono">21 Oct 2026</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-md font-bold text-xl tracking-tight">
              BM
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">BankMitra</h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-300">
                  MVP v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Inactive Account Re-engagement Engine</p>
            </div>
          </div>

          {/* Action items */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onReseed}
              disabled={reseedLoading}
              title="Reset synthetic data model with 200 fresh cases"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${reseedLoading ? 'animate-spin' : ''}`} />
              <span>{reseedLoading ? 'Reseeding...' : 'Reset Demo Data'}</span>
            </button>
            <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-medium rounded border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Transparent Rules Engine (R1–R8)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-4 border-t border-slate-100 pt-2 pb-1 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`inline-flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Operations Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('macro')}
            className={`inline-flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
              activeTab === 'macro'
                ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Macro Evidence & FINSI</span>
          </button>

          <button
            onClick={() => setActiveTab('accountability')}
            className={`inline-flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
              activeTab === 'accountability'
                ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Governance & Outcomes (G1–G5)</span>
          </button>

          <button
            onClick={() => setActiveTab('cases')}
            className={`inline-flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
              activeTab === 'cases'
                ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Case Management</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`inline-flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
              activeTab === 'review'
                ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Review Queue</span>
            {reviewCount > 0 && (
              <span className={`px-1.5 py-0.2 text-[11px] rounded-full font-bold ${
                activeTab === 'review' ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'
              }`}>
                {reviewCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`inline-flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
              activeTab === 'directory'
                ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Service Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`inline-flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
              activeTab === 'evidence'
                ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Rules & Evidence</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`inline-flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
              activeTab === 'audit'
                ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
