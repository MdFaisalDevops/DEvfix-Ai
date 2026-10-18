import os
from urllib.parse import urlparse

class Settings:
    APP_NAME: str = "DevFix AI Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")
    
    # Ollama settings
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "llama3.2:3b")
    OLLAMA_TIMEOUT_SECONDS: float = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "45.0"))
    
    # Fallback to deterministic demo mode when Ollama is unavailable
    AUTO_DEMO_FALLBACK: bool = os.getenv("AUTO_DEMO_FALLBACK", "true").lower() in ("true", "1", "yes")

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "*"
    ]

    RECOMMENDED_MODELS: list[dict] = [
        {
            "name": "llama3.2:3b",
            "size": "2.0 GB",
            "speed": "Ultra Fast",
            "ram_required": "4 GB",
            "description": "Meta's lightweight model. Excellent for fast triage and root-cause summaries."
        },
        {
            "name": "qwen2.5-coder:7b",
            "size": "4.7 GB",
            "speed": "Fast",
            "ram_required": "8 GB",
            "description": "Specialized coding & DevOps model. Unmatched accuracy for bash, YAML, and Dockerfiles."
        },
        {
            "name": "mistral:7b",
            "size": "4.1 GB",
            "speed": "Fast",
            "ram_required": "8 GB",
            "description": "Solid reasoning across Linux system errors, networking, and Terraform state."
        },
        {
            "name": "deepseek-r1:7b",
            "size": "4.7 GB",
            "speed": "Moderate",
            "ram_required": "8 GB",
            "description": "Chain-of-thought reasoning model for complex multi-service cascade failures."
        }
    ]

    @staticmethod
    def is_local_inference(url: str) -> bool:
        """Determines if the Ollama endpoint is running locally on the user's machine/LAN."""
        try:
            parsed = urlparse(url)
            hostname = (parsed.hostname or "").lower()
            if hostname in ("localhost", "127.0.0.1", "::1", "0.0.0.0", "host.docker.internal"):
                return True
            # Also treat local subnet IPs as on-premises private
            if hostname.startswith("192.168.") or hostname.startswith("10.") or hostname.endswith(".local"):
                return True
            return False
        except Exception:
            return False

settings = Settings()
