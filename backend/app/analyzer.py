import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List

from .config import settings
from .schemas import AnalyzeRequest, AnalysisResult, DiagnosticCommand, RollbackPrecaution
from .redactor import redact_sensitive_data
from .classifier import classify_log
from .samples import SAMPLE_ERRORS
from .ollama_client import OllamaClient

def generate_fallback_analysis(
    log_text: str,
    tech: str,
    category: str,
    severity: str
) -> Dict[str, Any]:
    """
    Deterministic rule-based analysis engine for offline / demo mode.
    Accurately diagnoses the log without fabricating facts, and flags insufficient logs when needed.
    """
    # 1. Check if the log matches any of our curated samples
    for sample in SAMPLE_ERRORS:
        # Check title, id, or distinctive snippet
        sample_snippets = [sample["id"], sample["technology"]]
        if sample["id"] in log_text or (sample["log"][:80] in log_text):
            analysis = dict(sample["deterministic_analysis"])
            analysis["detected_technology"] = sample["technology"]
            analysis["detected_category"] = sample["category"]
            analysis["severity"] = sample["severity"]
            return analysis

    # 2. Check if log is too brief or lacks actionable data
    lines = [line.strip() for line in log_text.splitlines() if line.strip()]
    if len(lines) <= 2 and len(log_text.strip()) < 80:
        return {
            "summary": f"Detected a possible {tech} {category} event, but the log excerpt is insufficient for conclusive root-cause isolation.",
            "detected_technology": tech,
            "detected_category": category,
            "severity": severity,
            "confidence": "low",
            "confidence_score": 0.45,
            "likely_root_cause": "The provided log snippet contains only an isolated error string without contextual stack traces, environment variables, or prior lifecycle events.",
            "evidence": [lines[0]] if lines else ["No significant lines provided."],
            "safe_diagnostic_commands": [
                {
                    "command": "journalctl -xe --no-pager -n 100" if tech == "linux" else (
                        "kubectl logs <pod-name> --previous --tail=100" if tech == "kubernetes" else (
                            "docker logs --tail=100 <container-name>" if tech == "docker" else "cat /var/log/syslog | tail -n 100"
                        )
                    ),
                    "purpose": f"Collect preceding timestamps and context leading up to the failure",
                    "is_safe_read_only": True,
                    "requires_sudo": False,
                    "expected_output": "Pre-crash log lines and stack trace"
                }
            ],
            "suggested_remediation": [
                "Re-run the failure scenario with elevated log verbosity enabled (e.g., DEBUG or TRACE level).",
                "Extract the full stderr stream instead of a truncated stdout snippet.",
                "Verify whether surrounding infrastructure services or databases triggered timeouts."
            ],
            "rollback_precautions": [
                {
                    "action": "Diagnosing insufficient log excerpt",
                    "risk_level": "low",
                    "precaution": "Do not apply speculative configuration changes or restart pods until full logs are retrieved."
                }
            ],
            "insufficient_logs": True,
            "missing_information_request": f"Please provide full stack traces or run '{'kubectl logs <pod> --previous' if tech == 'kubernetes' else 'docker logs <container>'}' to capture pre-crash events."
        }

    # 3. Dynamic heuristic synthesis based on detected patterns
    evidence_lines: List[str] = []
    for line in lines:
        lower = line.lower()
        if any(term in lower for term in ["error", "fatal", "fail", "denied", "exception", "refused", "timeout", "killed", "oom"]):
            if len(line) <= 180:
                evidence_lines.append(line)
        if len(evidence_lines) >= 4:
            break
    
    if not evidence_lines and lines:
        evidence_lines = lines[:2]

    diag_cmds: List[Dict[str, Any]] = []
    remediations: List[str] = []
    precautions: List[Dict[str, Any]] = []

    if tech == "kubernetes":
        diag_cmds = [
            {"command": "kubectl get pods -A --field-selector status.phase!=Running", "purpose": "List any pods in non-running states cluster-wide", "is_safe_read_only": True, "requires_sudo": False, "expected_output": "Pods showing Error, CrashLoopBackOff, or Evicted"},
            {"command": "kubectl describe pod <pod-name> -n <namespace>", "purpose": "Inspect events, exit codes, and resource limits", "is_safe_read_only": True, "requires_sudo": False, "expected_output": "Termination message and Last State"}
        ]
        remediations = [
            "Check pod memory/CPU limits against actual workload demands in deployment YAML.",
            "Verify network policies and DNS resolution within the cluster namespace.",
            "Review container entrypoint and application startup scripts for unhandled exceptions."
        ]
        precautions = [
            {"action": "Applying manifest updates", "risk_level": "medium", "precaution": "Test changes with --dry-run=client first, then apply to staging before production."}
        ]
    elif tech == "docker":
        diag_cmds = [
            {"command": "docker ps -a --filter status=exited", "purpose": "Find all stopped or crashed containers with exit codes", "is_safe_read_only": True, "requires_sudo": False, "expected_output": "Exited (1), Exited (137), etc."},
            {"command": "docker inspect <container-id> | grep -iE 'error|oomkilled|exitcode'", "purpose": "Inspect container crash metadata directly from daemon", "is_safe_read_only": True, "requires_sudo": False, "expected_output": "Exit code and OOM status"}
        ]
        remediations = [
            "Check for port conflicts or stale containers bound to host network sockets.",
            "Verify environment variables and mounted volume permissions inside docker-compose.yml.",
            "Inspect container memory caps in the compose specification."
        ]
        precautions = [
            {"action": "Restarting container or daemon", "risk_level": "medium", "precaution": "Ensure stateful volumes are backed up before recreating containers with docker compose down -v."}
        ]
    elif tech == "aws":
        diag_cmds = [
            {"command": "aws sts get-caller-identity", "purpose": "Verify active AWS IAM principal ARN and Account ID", "is_safe_read_only": True, "requires_sudo": False, "expected_output": "UserId, Account, and Arn"},
            {"command": "aws iam get-role-policy --role-name <RoleName> --policy-name <Policy>", "purpose": "Inspect inline IAM permissions assigned to the executing role", "is_safe_read_only": True, "requires_sudo": False, "expected_output": "PolicyDocument JSON"}
        ]
        remediations = [
            "Validate IAM role permissions and resource ARNs against the operation being attempted.",
            "Verify KMS Key policy principal grants if working with SSE-KMS encrypted S3 or EBS storage.",
            "Check AWS Service Quotas or CloudTrail Event History for explicit denial logs."
        ]
        precautions = [
            {"action": "Modifying IAM policies", "risk_level": "high", "precaution": "Use IAM policy simulator before attaching broad permissions; follow least-privilege principles."}
        ]
    elif tech == "terraform":
        diag_cmds = [
            {"command": "terraform plan -no-color", "purpose": "Safely compute execution plan without mutating real cloud resources", "is_safe_read_only": True, "requires_sudo": False, "expected_output": "Plan diff or state error message"},
            {"command": "terraform providers", "purpose": "List locked provider plugin versions in .terraform.lock.hcl", "is_safe_read_only": True, "requires_sudo": False, "expected_output": "Provider dependency tree"}
        ]
        remediations = [
            "Verify backend state lock status in DynamoDB/Consul before forcing lock releases.",
            "Run 'terraform refresh' to ensure state mirrors actual cloud reality.",
            "Pin provider and module versions to avoid upstream breaking syntax changes."
        ]
        precautions = [
            {"action": "Running terraform apply or force-unlock", "risk_level": "critical", "precaution": "Ensure no CI pipeline is concurrently applying state changes before manual state modifications."}
        ]
    else:
        diag_cmds = [
            {"command": "uptime && free -h", "purpose": "Check system load average and memory availability", "is_safe_read_only": True, "requires_sudo": False, "expected_output": "System load below core count and free memory available"},
            {"command": "df -h", "purpose": "Check disk space and partition utilization", "is_safe_read_only": True, "requires_sudo": False, "expected_output": "Filesystems below 90% capacity"}
        ]
        remediations = [
            "Inspect system and application error logs around the timestamp of the event.",
            "Verify service dependency connectivity (database, message queue, DNS).",
            "Check recent configuration or deployment changes for regressions."
        ]
        precautions = [
            {"action": "Restarting system services", "risk_level": "medium", "precaution": "Confirm service backup and healthcheck procedures before triggering restarts."}
        ]

    return {
        "summary": f"Identified a {severity.upper()} {category} error in {tech.upper()} infrastructure.",
        "detected_technology": tech,
        "detected_category": category,
        "severity": severity,
        "confidence": "high" if len(evidence_lines) >= 2 else "medium",
        "confidence_score": 0.88 if len(evidence_lines) >= 2 else 0.72,
        "likely_root_cause": f"The process encountered a fatal condition in {tech} relating to {category}. Key indicators: {', '.join(evidence_lines[:2])}.",
        "evidence": evidence_lines,
        "safe_diagnostic_commands": diag_cmds,
        "suggested_remediation": remediations,
        "rollback_precautions": precautions,
        "insufficient_logs": False,
        "missing_information_request": None
    }

