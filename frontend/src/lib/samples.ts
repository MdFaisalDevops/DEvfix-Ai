import { SampleError } from '@/types';

export const SAMPLE_ERRORS: SampleError[] = [
  {
    id: 'k8s-oomkilled',
    title: 'Kubernetes Pod CrashLoopBackOff (OOMKilled)',
    technology: 'kubernetes',
    category: 'ResourceExhaustion',
    severity: 'critical',
    description: 'Payment service microservice terminated with ExitCode 137 due to Linux cgroup memory limit violations under high load.',
    log: `2026-10-18T10:14:22.418Z [payment-service-7d84fbb756-x9kl2] INFO: Processing batch transaction batch_id=89211 node_ip=192.168.44.12
2026-10-18T10:14:25.102Z [payment-service-7d84fbb756-x9kl2] WARN: JVM garbage collection pause 2400ms exceeding threshold
2026-10-18T10:14:26.004Z [payment-service-7d84fbb756-x9kl2] java.lang.OutOfMemoryError: Java heap space
2026-10-18T10:14:26.115Z [payment-service-7d84fbb756-x9kl2] Dumping heap to java_pid1.hprof ...
2026-10-18T10:14:27.000Z kubelet node-worker-pool-2: Container payment-service in pod payment-service-7d84fbb756-x9kl2_production(4f21ab-881c) was terminated
State:          Terminated
  Reason:       OOMKilled
  Exit Code:    137
  Started:      Sun, 18 Oct 2026 10:10:00 UTC
  Finished:     Sun, 18 Oct 2026 10:14:27 UTC
Ready:          False
Restart Count:  5
Limits:
  cpu:     2
  memory:  512Mi
Requests:
  cpu:     500m
  memory:  256Mi
Last State:     Terminated
  Reason:       OOMKilled
  Exit Code:    137
Events:
  Warning  BackOff   15s (x8 over 3m)  kubelet  Back-off restarting failed container payment-service in pod payment-service-7d84fbb756-x9kl2_production
Database connection token: postgres://app_user:dbSecretPass998@10.0.12.44:5432/payments`,
    deterministic_analysis: {
      summary: 'Payment service pod is repeatedly killed with Exit Code 137 (OOMKilled) because heap consumption exceeded the Kubernetes cgroup 512Mi memory limit.',
      likely_root_cause: 'The JVM heap allocation combined with batch transaction spikes exceeded the container memory limit (512Mi). Kubernetes kubelet terminated the process via SIGKILL (128 + 9 = 137).',
      evidence: [
        'Reason: OOMKilled',
        'Exit Code: 137',
        'java.lang.OutOfMemoryError: Java heap space',
        'Limits: memory: 512Mi vs Requests: memory: 256Mi'
      ],
      safe_diagnostic_commands: [
        {
          command: 'kubectl describe pod payment-service-7d84fbb756-x9kl2 -n production',
          purpose: 'Inspect pod termination reasons, restart counters, and kubelet event stream',
          is_safe_read_only: true,
          requires_sudo: false,
          expected_output: "Check 'Last State: Terminated Reason: OOMKilled' and events section"
        },
        {
          command: 'kubectl top pod payment-service-7d84fbb756-x9kl2 -n production --containers',
          purpose: 'Check active memory and CPU utilization of each container in the pod',
          is_safe_read_only: true,
          requires_sudo: false,
          expected_output: 'Memory usage close to 512Mi cap'
        },
        {
          command: 'kubectl logs payment-service-7d84fbb756-x9kl2 -n production --previous --tail=100',
          purpose: 'View log output right before the last container crash',
          is_safe_read_only: true,
          requires_sudo: false,
          expected_output: 'Stack trace preceding the SIGKILL'
        }
      ],
      suggested_remediation: [
        'Increase container memory limit in the deployment manifest from 512Mi to at least 1.5Gi (e.g. resources.limits.memory: 1536Mi).',
        "Configure JVM memory parameters inside container using JAVA_TOOL_OPTIONS='-XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError'.",
        'Implement batch size throttling or pagination for transaction batch processing (batch_id=89211) to avoid unbounded in-memory collection buildup.',
        'Deploy a HorizontalPodAutoscaler (HPA) targeting 70% average memory utilization.'
      ],
      rollback_precautions: [
        {
          action: 'Applying modified deployment manifest',
          risk_level: 'medium',
          precaution: "Perform rolling update with maxUnavailable: 1. Keep previous deployment revision handy: 'kubectl rollout undo deployment/payment-service -n production'."
        },
        {
          action: 'Altering JVM flags',
          risk_level: 'low',
          precaution: 'Validate JVM flags in staging environment first to verify GC pause times do not degrade latency.'
        }
      ],
      confidence: 'high',
      confidence_score: 0.98,
      insufficient_logs: false
    }
  },
  {
    id: 'docker-port-conflict',
    title: 'Docker Port Bind Failure & Zombie Daemon State',
    technology: 'docker',
    category: 'Networking',
    severity: 'high',
    description: 'Docker container fails to start due to host port 8080 already bound by another process or abandoned socket.',
    log: `Creating network "ecommerce_default" with the default driver
Creating ecommerce_api_1 ... error
ERROR: for ecommerce_api_1  Cannot start service api: driver failed programming external connectivity on endpoint ecommerce_api_1 (98d21c3b12): Error starting userland proxy: listen tcp4 0.0.0.0:8080: bind: address already in use

Encountered errors while bringing up the project.
Host IP: 192.168.1.105
API Key in env: client_secret='sk_live_99834812739182379182'
Container inspection:
  "State": {
      "Status": "created",
      "Running": false,
      "Paused": false,
      "Restarting": false,
      "OOMKilled": false,
      "Dead": false,
      "Pid": 0,
      "ExitCode": 128,
      "Error": "driver failed programming external connectivity on endpoint ecommerce_api_1: bind: address already in use"
  }`,
    deterministic_analysis: {
      summary: "Docker Compose service 'api' cannot start because host port 8080 is already occupied by another running container or system process.",
      likely_root_cause: 'The userland proxy failed to bind tcp4 0.0.0.0:8080 (errno 98: EADDRINUSE). Another instance of the application or an unstopped container is holding socket 8080.',
      evidence: [
        'listen tcp4 0.0.0.0:8080: bind: address already in use',
        'Error starting userland proxy',
        'ExitCode: 128'
      ],
      safe_diagnostic_commands: [
        {
          command: 'sudo lsof -i :8080 -sTCP:LISTEN -P -n',
          purpose: 'Identify which process PID and program name is currently listening on port 8080',
          is_safe_read_only: true,
          requires_sudo: true,
          expected_output: 'COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME (e.g., node, docker-proxy, java)'
        },
        {
          command: "docker ps --filter 'publish=8080' --format 'table {{.ID}}\\t{{.Names}}\\t{{.Status}}\\t{{.Ports}}'",
          purpose: 'Check if an existing Docker container already claims port 8080',
          is_safe_read_only: true,
          requires_sudo: false,
          expected_output: 'List of running containers with port 8080 mapped'
        },
        {
          command: 'sudo ss -tulpn | grep :8080',
          purpose: 'Socket statistics verification on host network stack',
          is_safe_read_only: true,
          requires_sudo: true,
          expected_output: 'Socket inode and owner process'
        }
      ],
      suggested_remediation: [
        "Terminate the stale process currently bound to port 8080 using 'kill -15 <PID>', or stop conflicting containers with 'docker stop <container_name>'.",
        "Alternatively, change the host port mapping in docker-compose.yml to an unused port (e.g. '8081:8080').",
        "If no process appears in lsof but Docker still reports bind error, restart Docker daemon: 'sudo systemctl restart docker'."
      ],
      rollback_precautions: [
        {
          action: 'Killing process listening on 8080',
          risk_level: 'medium',
          precaution: 'Verify process name before killing to avoid accidentally killing a production database or critical ingress router.'
        }
      ],
      confidence: 'high',
      confidence_score: 0.96,
      insufficient_logs: false
    }
  },
  {
    id: 'jenkins-npm-oom',
    title: 'Jenkins CI Pipeline Failure (Node.js Heap OOM & Token Leak)',
    technology: 'jenkins',
    category: 'BuildFailure',
    severity: 'high',
    description: 'Jenkins build pipeline aborts during Webpack / Vite build step due to V8 heap memory limit exhaustion in CI agent.',
    log: `[Pipeline] stage (Build Web Assets)
[Pipeline] sh
+ npm run build:production
> client-portal@3.4.0 build:production
> vite build --mode production

vite v5.2.0 building for production...
transforming (1842) src/components/Dashboard.tsx
<--- Last few GCs --->
[3412:0x55dc98a12000]    42102 ms: Mark-sweep (reduce) 2038.4 (2080.1) -> 2037.1 (2081.2) MB, 812.4 / 0.0 ms  (average mu = 0.124, current mu = 0.003) allocation failure; scavenge might not succeed
[3412:0x55dc98a12000]    43015 ms: Mark-sweep (reduce) 2038.8 (2081.2) -> 2038.0 (2081.7) MB, 912.8 / 0.0 ms  (average mu = 0.062, current mu = 0.001) allocation failure; scavenge might not succeed

<--- JS stacktrace --->
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
 1: 0xb79990 node::Abort() [node]
 2: 0xa8d76b node::FatalError(char const*, char const*) [node]
 3: 0xd3840e v8::Utils::ReportOOMFailure(v8::internal::Isolate*, char const*, bool) [node]
 4: 0xd38787 v8::internal::V8::FatalProcessOutOfMemory(v8::internal::Isolate*, char const*, bool) [node]

Build step 'Execute shell' marked build as failure
CI Auth Token leaked in job env: ghp_119823481239847129837198237491823741
Finished: FAILURE`,
    deterministic_analysis: {
      summary: 'Jenkins build stage aborted because Node.js reached its default 2GB V8 heap allocation limit during the production asset bundling step.',
      likely_root_cause: 'Node.js runs with a default max-old-space-size of approximately 2048MB in 64-bit environments. Memory-heavy AST transformation and tree-shaking exceeded this boundary.',
      evidence: [
        'FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory',
        'Mark-sweep (reduce) 2038.8 -> 2038.0 MB allocation failure',
        'Finished: FAILURE'
      ],
      safe_diagnostic_commands: [
        {
          command: "node -e 'console.log(v8.getHeapStatistics())'",
          purpose: 'Check default V8 heap limits on the CI agent node',
          is_safe_read_only: true,
          requires_sudo: false,
          expected_output: 'heap_size_limit in bytes'
        },
        {
          command: 'free -h',
          purpose: 'Check total available physical RAM and swap space on the Jenkins CI executor',
          is_safe_read_only: true,
          requires_sudo: false,
          expected_output: 'Mem: total, used, free, available'
        }
      ],
      suggested_remediation: [
        "Increase Node.js memory limit in the Jenkinsfile sh step: 'NODE_OPTIONS=\"--max-old-space-size=4096\" npm run build:production'.",
        'CRITICAL SECURITY: Revoke and rotate the exposed GitHub token (ghp_...) immediately via GitHub Settings > Developer Settings > Personal Access Tokens.',
        'Ensure Jenkins credentials are injected using withCredentials([string(credentialsId: "gh-token", variable: "GH_TOKEN")]) and masked from console logs.',
        'Split bulky client-portal chunks or dynamic import heavy third-party visualization libraries to minimize bundler peak memory.'
      ],
      rollback_precautions: [
        {
          action: 'Increasing NODE_OPTIONS in Jenkinsfile',
          risk_level: 'low',
          precaution: 'Ensure underlying Jenkins worker has at least 5GB RAM available to prevent worker kernel OOM killing.'
        }
      ],
      confidence: 'high',
      confidence_score: 0.99,
      insufficient_logs: false
    }
  },
  {
    id: 'linux-systemd-nginx',
    title: 'Linux Systemd Nginx Service Startup Failure',
    technology: 'linux',
    category: 'ServiceCrash',
    severity: 'high',
    description: 'Nginx systemd service unit enters failed state (code=exited, status=1/FAILURE) due to SSL certificate permission and configuration syntax errors.',
    log: `Oct 18 10:20:11 production-web-01 systemd[1]: Starting A high performance web server and a reverse proxy server...
Oct 18 10:20:11 production-web-01 nginx[14920]: nginx: [emerg] cannot load certificate "/etc/ssl/certs/app.production.crt": BIO_new_file() failed (SSL: error:0200100D:system library:fopen:Permission denied:fopen('/etc/ssl/certs/app.production.crt','r') error:2006D002:BIO routines:BIO_new_file:system lib)
Oct 18 10:20:11 production-web-01 nginx[14920]: nginx: configuration file /etc/nginx/nginx.conf test failed
Oct 18 10:20:11 production-web-01 systemd[1]: nginx.service: Control process exited, code=exited, status=1/FAILURE
Oct 18 10:20:11 production-web-01 systemd[1]: nginx.service: Failed with result 'exit-code'.
Oct 18 10:20:11 production-web-01 systemd[1]: Failed to start A high performance web server and a reverse proxy server.
Server IP: 198.51.100.42
Admin Contact: devops-admin@enterprise-cloud.io`,
    deterministic_analysis: {
      summary: "Nginx fails configuration test and cannot start because the SSL certificate file '/etc/ssl/certs/app.production.crt' has restrictive file permissions or incorrect SELinux/AppArmor context.",
      likely_root_cause: 'The worker or master process cannot read the certificate file due to Linux filesystem permissions (fopen: Permission denied, error:0200100D).',
      evidence: [
        'cannot load certificate "/etc/ssl/certs/app.production.crt": BIO_new_file() failed',
        'fopen:Permission denied',
        'nginx: configuration file /etc/nginx/nginx.conf test failed',
        'code=exited, status=1/FAILURE'
      ],
      safe_diagnostic_commands: [
        {
          command: 'sudo ls -la /etc/ssl/certs/app.production.crt',
          purpose: 'Verify file ownership, group permissions, and read bits of the certificate',
          is_safe_read_only: true,
          requires_sudo: true,
          expected_output: '-rw-r--r-- 1 root root ... or restrictive permissions'
        },
        {
          command: 'sudo nginx -t',
          purpose: 'Test Nginx configuration syntax and output detailed file failure paths',
          is_safe_read_only: true,
          requires_sudo: true,
          expected_output: 'Configuration test output with line numbers'
        },
        {
          command: 'sudo ls -lZd /etc/ssl/certs/app.production.crt',
          purpose: 'Check SELinux security context label if running on RHEL / Rocky / AlmaLinux',
          is_safe_read_only: true,
          requires_sudo: true,
          expected_output: 'cert_t context'
        }
      ],
      suggested_remediation: [
        "Grant read permissions to the certificate file: 'sudo chmod 644 /etc/ssl/certs/app.production.crt'.",
        "Ensure parent directory /etc/ssl/certs has execute permission: 'sudo chmod 755 /etc/ssl/certs'.",
        "If using SELinux, restore default file security context: 'sudo restorecon -v /etc/ssl/certs/app.production.crt'.",
        "Test configuration again using 'sudo nginx -t' and restart with 'sudo systemctl restart nginx'."
      ],
      rollback_precautions: [
        {
          action: 'Modifying permissions of SSL certificates',
          risk_level: 'low',
          precaution: 'Keep private keys (.key) strictly chmod 600 or 640 owned by root:ssl-cert; do not make private keys world-readable.'
        }
      ],
      confidence: 'high',
      confidence_score: 0.97,
      insufficient_logs: false
    }
  },
  {
    id: 'terraform-state-lock',
    title: 'Terraform AWS DynamoDB State Lock Acquisition Failure',
    technology: 'terraform',
    category: 'StateLock',
    severity: 'medium',
    description: 'Terraform plan/apply fails because another CI run or crashed process did not release the DynamoDB backend state lock.',
    log: `Acquiring state lock. This may take a few moments...
╷
│ Error: Error acquiring the state lock
│ 
│   Error message: ConditionalCheckFailedException: The conditional request failed
│   Lock Info:
│     ID:        3b9d0e12-421f-891a-8b1a-912c3f848123
│     Path:      tf-state-production/infrastructure/vpc.tfstate
│     Operation: OperationTypeApply
│     Who:       circleci@runner-prod-04
│     Version:   1.7.5
│     Created:   2026-10-18 09:30:14.238192 UTC
│     Info:      
│ 
│ Terraform acquires a state lock to protect the state from being written
│ by multiple users at the same time. Please resolve the issue above and try
│ again. For most operations, you can force-unlock using:
│   terraform force-unlock 3b9d0e12-421f-891a-8b1a-912c3f848123
╵
AWS Account: arn:aws:iam::123456789012:role/terraform-ci-deployer
AWS Access Key: AKIAIOSFODNN7EXAMPLE`,
    deterministic_analysis: {
      summary: 'Terraform execution halted because the S3/DynamoDB remote state lock was already held by an earlier CircleCI build run that either crashed or timed out.',
      likely_root_cause: 'A previous run (Lock ID: 3b9d0e12-421f-891a-8b1a-912c3f848123 on runner-prod-04) held the DynamoDB lock and terminated without cleanly running the lock release lifecycle hook.',
      evidence: [
        'Error acquiring the state lock',
        'ConditionalCheckFailedException: The conditional request failed',
        'ID: 3b9d0e12-421f-891a-8b1a-912c3f848123',
        'Operation: OperationTypeApply by circleci@runner-prod-04'
      ],
      safe_diagnostic_commands: [
        {
          command: "aws dynamodb get-item --table-name tf-locks-production --key '{\"LockID\": {\"S\": \"tf-state-production/infrastructure/vpc.tfstate\"}}'",
          purpose: 'Verify lock metadata, timestamp, and lock owner directly in DynamoDB',
          is_safe_read_only: true,
          requires_sudo: false,
          expected_output: 'JSON containing LockInfo attribute with creation time and holder details'
        },
        {
          command: 'aws s3 ls s3://tf-state-production/infrastructure/vpc.tfstate',
          purpose: 'Check last modified timestamp of current statefile to ensure no concurrent write took place',
          is_safe_read_only: true,
          requires_sudo: false,
          expected_output: 'State file timestamp'
        }
      ],
      suggested_remediation: [
        'Verify with the team and CI logs that CircleCI job on runner-prod-04 is truly inactive and not actively writing infrastructure.',
        "Force unlock the orphaned state lock using the safe ID: 'terraform force-unlock 3b9d0e12-421f-891a-8b1a-912c3f848123'.",
        "Re-run 'terraform plan' to verify that remote state is intact before running apply.",
        'Add a CI pipeline timeout and post-execution trap handler in CircleCI config to unlock automatically on abort.'
      ],
      rollback_precautions: [
        {
          action: 'Running terraform force-unlock',
          risk_level: 'high',
          precaution: 'NEVER run force-unlock while another engineer or CI job is actively applying changes; state corruption will occur if two processes write concurrently.'
        }
      ],
      confidence: 'high',
      confidence_score: 0.99,
      insufficient_logs: false
    }
  },
  {
    id: 'aws-s3-access-denied',
    title: 'AWS S3 / IAM PutObject Access Denied (Missing KMS Decrypt)',
    technology: 'aws',
    category: 'IAMPolicy',
    severity: 'high',
    description: 'Application fails to upload encrypted data objects to S3 bucket due to missing kms:GenerateDataKey or s3:PutObject permissions in IAM role policy.',
    log: `[2026-10-18 10:24:55,102] ERROR [data_sync_worker] Failed to sync telemetry bundle to s3://corp-analytics-lake-prod/2026/10/18/bundle-991.parquet
Traceback (most recent call last):
  File "/opt/analytics/worker.py", line 144, in sync_to_s3
    s3_client.put_object(
  File "/usr/local/lib/python3.11/site-packages/botocore/client.py", line 565, in _api_call
    return self._make_api_call(operation_name, kwargs)
  File "/usr/local/lib/python3.11/site-packages/botocore/client.py", line 1021, in _make_api_call
    raise ClientError(parsed_response, operation_name)
botocore.exceptions.ClientError: An error occurred (AccessDenied) when calling the PutObject operation: Access Denied
Extended Request ID: 41k9aB02919xZlq82718==
Host ID: s3.us-east-1.amazonaws.com
Target Bucket: corp-analytics-lake-prod (KMS Key: arn:aws:kms:us-east-1:123456789012:key/a1b2c3d4-e5f6-7890-1234-567890abcdef)
Executing IAM Role: arn:aws:iam::123456789012:role/AnalyticsTelemetryWorkerRole
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE`,
    deterministic_analysis: {
      summary: "Analytics telemetry worker received AccessDenied (403) while invoking s3:PutObject on 'corp-analytics-lake-prod', caused by missing KMS key permissions or an explicit S3 bucket policy denial.",
      likely_root_cause: "The destination bucket enforces SSE-KMS server-side encryption with key 'a1b2c3d4-...'. The IAM role 'AnalyticsTelemetryWorkerRole' has s3:PutObject permissions but lacks 'kms:GenerateDataKey' and 'kms:Encrypt' permissions in the KMS key policy.",
      evidence: [
        'botocore.exceptions.ClientError: An error occurred (AccessDenied) when calling the PutObject operation: Access Denied',
        'KMS Key: arn:aws:kms:us-east-1:*:key/a1b2c3d4-e5f6-7890-1234-567890abcdef',
        'Executing IAM Role: arn:aws:iam:*:role/AnalyticsTelemetryWorkerRole'
      ],
      safe_diagnostic_commands: [
        {
          command: 'aws s3api get-bucket-encryption --bucket corp-analytics-lake-prod',
          purpose: 'Verify default bucket encryption algorithm and KMS Key ID',
          is_safe_read_only: true,
          requires_sudo: false,
          expected_output: 'ServerSideEncryptionConfiguration JSON with aws:kms details'
        },
        {
          command: 'aws kms get-key-policy --key-id a1b2c3d4-e5f6-7890-1234-567890abcdef --policy-name default --output json',
          purpose: 'Inspect KMS Key Policy to verify if AnalyticsTelemetryWorkerRole is listed under allowed principals',
          is_safe_read_only: true,
          requires_sudo: false,
          expected_output: 'Key policy Statement JSON'
        },
        {
          command: 'aws iam simulate-principal-policy --policy-source-arn arn:aws:iam::123456789012:role/AnalyticsTelemetryWorkerRole --action-names s3:PutObject kms:GenerateDataKey --resource-arns arn:aws:s3:::corp-analytics-lake-prod/* arn:aws:kms:us-east-1:123456789012:key/a1b2c3d4-e5f6-7890-1234-567890abcdef',
          purpose: 'Simulate IAM policy evaluation against S3 object and KMS key without changing any resources',
          is_safe_read_only: true,
          requires_sudo: false,
          expected_output: 'EvaluationResults showing allowed or implicitDeny / explicitDeny'
        }
      ],
      suggested_remediation: [
        "Update the AWS KMS Key Policy or IAM role policy to grant 'kms:GenerateDataKey' and 'kms:Decrypt' on key 'arn:aws:kms:us-east-1:...:key/a1b2c3d4-e5f6-7890-1234-567890abcdef'.",
        "Check S3 Bucket Policy on 'corp-analytics-lake-prod' for Deny statements checking aws:PrincipalArn or aws:SecureTransport.",
        "Ensure the put_object request includes ServerSideEncryption='aws:kms' and SSEKMSKeyId if enforced by bucket policy."
      ],
      rollback_precautions: [
        {
          action: 'Updating KMS Key Policy',
          risk_level: 'medium',
          precaution: 'Never remove root account administration permissions from KMS key policy, or the key can become permanently unmanageable.'
        }
      ],
      confidence: 'high',
      confidence_score: 0.95,
      insufficient_logs: false
    }
  }
];
