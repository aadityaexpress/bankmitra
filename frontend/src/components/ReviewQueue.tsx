import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, ArrowRight, CheckCircle, Ban, Clock, MapPin, Eye } from 'lucide-react';
import { ReviewQueueItem } from '../types';
import { fetchReviewQueue } from '../api';

interface ReviewQueueProps {
  onSelectCase: (caseId: string) => void;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({ onSelectCase }) => {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await fetchReviewQueue();
      setItems(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                Safety & Quality Queue
              </span>
              <span className="text-xs text-slate-500 font-medium">Deterministic Rule Holds</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Human Review & Exception Queue</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Cases where automated outbound contact is blocked due to unconfirmed system signals, stale service touchpoints, or active unresolved grievances.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg text-xs">
            <span className="text-amber-800 font-semibold block">Total Cases Held for Review</span>
            <span className="text-2xl font-bold font-mono text-amber-900">{items.length} Cases</span>
          </div>
        </div>
      </div>

      {/* Queue items */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center bg-white rounded-xl border border-slate-200">
            <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500 font-medium">Scanning review triggers across database...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">Review Queue Empty</h3>
            <p className="text-xs text-slate-500 mt-1">No cases currently require human triage or exception override.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.case_id}
              className="bg-white border border-slate-200 hover:border-amber-300 rounded-xl p-4 shadow-sm transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{item.case_id}</span>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.customer_token}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Inactivity: {item.inactivity_band.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      Rule {item.rule_id}
                    </span>
                  </div>

                  {/* Why it is in the queue */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.queue_reasons.map((r, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                        <span>{r}</span>
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                    <strong>Trigger Context:</strong> {item.explanation_note}
                  </p>

                  {item.service_id && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Associated Service Point: {item.location_label} ({item.service_id})</span>
                      {item.authorised_status === 0 && (
                        <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded">
                          Unauthorised / Inactive
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <button
                    onClick={() => onSelectCase(item.case_id)}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg border border-amber-300 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Triage & Resolve</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
