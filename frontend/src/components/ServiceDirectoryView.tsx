import React, { useState, useEffect } from 'react';
import { MapPin, ShieldCheck, AlertTriangle, Building, Phone, Clock, ExternalLink } from 'lucide-react';
import { ServicePoint } from '../types';
import { fetchServiceDirectory } from '../api';

export const ServiceDirectoryView: React.FC = () => {
  const [services, setServices] = useState<ServicePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDirectory();
  }, []);

  const loadDirectory = async () => {
    setLoading(true);
    try {
      const data = await fetchServiceDirectory();
      setServices(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                Service Directory & Verification
              </span>
              <span className="text-xs text-slate-500 font-medium">90-Day Freshness Guardrail</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Authorised Resolution Touchpoints</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Under <strong>Rule R3</strong>, BankMitra strictly refuses to route customers to unverified or stale service points, preventing wasted travel and erosion of institutional trust.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-xs font-mono">
            <span className="text-slate-500 block">Total Cataloged Points</span>
            <span className="text-2xl font-bold text-slate-800">{services.length} Points</span>
          </div>
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-20 text-center bg-white rounded-xl border border-slate-200">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500 font-medium">Auditing service directory freshness...</p>
          </div>
        ) : (
          services.map((s) => {
            const isFresh = s.fresh_status === 'ACTIVE_VERIFIED';
            return (
              <div
                key={s.service_id}
                className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between transition-all ${
                  isFresh ? 'border-slate-200 hover:border-emerald-300' : 'border-amber-300 bg-amber-50/20'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {s.service_id}
                    </span>
                    {isFresh ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active & Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Stale or Blocked</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{s.location_label}</h3>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">{s.institution}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {s.service_type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center gap-1 text-slate-600 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Last Audited: <strong className="text-slate-800">{s.last_verified_at.slice(0, 10)}</strong></span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Audit Source: <span className="font-mono text-slate-700">{s.verification_source}</span>
                    </div>
                    {s.freshness_notes && (
                      <p className="text-[11px] text-slate-600 italic pt-0.5">{s.freshness_notes}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px] truncate max-w-[200px]" title={s.contact_route}>
                    {s.contact_route}
                  </span>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-mono">
                    Synthetic Sim
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
