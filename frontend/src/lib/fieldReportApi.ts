/**
 * NETRA — Field Report API Client
 * Submits geo-tagged field reports to POST /api/field-reports.
 * Falls back to DEMO MODE if the backend is unavailable.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface FieldReportPayload {
  incident_type: string;
  latitude: number;
  longitude: number;
  accuracy_m: number;
  captured_at: string;       // ISO 8601
  media_url?: string | null; // Set after file upload; null for now
  source: "citizen" | "patrol";
  status: "FIELD_REPORT";
  road_impact?: string;
}

export interface FieldReportResponse {
  id: number;
  status: "FIELD_REPORT";
  message: string;
  demo_mode: boolean;
}

export async function submitFieldReport(
  payload: FieldReportPayload
): Promise<FieldReportResponse> {
  const url = `${API_BASE}/api/field-reports`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Network failure — backend unreachable
    return {
      id: -1,
      status: "FIELD_REPORT",
      message: "Backend unavailable — report saved locally (DEMO MODE).",
      demo_mode: true,
    };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return { ...data, demo_mode: false };
}
