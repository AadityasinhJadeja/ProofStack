# Security Policy Excerpt: Authentication, Logging, and Incident Handling
Version: 1.7
Last reviewed: 2026-01-15

## Authentication Policy
1. All users must have passwords of at least **12 characters**.
2. Passwords must include at least **one** of each:
   - uppercase letter
   - lowercase letter
   - number
   - symbol
3. MFA is required for:
   - all admin accounts
   - all access to internal dashboards
4. MFA for customer accounts is **recommended** but not required for all users.

## Rate Limiting / Abuse Prevention
1. Public authentication endpoints must enforce rate limiting.
2. Suggested baseline:
   - **20–30 requests/minute per IP** on login endpoints
3. If a burst of failures is detected:
   - apply step-up verification (MFA or CAPTCHA)
   - temporarily block abusive IPs

## Logging Policy
1. Authentication logs must include:
   - timestamp
   - endpoint
   - status (success/fail)
   - IP
   - user agent
2. Logs must be retained for **90 days** minimum.
3. Access to logs is restricted to authorized staff only.

## Incident Handling
1. Severity is based on:
   - data exposure risk
   - system availability impact
   - persistence of threat actor
2. For incidents involving authentication abuse:
   - preserve logs immediately
   - apply throttling
   - validate no unusual database access occurred
3. Post-incident, a written report must include:
   - timeline
   - impact
   - containment actions
   - follow-up actions
