import re
from typing import Tuple

TECH_PATTERNS = [
    (
        "kubernetes",
        [
            r"\bkubelet\b", r"\bpod\b", r"\bcrashloopbackoff\b", r"\boomkilled\b",
            r"\bkubectl\b", r"\bimagepullbackoff\b", r"\bdeployment\.apps\b",
            r"\bnamespace\b", r"\bkube-system\b", r"\bcontainer\s+in\s+pod\b"
        ]
    ),
    (
        "docker",
        [
            r"\bdocker-compose\b", r"\buserland proxy\b", r"\bdockerd\b",
            r"\bdocker\.sock\b", r"\berror starting container\b",
            r"driver failed programming external connectivity"
        ]
    ),
    (
        "jenkins",
        [
            r"\[Pipeline\]", r"\bjenkins\b", r"\bbuild step 'execute shell'\b",
            r"\bfinished:\s*failure\b", r"\bhudson\.", r"\bci auth token\b"
        ]
    ),
    (
        "terraform",
        [
            r"\bterraform\b", r"\bstate lock\b", r"\btfstate\b",
            r"\bconditionalcheckfailedexception\b", r"\bterraform force-unlock\b",
            r"\bplan: \d+ to add\b", r"\bbackend \"s3\"\b"
        ]
    ),
    (
        "aws",
        [
            r"\bbotocore\b", r"\bboto3\b", r"\barn:aws:", r"\bclienterror\b",
            r"\baccessdenied\b", r"\bputobject\b", r"\bgetobject\b",
            r"\baws_access_key\b", r"\bs3\.amazonaws\.com\b", r"\bkms:generatedatakey\b"
        ]
    ),
    (
        "linux",
        [
            r"\bsystemd\[\d+\]", r"\bsystemctl\b", r"\bjournalctl\b",
            r"\bkernel:\b", r"\bdmesg\b", r"\bpermission denied\b",
            r"\bsegmentation fault\b", r"\bnginx: \[emerg\]\b", r"\b/etc/ssl/\b"
        ]
    )
]

CATEGORY_PATTERNS = [
    ("ResourceExhaustion", [r"oomkilled", r"out of memory", r"heap out of memory", r"exit code 137", r"no space left on device", r"disk full"]),
    ("Networking", [r"address already in use", r"connection refused", r"connection timed out", r"temporary failure in name resolution", r"broken pipe", r"network is unreachable"]),
    ("PermissionDenied", [r"access denied", r"permission denied", r"accessdenied", r"unauthorized", r"forbidden", r"403 forbidden", r"status=13/permission"]),
    ("StateLock", [r"state lock", r"conditionalcheckfailedexception", r"database is locked", r"deadlock"]),
    ("ServiceCrash", [r"sigsegv", r"segmentation fault", r"fatal error", r"code=exited, status=1", r"core dumped"]),
    ("ConfigurationError", [r"configuration file .* test failed", r"syntax error", r"invalid argument", r"unknown option", r"yaml:", r"json:"])
]

def classify_log(log_text: str, specified_tech: str = "auto") -> Tuple[str, str, str]:
    """
    Detects technology, category, and estimated severity from log text.
    Returns:
        (technology, category, severity)
    """
    log_lower = log_text.lower()
    
    # 1. Determine Technology
    detected_tech = "generic"
    if specified_tech and specified_tech != "auto":
        detected_tech = specified_tech.lower()
    else:
        scores = {}
        for tech, patterns in TECH_PATTERNS:
            match_count = 0
            for pat in patterns:
                if re.search(pat, log_lower):
                    match_count += 1
            if match_count > 0:
                scores[tech] = match_count
        
        if scores:
            detected_tech = max(scores, key=scores.get)

    # 2. Determine Category
    detected_category = "GeneralError"
    for cat, patterns in CATEGORY_PATTERNS:
        if any(re.search(pat, log_lower) for pat in patterns):
            detected_category = cat
            break

    # 3. Determine Severity
    severity = "medium"
    critical_signals = ["oomkilled", "fatal error", "emergency", "crashloopbackoff", "panic:", "sigsegv"]
    high_signals = ["accessdenied", "permission denied", "state lock", "bind: address already in use", "failure", "error:"]
    
    if any(sig in log_lower for sig in critical_signals):
        severity = "critical"
    elif any(sig in log_lower for sig in high_signals):
        severity = "high"
    elif "warn" in log_lower or "warning" in log_lower:
        severity = "medium"
    else:
        severity = "low"

    return detected_tech, detected_category, severity
