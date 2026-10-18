from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class DiagnosticCommand(BaseModel):
    command: str = Field(..., description="Safe terminal diagnostic command")
    purpose: str = Field(..., description="Explanation of what the command inspects")
    is_safe_read_only: bool = Field(True, description="Indicates if the command is non-destructive read-only")
    requires_sudo: bool = Field(False, description="Whether command needs elevated privileges")
    expected_output: str = Field("", description="What healthy vs unhealthy output looks like")

class RollbackPrecaution(BaseModel):
    action: str = Field(..., description="Action being guarded")
    risk_level: Literal["low", "medium", "high", "critical"] = "medium"
    precaution: str = Field(..., description="Precaution or rollback step before applying remediation")

class AnalysisResult(BaseModel):
    id: str
    timestamp: str
    detected_technology: str = Field(..., description="kubernetes, docker, jenkins, linux, terraform, aws, or generic")
    detected_category: str = Field(..., description="E.g., OOMKilled, PermissionDenied, StateLock, NetworkTimeout")
    severity: Literal["low", "medium", "high", "critical"] = "high"
    confidence: Literal["low", "medium", "high"] = "high"
    confidence_score: float = Field(0.9, ge=0.0, le=1.0)
    summary: str = Field(..., description="Concise, 1-2 sentence executive summary of the issue")
    likely_root_cause: str = Field(..., description="Technical explanation of the primary root cause")
    evidence: List[str] = Field(default_factory=list, description="Direct excerpts/patterns from logs proving the diagnosis")
    safe_diagnostic_commands: List[DiagnosticCommand] = Field(default_factory=list)
    suggested_remediation: List[str] = Field(default_factory=list, description="Step-by-step remediation guide")
    rollback_precautions: List[RollbackPrecaution] = Field(default_factory=list)
    insufficient_logs: bool = Field(False, description="True if log is truncated or missing key context")
    missing_information_request: Optional[str] = Field(None, description="Guidance on what logs/data to retrieve next")
    redacted_items_count: int = Field(0, description="Number of sensitive tokens redacted before AI analysis")
    redacted_categories: List[str] = Field(default_factory=list)
    inference_source: Literal["local_ollama", "remote_ollama", "deterministic_demo"] = "deterministic_demo"
    model_used: str = Field("demo-rule-engine-v1", description="Model name or engine used")
    execution_time_ms: float = 0.0

class AnalyzeRequest(BaseModel):
    log: str = Field(..., description="Raw log text to analyze")
    technology: Optional[str] = Field("auto", description="kubernetes, docker, jenkins, linux, terraform, aws, auto")
    redact_secrets: bool = Field(True, description="Whether to redact PII, tokens, and secrets prior to inference")
    force_demo_mode: bool = Field(False, description="Force deterministic demo analysis even if Ollama is connected")
    model_name: Optional[str] = Field(None, description="Override Ollama model name")
    ollama_url: Optional[str] = Field(None, description="Override Ollama URL")

class RedactRequest(BaseModel):
    text: str

class RedactResponse(BaseModel):
    redacted_text: str
    redactions_count: int
    redacted_types: List[str]

class ModelStatusResponse(BaseModel):
    available: bool
    is_local: bool
    ollama_url: str
    configured_model: str
    installed_models: List[str] = Field(default_factory=list)
    error_message: Optional[str] = None
    recommended_models: List[dict] = Field(default_factory=list)

class FeedbackRequest(BaseModel):
    category: str = Field("General", description="Accuracy, Model Support, Secret Redaction, UI, Other")
    rating: int = Field(5, ge=1, le=5)
    message: str = Field(..., min_length=3)
    email: Optional[str] = None
    log_sample_included: bool = False

class FeedbackResponse(BaseModel):
    success: bool
    message: str
    id: str

class SampleError(BaseModel):
    id: str
    title: str
    technology: str
    category: str
    severity: str
    description: str
    log: str
