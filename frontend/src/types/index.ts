export type Technology = 'kubernetes' | 'docker' | 'jenkins' | 'linux' | 'terraform' | 'aws' | 'generic' | 'auto';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type Confidence = 'low' | 'medium' | 'high';

export interface DiagnosticCommand {
  command: string;
  purpose: string;
  is_safe_read_only: boolean;
  requires_sudo: boolean;
  expected_output: string;
}

export interface RollbackPrecaution {
  action: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  precaution: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  detected_technology: Technology | string;
  detected_category: string;
  severity: Severity;
  confidence: Confidence;
  confidence_score: number;
  summary: string;
  likely_root_cause: string;
  evidence: string[];
  safe_diagnostic_commands: DiagnosticCommand[];
  suggested_remediation: string[];
  rollback_precautions: RollbackPrecaution[];
  insufficient_logs: boolean;
  missing_information_request?: string | null;
  redacted_items_count: number;
  redacted_categories?: string[];
  inference_source: 'local_ollama' | 'remote_ollama' | 'deterministic_demo';
  model_used: string;
  execution_time_ms: number;
}

export interface SampleError {
  id: string;
  title: string;
  technology: Technology;
  category: string;
  severity: Severity;
  description: string;
  log: string;
  deterministic_analysis?: Partial<AnalysisResult>;
}

export interface ModelStatus {
  available: boolean;
  is_local: boolean;
  ollama_url: string;
  configured_model: string;
  installed_models: string[];
  error_message?: string | null;
  recommended_models: Array<{
    name: string;
    size: string;
    speed: string;
    ram_required: string;
    description: string;
  }>;
}

export interface FeedbackSubmission {
  category: string;
  rating: number;
  message: string;
  email?: string;
  log_sample_included?: boolean;
}
