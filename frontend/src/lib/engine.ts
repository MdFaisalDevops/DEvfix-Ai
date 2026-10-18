import { AnalysisResult, DiagnosticCommand, RollbackPrecaution, Technology } from '@/types';
import { SAMPLE_ERRORS } from './samples';
import { redactSensitiveData } from './redactor';

export function runClientDeterministicAnalysis(
  rawLog: string,
  hintTech: Technology = 'auto',
  redact: boolean = true
): AnalysisResult {
  const startTime = performance.now();
  const id = `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const nowIso = new Date().toISOString();

  // 1. Redact secrets
  let processedLog = rawLog;
  let redactedCount = 0;
  let redactedCategories: string[] = [];
  if (redact) {
    const red = redactSensitiveData(rawLog);
    processedLog = red.redactedText;
    redactedCount = red.totalRedactions;
    redactedCategories = red.categoriesFound;
  }

  const logLower = processedLog.toLowerCase();

  // 2. Match against curated samples first
  for (const sample of SAMPLE_ERRORS) {
    if (processedLog.includes(sample.id) || processedLog.includes(sample.log.slice(0, 60))) {
      const d = sample.deterministic_analysis || {};
      return {
        id,
        timestamp: nowIso,
        detected_technology: sample.technology,
        detected_category: sample.category,
        severity: sample.severity,
        confidence: (d.confidence as any) || 'high',
        confidence_score: d.confidence_score || 0.98,
        summary: d.summary || `Identified error in ${sample.technology}.`,
        likely_root_cause: d.likely_root_cause || 'Root cause detailed in diagnostic report.',
        evidence: d.evidence || [],
        safe_diagnostic_commands: (d.safe_diagnostic_commands as DiagnosticCommand[]) || [],
        suggested_remediation: d.suggested_remediation || [],
        rollback_precautions: (d.rollback_precautions as RollbackPrecaution[]) || [],
        insufficient_logs: false,
        missing_information_request: null,
        redacted_items_count: redactedCount,
        redacted_categories: redactedCategories,
        inference_source: 'deterministic_demo',
        model_used: 'devfix-deterministic-v1',
        execution_time_ms: Math.round(performance.now() - startTime)
      };
    }
  }

  // 3. Classify Technology
  let detectedTech: Technology = 'generic';
  if (hintTech && hintTech !== 'auto') {
    detectedTech = hintTech;
  } else {
    if (logLower.includes('kube') || logLower.includes('pod') || logLower.includes('crashloopbackoff') || logLower.includes('oomkilled')) {
      detectedTech = 'kubernetes';
    } else if (logLower.includes('docker') || logLower.includes('userland proxy') || logLower.includes('dockerd')) {
      detectedTech = 'docker';
    } else if (logLower.includes('jenkins') || logLower.includes('[pipeline]') || logLower.includes('hudson')) {
      detectedTech = 'jenkins';
    } else if (logLower.includes('terraform') || logLower.includes('state lock') || logLower.includes('tfstate')) {
      detectedTech = 'terraform';
    } else if (logLower.includes('aws') || logLower.includes('s3') || logLower.includes('botocore') || logLower.includes('iam::')) {
      detectedTech = 'aws';
    } else if (logLower.includes('systemd') || logLower.includes('nginx') || logLower.includes('kernel:') || logLower.includes('permission denied')) {
      detectedTech = 'linux';
    }
  }

  // 4. Classify Category
  let category = 'GeneralError';
  if (logLower.includes('oom') || logLower.includes('memory') || logLower.includes('exit code 137')) category = 'ResourceExhaustion';
  else if (logLower.includes('bind') || logLower.includes('address already in use') || logLower.includes('refused') || logLower.includes('timeout')) category = 'Networking';
  else if (logLower.includes('denied') || logLower.includes('forbidden') || logLower.includes('unauthorized') || logLower.includes('403')) category = 'PermissionDenied';
  else if (logLower.includes('lock') || logLower.includes('conditionalcheck')) category = 'StateLock';
  else if (logLower.includes('syntax') || logLower.includes('invalid') || logLower.includes('not found')) category = 'ConfigurationError';

  // 5. Check if log is insufficient
  const lines = processedLog.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length <= 2 && processedLog.trim().length < 80) {
    return {
      id,
      timestamp: nowIso,
      detected_technology: detectedTech,
      detected_category: category,
      severity: 'medium',
      confidence: 'low',
      confidence_score: 0.42,
      summary: `Identified a potential ${detectedTech} ${category} condition, but log lines are insufficient to guarantee root cause isolation.`,
      likely_root_cause: 'The input log contains only an isolated error string without surrounding execution context, PID timestamps, or stack traces.',
      evidence: lines.length > 0 ? [lines[0]] : ['No significant log lines provided.'],
      safe_diagnostic_commands: [
        {
          command: detectedTech === 'kubernetes' ? 'kubectl logs <pod-name> --previous --tail=100' :
                   detectedTech === 'docker' ? 'docker logs --tail=100 <container-name>' :
                   detectedTech === 'linux' ? 'journalctl -xe --no-pager -n 100' :
                   'tail -n 100 /var/log/application.log',
          purpose: 'Capture surrounding log events and preceding application traces',
          is_safe_read_only: true,
          requires_sudo: false,
          expected_output: 'Preceding 100 lines with timestamps and stack traces'
        }
      ],
      suggested_remediation: [
        'Collect full stdout and stderr streams from the failing container/host.',
        'Ensure debug or verbose logging is enabled temporarily during replication.',
        'Review recent deployment commits or environment configuration drift.'
      ],
      rollback_precautions: [
        {
          action: 'Applying remediation without full logs',
          risk_level: 'low',
          precaution: 'Avoid destructive restarts until diagnostic logs have been preserved.'
        }
      ],
      insufficient_logs: true,
      missing_information_request: `Please provide more context or run '${detectedTech === 'kubernetes' ? 'kubectl logs <pod> --previous' : 'docker logs <container>'}' to extract the full error stack.`,
      redacted_items_count: redactedCount,
      redacted_categories: redactedCategories,
      inference_source: 'deterministic_demo',
      model_used: 'devfix-deterministic-v1',
      execution_time_ms: Math.round(performance.now() - startTime)
    };
  }

  // 6. Generic synthesis
  const evidence: string[] = [];
  for (const line of lines) {
    const l = line.toLowerCase();
    if (l.includes('error') || l.includes('fatal') || l.includes('failed') || l.includes('exception') || l.includes('denied') || l.includes('killed')) {
      if (line.length <= 160) evidence.push(line);
    }
    if (evidence.length >= 3) break;
  }
  if (evidence.length === 0 && lines.length > 0) evidence.push(lines[0]);

  const safeCommands: DiagnosticCommand[] = [];
  if (detectedTech === 'kubernetes') {
    safeCommands.push({
      command: 'kubectl get events --sort-by=.metadata.creationTimestamp -A | tail -n 20',
      purpose: 'View the latest cluster-wide Kubernetes events',
      is_safe_read_only: true,
      requires_sudo: false,
      expected_output: 'Recent Warning and Normal events'
    });
    safeCommands.push({
      command: 'kubectl describe pod <failing-pod-name>',
      purpose: 'Check pod lifecycle states, restart counts, and container termination codes',
      is_safe_read_only: true,
      requires_sudo: false,
      expected_output: 'Pod status with exit code and reason'
    });
  } else if (detectedTech === 'docker') {
    safeCommands.push({
      command: 'docker ps -a --filter status=exited',
      purpose: 'List crashed or stopped containers and exit codes',
      is_safe_read_only: true,
      requires_sudo: false,
      expected_output: 'List of exited containers with timestamps'
    });
    safeCommands.push({
      command: 'docker inspect <container-name> | grep -iE "error|exitcode|oom"',
      purpose: 'Inspect container failure details directly from daemon',
      is_safe_read_only: true,
      requires_sudo: false,
      expected_output: 'ExitCode and error text'
    });
  } else {
    safeCommands.push({
      command: 'uptime && free -h',
      purpose: 'Check system load average and available RAM',
      is_safe_read_only: true,
      requires_sudo: false,
      expected_output: 'System load and memory metrics'
    });
    safeCommands.push({
      command: 'df -h',
      purpose: 'Check disk storage capacity on host mount points',
      is_safe_read_only: true,
      requires_sudo: false,
      expected_output: 'Mount usage percentages below 90%'
    });
  }

  return {
    id,
    timestamp: nowIso,
    detected_technology: detectedTech,
    detected_category: category,
    severity: 'high',
    confidence: evidence.length >= 2 ? 'high' : 'medium',
    confidence_score: evidence.length >= 2 ? 0.89 : 0.74,
    summary: `Identified an infrastructure ${category} event in ${detectedTech.toUpperCase()} system.`,
    likely_root_cause: `The process triggered a failure condition related to ${category}. Detected signals: ${evidence.join(' | ')}.`,
    evidence,
    safe_diagnostic_commands: safeCommands,
    suggested_remediation: [
      `Inspect the ${detectedTech} resource configuration and allocate sufficient capacity.`,
      'Verify network endpoints and firewall access rules for connected dependencies.',
      'Review environment variables and configuration files for typos or expired credentials.'
    ],
    rollback_precautions: [
      {
        action: `Applying updates to ${detectedTech} service`,
        risk_level: 'medium',
        precaution: 'Ensure deployment rollbacks or snapshot backups are verified prior to restarting services in production.'
      }
    ],
    insufficient_logs: false,
    missing_information_request: null,
    redacted_items_count: redactedCount,
    redacted_categories: redactedCategories,
    inference_source: 'deterministic_demo',
    model_used: 'devfix-deterministic-v1',
    execution_time_ms: Math.round(performance.now() - startTime)
  };
}
