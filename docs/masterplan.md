## 30-second elevator pitch

**ProofStack** is an AI audit layer for cybersecurity work.  
It takes AI-generated answers, breaks them into verifiable claims, checks each claim against provided evidence, scores risk, and produces an exportable **Trust Report** suitable for security reviews, compliance, and decision-making.

> Don’t give me an answer. Give me an answer I can trust — with receipts.

---

## Problem & mission

### The problem

AI is already used in cybersecurity for:

- Incident analysis
- Risk assessment
- Policy interpretation
- Recommendations and summaries

But AI output today is:

- Confident but unverifiable
- Poorly cited or uncited
- Prone to hallucinated facts
- Non-auditable
- Unsafe for compliance-heavy workflows

Security teams cannot act on answers they cannot prove.

### Mission

Create a trust layer that audits AI output with the same rigor applied to logs, alerts, and controls.

---

## Target audience

### Primary user

- Security analyst, engineer, or PM
- Uses AI to analyze incidents, reports, or policies
- Needs evidence-backed, auditable output

### Secondary user

- Security manager, auditor, or reviewer
- Needs to quickly assess trustworthiness and risk
- Does not want “trust me bro” AI

### Core promise

**“AI answers you can defend in an audit.”**

ProofStack transforms:

**Free-form AI output**  
→ **Structured claims**  
→ **Verified evidence**  
→ **Measurable risk**  
→ **Audit-ready artifacts**

---

## Core features (scannable)

- **Claim Decomposition**  
  Convert AI answers into atomic, checkable claims

- **Source-Grounded Evidence Retrieval**  
  Match claims only against user-provided sources

- **Claim Verification**  
  Supported / Weak / Unsupported verdicts with reasoning

- **Adversarial Self-Checks**  
  Actively attempt to disprove claims using sources

- **Trust Scoring**  
  Deterministic, domain-aware risk score (0–100)

- **Auto-Redlined Fix**  
  Rewrite answers using only supported claims

- **Exportable Trust Report**  
  Markdown / PDF for sharing and audits

---

## High-level tech stack (and why)

- **LLM (GPT-class)**  
  Claim extraction, verification, adversarial checks, redlining

- **Embeddings + Vector Store (FAISS / Chroma)**  
  Fast, local evidence retrieval from uploaded sources

- **Next.js or Streamlit**  
  Rapid UI with strong demo polish

- **FastAPI or API routes**  
  Simple orchestration of verification pipeline

- **Local PDF parsing**  
  Deterministic, hackathon-safe ingestion

**Why this fits the mission:**  
Every component prioritizes traceability, determinism, and auditability over raw generation.

---

## Conceptual data model (ERD in words)

### VerificationSession

- domain
- strictness
- created_at

### Source

- raw_text
- chunks[]

### Answer

- draft_text
- verified_text

### Claim

- text
- criticality
- verdict
- confidence

### Evidence

- source_id
- snippet
- relevance_score

### TrustReport

- claims[]
- scores
- risks
- diffs

---

## UX design principles (Krug-aligned)

- **No configuration thinking**  
  Domain presets handle rules automatically

- **One primary action per step**  
  Upload → Ask → Review → Export

- **Show sophistication, not knobs**  
  Defaults > settings

- **Artifacts over dashboards**  
  Reports > charts

- **Explain every verdict**  
  No silent scores or black boxes

---

## Security & compliance notes

- Source-bounded verification only
- No external browsing required for MVP
- Clear disclaimers for non-production use
- Audit artifacts preserved per session
- Deterministic scoring logic (explainable)

---

## Phased roadmap

### MVP (hackathon)

- Single end-to-end workflow
- Cyber domain only
- Markdown export
- Sample dataset for reliable demo

### V1

- PDF export
- Multi-domain presets
- Persistent session history

### V2

- Policy rule authoring
- CI / PR integrations
- Continuous verification (diff over time)

---

## Key risks & mitigations

- **LLM inconsistency**  
  Use strict JSON schemas + capped claim count

- **Latency**  
  Parallelize claim checks; cap top-k evidence

- **Scope creep**  
  One workflow, one domain, one report

---

## Future expansion ideas

- SOC tool integrations
- Continuous monitoring of AI outputs
- Compliance mappings (SOC 2, ISO, NIST)
- “Trust score over time” trendlines
- Multi-model answer comparison
