import pytest
from app.analyzer import analyze_infrastructure_log
from app.schemas import AnalyzeRequest
from app.samples import SAMPLE_ERRORS

@pytest.mark.asyncio
async def test_k8s_sample_analysis():
    k8s_sample = next(s for s in SAMPLE_ERRORS if s["technology"] == "kubernetes")
    req = AnalyzeRequest(
        log=k8s_sample["log"],
        technology="auto",
        redact_secrets=True,
        force_demo_mode=True
    )
    res = await analyze_infrastructure_log(req)
    assert res.detected_technology == "kubernetes"
    assert res.detected_category == "ResourceExhaustion"
    assert res.severity == "critical"
    assert len(res.safe_diagnostic_commands) > 0
    assert len(res.suggested_remediation) > 0
    assert len(res.rollback_precautions) > 0
    assert res.redacted_items_count > 0  # Should have redacted the DB token and IP
    assert res.insufficient_logs is False

@pytest.mark.asyncio
async def test_insufficient_log_detection():
    short_log = "error: something failed"
    req = AnalyzeRequest(
        log=short_log,
        technology="linux",
        force_demo_mode=True
    )
    res = await analyze_infrastructure_log(req)
    assert res.insufficient_logs is True
    assert res.missing_information_request is not None
    assert res.confidence == "low"
