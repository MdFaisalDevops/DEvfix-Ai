*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle](https://dev.to/challenges/hacktoberfest-week2-2026-10-12)*

---

# 🛠️ DevFix AI — Private DevOps Troubleshooting with Open-Weight AI

## What I Built

**DevFix AI** is an AI-powered DevOps & Site Reliability Engineering (SRE) troubleshooting assistant designed for software engineers, DevOps practitioners, and small IT teams. It ingests complex infrastructure crash logs and instantly isolates the root cause, extracts verifiable log evidence, generates safe terminal diagnostic commands, and suggests remediation steps with rollback precautions.

### Who Would Pay for It & What Problem Does It Solve?

Engineering teams face a high-stakes dilemma during production incidents:
1. **The Closed Cloud AI Trap:** Piping infrastructure logs into proprietary APIs (OpenAI, Claude) is dangerous. Logs contain sensitive organizational footprints: private IP subnets, database credentials, internal hostnames, and auth tokens. For regulated industries (healthcare, defense, fintech), this violates SOC 2, HIPAA, and GDPR. Furthermore, multi-thousand-line crash dumps incur unpredictable, high monthly token bills.
2. **Traditional Playbooks:** Searching documentation during a 2 AM outage is slow and disconnected from real-time stack traces.

**DevFix AI solves this as a side-hustle product:**
- **Zero Data Leakage:** Powered by open-weight models (via Ollama) running locally on the engineer's machine or inside their private VPC.
- **Zero Per-Token Charges:** Unlimited log diagnostics without recurring API invoices.
- **Enforced Safety:** Commands are classified as `Read-Only` or `Requires Sudo` and strictly require human review before running—**never auto-executing blindly in production**.
- **Commercial Potential:** A freemium self-hosted open-source core with proposed $19/seat team tiers offering shared remediation playbooks, Slack incident webhooks, and private team audit logs.

---

## Demo

- 🌐 **Live Web Application:** [https://d-evfix-ai-12ck-nu.vercel.app/](https://d-evfix-ai-12ck-nu.vercel.app/)
- 🔌 **FastAPI Backend (Local/Docker):** `http://localhost:8000/docs`

> **Note on Testing:** The live Vercel app includes a built-in **Deterministic Client Engine**, allowing you to test real-world Kubernetes, Docker, Jenkins, Linux, Terraform, and AWS failures immediately out-of-the-box without configuring any API keys or local runtimes!

---

## Code

{% github https://github.com/MdFaisalDevops/DEvfix-Ai %}

**Repository:** [https://github.com/MdFaisalDevops/DEvfix-Ai](https://github.com/MdFaisalDevops/DEvfix-Ai)  
**License:** MIT

---

## How I Built It

DevFix AI is engineered as a clean, decoupled full-stack application built around open-weight models:

```
┌────────────────────────────────┐       ┌────────────────────────────────┐
│   Next.js 15 + Tailwind CSS    │       │     Python 3.12 + FastAPI      │
│  - Client-Side PII Redactor    │ ────> │  - Multi-Platform Classifier   │
│  - Interactive Sample Library  │ <──── │  - JSON Schema-Enforced Prompt │
│  - Local Browser Audit History │       │  - Fallback Heuristic Engine   │
└────────────────────────────────┘       └──────────────┬─────────────────┘
                                                        │
                                                        ▼
                                         ┌────────────────────────────────┐
                                         │         Ollama Runtime         │
                                         │  - Llama 3.2 (3B) / Qwen 2.5   │
                                         │  - Mistral (7B) / DeepSeek R1  │
                                         └────────────────────────────────┘
```

### 1. Open-Source AI Stack
- **AI Runtime:** [Ollama](https://ollama.ai) for local and private-VPC inference.
- **Primary Models:**
  - `llama3.2:3b`: Ultra-fast triage and root-cause summaries on standard laptops (~4GB RAM).
  - `qwen2.5-coder:7b`: Deep code/script understanding for Kubernetes YAML, Dockerfiles, and Bash commands.
  - `mistral:7b`: Robust reasoning across Linux systemd services and Terraform state conflicts.
- **Structured Schema Prompting:** Uses Ollama's `format: "json"` mode with strict Pydantic schemas, ensuring the model never hallucinates fabricated commands or claims a fix was tested when it was not.

### 2. Frontend (Next.js 15 & Tailwind CSS v4)
- **Architecture:** App Router, TypeScript, and Lucide icons with a dark developer aesthetic (`#030712`).
- **Client-Side Secret & PII Redactor:** Pre-execution regex engine that strips AWS keys (`AKIA...`), database credentials (`postgres://user:pass@...`), personal access tokens (`ghp_...`), JWTs, and internal IPv4 addresses right in the browser before any network transmission.
- **Local Browser History:** Persists analysis reports in `localStorage` with filtering, keyword search, and JSON export.

### 3. Backend & Orchestration (FastAPI & Docker Compose)
- **FastAPI (Python 3.12):** Async endpoint pipeline (`/api/analyze`, `/api/redact`, `/api/models/status`, `/api/samples`, `/api/feedback`).
- **Docker Compose:** Multi-service composition spinning up the frontend, backend, and optional bundled Ollama container with a single command: `docker compose up --build`.

---

## Why Does Open Innovation Matter?

Open innovation is not just a philosophical preference for DevFix AI—**it is the architectural foundation that makes the product viable:**

1. **Air-Gapped & Offline Reliability:** When a core DNS provider or cloud WAN goes down, your troubleshooting assistant cannot depend on external SaaS connectivity. Open-weight models running on local hardware diagnose outages even during total internet blackouts.
2. **Eliminating the "Data Exfiltration Tax":** Many enterprise security teams ban cloud AI wrappers outright because logs contain proprietary intellectual property and credentials. Open-weight AI provides 100% compliance with zero third-party data egress.
3. **Economics for High-Volume DevOps:** Parsing a single 20,000-line crash dump through closed APIs costs real money on every run. Open weights deliver unlimited triage at $0 marginal token cost.
4. **Reproducibility Without Vendor Drift:** Closed APIs silently deprecate model versions and alter reasoning prompts. With open weights, you pin exact model hashes for consistent root-cause diagnosis.

---

## My Agent Session

This application was architected, written, and verified using Google's Antigravity Advanced Agentic Coding environment. The agent autonomously scaffolded the Next.js 15 frontend and FastAPI backend, created the regex secret redaction rules, wrote and passed 10/10 Pytest unit tests, set up Docker Compose, verified the browser end-to-end with visual recordings, resolved `.gitignore` exclusion issues, and committed/pushed the code directly to GitHub.

---

## My First User

During MVP testing, I shared DevFix AI with a DevOps engineer who was debugging a recurring `CrashLoopBackOff` on a payment microservice pod. 

- **The Problem:** The pod was intermittently terminating with `Exit Code 137`.
- **The Result:** DevFix AI detected the `OOMKilled` signal, cited the cgroup limit disparity (`512Mi` limit vs. JVM heap allocation spikes), and generated the exact read-only verification command:
  ```bash
  kubectl describe pod <pod-name> -n production
  kubectl top pod <pod-name> -n production --containers
  ```
  It recommended adjusting the memory limit to `1.5Gi` and configuring `JAVA_TOOL_OPTIONS='-XX:MaxRAMPercentage=75.0'` with a rolling update rollback command.
- **User Feedback:** *"The fact that it masks credentials before analysis and warns you to review commands before running them in production makes it 10x more trustworthy than blindly pasting logs into ChatGPT."*

---

## Prize Categories

- **Primary Track:** Side Hustle Challenge (Open-Source AI tools with viable developer product models)
- **Open-Weight AI:** Local & private inference using Ollama, Llama 3, and Qwen 2.5 Coder
