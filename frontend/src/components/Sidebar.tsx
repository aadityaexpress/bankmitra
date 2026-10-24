import React from 'react';
import { 
  LayoutDashboard, 
  Globe, 
  GitPullRequest, 
  TrendingUp, 
  BookOpen, 
  ShieldCheck, 
  RotateCcw,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Server
} from 'lucide-react';

export type ActiveModule = 
  | 'overview' 
  | 'regional-intelligence' 
  | 'interventions' 
  | 'outcomes' 
  | 'methodology' 
  | 'audit';

interface SidebarProps {
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  reviewCount: number;
  onReseed: () => void;
  reseedLoading: boolean;
  activeRole: string;
  setActiveRole: (role: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  reviewCount,
  onReseed,
  reseedLoading,
  activeRole,
  setActiveRole
}) => {
  const navItems = [
    {
      id: 'overview' as ActiveModule,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'regional-intelligence' as ActiveModule,
      label: 'Regional Intelligence',
      icon: Globe,
      badge: null
    },
    {
      id: 'interventions' as ActiveModule,
      label: 'Intervention Management',
      icon: GitPullRequest,
      badge: reviewCount > 0 ? `${reviewCount}` : null
    },
    {
      id: 'outcomes' as ActiveModule,
      label: 'Outcome Monitoring',
      icon: TrendingUp,
      badge: null
    },
    {
      id: 'methodology' as ActiveModule,
      label: 'Evidence & Methodology',
      icon: BookOpen,
      badge: null
    },
    {
      id: 'audit' as ActiveModule,
      label: 'Audit & Governance',
      icon: ShieldCheck,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 select-none z-20">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveModule('overview')}>
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-xs tracking-tight">
              BM
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-sm">BankMitra</span>
                <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-slate-100 text-slate-600 rounded">
                  v3.2
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                Financial Inclusion Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Platform Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Institutional Context & Operational Roles */}
      <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
        {/* Role Selector */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Simulated Role (RBAC)
          </label>
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value)}
            className="w-full text-xs font-mono font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="BRANCH_OFFICER">Branch Officer</option>
            <option value="BC_AGENT">Banking Correspondent</option>
            <option value="COMPLIANCE_AUDITOR">Compliance Auditor</option>
            <option value="POLICY_LEAD">Policy Lead</option>
          </select>
        </div>

        {/* Data Air-Gap Badge */}
        <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-600 font-medium">
            <span className="flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              Environment
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 font-mono">
              SANDBOX
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Operational records are synthetic; macro indicators are sovereign.
          </p>
        </div>

        {/* Reseed action */}
        <button
          onClick={onReseed}
          disabled={reseedLoading}
          className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${reseedLoading ? 'animate-spin' : ''}`} />
          <span>{reseedLoading ? 'Resetting...' : 'Reset Sandbox Data'}</span>
        </button>
      </div>
    </aside>
  );
};
