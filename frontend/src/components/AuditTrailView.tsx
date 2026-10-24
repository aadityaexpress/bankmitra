import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, RefreshCw, Filter } from 'lucide-react';
import { AuditEvent } from '../types';
import { fetchAuditEvents } from '../api';

export const AuditTrailView: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAudit();
  }, []);

  const loadAudit = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditEvents(100);
      setEvents(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                Compliance & Accountability
              </span>
              <span className="text-xs text-slate-500 font-mono">Immutable Audit Trail • PMLA & DPDP Alignment</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1 tracking-tight">System Audit & Governance Log</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Tracks rule evaluations, customer decisions, outreach suppressions, and outcome recordings under data protection principles.
            </p>
          </div>

          <button
            onClick={loadAudit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Audit Log</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] font-sans">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Actor Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Purpose Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                    Loading audit records...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                events.map((e) => (
                  <tr key={e.event_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-800">{e.event_id}</td>
                    <td className="py-2.5 px-4 text-slate-500">{e.timestamp.slice(0, 19).replace('T', ' ')}</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-800">{e.case_id}</td>
                    <td className="py-2.5 px-4 text-slate-700">{e.actor_role}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        e.action === 'OPT_OUT_ENFORCED' ? 'bg-purple-100 text-purple-800' :
                        e.action === 'BARRIER_ASSESSED' ? 'bg-blue-100 text-blue-800' :
                        e.action === 'OUTCOME_UPDATED' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {e.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 font-sans max-w-xs truncate" title={e.details}>
                      {e.details}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 text-[10px]">{e.purpose_code}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
