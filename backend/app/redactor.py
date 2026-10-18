import re
from typing import Tuple, List

# Compiled regex rules for identifying secrets, credentials, tokens, and identifiers
REDACTION_RULES = [
    # AWS Access Key ID
    (
        "AWS Access Key ID",
        re.compile(r"\b(AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}\b"),
        "[REDACTED_AWS_ACCESS_KEY]"
    ),
    # AWS Secret Key (often prefixed or in assignments)
    (
        "AWS Secret Access Key",
        re.compile(r"(?i)(?:aws_secret_access_key|aws_secret_key|secret_key|secret_token)\s*[:=]\s*['\"]?([A-Za-z0-9/+=]{40})['\"]?"),
        r"aws_secret_access_key=[REDACTED_AWS_SECRET_KEY]"
    ),
    # GitHub Personal Access Token / Fine-grained token
    (
        "GitHub Token",
        re.compile(r"\b(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{82})\b"),
        "[REDACTED_GITHUB_TOKEN]"
    ),
    # GitLab Personal Access Token
    (
        "GitLab Token",
        re.compile(r"\bglpat-[0-9a-zA-Z\-_]{20,30}\b"),
        "[REDACTED_GITLAB_TOKEN]"
    ),
    # Slack Token
    (
        "Slack Token",
        re.compile(r"\bxox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,32}\b"),
        "[REDACTED_SLACK_TOKEN]"
    ),
    # JWT Tokens (JSON Web Token header + payload + signature)
    (
        "JWT / Bearer Token",
        re.compile(r"\b(?:Bearer\s+)?eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b"),
        "[REDACTED_JWT_TOKEN]"
    ),
    # Private SSH / RSA / EC Keys
    (
        "Private Key",
        re.compile(r"-----BEGIN (?:RSA|OPENSSH|DSA|EC|PGP)?\s*PRIVATE KEY-----[\s\S]*?-----END (?:RSA|OPENSSH|DSA|EC|PGP)?\s*PRIVATE KEY-----"),
        "[REDACTED_PRIVATE_KEY_BLOCK]"
    ),
    # Database Connection URIs with credentials
    (
        "Database URI Credentials",
        re.compile(r"\b((?:postgres|postgresql|mysql|mongodb|redis|amqp|couchdb):\/\/[^:\s]+:)([^@\s]+)(@[^:\s]+:[0-9]+[^\s]*)"),
        r"\1[REDACTED_DB_PASSWORD]\3"
    ),
    # Generic password / secret / token assignments (e.g. password = "xyz" or token: "abc")
    (
        "Credential Assignment",
        re.compile(r"(?i)\b(password|passwd|pwd|client_secret|api_key|apikey|auth_token|access_token|secret_val)\s*[:=]\s*['\"]?([^'\"\s\r\n]{6,})['\"]?"),
        r"\1=[REDACTED_CREDENTIAL]"
    ),
    # AWS 12-digit Account ID in ARNs
    (
        "AWS Account ID",
        re.compile(r"\barn:aws:[a-z0-9-]+:[a-z0-9-]*:([0-9]{12}):"),
        "arn:aws:*:*:[REDACTED_AWS_ACCOUNT_ID]:"
    ),
    # IPv4 addresses (excluding 127.0.0.1 and 0.0.0.0)
    (
        "IPv4 Address",
        re.compile(r"\b(?!127\.0\.0\.1\b)(?!0\.0\.0\.0\b)(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b"),
        "[REDACTED_IP]"
    ),
    # Email addresses
    (
        "Email Address",
        re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
        "[REDACTED_EMAIL]"
    )
]

def redact_sensitive_data(text: str) -> Tuple[str, int, List[str]]:
    """
    Scans and redacts credentials, secrets, IP addresses, and identifiers from text.
    Returns:
        redacted_text: text with placeholders
        total_redactions: count of redactions performed
        categories_found: list of unique rule names that matched
    """
    if not text:
        return text, 0, []

    redacted_text = text
    total_redactions = 0
    categories_found = []

    for name, pattern, replacement in REDACTION_RULES:
        matches = list(pattern.finditer(redacted_text))
        if matches:
            count = len(matches)
            total_redactions += count
            categories_found.append(name)
            redacted_text = pattern.sub(replacement, redacted_text)

    return redacted_text, total_redactions, categories_found