async def analyze_infrastructure_log(request: AnalyzeRequest) -> AnalysisResult:
    """
    Main entrypoint for log analysis.
    1. Redacts secrets/PII if requested.
    2. Classifies tech and error category.
    3. Queries Ollama if available and not forced demo.
    4. Falls back to deterministic rule engine if Ollama is unreachable.
    """
    start_time = time.perf_counter()
    analysis_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()

    # Step 1: Redaction
    log_to_process = request.log
    redactions_count = 0
    redacted_categories: List[str] = []
    if request.redact_secrets:
        log_to_process, redactions_count, redacted_categories = redact_sensitive_data(request.log)

    # Step 2: Classification
    tech, category, severity = classify_log(log_to_process, request.technology or "auto")

    # Step 3: Ollama or Demo
    ollama_url = request.ollama_url or settings.OLLAMA_BASE_URL
    model_name = request.model_name or settings.DEFAULT_MODEL
    ollama_client = OllamaClient(base_url=ollama_url, default_model=model_name)

    raw_result: Dict[str, Any] = {}
    inference_source = "deterministic_demo"
    model_used = "demo-heuristic-v1"

    if not request.force_demo_mode:
        # Check if Ollama is accessible
        health = await ollama_client.check_health()
        if health.get("available", False):
            ai_result = await ollama_client.analyze_log(
                sanitized_log=log_to_process,
                hint_tech=tech,
                model=model_name
            )
            if ai_result and isinstance(ai_result, dict) and "summary" in ai_result:
                raw_result = ai_result
                is_local = settings.is_local_inference(ollama_url)
                inference_source = "local_ollama" if is_local else "remote_ollama"
                model_used = model_name

    # If raw_result is still empty, use deterministic rule-based engine
    if not raw_result:
        raw_result = generate_fallback_analysis(log_to_process, tech, category, severity)
        inference_source = "deterministic_demo"
        model_used = "demo-heuristic-v1"

    # Step 4: Schema mapping and normalization
    diag_commands: List[DiagnosticCommand] = []
    for cmd in raw_result.get("safe_diagnostic_commands", []):
        if isinstance(cmd, dict) and "command" in cmd:
            diag_commands.append(
                DiagnosticCommand(
                    command=str(cmd.get("command", "")),
                    purpose=str(cmd.get("purpose", "Inspect system status")),
                    is_safe_read_only=bool(cmd.get("is_safe_read_only", True)),
                    requires_sudo=bool(cmd.get("requires_sudo", False)),
                    expected_output=str(cmd.get("expected_output", ""))
                )
            )

    rollback_list: List[RollbackPrecaution] = []
    for rb in raw_result.get("rollback_precautions", []):
        if isinstance(rb, dict) and "action" in rb:
            risk = rb.get("risk_level", "medium")
            if risk not in ["low", "medium", "high", "critical"]:
                risk = "medium"
            rollback_list.append(
                RollbackPrecaution(
                    action=str(rb.get("action", "")),
                    risk_level=risk,
                    precaution=str(rb.get("precaution", ""))
                )
            )

    execution_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return AnalysisResult(
        id=analysis_id,
        timestamp=now_iso,
        detected_technology=raw_result.get("detected_technology", tech),
        detected_category=raw_result.get("detected_category", category),
        severity=raw_result.get("severity", severity),
        confidence=raw_result.get("confidence", "high"),
        confidence_score=float(raw_result.get("confidence_score", 0.9)),
        summary=raw_result.get("summary", "Analysis completed."),
        likely_root_cause=raw_result.get("likely_root_cause", "Review logs and diagnostic outputs."),
        evidence=raw_result.get("evidence", []),
        safe_diagnostic_commands=diag_commands,
        suggested_remediation=raw_result.get("suggested_remediation", []),
        rollback_precautions=rollback_list,
        insufficient_logs=bool(raw_result.get("insufficient_logs", False)),
        missing_information_request=raw_result.get("missing_information_request"),
        redacted_items_count=redactions_count,
        redacted_categories=redacted_categories,
        inference_source=inference_source,
        model_used=model_used,
        execution_time_ms=execution_ms
    )
