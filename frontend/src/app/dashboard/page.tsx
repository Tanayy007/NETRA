"use client";

import { useEffect, useState } from "react";
import Map, { IncidentFeature, FieldReportFeature } from "@/components/Map";
import { AlertTriangle, ShieldCheck, Activity, RefreshCw, Clock, Target } from "lucide-react";

export default function Dashboard() {
  const [incidents, setIncidents] = useState<IncidentFeature[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentFeature | null>(null);
  const [loading, setLoading] = useState(true);
  const [fieldReports, setFieldReports] = useState<FieldReportFeature[]>([]);

  const fetchIncidents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/incidents`);
      const data = await res.json();
      setIncidents(data);
    } catch (err) {
      console.error("Failed to fetch incidents", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFieldReports = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/field-reports`);
      const data = await res.json();
      setFieldReports(data);
    } catch {
      // Backend may not be running yet — fail silently
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchFieldReports();
    const incidentInterval = setInterval(fetchIncidents, 5000);
    const fieldInterval = setInterval(fetchFieldReports, 10000);

    // Listen for live WebSocket NEW_FIELD_REPORT events
    const wsUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
      .replace(/^http/, "ws") + "/ws";
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "NEW_FIELD_REPORT") {
            // Append the new report directly without waiting for the next poll
            setFieldReports((prev) => [
              { ...msg.data, status: "FIELD_REPORT" },
              ...prev,
            ]);
          }
        } catch {
          // Ignore malformed messages
        }
      };
    } catch {
      // WebSocket not available
    }

    return () => {
      clearInterval(incidentInterval);
      clearInterval(fieldInterval);
      ws?.close();
    };
  }, []);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full bg-slate-950 p-4 gap-4 overflow-hidden">
      {/* LEFT PANEL - INCIDENTS */}
      <aside className="w-80 flex flex-col gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" /> Active Incidents
            </h2>
            <div className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">
              {incidents.length}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="text-center text-slate-500 text-sm py-8 flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Loading intelligence...
              </div>
            ) : incidents.length === 0 ? (
              <div className="text-center text-slate-500 text-sm py-8">
                No active incidents reported.
              </div>
            ) : (
              incidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                const isConfirmed = inc.incident_class === "CONFIRMED";
                const priority = inc.priority_p1_p4 ?? "P3";
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`border p-3 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "bg-slate-700 border-blue-500/60 shadow-lg shadow-blue-500/10"
                        : "bg-slate-800/50 hover:bg-slate-800 border-slate-700/50 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${priority === 'P1' ? 'text-red-500' : priority === 'P2' ? 'text-orange-500' : 'text-yellow-500'}`} />
                        {inc.incident_type || "Unknown Incident"}
                      </h3>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                        priority === 'P1' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : priority === 'P2' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>{priority}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1 uppercase ${
                        isConfirmed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {isConfirmed ? <><ShieldCheck className="w-3 h-3" /> CONFIRMED</> : <>⚠ PREDICTED</>}
                      </span>
                      {inc.location_name && (
                        <span className="text-xs text-slate-400 truncate">{inc.location_name}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-900/50 p-2 rounded flex flex-col">
                        <span className="text-slate-500">Confidence</span>
                        <span className="font-mono text-slate-300">{Math.round((inc.confidence ?? 0.5) * 100)}%</span>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded flex flex-col">
                        <span className="text-slate-500">Status</span>
                        <span className="font-semibold text-slate-300">{inc.status || "ACTIVE"}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* CENTER - DIGITAL TWIN */}
      <section className="flex-1 relative rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 flex items-center justify-center">
            <Map
              incidents={incidents}
              infrastructure={[]}
              susceptibilityZones={[]}
              fieldReports={fieldReports}
              onIncidentSelect={(inc) => setSelectedIncident(inc)}
            />
      </section>

      {/* RIGHT PANEL - AI FORECASTING ENGINE */}
      <aside className="w-96 flex flex-col gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-1 flex flex-col relative overflow-hidden">
          {/* Subtle scanning background effect */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(56,189,248,0.03)_50%,transparent_100%)] bg-[length:100%_4px] animate-[scan_3s_linear_infinite] pointer-events-none opacity-50"></div>
          
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-4 pb-4 border-b border-slate-800">
            <Target className="w-4 h-4 text-sky-400" /> AI Forecasting Engine
          </h2>

          {selectedIncident ? (
            <div className="flex-1 overflow-y-auto text-sm text-slate-300 space-y-4 relative z-10">
              {/* Incident Header */}
              <div className={`p-3 rounded-lg border ${
                selectedIncident.incident_class === 'CONFIRMED'
                  ? 'bg-red-950/40 border-red-500/30'
                  : 'bg-amber-950/40 border-amber-500/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      selectedIncident.incident_class === 'CONFIRMED'
                        ? 'bg-red-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}>{selectedIncident.incident_class ?? 'PREDICTED'}</span>
                    <span className="text-xs text-slate-400 font-mono">ID: {selectedIncident.id}</span>
                  </div>
                  <span className="text-[10px] font-mono text-sky-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"></span>
                    LIVE INFERENCE
                  </span>
                </div>
                <h3 className="font-bold text-slate-100">{selectedIncident.incident_type}</h3>
                <p className="text-slate-400 text-xs mt-1 font-mono">COORD: {selectedIncident.location_name || 'LAT/LNG UNKNOWN'}</p>
              </div>

              {/* Prediction Confidence Gauge */}
              <div className="bg-[#0b192c] border border-slate-800/80 rounded-lg p-3">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400 font-mono">Prediction Confidence</span>
                  <span className="font-mono font-bold text-sky-400">{Math.round((selectedIncident.confidence ?? 0.5) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      (selectedIncident.confidence ?? 0) > 0.8 ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                      : (selectedIncident.confidence ?? 0) > 0.5 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                      : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                    }`}
                    style={{ width: `${Math.round((selectedIncident.confidence ?? 0.5) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Prediction Timeline */}
              <div className="bg-[#0b192c] border border-slate-800/80 rounded-lg p-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Impact Forecast Timeline
                </h4>
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                  {/* T-0 */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full border border-white bg-slate-900 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-3 md:ml-0 p-2 bg-slate-800/40 rounded border border-slate-700/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] text-emerald-400 font-bold">T-0 (NOW)</span>
                      </div>
                      <div className="text-[10px] text-slate-300">Initial anomaly detected.</div>
                    </div>
                  </div>
                  {/* T+2 */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full border border-white bg-slate-900 group-[.is-active]:bg-amber-500 text-slate-500 group-[.is-active]:text-amber-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
                    </div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-2 bg-amber-900/20 rounded border border-amber-700/30 ml-3 md:ml-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] text-amber-400 font-bold">T+2 HRS</span>
                      </div>
                      <div className="text-[10px] text-slate-300">Expected structural failure / spread. 85% probability.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brief placeholder */}
              <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-sky-500"></div>
                <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-1">AI Recommendation Model</p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Based on hydro-mechanical terrain analysis and current satellite imagery, this incident requires priority <strong>{selectedIncident.priority_p1_p4}</strong> response. Evacuate <strong>{selectedIncident.affected_population ?? 'the immediate area'}</strong> within the T+2 forecast zone.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 relative z-10">
              <div className="w-16 h-16 rounded-full bg-[#0b192c] border border-slate-700/50 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-2 border-sky-500/20 animate-[spin_4s_linear_infinite]"></div>
                <div className="absolute inset-2 rounded-full border-2 border-slate-600/30 border-t-sky-400 animate-[spin_2s_linear_infinite_reverse]"></div>
                <Target className="w-6 h-6 text-sky-400/80 relative z-10" />
              </div>
              <p className="text-slate-400 text-xs font-mono max-w-[200px]">
                AWAITING TARGET SELECTION FOR AI INFERENCE
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
