import json
import logging
import httpx
from typing import Optional, Dict, Any, List
from .config import settings

logger = logging.getLogger("devfix.ollama")

SYSTEM_PROMPT = """You are DevFix AI, an expert, precision-focused DevOps and Site Reliability Engineering (SRE) troubleshooting assistant.
Your duty is to diagnose infrastructure errors quickly using open-weight AI.

CRITICAL RULES:
1. Be realistic and precise. NEVER fabricate diagnostic evidence or claim a fix was tested when it was not.
2. Only quote evidence that genuinely appears in the provided log text.
3. If the provided log is truncated, ambiguous, or lacks critical stack traces/context, set "insufficient_logs": true, and explicitly ask for the exact command or file needed in "missing_information_request".
4. Every diagnostic command MUST be safe to run (read-only or non-destructive). Mark destructive/elevated actions clearly.
5. All remediation steps MUST include corresponding rollback precautions so engineers do not cause secondary outages.
6. Return your entire response as a valid, parsable JSON object strictly following this structure:
{
  "summary": "1-2 sentence concise executive summary of the failure",
  "detected_technology": "kubernetes|docker|jenkins|linux|terraform|aws|generic",
  "detected_category": "ResourceExhaustion|Networking|PermissionDenied|StateLock|ServiceCrash|ConfigurationError|GeneralError",
  "severity": "critical|high|medium|low",
  "confidence": "high|medium|low",
  "confidence_score": 0.85,
  "likely_root_cause": "Detailed technical explanation of the primary root cause",
  "evidence": ["exact excerpt 1 from the log", "exact excerpt 2 from the log"],
  "safe_diagnostic_commands": [
    {
      "command": "terminal command to inspect state",
      "purpose": "why run this command",
      "is_safe_read_only": true,
      "requires_sudo": false,
      "expected_output": "what healthy or confirming output looks like"
    }
  ],
  "suggested_remediation": [
    "Step 1: ...",
    "Step 2: ..."
  ],
  "rollback_precautions": [
    {
      "action": "Description of the remediation action",
      "risk_level": "medium",
      "precaution": "How to revert or what safeguard to test first"
    }
  ],
  "insufficient_logs": false,
  "missing_information_request": null
}"""

class OllamaClient:
    def __init__(self, base_url: Optional[str] = None, default_model: Optional[str] = None):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.default_model = default_model or settings.DEFAULT_MODEL
        self.timeout = settings.OLLAMA_TIMEOUT_SECONDS

    async def check_health(self) -> Dict[str, Any]:
        """
        Queries Ollama /api/tags to see if the daemon is reachable and lists downloaded models.
        """
        url = f"{self.base_url}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    return {
                        "available": True,
                        "is_local": settings.is_local_inference(self.base_url),
                        "ollama_url": self.base_url,
                        "configured_model": self.default_model,
                        "installed_models": models,
                        "error_message": None,
                        "recommended_models": settings.RECOMMENDED_MODELS
                    }
                else:
                    return {
                        "available": False,
                        "is_local": settings.is_local_inference(self.base_url),
                        "ollama_url": self.base_url,
                        "configured_model": self.default_model,
                        "installed_models": [],
                        "error_message": f"Ollama HTTP {res.status_code}: {res.text[:100]}",
                        "recommended_models": settings.RECOMMENDED_MODELS
                    }
        except httpx.ConnectError:
            return {
                "available": False,
                "is_local": settings.is_local_inference(self.base_url),
                "ollama_url": self.base_url,
                "configured_model": self.default_model,
                "installed_models": [],
                "error_message": f"Could not connect to Ollama at {self.base_url}. Ensure 'ollama serve' is running.",
                "recommended_models": settings.RECOMMENDED_MODELS
            }
        except Exception as e:
            return {
                "available": False,
                "is_local": settings.is_local_inference(self.base_url),
                "ollama_url": self.base_url,
                "configured_model": self.default_model,
                "installed_models": [],
                "error_message": str(e),
                "recommended_models": settings.RECOMMENDED_MODELS
            }

    async def analyze_log(
        self,
        sanitized_log: str,
        hint_tech: str = "auto",
        model: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Sends the sanitized log to Ollama with format='json'.
        Returns the parsed dictionary or None if Ollama fails.
        """
        target_model = model or self.default_model
        url = f"{self.base_url}/api/generate"
        
        user_prompt = f"""Target Platform Hint: {hint_tech}
Examine the following redacted infrastructure / DevOps log and produce a structured root-cause diagnosis.
Remember: DO NOT hallucinate evidence. Only extract what is present in the text.

LOG START:
{sanitized_log}
LOG END
"""

        payload = {
            "model": target_model,
            "system": SYSTEM_PROMPT,
            "prompt": user_prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.2,
                "top_p": 0.9,
                "num_ctx": 4096
            }
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    resp_json = res.json()
                    response_text = resp_json.get("response", "").strip()
                    # Parse the JSON response
                    parsed = json.loads(response_text)
                    return parsed
                else:
                    logger.warning(f"Ollama returned HTTP {res.status_code}: {res.text}")
                    return None
        except Exception as e:
            logger.warning(f"Failed to query Ollama model {target_model}: {e}")
            return None
