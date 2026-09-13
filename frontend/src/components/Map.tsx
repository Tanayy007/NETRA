"use client";

import React, { useRef, useEffect } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, LngLatLike, MapMouseEvent, MapGeoJSONFeature } from "maplibre-gl";

// ─────────────────────────────────────────────────────────────────
// Constants — no hardcoded tokens, no Mapbox dependency
// ─────────────────────────────────────────────────────────────────
const BASE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: [
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm-tiles-layer",
      type: "raster",
      source: "osm-tiles",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
  glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
};

/** Geographic center of Pune District (where our demo incidents are) */
const PUNE_CENTER: LngLatLike = [73.8567, 18.5204];
const DEFAULT_ZOOM = 10;
const MIN_ZOOM = 4;
const MAX_ZOOM = 18;

// Susceptibility zone fill colours (LOW → VERY HIGH)
const SUSCEPTIBILITY_COLOR_MAP: Record<string, string> = {
  LOW: "#22c55e",       // green-500
  MODERATE: "#eab308",  // yellow-500
  HIGH: "#f97316",      // orange-500
  "VERY HIGH": "#ef4444", // red-500
};

// Layer/source IDs — centralised so 3D CesiumJS module can reference them
export const LAYER_IDS = {
  SUSCEPTIBILITY_FILL: "susceptibility-fill",
  SUSCEPTIBILITY_OUTLINE: "susceptibility-outline",
  SUSCEPTIBILITY_LABELS: "susceptibility-labels",
  ROAD_LINE: "roads-line",
  HOSPITAL_ICON: "hospitals-icon",
  HOSPITAL_CIRCLE: "hospitals-circle",
  INCIDENT_PREDICTED_CIRCLE: "incidents-predicted-circle",
  INCIDENT_PREDICTED_BORDER: "incidents-predicted-border",
  INCIDENT_CONFIRMED_CIRCLE: "incidents-confirmed-circle",
  INCIDENT_CONFIRMED_PULSE: "incidents-confirmed-pulse",
  FIELD_REPORT_CIRCLE: "field-reports-circle",
  FIELD_REPORT_PULSE: "field-reports-pulse",
  AI_FORECAST_FILL: "ai-forecast-fill",
  AI_FORECAST_OUTLINE: "ai-forecast-outline",
} as const;

export const SOURCE_IDS = {
  SUSCEPTIBILITY: "source-susceptibility",
  ROADS: "source-roads",
  HOSPITALS: "source-hospitals",
  INCIDENTS: "source-incidents",
  FIELD_REPORTS: "source-field-reports",
  AI_FORECAST: "source-ai-forecast",
} as const;

// ─────────────────────────────────────────────────────────────────
// Public Types — backend GeoJSON contract
// ─────────────────────────────────────────────────────────────────
export interface IncidentFeature {
  id: number;
  incident_type?: string;
  severity?: string;
  priority_p1_p4?: string;
  confidence?: number;
  status?: string;
  /** 'PREDICTED' = unverified cluster | 'CONFIRMED' = DDMA / SACHET confirmed */
  incident_class?: "PREDICTED" | "CONFIRMED";
  /** GeoJSON string from backend, e.g. '{"type":"Point","coordinates":[...]}' */
  geometry?: string;
  location_name?: string;
  affected_population?: number;
}

export interface InfrastructureFeature {
  id: number;
  infra_type?: string; // "road" | "hospital" | "shelter" | "fire_station"
  status?: string;     // "open" | "damaged" | "closed"
  geometry?: string;   // GeoJSON string
  name?: string;
}

