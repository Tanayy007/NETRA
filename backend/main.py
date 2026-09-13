import os
import json
import asyncio
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import datetime

import models
from database import engine, get_db

# ─── Gemini AI Setup ─────────────────────────────────────────────
try:
    import google.generativeai as genai
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        GEMINI_AVAILABLE = True
    else:
        GEMINI_AVAILABLE = False
except ImportError:
    GEMINI_AVAILABLE = False

# ─── DB Init ─────────────────────────────────────────────────────
models.Base.metadata.create_all(bind=engine)

# ─── App Setup ───────────────────────────────────────────────────
app = FastAPI(
    title="NETRA API",
    description="NDRF Emergency & Threat Response Analysis — Backend",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── WebSocket Connection Manager ────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active_connections.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active_connections.remove(ws)

    async def broadcast(self, data: dict):
        dead = []
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception:
                dead.append(connection)
        for d in dead:
            self.active_connections.remove(d)

manager = ConnectionManager()

# ─── Pydantic Schemas ─────────────────────────────────────────────
class IncidentSchema(BaseModel):
    id: int
    name: Optional[str] = None
    location_name: Optional[str] = None
    incident_type: Optional[str] = None
    severity: Optional[str] = None
    priority_p1_p4: Optional[str] = None
    confidence: Optional[float] = None
    status: Optional[str] = None
    incident_class: Optional[str] = None
    affected_population: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    geometry: Optional[str] = None

    class Config:
        from_attributes = True

class ReportCreateSchema(BaseModel):
    source_type: str
    source_name: str
    content: str
    verification_badge: str
    incident_id: Optional[int] = None

class ReportSchema(BaseModel):
    id: int
    incident_id: Optional[int] = None
    source_type: Optional[str] = None
    source_name: Optional[str] = None
    content: Optional[str] = None
    verification_badge: Optional[str] = None

    class Config:
        from_attributes = True

class InfrastructureSchema(BaseModel):
    id: int
    name: Optional[str] = None
    infra_type: Optional[str] = None
    status: Optional[str] = None
    geometry: Optional[str] = None
    updated_by: Optional[str] = None

    class Config:
        from_attributes = True

class InfraUpdateSchema(BaseModel):
    status: str
    updated_by: str

class FieldReportCreateSchema(BaseModel):
    """Geo-tagged field report from citizen or patrol device."""
    incident_type: str
    latitude: float
    longitude: float
    accuracy_m: float
    captured_at: str                       # ISO 8601 from device
    media_url: Optional[str] = None        # Object-storage key (Phase 2)
    road_impact: Optional[str] = None
    source: str = "citizen"                # 'citizen' | 'patrol'
    status: str = "FIELD_REPORT"

class FieldReportSchema(BaseModel):
    id: int
    incident_type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy_m: Optional[float] = None
    geometry: Optional[str] = None
    captured_at: Optional[str] = None
    media_url: Optional[str] = None
    road_impact: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True

# ─── Routes ──────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "NETRA API v2.0 — Online", "gemini": GEMINI_AVAILABLE}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "gemini_available": GEMINI_AVAILABLE,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

# ── Incidents ─────────────────────────────────────────────────────
@app.get("/api/incidents", response_model=List[IncidentSchema])
def get_incidents(db: Session = Depends(get_db)):
    return db.query(models.Incident).all()

@app.get("/api/incidents/{incident_id}", response_model=IncidentSchema)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

# ── Reports ───────────────────────────────────────────────────────
@app.get("/api/reports/{incident_id}", response_model=List[ReportSchema])
def get_reports_for_incident(incident_id: int, db: Session = Depends(get_db)):
    return db.query(models.Report).filter(models.Report.incident_id == incident_id).all()

@app.post("/api/reports")
async def create_report(report: ReportCreateSchema, db: Session = Depends(get_db)):
    db_report = models.Report(
        source_type=report.source_type,
        source_name=report.source_name,
        content=report.content,
        verification_badge=report.verification_badge,
        incident_id=report.incident_id
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    # Broadcast new report to all WebSocket clients
    await manager.broadcast({
        "type": "NEW_REPORT",
        "data": {
            "id": db_report.id,
            "incident_id": db_report.incident_id,
            "source_type": db_report.source_type,
            "source_name": db_report.source_name,
            "content": db_report.content,
            "verification_badge": db_report.verification_badge,
        }
    })
    return {"status": "success", "report_id": db_report.id}

# ── Infrastructure ────────────────────────────────────────────────
@app.get("/api/infrastructure", response_model=List[InfrastructureSchema])
def get_infrastructure(db: Session = Depends(get_db)):
    return db.query(models.Infrastructure).all()

@app.put("/api/infrastructure/{infra_id}")
async def update_infrastructure(infra_id: int, body: InfraUpdateSchema, db: Session = Depends(get_db)):
    infra = db.query(models.Infrastructure).filter(models.Infrastructure.id == infra_id).first()
    if not infra:
        raise HTTPException(status_code=404, detail="Infrastructure not found")
    infra.status = body.status
    infra.updated_by = body.updated_by
    db.commit()
    db.refresh(infra)

    await manager.broadcast({
        "type": "INFRA_UPDATE",
        "data": {"id": infra_id, "status": body.status, "updated_by": body.updated_by}
    })
    return {"status": "success"}

# ── Field Reports (Geo-Tagged Citizen / Patrol Submissions) ───────
@app.get("/api/field-reports", response_model=List[FieldReportSchema])
def get_field_reports(db: Session = Depends(get_db)):
    """Return all field reports ordered by newest first."""
    return db.query(models.FieldReport).order_by(models.FieldReport.id.desc()).all()

@app.post("/api/field-reports", status_code=201)
async def create_field_report(
    report: FieldReportCreateSchema,
    db: Session = Depends(get_db)
):
    """Accept a geo-tagged field report from the browser client.

    Stores:
    - incident_type, source, status
    - latitude, longitude, accuracy_m
    - geometry: GeoJSON Point string (PostGIS-compatible, EPSG:4326)
    - captured_at, media_url, road_impact
    """
    # Build PostGIS-compatible GeoJSON point (lon, lat order)
    geometry_str = (
        f'{{"type":"Point","coordinates":[{report.longitude},{report.latitude}]}}'
    )

    db_report = models.FieldReport(
        incident_type=report.incident_type,
        latitude=report.latitude,
        longitude=report.longitude,
        accuracy_m=report.accuracy_m,
        geometry=geometry_str,
        captured_at=report.captured_at,
        media_url=report.media_url,
        road_impact=report.road_impact,
        source=report.source,
        status=report.status,
        sync_status="SYNCED",
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    # Broadcast to all WebSocket clients so the dashboard map updates live
    await manager.broadcast({
        "type": "NEW_FIELD_REPORT",
        "data": {
            "id": db_report.id,
            "incident_type": db_report.incident_type,
            "latitude": db_report.latitude,
            "longitude": db_report.longitude,
            "accuracy_m": db_report.accuracy_m,
            "captured_at": db_report.captured_at,
            "status": db_report.status,
        },
    })

    return {
        "id": db_report.id,
        "status": "FIELD_REPORT",
        "message": "Field report received and queued for authority review.",
    }

# ── Stats KPIs ────────────────────────────────────────────────────
@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    incidents = db.query(models.Incident).all()
    total = len(incidents)
    confirmed = sum(1 for i in incidents if i.incident_class == "CONFIRMED")
    predicted = sum(1 for i in incidents if i.incident_class == "PREDICTED")
    total_affected = sum(i.affected_population or 0 for i in incidents)
    p1_count = sum(1 for i in incidents if i.priority_p1_p4 == "P1")

    avg_confidence = 0.0
    if total > 0:
        avg_confidence = sum(i.confidence or 0 for i in incidents) / total

    return {
        "total_incidents": total,
        "confirmed": confirmed,
        "predicted": predicted,
        "total_affected_population": total_affected,
        "p1_critical": p1_count,
        "avg_confidence": round(avg_confidence * 100, 1),
        "ws_connections": len(manager.active_connections),
    }

# ── AI Disaster Brief ─────────────────────────────────────────────
def _build_template_brief(inc: models.Incident) -> str:
    """Fallback templated brief when Gemini is unavailable."""
    priority_map = {"P1": "IMMEDIATE", "P2": "HIGH", "P3": "MODERATE", "P4": "LOW"}
    action = priority_map.get(inc.priority_p1_p4 or "P2", "HIGH")
    return f"""**NDRF OPERATIONAL BRIEF — {(inc.incident_type or 'INCIDENT').upper()}**

**Classification:** {inc.incident_class or 'PREDICTED'} | Priority: {inc.priority_p1_p4 or 'P2'}
**Location:** {inc.location_name or 'Unknown'}
**Confidence Score:** {round((inc.confidence or 0.5) * 100)}%

**SITUATION REPORT:**
A {inc.severity or 'MODERATE'}-severity {inc.incident_type or 'incident'} has been detected at {inc.location_name or 'the reported location'}. Data fusion from multiple sources confirms this event with {round((inc.confidence or 0.5) * 100)}% confidence. Estimated {inc.affected_population or 'unknown'} individuals in the affected area.

**RECOMMENDED ACTIONS ({action} PRIORITY):**
1. Deploy NDRF Quick Reaction Team (QRT) to {inc.location_name or 'affected area'} immediately.
2. Establish Forward Operating Base (FOB) at nearest safe vantage point.
3. Coordinate with local DDMA and district administration.
4. Activate Search & Rescue (SAR) operations for trapped individuals.
5. Set up medical triage point in coordination with nearest hospital.

**RESOURCE REQUIREMENTS:**
- 1× NDRF Column (45 personnel)
- 2× Inflatable rescue boats (if flood-related)
- Medical first-responder kit
- Communication equipment (HF/VHF radios)

**NEXT REVIEW:** 30 minutes or on receipt of updated ground report.
"""

@app.get("/api/brief/{incident_id}")
async def get_disaster_brief(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    if GEMINI_AVAILABLE:
        prompt = f"""You are an NDRF (National Disaster Response Force) operational intelligence officer.
Generate a concise, actionable NDRF Disaster Brief for the following incident:

Incident Type: {inc.incident_type}
Location: {inc.location_name}
Severity: {inc.severity}
Priority: {inc.priority_p1_p4}
Status: {inc.status}
Classification: {inc.incident_class}
Confidence Score: {round((inc.confidence or 0.5) * 100)}%
Affected Population (estimated): {inc.affected_population}

Write a professional brief with:
1. Situation Report (2-3 sentences)
2. Recommended Immediate Actions (numbered list, 4-5 actions)
3. Resource Requirements (bullet list)
4. Coordination Points (which agencies to contact)

Keep it under 250 words. Use clear military-style language suitable for an operational command center."""

        try:
            response = gemini_model.generate_content(prompt)
            brief_text = response.text
        except Exception as e:
            brief_text = _build_template_brief(inc)
            brief_text += f"\n\n*[Gemini unavailable: {str(e)[:60]}]*"
    else:
        brief_text = _build_template_brief(inc)

    return {
        "incident_id": incident_id,
        "incident_type": inc.incident_type,
        "location_name": inc.location_name,
        "brief": brief_text,
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "ai_powered": GEMINI_AVAILABLE,
    }

# ── Demo Simulation ───────────────────────────────────────────────
DEMO_TIMELINE = [
    {"delay": 0,   "type": "SYSTEM_STATUS",  "message": "🟢 NETRA System Operational — Demo Mode Active", "level": "info"},
    {"delay": 3,   "type": "WEATHER_ALERT",  "message": "⛈ IMD Alert: Extremely Heavy Rainfall forecast for Pune District (250mm/24h). Red Warning issued.", "level": "warning"},
    {"delay": 8,   "type": "SOCIAL_INTEL",   "message": "📱 5 social media reports: Waterlogging in Ward 12, Shivaji Nagar. AI clustering active...", "level": "info"},
    {"delay": 14,  "type": "INCIDENT_CREATED","message": "🔶 AI Fusion Engine: NEW INCIDENT created — Urban Flood, Ward 12 (Confidence: 30% PREDICTED)", "level": "warning"},
    {"delay": 20,  "type": "SACHET_ALERT",   "message": "📡 SACHET Alert received: Flood Warning, Pune District. Confidence updated to 65%.", "level": "warning"},
    {"delay": 28,  "type": "DDMA_UPDATE",    "message": "🏛 DDMA Pune confirmed: 450 residents trapped in Ward 12. Status → CONFIRMED. Confidence: 95%", "level": "critical"},
    {"delay": 36,  "type": "AI_BRIEF",       "message": "🤖 AI Brief generated: Deploy 1 NDRF Column to Ward 12. FOB at Shivaji Nagar Ground. ETA 25 min.", "level": "critical"},
    {"delay": 44,  "type": "SATELLITE",      "message": "🛰 Sentinel-1 SAR processed: Flood extent confirmed — 2.3 km² inundated. 6 roads blocked.", "level": "warning"},
    {"delay": 52,  "type": "RESCUE_UPDATE",  "message": "✅ NDRF Column Alpha deployed. Rescue ops commenced. 12 persons evacuated.", "level": "success"},
]

@app.post("/api/demo/simulate")
async def run_demo_simulation(background_tasks: BackgroundTasks):
    """Trigger the Golden Path demo simulation over WebSocket."""
    background_tasks.add_task(_run_simulation)
    return {"status": "simulation_started", "events": len(DEMO_TIMELINE)}

async def _run_simulation():
    last_delay = 0
    for event in DEMO_TIMELINE:
        wait = event["delay"] - last_delay
        if wait > 0:
            await asyncio.sleep(wait)
        last_delay = event["delay"]
        await manager.broadcast({
            "type": "DEMO_EVENT",
            "event_type": event["type"],
            "message": event["message"],
            "level": event["level"],
            "timestamp": datetime.datetime.utcnow().isoformat(),
        })

# ── WebSocket ─────────────────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send welcome + current state on connect
        await websocket.send_json({
            "type": "CONNECTED",
            "message": "NETRA real-time feed connected.",
            "timestamp": datetime.datetime.utcnow().isoformat(),
        })
        while True:
            # Keep connection alive; server pushes events via broadcast()
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
