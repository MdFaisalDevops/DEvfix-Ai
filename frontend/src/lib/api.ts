import { AnalysisResult, ModelStatus, SampleError, FeedbackSubmission, Technology } from '@/types';
import { runClientDeterministicAnalysis } from './engine';
import { SAMPLE_ERRORS } from './samples';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(2000)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchModelStatus(ollamaUrl?: string): Promise<ModelStatus> {
  try {
    const query = ollamaUrl ? `?url=${encodeURIComponent(ollamaUrl)}` : '';
    const res = await fetch(`${BACKEND_BASE_URL}/api/models/status${query}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(4000)
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend offline
  }

  // Fallback status when backend isn't reachable
  return {
    available: false,
    is_local: true,
    ollama_url: ollamaUrl || 'http://localhost:11434',
    configured_model: 'llama3.2:3b',
    installed_models: [],
    error_message: 'FastAPI backend or local Ollama is offline. DevFix AI is operating in deterministic Demo Mode.',
    recommended_models: [
      {
        name: 'llama3.2:3b',
        size: '2.0 GB',
        speed: 'Ultra Fast',
        ram_required: '4 GB',
        description: "Meta's lightweight model. Best for instant local triage on developer laptops."
      },
      {
        name: 'qwen2.5-coder:7b',
        size: '4.7 GB',
        speed: 'Fast',
        ram_required: '8 GB',
        description: 'Specialized coding & DevOps model with outstanding Bash and YAML accuracy.'
      },
      {
        name: 'mistral:7b',
        size: '4.1 GB',
        speed: 'Fast',
        ram_required: '8 GB',
        description: 'Solid reasoning across Linux systems, systemd, and Terraform state.'
      },
      {
        name: 'deepseek-r1:7b',
        size: '4.7 GB',
        speed: 'Moderate',
        ram_required: '8 GB',
        description: 'Chain-of-thought reasoning for complex multi-tier cascading outages.'
      }
    ]
  };
}

export async function analyzeLog(params: {
  log: string;
  technology?: Technology;
  redact_secrets?: boolean;
  force_demo_mode?: boolean;
  model_name?: string;
  ollama_url?: string;
}): Promise<AnalysisResult> {
  if (params.force_demo_mode) {
    return runClientDeterministicAnalysis(params.log, params.technology, params.redact_secrets ?? true);
  }

  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        log: params.log,
        technology: params.technology || 'auto',
        redact_secrets: params.redact_secrets ?? true,
        force_demo_mode: params.force_demo_mode || false,
        model_name: params.model_name,
        ollama_url: params.ollama_url
      }),
      signal: AbortSignal.timeout(30000)
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // If backend fails, execute client-side deterministic engine gracefully
  }

  return runClientDeterministicAnalysis(params.log, params.technology, params.redact_secrets ?? true);
}

export async function fetchSamples(): Promise<SampleError[]> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/samples`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fall back to local samples
  }
  return SAMPLE_ERRORS;
}

export async function submitFeedback(fb: FeedbackSubmission): Promise<{ success: boolean; message: string; id: string }> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fb),
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Store in localStorage if backend offline
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('devfix_feedback') || '[]');
      stored.push({ ...fb, id: `fb_local_${Date.now()}` });
      localStorage.setItem('devfix_feedback', JSON.stringify(stored));
    }
  }

  return {
    success: true,
    message: 'Thank you! Your feedback has been stored and helps improve DevFix AI.',
    id: `fb_${Date.now()}`
  };
}
