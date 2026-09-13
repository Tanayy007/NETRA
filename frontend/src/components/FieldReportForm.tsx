"use client";

/**
 * NETRA — Geo-Tagged Field Report Form
 *
 * Implements the complete reporting workflow:
 *   Step 1: Photo / Video capture
 *   Step 2: Device GPS acquisition
 *   Step 3: Incident type + road impact selection
 *   Step 4: Review & Submit
 *
 * Uses real browser APIs:
 *   - navigator.geolocation (device GPS)
 *   - <input type="file" capture="environment"> (camera)
 *   - IndexedDB (offline queue)
 *   - navigator.onLine / online/offline events (network detection)
 *
 * Design: ONLY functionality is wired here.
 *         All classes match the existing NETRA dark theme.
 *         No new visual language is introduced.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  saveReportLocally,
  getPendingReports,
  markReportSynced,
  markReportFailed,
  type LocalFieldReport,
} from "@/lib/fieldReportDB";
import { submitFieldReport, type FieldReportPayload } from "@/lib/fieldReportApi";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = "capture" | "location" | "type" | "review" | "done";

interface GpsData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

type SyncState = "idle" | "saving" | "waiting" | "syncing" | "synced" | "failed" | "demo";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCoord(val: number, axis: "lat" | "lng"): string {
  const dir = axis === "lat" ? (val >= 0 ? "N" : "S") : val >= 0 ? "E" : "W";
  return `${Math.abs(val).toFixed(4)}° ${dir}`;
}

function formatTs(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

const INCIDENT_TYPES = [
  "Active Debris Runout / Highway Blocked",
  "Tension Cracks on Road Surface (>5cm)",
  "Rockfall Impact on Shoulder",
  "High Turbidity / Muddy River Flow",
  "Retaining Wall Cracking",
  "Landslide",
  "Other",
];

const ROAD_IMPACTS = ["Partial Lane", "Total Block", "Culvert Threat", "No Impact"];

// ─── Component ───────────────────────────────────────────────────────────────

interface FieldReportFormProps {
  /** Called with the submitted report data so the parent map can add a marker */
  onReportSubmitted?: (report: {
    incident_type: string;
    latitude: number;
    longitude: number;
    accuracy_m: number;
    captured_at: string;
    demo_mode: boolean;
  }) => void;
}

