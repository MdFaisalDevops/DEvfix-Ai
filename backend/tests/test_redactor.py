from app.redactor import redact_sensitive_data

def test_redact_aws_key():
    text = "Error connecting with AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE to S3"
    redacted, count, types = redact_sensitive_data(text)
    assert "[REDACTED_AWS_ACCESS_KEY]" in redacted
    assert "AKIAIOSFODNN7EXAMPLE" not in redacted
    assert count >= 1
    assert "AWS Access Key ID" in types

def test_redact_github_token():
    text = "Cloning with token ghp_1234567890abcdefghijklmnopqrstuvwxyz from repo"
    redacted, count, types = redact_sensitive_data(text)
    assert "[REDACTED_GITHUB_TOKEN]" in redacted
    assert "ghp_" not in redacted
    assert count >= 1

def test_redact_db_uri():
    text = "Connected to postgres://admin:superSecretPass123@db.internal:5432/production"
    redacted, count, types = redact_sensitive_data(text)
    assert "[REDACTED_DB_PASSWORD]" in redacted
    assert "superSecretPass123" not in redacted

def test_redact_ip_address():
    text = "Connection refused from 192.168.1.105 on port 8080"
    redacted, count, types = redact_sensitive_data(text)
    assert "[REDACTED_IP]" in redacted
    assert "192.168.1.105" not in redacted
