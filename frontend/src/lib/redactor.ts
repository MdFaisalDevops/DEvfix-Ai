export interface RedactionRule {
  name: string;
  pattern: RegExp;
  replacement: string;
}

export const REDACTION_RULES: RedactionRule[] = [
  {
    name: 'AWS Access Key ID',
    pattern: /\b(AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}\b/g,
    replacement: '[REDACTED_AWS_ACCESS_KEY]'
  },
  {
    name: 'AWS Secret Access Key',
    pattern: /(aws_secret_access_key|aws_secret_key|secret_key|secret_token)\s*[:=]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/gi,
    replacement: '$1=[REDACTED_AWS_SECRET_KEY]'
  },
  {
    name: 'GitHub Token',
    pattern: /\b(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{82})\b/g,
    replacement: '[REDACTED_GITHUB_TOKEN]'
  },
  {
    name: 'GitLab Token',
    pattern: /\bglpat-[0-9a-zA-Z\-_]{20,30}\b/g,
    replacement: '[REDACTED_GITLAB_TOKEN]'
  },
  {
    name: 'Slack Token',
    pattern: /\bxox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,32}\b/g,
    replacement: '[REDACTED_SLACK_TOKEN]'
  },
  {
    name: 'JWT / Bearer Token',
    pattern: /\b(?:Bearer\s+)?eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g,
    replacement: '[REDACTED_JWT_TOKEN]'
  },
  {
    name: 'Private Key',
    pattern: /-----BEGIN (?:RSA|OPENSSH|DSA|EC|PGP)?\s*PRIVATE KEY-----[\s\S]*?-----END (?:RSA|OPENSSH|DSA|EC|PGP)?\s*PRIVATE KEY-----/g,
    replacement: '[REDACTED_PRIVATE_KEY_BLOCK]'
  },
  {
    name: 'Database URI Credentials',
    pattern: /\b((?:postgres|postgresql|mysql|mongodb|redis|amqp|couchdb):\/\/[^:\s]+:)([^@\s]+)(@[^:\s]+:[0-9]+[^\s]*)/g,
    replacement: '$1[REDACTED_DB_PASSWORD]$3'
  },
  {
    name: 'Credential Assignment',
    pattern: /\b(password|passwd|pwd|client_secret|api_key|apikey|auth_token|access_token|secret_val)\s*[:=]\s*['"]?([^'"\s\r\n]{6,})['"]?/gi,
    replacement: '$1=[REDACTED_CREDENTIAL]'
  },
  {
    name: 'AWS Account ID',
    pattern: /\barn:aws:[a-z0-9-]+:[a-z0-9-]*:([0-9]{12}):/g,
    replacement: 'arn:aws:*:*:[REDACTED_AWS_ACCOUNT_ID]:'
  },
  {
    name: 'IPv4 Address',
    pattern: /\b(?!127\.0\.0\.1\b)(?!0\.0\.0\.0\b)(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
    replacement: '[REDACTED_IP]'
  },
  {
    name: 'Email Address',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    replacement: '[REDACTED_EMAIL]'
  }
];

export function redactSensitiveData(text: string): {
  redactedText: string;
  totalRedactions: number;
  categoriesFound: string[];
} {
  if (!text) {
    return { redactedText: text, totalRedactions: 0, categoriesFound: [] };
  }

  let redactedText = text;
  let totalRedactions = 0;
  const categoriesFound: string[] = [];

  for (const rule of REDACTION_RULES) {
    const matches = redactedText.match(rule.pattern);
    if (matches && matches.length > 0) {
      totalRedactions += matches.length;
      categoriesFound.push(rule.name);
      redactedText = redactedText.replace(rule.pattern, rule.replacement);
    }
  }

  return {
    redactedText,
    totalRedactions,
    categoriesFound
  };
}
