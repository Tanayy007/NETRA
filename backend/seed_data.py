import random
from database import engine, SessionLocal
import models

def seed_db():
    print("Seeding database...")
    db = SessionLocal()

    # Create users if they don't exist
    demo_users = [
        {"email": "ndrf.admin@demo.local", "role": "NDRF_ADMIN", "organization": "NDRF HQ", "jurisdiction": "National"},
        {"email": "ndrf.operator@demo.local", "role": "NDRF_OPERATOR", "organization": "NDRF Command", "jurisdiction": "National"},
        {"email": "ddma.pune@demo.local", "role": "LOCAL_AUTHORITY", "organization": "Pune DDMA", "jurisdiction": "Pune District"},
        {"email": "police.pune@demo.local", "role": "LOCAL_AUTHORITY", "organization": "Pune Police", "jurisdiction": "Pune District"},
        {"email": "fire.pune@demo.local", "role": "LOCAL_AUTHORITY", "organization": "Pune Fire Dept", "jurisdiction": "Pune District"},
    ]

    for user_data in demo_users:
        user = db.query(models.User).filter(models.User.email == user_data["email"]).first()
        if not user:
            new_user = models.User(
                email=user_data["email"],
                role=user_data["role"],
                organization=user_data["organization"],
                jurisdiction=user_data["jurisdiction"],
                password_hash="demo_hash" # Use proper hashing in prod
            )
            db.add(new_user)
    
    db.commit()

    # Clear existing data to ensure fresh seed
    db.query(models.Report).delete()
    db.query(models.Incident).delete()
    db.query(models.Infrastructure).delete()
    db.commit()

    print("Adding Pune flood scenario infrastructure...")
    mock_infra = [
        {"name": "Pune Junction Railway Station", "infra_type": "hospital", "status": "open", "geometry": '{"type": "Point", "coordinates": [73.8732, 18.5284]}'},
        {"name": "Sassoon General Hospital", "infra_type": "hospital", "status": "open", "geometry": '{"type": "Point", "coordinates": [73.8741, 18.5262]}'},
        {"name": "KEM Hospital", "infra_type": "hospital", "status": "open", "geometry": '{"type": "Point", "coordinates": [73.8643, 18.5204]}'},
        {"name": "Shivaji Nagar Road", "infra_type": "road", "status": "closed", "geometry": '{"type": "LineString", "coordinates": [[73.8567, 18.5304], [73.8477, 18.5314]]}'},
        {"name": "FC Road", "infra_type": "road", "status": "damaged", "geometry": '{"type": "LineString", "coordinates": [[73.8400, 18.5204], [73.8450, 18.5304]]}'}
    ]
    for m in mock_infra:
        db.add(models.Infrastructure(
            name=m.get("name"),
            infra_type=m["infra_type"],
            status=m["status"],
            geometry=m["geometry"],
            updated_by="System Seed"
        ))
    
    print("Adding Pune flood scenario incidents...")
    mock_incidents = [
        {
            "name": "Severe Waterlogging Ward 12",
            "location_name": "Ward 12, Shivaji Nagar",
            "incident_type": "Urban Flood",
            "severity": "HIGH",
            "priority_p1_p4": "P1",
            "confidence": 0.95,
            "status": "ACTIVE",
            "incident_class": "CONFIRMED",
            "affected_population": 450,
            "latitude": 18.5300,
            "longitude": 73.8500,
            "geometry": '{"type": "Point", "coordinates": [73.8500, 18.5300]}'
        },
        {
            "name": "Mula-Mutha River Overflow",
            "location_name": "Bund Garden Bridge",
            "incident_type": "River Overflow",
            "severity": "MODERATE",
            "priority_p1_p4": "P2",
            "confidence": 0.65,
            "status": "UNDER_VERIFICATION",
            "incident_class": "PREDICTED",
            "affected_population": 1200,
            "latitude": 18.5350,
            "longitude": 73.8800,
            "geometry": '{"type": "Point", "coordinates": [73.8800, 18.5350]}'
        },
        {
            "name": "Landslide Risk on Sinhagad Road",
            "location_name": "Sinhagad Road, near hills",
            "incident_type": "Landslide",
            "severity": "VERY HIGH",
            "priority_p1_p4": "P1",
            "confidence": 0.88,
            "status": "ACTIVE",
            "incident_class": "CONFIRMED",
            "affected_population": 50,
            "latitude": 18.4700,
            "longitude": 73.8200,
            "geometry": '{"type": "Point", "coordinates": [73.8200, 18.4700]}'
        },
    ]
    
    for inc in mock_incidents:
        db.add(models.Incident(
            name=inc["name"],
            location_name=inc["location_name"],
            incident_type=inc["incident_type"],
            severity=inc["severity"],
            priority_p1_p4=inc["priority_p1_p4"],
            confidence=inc["confidence"],
            status=inc["status"],
            incident_class=inc["incident_class"],
            affected_population=inc["affected_population"],
            latitude=inc["latitude"],
            longitude=inc["longitude"],
            geometry=inc["geometry"]
        ))
        
    db.commit()

    print("Seeding complete.")
    db.close()

if __name__ == "__main__":
    # Ensure tables are created
    models.Base.metadata.create_all(bind=engine)
    seed_db()
