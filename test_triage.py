"""
Comprehensive Unit & Integration Test Suite for Sahaay: Universal Triage Bridge (2040 Edition).
Tests:
- API Health & Metadata
- Medical AI Triage with Client Profile Injection & Allergy Interlock
- Traffic & Infrastructure Triage with Blockage Severity & Alternates
- Climate & Disaster Defense with Conflict Detection (Human Panic vs SCADA)
- Predictive Ripple Effect Engine Output Validation (2nd, 3rd order, AI mitigations)
"""
import pytest
from fastapi.testclient import TestClient
from main import app, TriagePriorityEnum, SeverityEnum

client = TestClient(app)

def test_health_check_endpoint():
    """Verify system status, version, and architectural feature listing."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"
    assert "version" in data
    assert any("Ripple" in f for f in data["features"])

def test_medical_triage_with_allergy_interlock():
    """Verify that clinical vitals are parsed, P1 priority assigned, and Penicillin allergy flagged."""
    payload = {
        "category": "medical",
        "raw_text": "Father 68 collapsed clutching chest, sweating cold, HR 134, BP 82/50, SpO2 86%!",
        "context_data": "Prescription list: Atorvastatin 40mg daily. KNOWN SEVERE ALLERGY TO PENICILLIN.",
        "client_profile": {
            "name": "Ramesh Verma",
            "blood_type": "O+",
            "emergency_contact": "+91-98220-44911",
            "allergies": "SEVERE ANAPHYLACTIC SHOCK TO PENICILLIN & AMOXICILLIN",
            "medical_history": "Prior coronary stent in LAD (2020)"
        }
    }
    response = client.post("/api/triage", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    # Assert Domain & Priority
    assert "medical" in data["category"].lower()
    assert data["triage_priority"] in [TriagePriorityEnum.P1_CRITICAL, "P1_CRITICAL"]
    assert len(data["civilian_instructions"]) == 3
    assert len(data["extracted_vitals"]) >= 1
    
    # Assert Allergy Contraindication Flagged
    assert data["conflict_detected"] is True
    
    # Assert Predictive Ripple Effect
    ripple = data["ripple_effect_prediction"]
    assert "second_order_effect" in ripple and len(ripple["second_order_effect"]) > 0
    assert "third_order_effect" in ripple and len(ripple["third_order_effect"]) > 0
    assert "automated_mitigation" in ripple and len(ripple["automated_mitigation"]) > 0
    assert ripple["cascading_risk_level"] in ["CRITICAL", "HIGH", "MODERATE"]

def test_traffic_triage_and_corridor_bypass():
    """Verify that traffic incident extracts geo-anchors, blockage severity, and detour corridors."""
    payload = {
        "category": "traffic",
        "raw_text": "Old highway near Sector 14 flyover toll plaza, high tension power cable snapped and fallen across lanes!",
        "context_data": "Highway Corridor 4B arterial status red.",
        "client_profile": {
            "name": "Ramesh Verma",
            "blood_type": "O+"
        }
    }
    response = client.post("/api/triage", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["category"].lower() == "traffic"
    assert data["blockage_severity"] in [SeverityEnum.HIGH, "HIGH", "CRITICAL", "MEDIUM"]
    assert "alternate_routing_suggestions" in data
    assert len(data["alternate_routing_suggestions"]) >= 1
    assert len(data["civilian_instructions"]) == 3
    
    # Assert Traffic Ripple Effect
    ripple = data["ripple_effect_prediction"]
    assert "second_order_effect" in ripple
    assert "automated_mitigation" in ripple

def test_climate_conflict_detection_scada_vs_human_panic():
    """Verify that viral rumors contradicting authoritative SCADA dam sensors trigger conflict_detected=true."""
    payload = {
        "category": "climate",
        "raw_text": "Emergency run! The Khopoli main dam wall broke open, bridge washed away, hundreds swept into river!",
        "context_data": "Irrigation Department SCADA Telemetry (Khopoli Dam): All 4 radial gates are 100% closed, spillway discharge is 0 cumecs.",
        "client_profile": {
            "name": "Ramesh Verma",
            "blood_type": "O+"
        }
    }
    response = client.post("/api/triage", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["category"].lower() == "climate"
    assert data["conflict_detected"] is True
    assert "scada" in data["conflict_details"].lower() or "dam" in data["conflict_details"].lower() or "discrepancy" in data["conflict_details"].lower()
    assert "evacuation_directives" in data
    assert len(data["civilian_instructions"]) == 3

def test_custom_open_triage_hazard():
    """Verify autonomous categorization and risk assessment for custom industrial hazards."""
    payload = {
        "category": "others",
        "raw_text": "Unmarked tank car hissing yellow green vapor near rail siding 4, eyes burning, coughing uncontrollably!",
        "context_data": "Industrial SCADA Alarm: Chlorine/Ammonia bulk storage perimeter alert.",
        "client_profile": {
            "name": "Ramesh Verma"
        }
    }
    response = client.post("/api/triage", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert "ai_categorization" in data or "hazard" in str(data).lower()
    assert "risk_assessment" in data
    assert len(data["recommended_action"]) >= 1
    assert "ripple_effect_prediction" in data
