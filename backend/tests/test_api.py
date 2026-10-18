from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_api_samples():
    response = client.get("/api/samples")
    assert response.status_code == 200
    samples = response.json()
    assert len(samples) >= 6
    techs = [s["technology"] for s in samples]
    assert "kubernetes" in techs
    assert "docker" in techs
    assert "terraform" in techs

def test_api_redact():
    payload = {"text": "My AWS key is AKIAIOSFODNN7EXAMPLE"}
    response = client.post("/api/redact", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "[REDACTED_AWS_ACCESS_KEY]" in data["redacted_text"]
    assert data["redactions_count"] == 1

def test_api_feedback():
    payload = {
        "category": "Accuracy",
        "rating": 5,
        "message": "Excellent Kubernetes diagnosis!",
        "email": "engineer@test.com"
    }
    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "id" in data
