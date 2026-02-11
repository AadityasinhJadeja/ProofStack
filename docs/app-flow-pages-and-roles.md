## Site map (top-level pages only)

- Home / Session Setup  
- Verification Workspace  
- Trust Report  
- Export / Share  

**That’s it.**  
No settings maze. No dead ends.

---

## Page purposes (one line each)

### 1) Home / Session Setup
Create a verification session with domain presets and strictness.

### 2) Verification Workspace
Upload sources, ask a question, and generate the draft answer.

### 3) Trust Report
Inspect verified claims, evidence, risk score, and redlined output.

### 4) Export / Share
Download or share the audit-ready report.

---

## User roles & access levels

### Role: Analyst (Primary)

**Permissions**

- Create sessions  
- Upload sources  
- Ask questions  
- View all verification details  
- Export reports  

**Mental model**

> “Help me trust (or fix) this AI output.”

---

### Role: Reviewer / Judge (Secondary)

**Permissions**

- View Trust Report  
- Inspect claims and evidence  
- See risk score and diffs  
- Download exported report  

**Restrictions**

- Cannot modify sources  
- Cannot rerun verification  

**Mental model**

> “Can I rely on this result?”

> Hackathon note: both roles can be the same user; role framing is conceptual, not enforced.

---

## Primary user journeys (≤3 steps each)

### Journey 1 — Create a verification session

1. Select Domain: Cyber / Security  
2. Select Strictness: Fast / Balanced / Strict  
3. Click Start Verification  

**Why it matters**

- Signals seriousness  
- Applies rules without cognitive load  

---

### Journey 2 — Verify an AI answer

1. Upload sources + ask question  
2. Generate Draft Answer  
3. Auto-run Proof Mode  

**Why it matters**

- One click to value  
- No manual verification steps  

---

### Journey 3 — Inspect trustworthiness

1. Open Trust Report  
2. Scan trust score + top risks  
3. Drill into specific claims  

**Why it matters**

- Supports both skimming and deep audit  

---

### Journey 4 — Fix and export

1. Click Fix Answer  
2. Review redlined diff  
3. Export report  

**Why it matters**

- Turns critique into action  
- Produces a real artifact  

---

## Core screens (what must be visible)

### Verification Workspace

**Required elements**

- Source upload area  
- Question input  
- Template selector  
- “Generate Answer” CTA  

**Nice-to-have**

- Sample dataset button (demo safety)

---

### Trust Report (the hero screen)

**Above the fold**

- Trust Score (large, calm)
- Supported / Weak / Unsupported counts
- “Top 3 Risks”

**Below**

- Claims table
- Verdict badge
- Confidence
- Evidence access
- Verified Answer
- Diff view (Draft vs Verified)

> This is where judges spend time.

---

## Interaction rules (clarity-first)

- Verification auto-runs after answer generation  
- No modal dialogs for critical info  
- Evidence always one click away  
- Scores always explained  
- No irreversible actions  

---

## Demo mode considerations (important)

- Default to a known-good sample dataset  
- Pre-fill a strong cyber question:  
  > “Analyze this incident report and recommend remediation steps.”  
- Keep claim count capped for speed  

Ensure at least:

- One supported claim  
- One weak claim  
- One unsupported claim  

Judges need contrast.

---

## Success criteria (UX-level)

A judge should be able to answer these in under **60 seconds**:

- What did the AI claim?
- What evidence supports it?
- What’s risky or unproven?
- Can I trust the final output?
- Can I export this?

If yes → **you win.**

---

## Final note

ProofStack’s flow is intentionally boring.

That’s the point.

**Trust tools don’t entertain — they reassure.**