export interface SusceptibilityZone {
  type: "Feature";
  properties: {
    level: "LOW" | "MODERATE" | "HIGH" | "VERY HIGH";
    name?: string;
    area_km2?: number;
  };
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

/** Geo-tagged field report from citizen / patrol device */
export interface FieldReportFeature {
  id: number;
  incident_type?: string;
  latitude?: number;
  longitude?: number;
  accuracy_m?: number;
  captured_at?: string;
  media_url?: string | null;
  road_impact?: string;
  source?: string;
  status?: string;
}

interface MapProps {
  incidents: IncidentFeature[];
  infrastructure: InfrastructureFeature[];
  susceptibilityZones?: SusceptibilityZone[];
  fieldReports?: FieldReportFeature[];
  onIncidentSelect?: (incident: IncidentFeature) => void;
}

// ─────────────────────────────────────────────────────────────────
// Helper — parse geometry string or object safely
// ─────────────────────────────────────────────────────────────────
function parseGeometry(raw?: string): GeoJSON.Geometry | null {
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────
// Helper — convert flat incident array → GeoJSON FeatureCollection
// ─────────────────────────────────────────────────────────────────
function incidentsToGeoJSON(
  incidents: IncidentFeature[]
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  for (const inc of incidents) {
    const geom = parseGeometry(inc.geometry);
    if (!geom || geom.type !== "Point") continue;
    features.push({
      type: "Feature",
      id: inc.id,
      properties: {
        id: inc.id,
        incident_type: inc.incident_type ?? "Unknown",
        severity: inc.severity ?? "UNKNOWN",
        priority: inc.priority_p1_p4 ?? "P3",
        confidence: (inc.confidence ?? 0.5) * 100,
        status: inc.status ?? "ACTIVE",
        incident_class: inc.incident_class ?? "PREDICTED",
        location_name: inc.location_name ?? "",
        affected_population: inc.affected_population ?? 0,
      },
      geometry: geom,
    });
  }
  return { type: "FeatureCollection", features };
}

// ─────────────────────────────────────────────────────────────────
// Helper — split infrastructure by type into GeoJSON collections
// ─────────────────────────────────────────────────────────────────
function infraToGeoJSON(
  infra: InfrastructureFeature[],
  types: string[]
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  for (const item of infra) {
    if (!types.includes(item.infra_type ?? "")) continue;
    const geom = parseGeometry(item.geometry);
    if (!geom) continue;
    features.push({
      type: "Feature",
      id: item.id,
      properties: {
        id: item.id,
        infra_type: item.infra_type,
        status: item.status ?? "open",
        name: item.name ?? item.infra_type,
      },
      geometry: geom,
    });
  }
  return { type: "FeatureCollection", features };
}

// ─────────────────────────────────────────────────────────────────
// Popup content builders
// ─────────────────────────────────────────────────────────────────
function buildIncidentPopup(props: Record<string, unknown>): string {
  const isConfirmed = props.incident_class === "CONFIRMED";
  const badge = isConfirmed
    ? `<span style="background:#16a34a;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:0.05em">✔ CONFIRMED</span>`
    : `<span style="background:#d97706;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:0.05em">⚠ PREDICTED</span>`;
  return `
    <div style="font-family:system-ui,sans-serif;min-width:200px;padding:4px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        ${badge}
        <span style="font-size:11px;font-weight:700;color:#374151">${props.priority ?? "P3"}</span>
      </div>
      <h3 style="margin:0 0 4px;font-size:14px;font-weight:700;color:#111827">${props.incident_type ?? "Incident"}</h3>
      <p style="margin:0 0 2px;font-size:12px;color:#6b7280">📍 ${props.location_name || "Location unknown"}</p>
      <p style="margin:0 0 2px;font-size:12px;color:#6b7280">👥 Affected: <strong>${props.affected_population ?? "N/A"}</strong></p>
      <div style="margin-top:8px;background:#f3f4f6;border-radius:6px;padding:6px">
        <div style="font-size:11px;color:#6b7280;margin-bottom:2px">Confidence</div>
        <div style="height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${props.confidence ?? 50}%;background:${isConfirmed ? "#16a34a" : "#f59e0b"};border-radius:3px;transition:width 0.3s"></div>
        </div>
        <div style="font-size:11px;color:#374151;font-weight:600;margin-top:2px">${props.confidence ?? 50}%</div>
      </div>
    </div>`;
}

function buildInfraPopup(props: Record<string, unknown>): string {
  const statusColor =
    props.status === "open" ? "#16a34a" : props.status === "damaged" ? "#d97706" : "#dc2626";
  return `
    <div style="font-family:system-ui,sans-serif;padding:4px;min-width:160px">
      <h3 style="margin:0 0 4px;font-size:14px;font-weight:700;color:#111827">${props.name ?? props.infra_type}</h3>
      <p style="margin:0;font-size:12px">Status: <strong style="color:${statusColor}">${String(props.status ?? "unknown").toUpperCase()}</strong></p>
    </div>`;
}

function buildFieldReportPopup(props: Record<string, unknown>): string {
  const ts = props.captured_at
    ? new Date(props.captured_at as string).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: false,
      })
    : "Unknown";
  const lat = typeof props.latitude === "number" ? props.latitude.toFixed(4) : "?";
  const lng = typeof props.longitude === "number" ? props.longitude.toFixed(4) : "?";
  const acc = props.accuracy_m ? `${Math.round(props.accuracy_m as number)} m` : "Unknown";
  return `
    <div style="font-family:system-ui,sans-serif;min-width:200px;padding:4px">
      <div style="margin-bottom:6px">
        <span style="background:#1d4ed8;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:0.05em">📍 FIELD REPORT</span>
      </div>
      <h3 style="margin:0 0 6px;font-size:14px;font-weight:700;color:#111827">${props.incident_type ?? "Field Report"}</h3>
      <p style="margin:0 0 2px;font-size:12px;color:#374151">Device GPS</p>
      <p style="margin:0 0 2px;font-size:12px;color:#6b7280">${lat}° N, ${lng}° E</p>
      <p style="margin:0 0 4px;font-size:12px;color:#6b7280">Accuracy: ${acc}</p>
      <p style="margin:0 0 2px;font-size:12px;color:#6b7280">📅 ${ts}</p>
      ${props.road_impact ? `<p style="margin:4px 0 0;font-size:11px;color:#374151">Road Impact: <strong>${props.road_impact}</strong></p>` : ""}
      <div style="margin-top:8px;padding:4px 8px;background:#eff6ff;border-radius:4px;font-size:10px;color:#1d4ed8;font-weight:600">
        Status: FIELD REPORT — Awaiting authority review
      </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────
// Main Map Component
// ─────────────────────────────────────────────────────────────────
export default function Map({
  incidents,
  infrastructure,
  susceptibilityZones = [],
  fieldReports = [],
  onIncidentSelect,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const mapReadyRef = useRef(false);

  // ── Initialise map (once) ─────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASE_STYLE,
      center: PUNE_CENTER,
      zoom: 10,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      pitch: 45, // Default angled view for 'digital twin' feel
      attributionControl: false,
    });

    // Navigation controls (top-right)
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    // Scale bar (bottom-left)
    map.addControl(
      new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }),
      "bottom-left"
    );

    // Attribution (bottom-right, compact)
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    // Shared reusable popup
    popupRef.current = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: "280px",
      className: "netra-popup",
    });

    map.on("load", () => {
      // ── Susceptibility source (empty until data arrives) ──────
      map.addSource(SOURCE_IDS.SUSCEPTIBILITY, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // ── AI Forecast Source (Cone of Uncertainty) ──────────────
      map.addSource(SOURCE_IDS.AI_FORECAST, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: { name: "T+12 Impact Zone (85% Prob)" },
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [73.8567, 18.5204],
                    [73.8700, 18.5400],
                    [73.9000, 18.5300],
                    [73.8900, 18.5100],
                    [73.8567, 18.5204],
                  ],
                ],
              },
            },
          ],
        },
      });

      // AI Forecast animated fill
      map.addLayer({
        id: LAYER_IDS.AI_FORECAST_FILL,
        type: "fill",
        source: SOURCE_IDS.AI_FORECAST,
        paint: {
          "fill-color": "#f43f5e", // Rose-500
          "fill-opacity": 0.2,
        },
      });

      // AI Forecast dashed outline
      map.addLayer({
        id: LAYER_IDS.AI_FORECAST_OUTLINE,
        type: "line",
        source: SOURCE_IDS.AI_FORECAST,
        paint: {
          "line-color": "#f43f5e",
          "line-width": 2,
          "line-dasharray": [2, 4],
        },
      });

      // Fill layer — colour-coded by susceptibility level
      map.addLayer({
        id: LAYER_IDS.SUSCEPTIBILITY_FILL,
        type: "fill",
        source: SOURCE_IDS.SUSCEPTIBILITY,
        paint: {
          "fill-color": [
            "match",
            ["get", "level"],
            "LOW", SUSCEPTIBILITY_COLOR_MAP.LOW,
            "MODERATE", SUSCEPTIBILITY_COLOR_MAP.MODERATE,
            "HIGH", SUSCEPTIBILITY_COLOR_MAP.HIGH,
            "VERY HIGH", SUSCEPTIBILITY_COLOR_MAP["VERY HIGH"],
            "#94a3b8", // default grey
          ],
          "fill-opacity": 0.3,
        },
      });

      // Outline layer
      map.addLayer({
        id: LAYER_IDS.SUSCEPTIBILITY_OUTLINE,
        type: "line",
        source: SOURCE_IDS.SUSCEPTIBILITY,
        paint: {
          "line-color": [
            "match",
            ["get", "level"],
            "LOW", SUSCEPTIBILITY_COLOR_MAP.LOW,
            "MODERATE", SUSCEPTIBILITY_COLOR_MAP.MODERATE,
            "HIGH", SUSCEPTIBILITY_COLOR_MAP.HIGH,
            "VERY HIGH", SUSCEPTIBILITY_COLOR_MAP["VERY HIGH"],
            "#94a3b8",
          ],
          "line-width": 1.5,
          "line-opacity": 0.8,
        },
      });

      // Label layer for zone names
      map.addLayer({
        id: LAYER_IDS.SUSCEPTIBILITY_LABELS,
        type: "symbol",
        source: SOURCE_IDS.SUSCEPTIBILITY,
        layout: {
          "text-field": ["get", "level"],
          "text-size": 10,
          "text-font": ["Noto Sans Regular"],
          "text-anchor": "center",
        },
        paint: {
          "text-color": "#1e293b",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
        },
        minzoom: 8,
      });

      // ── Roads source ──────────────────────────────────────────
      map.addSource(SOURCE_IDS.ROADS, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: LAYER_IDS.ROAD_LINE,
        type: "line",
        source: SOURCE_IDS.ROADS,
        paint: {
          "line-color": [
            "match",
            ["get", "status"],
            "open", "#22c55e",
            "damaged", "#f59e0b",
            "closed", "#ef4444",
            "#94a3b8",
          ],
          "line-width": 3,
          "line-opacity": 0.9,
        },
      });

      // ── Hospitals / critical infrastructure source ─────────────
      map.addSource(SOURCE_IDS.HOSPITALS, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Glowing circle base
      map.addLayer({
        id: LAYER_IDS.HOSPITAL_CIRCLE,
        type: "circle",
        source: SOURCE_IDS.HOSPITALS,
        paint: {
          "circle-radius": 8,
          "circle-color": "#3b82f6",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
          "circle-opacity": 0.9,
        },
      });

      // ── Incidents source ──────────────────────────────────────
      map.addSource(SOURCE_IDS.INCIDENTS, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // PREDICTED — dashed pulsing circle (amber)
      map.addLayer({
        id: LAYER_IDS.INCIDENT_PREDICTED_BORDER,
        type: "circle",
        source: SOURCE_IDS.INCIDENTS,
        filter: ["==", ["get", "incident_class"], "PREDICTED"],
        paint: {
          "circle-radius": 14,
          "circle-color": "transparent",
          "circle-stroke-color": "#f59e0b",
          "circle-stroke-width": 2,
          "circle-opacity": 0.6,
        },
      });

      map.addLayer({
        id: LAYER_IDS.INCIDENT_PREDICTED_CIRCLE,
        type: "circle",
        source: SOURCE_IDS.INCIDENTS,
        filter: ["==", ["get", "incident_class"], "PREDICTED"],
        paint: {
          "circle-radius": 9,
          "circle-color": "#f59e0b",
          "circle-stroke-color": "#1e293b",
          "circle-stroke-width": 1.5,
          "circle-opacity": 0.85,
        },
      });

      // CONFIRMED — solid red with halo
      map.addLayer({
        id: LAYER_IDS.INCIDENT_CONFIRMED_PULSE,
        type: "circle",
        source: SOURCE_IDS.INCIDENTS,
        filter: ["==", ["get", "incident_class"], "CONFIRMED"],
        paint: {
          "circle-radius": 18,
          "circle-color": "#ef4444",
          "circle-opacity": 0.2,
          "circle-stroke-width": 0,
        },
      });

      map.addLayer({
        id: LAYER_IDS.INCIDENT_CONFIRMED_CIRCLE,
        type: "circle",
        source: SOURCE_IDS.INCIDENTS,
        filter: ["==", ["get", "incident_class"], "CONFIRMED"],
        paint: {
          "circle-radius": 10,
          "circle-color": "#ef4444",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
          "circle-opacity": 1,
        },
      });

      // ── Click handlers ────────────────────────────────────────
      const incidentLayers = [
        LAYER_IDS.INCIDENT_PREDICTED_CIRCLE,
        LAYER_IDS.INCIDENT_CONFIRMED_CIRCLE,
      ];

      incidentLayers.forEach((layerId) => {
        map.on("click", layerId, (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
          if (!e.features?.length) return;
          const feature = e.features[0];
          const props = feature.properties as Record<string, unknown>;
          const coords = (feature.geometry as GeoJSON.Point).coordinates;

          popupRef.current
            ?.setLngLat([coords[0], coords[1]])
            .setHTML(buildIncidentPopup(props))
            .addTo(map);

          if (onIncidentSelect) {
            onIncidentSelect({
              id: props.id as number,
              incident_type: props.incident_type as string,
              severity: props.severity as string,
              priority_p1_p4: props.priority as string,
              confidence: (props.confidence as number) / 100,
              status: props.status as string,
              incident_class: props.incident_class as "PREDICTED" | "CONFIRMED",
              location_name: props.location_name as string,
              affected_population: props.affected_population as number,
            });
          }
        });

        map.on("mouseenter", layerId, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layerId, () => {
          map.getCanvas().style.cursor = "";
        });
      });

      // Hospital click handler
      map.on("click", LAYER_IDS.HOSPITAL_CIRCLE, (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
        if (!e.features?.length) return;
        const props = e.features[0].properties as Record<string, unknown>;
        const coords = (e.features[0].geometry as GeoJSON.Point).coordinates;
        popupRef.current
          ?.setLngLat([coords[0], coords[1]])
          .setHTML(buildInfraPopup(props))
          .addTo(map);
      });

      map.on("mouseenter", LAYER_IDS.HOSPITAL_CIRCLE, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", LAYER_IDS.HOSPITAL_CIRCLE, () => {
        map.getCanvas().style.cursor = "";
      });

      // ── Field Reports source (BLUE) ───────────────────────────
      map.addSource(SOURCE_IDS.FIELD_REPORTS, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Outer pulse halo
      map.addLayer({
        id: LAYER_IDS.FIELD_REPORT_PULSE,
        type: "circle",
        source: SOURCE_IDS.FIELD_REPORTS,
        paint: {
          "circle-radius": 24,
          "circle-color": "#000000", // Inverts to white on the dark map
          "circle-opacity": 0.5,
          "circle-stroke-width": 0,
        },
      });

      // Solid circle
      map.addLayer({
        id: LAYER_IDS.FIELD_REPORT_CIRCLE,
        type: "circle",
        source: SOURCE_IDS.FIELD_REPORTS,
        paint: {
          "circle-radius": 12,
          "circle-color": "#00008b", // Dark blue inverts to light blue
          "circle-stroke-color": "#000000", // Inverts to white
          "circle-stroke-width": 3,
          "circle-opacity": 1,
        },
      });

      // Field report click handler
      map.on("click", LAYER_IDS.FIELD_REPORT_CIRCLE, (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
        if (!e.features?.length) return;
        const props = e.features[0].properties as Record<string, unknown>;
        const coords = (e.features[0].geometry as GeoJSON.Point).coordinates;
        popupRef.current
          ?.setLngLat([coords[0], coords[1]])
          .setHTML(buildFieldReportPopup(props))
          .addTo(map);
      });

      map.on("mouseenter", LAYER_IDS.FIELD_REPORT_CIRCLE, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", LAYER_IDS.FIELD_REPORT_CIRCLE, () => {
        map.getCanvas().style.cursor = "";
      });

      mapReadyRef.current = true;
    });

    mapRef.current = map;

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
      mapReadyRef.current = false;
    };
  }, []); // intentionally empty — map initialises once

  // ── Update susceptibility zones ───────────────────────────────
  useEffect(() => {
    if (!mapReadyRef.current || !mapRef.current) return;
    const source = mapRef.current.getSource(SOURCE_IDS.SUSCEPTIBILITY) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData({
      type: "FeatureCollection",
      features: susceptibilityZones,
    });
  }, [susceptibilityZones]);

  // ── Update incident markers ───────────────────────────────────
  useEffect(() => {
    if (!mapReadyRef.current || !mapRef.current) return;
    const source = mapRef.current.getSource(SOURCE_IDS.INCIDENTS) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData(incidentsToGeoJSON(incidents));
  }, [incidents]);

  // ── Update infrastructure (hospitals + roads separately) ─────
  useEffect(() => {
    if (!mapReadyRef.current || !mapRef.current) return;

    const hospitalSource = mapRef.current.getSource(SOURCE_IDS.HOSPITALS) as maplibregl.GeoJSONSource | undefined;
    if (hospitalSource) {
      hospitalSource.setData(
        infraToGeoJSON(infrastructure, ["hospital", "shelter", "fire_station", "school"])
      );
    }

    const roadSource = mapRef.current.getSource(SOURCE_IDS.ROADS) as maplibregl.GeoJSONSource | undefined;
    if (roadSource) {
      roadSource.setData(infraToGeoJSON(infrastructure, ["road"]));
    }
  }, [infrastructure]);

  // ── Update field reports (BLUE markers) ───────────────────────
  useEffect(() => {
    const applyFieldReports = () => {
      if (!mapRef.current) return;
      const source = mapRef.current.getSource(SOURCE_IDS.FIELD_REPORTS) as maplibregl.GeoJSONSource | undefined;
      console.log("applyFieldReports called. Source exists:", !!source, "Reports:", fieldReports.length);
      if (!source) return;

      const features: GeoJSON.Feature[] = fieldReports
        .filter((r) => r.latitude != null && r.longitude != null)
        .map((r) => ({
          type: "Feature" as const,
          id: r.id,
          properties: {
            id: r.id,
            incident_type: r.incident_type ?? "Field Report",
            latitude: r.latitude,
            longitude: r.longitude,
            accuracy_m: r.accuracy_m,
            captured_at: r.captured_at,
            media_url: r.media_url,
            road_impact: r.road_impact,
            source: r.source,
            status: r.status,
          },
          geometry: {
            type: "Point" as const,
            coordinates: [r.longitude!, r.latitude!],
          },
        }));

      console.log("Updating Map source with features:", features);
      source.setData({ type: "FeatureCollection", features });

      // Auto-fly to first field report if map is zoomed out or on initial load
      if (features.length > 0 && mapRef.current) {
        const firstCoords = (features[0].geometry as GeoJSON.Point).coordinates;
        // Check if we need to fly (e.g. if we are far away, or if it's the first load)
        const currentCenter = mapRef.current.getCenter();
        const dist = Math.sqrt(
          Math.pow(currentCenter.lng - firstCoords[0], 2) + Math.pow(currentCenter.lat - firstCoords[1], 2)
        );
        
        // If we are more than ~0.5 degrees away (approx 50km), fly to it
        if (dist > 0.5 || mapRef.current.getZoom() <= 7) {
          mapRef.current.flyTo({
            center: [firstCoords[0], firstCoords[1]],
            zoom: 12,
            duration: 1500,
          });
        }
      }
    };

    if (mapReadyRef.current) {
      applyFieldReports();
    } else {
      // Map not ready yet — retry after it loads
      const timer = setTimeout(applyFieldReports, 2000);
      return () => clearTimeout(timer);
    }
  }, [fieldReports]);

  // ── Expose imperative methods via ref (for future CesiumJS hand-off) ──
  // A parent component can access mapRef.current directly if needed.
  // To switch to CesiumJS 3D twin, unmount this component and mount CesiumViewer
  // in the same container; pass SOURCE_IDS / LAYER_IDS constants as the data contract.

  return (
    <div className="w-full h-full relative">
      {/* Map canvas — CSS filter inverts light OSM tiles into a dark basemap */}
      <div
        ref={containerRef}
        className="w-full h-full absolute inset-0"
        style={{ filter: "invert(1) hue-rotate(180deg) brightness(0.95) contrast(1.2)" }}
        aria-label="NETRA Operational Map — North-East India"
        role="application"
      />

      {/* Legend overlay */}
      <div
        className="absolute bottom-8 left-4 z-10 flex flex-col gap-1"
        style={{
          background: "rgba(15,23,42,0.85)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(148,163,184,0.2)",
          borderRadius: "10px",
          padding: "10px 14px",
          minWidth: "160px",
        }}
      >
        <p
          style={{
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "#94a3b8",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          Susceptibility
        </p>
        {(["LOW", "MODERATE", "HIGH", "VERY HIGH"] as const).map((level) => (
          <div key={level} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "2px",
                background: SUSCEPTIBILITY_COLOR_MAP[level],
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: "11px", color: "#cbd5e1" }}>{level}</span>
          </div>
        ))}

        <div style={{ margin: "8px 0 4px", borderTop: "1px solid rgba(148,163,184,0.2)" }} />
        <p
          style={{
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "#94a3b8",
            textTransform: "uppercase",
            marginBottom: "4px",
          }}
        >
          Incidents & Forecast
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <span
            style={{
              width: "14px",
              height: "10px",
              background: "rgba(244,63,94,0.2)",
              border: "1.5px dashed #f43f5e",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: "11px", color: "#f43f5e", fontWeight: 600 }}>AI Forecast Zone</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#f59e0b",
              border: "1.5px solid #1e293b",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: "11px", color: "#cbd5e1" }}>Predicted</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#ef4444",
              border: "2px solid #fff",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: "11px", color: "#cbd5e1" }}>Confirmed</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#3b82f6",
              border: "2px solid #fff",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: "11px", color: "#cbd5e1" }}>Hospital / Infra</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#1d4ed8",
              border: "2px solid #fff",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: "11px", color: "#93c5fd" }}>Field Report</span>
        </div>
      </div>
    </div>
  );
}
