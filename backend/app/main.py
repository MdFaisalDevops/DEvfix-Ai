import uuid
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .schemas import (
    AnalyzeRequest, AnalysisResult,
    RedactRequest, RedactResponse,
    ModelStatusResponse,
    FeedbackRequest, FeedbackResponse,
    SampleError
)
from .analyzer import analyze_infrastructure_log
from .redactor import redact_sensitive_data
from .samples import SAMPLE_ERRORS
from .ollama_client import OllamaClient

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="DevOps troubleshooting assistant API powered by open-weight AI and Ollama."
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for feedback during MVP
FEEDBACK_STORE: List[Dict[str, Any]] = []

@app.get("/")
def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy",
        "docs": "/docs"
    }

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "ollama_base_url": settings.OLLAMA_BASE_URL,
        "default_model": settings.DEFAULT_MODEL
    }

@app.get("/api/models/status", response_model=ModelStatusResponse)
async def get_model_status(url: str = Query(None)):
    target_url = url or settings.OLLAMA_BASE_URL
    client = OllamaClient(base_url=target_url)
    health_info = await client.check_health()
    return ModelStatusResponse(**health_info)

@app.post("/api/analyze", response_model=AnalysisResult)
async def analyze(request: AnalyzeRequest):
    if not request.log or not request.log.strip():
        raise HTTPException(status_code=400, detail="Log content cannot be empty.")
    
    result = await analyze_infrastructure_log(request)
    return result

@app.post("/api/redact", response_model=RedactResponse)
def redact(request: RedactRequest):
    redacted_text, count, types = redact_sensitive_data(request.text)
    return RedactResponse(
        redacted_text=redacted_text,
        redactions_count=count,
        redacted_types=types
    )

@app.get("/api/samples", response_model=List[SampleError])
def get_samples():
    results = []
    for s in SAMPLE_ERRORS:
        results.append(
            SampleError(
                id=s["id"],
                title=s["title"],
                technology=s["technology"],
                category=s["category"],
                severity=s["severity"],
                description=s["description"],
                log=s["log"]
            )
        )
    return results

@app.post("/api/feedback", response_model=FeedbackResponse)
def submit_feedback(fb: FeedbackRequest):
    fid = f"fb_{uuid.uuid4().hex[:8]}"
    FEEDBACK_STORE.append({
        "id": fid,
        "category": fb.category,
        "rating": fb.rating,
        "message": fb.message,
        "email": fb.email,
        "log_sample_included": fb.log_sample_included
    })
    return FeedbackResponse(
        success=True,
        message="Thank you! Your feedback has been received and helps improve DevFix AI.",
        id=fid
    )
