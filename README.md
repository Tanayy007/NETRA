<div align="center">

# 🌐 NETRA
### Nature's Early Threat Recognition & Alert
**AI-Driven Disaster Intelligence & 3D Digital Twin Platform**

[![Smart India Hackathon](https://img.shields.io/badge/Smart_India_Hackathon-2026-orange?style=for-the-badge)](https://sih.gov.in)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostGIS](https://img.shields.io/badge/Database-PostGIS-336791?style=for-the-badge&logo=postgresql)](https://postgis.net/)

An intelligent Command, Control, Communications, Computers, and Intelligence (C4I) system designed specifically for the **NDRF** and **District Disaster Management Authorities (DDMA)**.

</div>

---

## 🎯 The Core Problem & Our Solution
During a natural disaster, the biggest operational bottleneck is **fragmented information**. Responders are flooded with noisy social media posts, delayed satellite imagery, and isolated official alerts.

**NETRA** fuses official alerts (SACHET), local authority updates, meteorological telemetry, satellite imagery, and geo-tagged citizen reports into **ONE verified, structured, and actionable situation picture**.

### The SIH Edge
1. **Focus on Operational Command:** We don't just alert citizens; we build a platform for responders to coordinate diversions, earthmovers, and deployments.
2. **Ground Truth Priority:** We acknowledge that AI identifies risk, but field evidence confirms it.
3. **AI Data Fusion:** Moves beyond simple dashboards by clustering, verifying, and scoring the confidence of multi-modal data streams to generate automated Disaster Briefs.

---

## ⚙️ How NETRA Works: The 4-Stage Lifecycle

1. 🟡 **PREDICT (Early Susceptibility):** Evaluates slope stability and pore-water pressure using hydro-mechanical models to identify high-risk zones before detachment begins.
2. 🔵 **DETECT (Operational Monitoring):** Continuously monitors regional automated weather stations (IMD AWS), radar rainfall grids, and satellite surface displacement scans.
3. 🟣 **VERIFY (Ground Truth Corroboration):** Eliminates computer false-alarms by cross-referencing predictive alerts with geo-tagged photos uploaded by highway patrol and citizens.
4. 🟢 **RESPOND (Swift Intervention):** Supplies authorized emergency response teams with recommended transit diversions, warning broadcasts, and clearway equipment staging.

---

## 🧠 The Prediction Model & AI Engine

NETRA's intelligence relies on a hybrid approach of geospatial modeling and Machine Learning:

### 1. Hydro-Mechanical Susceptibility Modeling
*   **Factor of Safety (FoS) Computation:** The system computes the FoS for terrain grid cells by integrating Cloud DEM slope gradients with root-zone soil moisture indices (via Google Earth Engine).
*   **Predictive Outputs:** Generates P1–P4 risk susceptibility grids updated on every rainfall event cycle.

### 2. Satellite Surface Displacement
*   **Sentinel-1 InSAR:** Processes Synthetic Aperture Radar interferograms to detect micro-millimeter surface displacement anomalies (slope scarp movement) before a major collapse.

### 3. AI Data Fusion & NLP
*   **Incident Clustering (DBSCAN):** Density-Based Spatial Clustering algorithms combined with time-windowing group multiple chaotic reports (e.g., 50 tweets from the same coordinate within 1 hour) into a single actionable incident.
*   **Information Extraction:** Utilizes lightweight LLMs (SpaCy / HuggingFace) to extract critical entities (Location, Casualties, Road Status) from unstructured text (Social Media, News).
*   **Confidence Scoring:** Algorithms weight evidence sources. A geo-tagged photo from a registered Highway Patrol officer automatically upgrades an incident's confidence score to >95% (CONFIRMED).

---

## 🏗️ Architecture & Technology Stack

The platform uses a modern, scalable microservices architecture.

### Frontend (Command Dashboard)
*   **Framework:** Next.js 16 (React) with TypeScript & Turbopack.
*   **Styling:** Tailwind CSS (v4) for a modern, dark-mode, high-contrast operational UI.
*   **GIS Integration:** Mapbox GL JS / MapLibre for seamless vector map rendering and interactive layer toggling.

### Backend (Data Ingestion & APIs)
*   **Framework:** FastAPI (Python) - highly performant, excellent for AI integration and async data pipelines.
*   **Real-time Comms:** WebSockets for live incident telemetry.
*   **Task Queue:** Celery with Redis for handling heavy background tasks (satellite image processing, social media scraping).

### Database (Geospatial)
*   **Primary DB:** PostgreSQL with the **PostGIS** extension (Crucial for spatial queries like "Find all blocked roads within the predicted hazard polygon").
*   **Caching:** Redis for fast retrieval of live incident states.

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- Docker & Docker Compose (for the Database)

### 1. Start the Database Infrastructure
```bash
# This will spin up PostGIS (PostgreSQL) and Redis
docker-compose up -d
```

### 2. Run the Frontend (Command Center)
```bash
cd frontend
npm install
npm run dev
```
*The web application will be available at `http://localhost:3000`.*

### 3. Run the Backend (API & AI Fusion)
```bash
cd backend
python -m venv venv
# Activate venv (Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
uvicorn main:app --reload
```
*The API documentation will be available at `http://localhost:8000/docs`.*

---
*Built with ❤️ for a Safer India | Smart India Hackathon*
