# Incident Report: API Gateway Credential-Stuffing Attempt

## Executive Summary
On **2026-02-08**, we observed a spike in failed login attempts against the **Customer Portal API**.
The activity was consistent with **credential stuffing** and originated from a small set of IP ranges.
We enabled additional rate limits and forced MFA challenges for suspicious traffic. No evidence of data exfiltration was found in the logs reviewed.

## Timeline (UTC)
- **02:11** — Alert triggered: elevated failed login rate on `/auth/login`
- **02:14** — On-call confirmed abnormal auth traffic
- **02:18** — Temporary rate limit applied on API Gateway for `/auth/login`
- **02:22** — MFA challenge enforced for suspicious sessions
- **02:31** — Failed login rate returned to baseline
- **02:45** — Incident marked contained; monitoring continued

## Impact
- Elevated latency on Customer Portal API for **~18 minutes**
- Peak p95 latency increased from **220ms** to **680ms**
- No customer-facing outage (HTTP 5xx rate remained under **0.3%**)

## Observations
- Total failed login attempts during incident window: **4,812**
- Total successful logins during incident window: **312**
- Distinct source IPs observed: **36**
- Top 3 suspicious IP ranges (redacted): `203.0.113.0/24`, `198.51.100.0/24`, `192.0.2.0/24`

## Containment Actions Taken
1. Applied API Gateway throttling:
   - `/auth/login` limited to **25 requests/minute per IP**
2. Enabled “step-up” MFA for suspicious login bursts
3. Blocked 12 IPs with sustained failure rates

## Root Cause (Preliminary)
The incident was triggered by automated credential stuffing attempts using leaked credential lists.
The authentication service accepted high-volume login attempts until throttling was applied.

## What We Know / What We Don’t
### Confirmed
- High-volume failed logins peaked between **02:11–02:31 UTC**
- Rate limiting reduced traffic and stabilized latency
- No evidence of database access anomalies in the logs reviewed

### Not Confirmed
- Whether the credentials used were from a single breach source
- Whether any accounts were accessed using valid leaked credentials outside the incident window

## Follow-up Actions (Planned)
- Add bot detection signals (user-agent + behavioral)
- Enforce MFA for all admin accounts (audit current coverage)
- Add alerting on “success-after-fail burst” patterns
- Review password policy alignment with current standards
