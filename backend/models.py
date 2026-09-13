from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String)
    organization = Column(String)
    jurisdiction = Column(String)
    password_hash = Column(String)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    location_name = Column(String)
    incident_type = Column(String, index=True)
    severity = Column(String)
    priority_p1_p4 = Column(String)
    confidence = Column(Float)
    status = Column(String)
    incident_class = Column(String) # PREDICTED or CONFIRMED
    affected_population = Column(Integer)
    latitude = Column(Float)
    longitude = Column(Float)
    geometry = Column(String) # Store GeoJSON as string instead of Geometry
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    source_type = Column(String)
    source_name = Column(String)
    content = Column(String)
    verification_badge = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FieldReport(Base):
    """Geo-tagged field reports submitted via the citizen / patrol reporting module."""
    __tablename__ = "field_reports"

    id = Column(Integer, primary_key=True, index=True)
    incident_type = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    accuracy_m = Column(Float, nullable=True)       # Device GPS accuracy in metres
    geometry = Column(String, nullable=True)         # GeoJSON Point string for PostGIS compat
    captured_at = Column(String, nullable=True)      # ISO 8601 from device
    media_url = Column(String, nullable=True)        # Object-storage reference (Phase 2)
    road_impact = Column(String, nullable=True)
    source = Column(String, default="citizen")       # 'citizen' | 'patrol'
    status = Column(String, default="FIELD_REPORT")
    sync_status = Column(String, default="SYNCED")   # Track sync state
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Infrastructure(Base):
    __tablename__ = "infrastructure"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    infra_type = Column(String)
    status = Column(String)
    geometry = Column(String) # Store GeoJSON as string
    updated_by = Column(String)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