export default function FieldReportForm({ onReportSubmitted }: FieldReportFormProps) {
  // ── Wizard state ──────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("capture");

  // ── Media ─────────────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // ── GPS ───────────────────────────────────────────────────────────────────
  const [gps, setGps] = useState<GpsData | null>(null);
  const [gpsState, setGpsState] = useState<"idle" | "requesting" | "ok" | "denied" | "timeout" | "low_accuracy">("idle");
  const [gpsError, setGpsError] = useState<string | null>(null);

  // ── Form fields ───────────────────────────────────────────────────────────
  const [incidentType, setIncidentType] = useState(INCIDENT_TYPES[0]);
  const [roadImpact, setRoadImpact] = useState(ROAD_IMPACTS[0]);
  const [capturedAt] = useState(() => new Date().toISOString());

  // ── Network & sync ────────────────────────────────────────────────────────
  const [isOnline, setIsOnline] = useState(true);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [pendingCount, setPendingCount] = useState(0);
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // ── Network listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingReports();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ── Refresh pending count ─────────────────────────────────────────────────
  const refreshPendingCount = useCallback(async () => {
    try {
      const pending = await getPendingReports();
      setPendingCount(pending.length);
    } catch {
      // IndexedDB may not be available in SSR
    }
  }, []);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  // ── Sync pending reports when online ─────────────────────────────────────
  const syncPendingReports = useCallback(async () => {
    try {
      const pending = await getPendingReports();
      if (pending.length === 0) return;

      setSyncState("syncing");

      for (const report of pending) {
        if (!report.localId || report.latitude == null || report.longitude == null) {
          continue;
        }
        const payload: FieldReportPayload = {
          incident_type: report.incident_type,
          latitude: report.latitude,
          longitude: report.longitude,
          accuracy_m: report.accuracy_m ?? 999,
          captured_at: report.captured_at,
          media_url: report.media_url ?? null,
          source: report.source,
          status: "FIELD_REPORT",
          road_impact: report.road_impact,
        };
        try {
          await submitFieldReport(payload);
          await markReportSynced(report.localId);
        } catch {
          await markReportFailed(report.localId);
        }
      }

      setSyncState("synced");
      await refreshPendingCount();
      setTimeout(() => setSyncState("idle"), 3000);
    } catch {
      setSyncState("failed");
    }
  }, [refreshPendingCount]);

  // ── GPS acquisition ───────────────────────────────────────────────────────
  const requestGps = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsState("denied");
      setGpsError("Geolocation is not supported by this browser.");
      return;
    }

    setGpsState("requesting");
    setGpsError(null);
    setGps(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const data: GpsData = {
          latitude,
          longitude,
          accuracy,
          timestamp: pos.timestamp,
        };
        setGps(data);

        if (accuracy > 50) {
          setGpsState("low_accuracy");
          setGpsError(`Location accuracy is low (${Math.round(accuracy)} m). Move to an open area or retry.`);
        } else {
          setGpsState("ok");
          setGpsError(null);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsState("denied");
          setGpsError("Location permission denied. Please enable device location to submit a geo-tagged field report.");
        } else if (err.code === err.TIMEOUT) {
          setGpsState("timeout");
          setGpsError("GPS timed out. Please retry in an open area.");
        } else {
          setGpsState("timeout");
          setGpsError("Could not determine location. Please retry.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // ── Media handlers ────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setMediaError("Only image or video files are accepted.");
      return;
    }

    setMediaFile(file);

    // Revoke previous URL
    if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
    setMediaPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
    setMediaPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
    };
  }, [mediaPreviewUrl]);

  // ── Step navigation ───────────────────────────────────────────────────────
  const goToLocation = () => {
    setStep("location");
    // Auto-request GPS when entering location step
    requestGps();
  };

  const goToType = () => setStep("type");
  const goToReview = () => setStep("review");

  // ── Submission ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!gps) return;

    setSyncState("saving");

    const payload: FieldReportPayload = {
      incident_type: incidentType,
      latitude: gps.latitude,
      longitude: gps.longitude,
      accuracy_m: Math.round(gps.accuracy),
      captured_at: capturedAt,
      media_url: null, // Phase 2: upload media blob to object storage first
      source: "citizen",
      status: "FIELD_REPORT",
      road_impact: roadImpact,
    };

    if (!isOnline) {
      // Save offline
      const localReport: Omit<LocalFieldReport, "localId"> = {
        ...payload,
        mediaBlob: mediaFile ?? null,
        sync_status: "PENDING",
      };
      await saveReportLocally(localReport);
      setSyncState("waiting");
      await refreshPendingCount();
      setStep("done");
      return;
    }

    // Online — submit directly
    try {
      const res = await submitFieldReport(payload);

      if (res.demo_mode || res.id === -1) {
        // Backend unreachable — save locally
        const localReport: Omit<LocalFieldReport, "localId"> = {
          ...payload,
          mediaBlob: mediaFile ?? null,
          sync_status: "PENDING",
        };
        await saveReportLocally(localReport);
        setSyncState("demo");
        setIsDemoMode(true);
        await refreshPendingCount();
      } else {
        setSubmittedId(res.id);
        setSyncState("synced");
        setIsDemoMode(false);

        // Notify parent to add map marker
        onReportSubmitted?.({
          incident_type: incidentType,
          latitude: gps.latitude,
          longitude: gps.longitude,
          accuracy_m: Math.round(gps.accuracy),
          captured_at: capturedAt,
          demo_mode: false,
        });
      }

      setStep("done");
    } catch (err) {
      // Save locally on any error
      const localReport: Omit<LocalFieldReport, "localId"> = {
        ...payload,
        mediaBlob: mediaFile ?? null,
        sync_status: "PENDING",
      };
      await saveReportLocally(localReport);
      setSyncState("waiting");
      await refreshPendingCount();
      setStep("done");
      console.error("Field report submission error:", err);
    }
  };

  const handleReset = () => {
    setStep("capture");
    setMediaFile(null);
    if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
    setMediaPreviewUrl(null);
    setGps(null);
    setGpsState("idle");
    setGpsError(null);
    setSyncState("idle");
    setSubmittedId(null);
    setIsDemoMode(false);
  };

  // ── Shared class helpers ──────────────────────────────────────────────────
  const btnPrimary =
    "w-full py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-md flex items-center justify-center gap-2 mt-2";
  const btnSecondary =
    "w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors border border-slate-700 flex items-center justify-center gap-2";
  const btnGhost =
    "text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-2";

  // ── Network badge ─────────────────────────────────────────────────────────
  const networkBadge = !isOnline ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-700 text-amber-400">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      OFFLINE MODE
    </span>
  ) : syncState === "syncing" ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/60 border border-sky-700 text-sky-400">
      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
      SYNCING REPORTS
    </span>
  ) : syncState === "synced" ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-700 text-emerald-400">
      ✓ SYNCED
    </span>
  ) : pendingCount > 0 ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-700 text-amber-400">
      {pendingCount} PENDING
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-700 text-emerald-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      GPS READY
    </span>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md bg-[#0b192c] rounded-xl border border-slate-800 p-6 shadow-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-rose-400 text-[20px]">add_a_photo</span>
          <span className="text-sm font-bold text-white">Submit Incident Observation</span>
        </div>
        {networkBadge}
      </div>

      {/* ── Step indicator ── */}
      {step !== "done" && (
        <div className="flex items-center gap-1.5 mb-5">
          {(["capture", "location", "type", "review"] as const).map((s, i) => {
            const labels = ["Capture", "Location", "Type", "Review"];
            const stepIdx = ["capture", "location", "type", "review"].indexOf(step);
            const done = i < stepIdx;
            const active = s === step;
            return (
              <React.Fragment key={s}>
                <div
                  className={`flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                    active
                      ? "bg-sky-950 border border-sky-600 text-sky-300"
                      : done
                      ? "bg-emerald-950/60 border border-emerald-700 text-emerald-400"
                      : "bg-slate-800/60 border border-slate-700 text-slate-500"
                  }`}
                >
                  {done && <span>✓</span>}
                  {labels[i]}
                </div>
                {i < 3 && <span className="text-slate-700 text-[10px]">›</span>}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* STEP 1 — CAPTURE                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {step === "capture" && (
        <div className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Observation Photo / Evidence *
            </label>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {!mediaPreviewUrl ? (
              /* Drop zone */
              <div
                className="border-2 border-dashed border-slate-700 hover:border-sky-600 rounded-lg p-4 text-center cursor-pointer bg-[#080e18] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="material-symbols-outlined text-[28px] text-slate-400">cloud_upload</span>
                <p className="text-xs text-slate-300 mt-1 font-medium">
                  Click to take photo / upload evidence
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Camera (rear) or existing image/video
                </p>
              </div>
            ) : (
              /* Preview */
              <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-[#080e18]">
                {mediaFile?.type.startsWith("video/") ? (
                  <video
                    src={mediaPreviewUrl}
                    controls
                    className="w-full max-h-48 object-contain"
                  />
                ) : (
                  <img
                    src={mediaPreviewUrl}
                    alt="Evidence preview"
                    className="w-full max-h-48 object-contain"
                  />
                )}
                <div className="flex items-center gap-2 p-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 flex-1 truncate">{mediaFile?.name}</span>
                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    ✕ RETAKE
                  </button>
                </div>
              </div>
            )}

            {mediaError && (
              <p className="text-[10px] text-rose-400 mt-1">{mediaError}</p>
            )}
          </div>

          <button
            type="button"
            className={btnPrimary}
            onClick={goToLocation}
            disabled={!mediaFile}
            style={{ opacity: mediaFile ? 1 : 0.5, cursor: mediaFile ? "pointer" : "not-allowed" }}
          >
            <span className="material-symbols-outlined text-[16px]">my_location</span>
            <span>Next: Capture Location</span>
          </button>
          {!mediaFile && (
            <p className="text-[10px] text-slate-500 text-center">
              Photo or video required to proceed.
            </p>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* STEP 2 — LOCATION (Device GPS)                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {step === "location" && (
        <div className="space-y-4 text-xs font-sans">
          <label className="block text-slate-300 font-medium mb-1">
            Location (Device GPS)
          </label>

          {/* GPS status display */}
          {gpsState === "requesting" && (
            <div className="w-full bg-[#080e18] border border-slate-700 rounded-lg p-3 text-slate-400 font-mono text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shrink-0" />
              Acquiring device GPS…
            </div>
          )}

          {(gpsState === "ok" || gpsState === "low_accuracy") && gps && (
            <div
              className={`w-full bg-[#080e18] border rounded-lg p-3 font-mono text-xs ${
                gpsState === "low_accuracy"
                  ? "border-amber-600"
                  : "border-emerald-600"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Device GPS</span>
                {gpsState === "ok" ? (
                  <span className="text-emerald-400 font-semibold">● ACQUIRED</span>
                ) : (
                  <span className="text-amber-400 font-semibold">⚠ LOW ACCURACY</span>
                )}
              </div>
              <div className="text-slate-200">
                {formatCoord(gps.latitude, "lat")}
              </div>
              <div className="text-slate-200">
                {formatCoord(gps.longitude, "lng")}
              </div>
              <div
                className={`mt-1 ${
                  gpsState === "low_accuracy" ? "text-amber-400" : "text-slate-400"
                }`}
              >
                Accuracy: {Math.round(gps.accuracy)} m
              </div>
            </div>
          )}

          {(gpsState === "denied" || gpsState === "timeout") && (
            <div className="w-full bg-[#080e18] border border-rose-800 rounded-lg p-3 text-xs">
              <p className="text-rose-400 font-semibold mb-1">Location unavailable</p>
              <p className="text-slate-400">
                {gpsError ?? "Please enable device location to submit a geo-tagged field report."}
              </p>
            </div>
          )}

          {/* Error message */}
          {gpsError && gpsState === "low_accuracy" && (
            <p className="text-amber-400 text-[10px]">{gpsError}</p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {(gpsState === "denied" || gpsState === "timeout" || gpsState === "low_accuracy" || gpsState === "idle") && (
              <button type="button" className={btnSecondary} onClick={requestGps}>
                <span className="material-symbols-outlined text-[16px] text-sky-400">refresh</span>
                TRY AGAIN
              </button>
            )}

            {(gpsState === "ok" || gpsState === "low_accuracy") && gps && (
              <button type="button" className={btnPrimary} onClick={goToType}>
                <span className="material-symbols-outlined text-[16px]">checklist</span>
                Next: Select Incident Type
              </button>
            )}

            <button type="button" className={btnGhost} onClick={() => setStep("capture")}>
              ← Back to Photo
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* STEP 3 — INCIDENT TYPE                                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {step === "type" && (
        <div className="space-y-4 text-xs font-sans">
          {/* Incident category */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Incident Category *
            </label>
            <select
              className="w-full bg-[#080e18] border border-slate-700 rounded-lg p-2.5 text-slate-200 text-xs focus:border-sky-500 focus:ring-0"
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
            >
              {INCIDENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Road condition impact */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Road Condition Impact
            </label>
            <div className="grid grid-cols-2 gap-2 text-center">
              {ROAD_IMPACTS.map((ri) => (
                <label
                  key={ri}
                  className={`p-2 rounded border cursor-pointer text-xs transition-colors ${
                    roadImpact === ri
                      ? "bg-sky-950 border-sky-500 text-sky-200 font-semibold"
                      : "bg-[#080e18] border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="road_impact"
                    className="hidden"
                    value={ri}
                    checked={roadImpact === ri}
                    onChange={() => setRoadImpact(ri)}
                  />
                  {ri}
                </label>
              ))}
            </div>
          </div>

          <button type="button" className={btnPrimary} onClick={goToReview}>
            <span className="material-symbols-outlined text-[16px]">preview</span>
            Review & Submit
          </button>
          <button type="button" className={btnGhost} onClick={() => setStep("location")}>
            ← Back
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* STEP 4 — REVIEW & SUBMIT                                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {step === "review" && (
        <div className="space-y-3 text-xs font-sans">
          <h3 className="text-sm font-bold text-white mb-2">Review Field Report</h3>

          {/* Photo thumbnail */}
          {mediaPreviewUrl && (
            <div className="rounded-lg overflow-hidden border border-slate-700">
              {mediaFile?.type.startsWith("video/") ? (
                <video src={mediaPreviewUrl} className="w-full max-h-32 object-contain bg-[#080e18]" />
              ) : (
                <img
                  src={mediaPreviewUrl}
                  alt="Captured evidence"
                  className="w-full max-h-32 object-contain bg-[#080e18]"
                />
              )}
            </div>
          )}

          {/* Review grid */}
          <div className="bg-[#080e18] rounded-lg border border-slate-800 divide-y divide-slate-800">
            {/* Location */}
            <div className="p-3">
              <p className="text-slate-500 font-mono uppercase text-[10px] tracking-wider mb-1">Location</p>
              {gps ? (
                <>
                  <p className="text-slate-200 font-mono">
                    {formatCoord(gps.latitude, "lat")}, {formatCoord(gps.longitude, "lng")}
                  </p>
                  <p className="text-slate-400 mt-0.5">
                    Device GPS · Accuracy: {Math.round(gps.accuracy)} m
                  </p>
                </>
              ) : (
                <p className="text-rose-400">No GPS data</p>
              )}
            </div>

            {/* Incident type */}
            <div className="p-3">
              <p className="text-slate-500 font-mono uppercase text-[10px] tracking-wider mb-1">Incident Type</p>
              <p className="text-slate-200">{incidentType}</p>
              <p className="text-slate-400 mt-0.5">Road Impact: {roadImpact}</p>
            </div>

            {/* Timestamp */}
            <div className="p-3">
              <p className="text-slate-500 font-mono uppercase text-[10px] tracking-wider mb-1">Captured</p>
              <p className="text-slate-200 font-mono">{formatTs(capturedAt)}</p>
            </div>

            {/* Status */}
            <div className="p-3">
              <p className="text-slate-500 font-mono uppercase text-[10px] tracking-wider mb-1">Report Status</p>
              <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-950/60 border border-sky-700 text-sky-300">
                FIELD REPORT
              </span>
              <p className="text-slate-500 mt-1 text-[10px]">
                Awaiting authority review. GPS ≠ incident confirmed.
              </p>
            </div>
          </div>

          {/* Offline warning */}
          {!isOnline && (
            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-700/50 text-amber-400 text-[10px] font-mono">
              ⚠ OFFLINE MODE — Report will be saved locally and synced when network is available.
            </div>
          )}

          <button
            type="button"
            className={btnPrimary}
            onClick={handleSubmit}
            disabled={syncState === "saving"}
          >
            {syncState === "saving" ? (
              <span className="animate-pulse">Submitting…</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>SUBMIT FIELD REPORT</span>
              </>
            )}
          </button>
          <button type="button" className={btnGhost} onClick={() => setStep("type")}>
            ← Back
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* STEP 5 — DONE                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {step === "done" && (
        <div className="space-y-4 text-xs font-sans text-center">
          {syncState === "synced" && !isDemoMode && (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-600 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-emerald-400 text-[24px]">check_circle</span>
              </div>
              <p className="text-emerald-400 font-bold text-sm">Report Submitted</p>
              <p className="text-slate-400">
                Your field report has been submitted successfully.
                {submittedId && (
                  <span className="font-mono text-sky-400"> · Report #{submittedId}</span>
                )}
              </p>
              <p className="text-[10px] text-slate-500">
                A blue marker has been added to the operational map.
              </p>
            </>
          )}

          {(syncState === "waiting" || syncState === "demo") && (
            <>
              <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-600 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-amber-400 text-[24px]">cloud_off</span>
              </div>
              <p className="text-amber-400 font-bold text-sm">
                {syncState === "demo" ? "DEMO MODE — Saved Locally" : "Saved Locally — Waiting for Network"}
              </p>
              <p className="text-slate-400">
                {syncState === "demo"
                  ? "Backend is not connected. Your report has been saved locally and is not a real submission."
                  : "No network detected. Your report is queued and will be synced automatically when connectivity returns."}
              </p>
              {pendingCount > 0 && (
                <div className="mt-1 p-2 rounded bg-amber-950/30 border border-amber-800/50">
                  <p className="text-amber-400 font-mono text-[10px]">{pendingCount} REPORT(S) PENDING SYNC</p>
                </div>
              )}
            </>
          )}

          {syncState === "failed" && (
            <>
              <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-600 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-rose-400 text-[24px]">error</span>
              </div>
              <p className="text-rose-400 font-bold text-sm">Submission Failed</p>
              <p className="text-slate-400">
                Report saved locally. It will retry automatically when the network is restored.
              </p>
            </>
          )}

          <span className="text-[10px] text-slate-500 block">
            Submissions are reviewed by highway control room.
          </span>

          <button type="button" className={btnSecondary} onClick={handleReset}>
            <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
            Submit Another Report
          </button>
          
          <a href="/dashboard" className="w-full py-3 rounded-lg bg-sky-900/60 hover:bg-sky-800 text-sky-200 font-semibold text-xs transition-colors shadow-md flex items-center justify-center gap-2 mt-2 border border-sky-700/50">
            <span className="material-symbols-outlined text-[16px]">map</span>
            View on Live Map (Digital Twin)
          </a>
        </div>
      )}
    </div>
  );
}
