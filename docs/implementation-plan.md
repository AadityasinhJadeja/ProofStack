## Build philosophy

**One workflow. One domain. One artifact.**

- Optimize for demo reliability, not edge cases  
- Every step should compile, render, or display something tangible  

---

## Step-by-step build sequence (micro-tasks)

---

## Phase 0 — Setup (30–45 min)

### Create repo

Add README with:

- One-line value prop  
- Architecture diagram (simple)  
- Demo steps  

### Initialize app

- Frontend: Next.js or Streamlit  
- Backend: API routes or FastAPI  

### Add environment config

- LLM key  
- Embeddings key  

✅ **Checkpoint:** App runs locally with placeholder UI.

---

## Phase 1 — Source ingestion (60 min)

**Goal:** Get text into chunks you can search.

### Implement source inputs

- Paste text  
- Upload PDF  

### Processing

- Parse PDFs into raw text  
- Chunk text  
  - Fixed size (500–800 tokens)  
  - Preserve source IDs  
- Embed chunks  
- Store in vector index (FAISS / Chroma)

### UI

Show **Source Health** indicator:

- # of chunks  
- Word count  

✅ **Checkpoint:** Uploading a PDF shows “X chunks indexed”.

---

## Phase 2 — Question → Draft Answer (30 min)

**Goal:** Generate something human-readable and verifiable.

- Add question input  
- Add templates:
  - “Analyze incident and recommend actions”
  - “Summarize risks”
- Prompt LLM to generate:
  - Draft answer (plain text)
- Store draft answer in session state  

✅ **Checkpoint:** User sees a readable AI answer.

---

## Phase 3 — Claim extraction (45 min)

**Goal:** Turn text into structure.

Prompt LLM:

**Input:** draft answer  
**Output:** JSON array of claims:

- id  
- claim_text  
- claim_type (fact / number / recommendation)  
- criticality (low / medium / high)

- Cap claims (e.g., max 12)
- Render claim list in UI (hidden or collapsed)

✅ **Checkpoint:** Claims render as a table or list.

---

## Phase 4 — Evidence retrieval (45 min)

**Goal:** Ground every claim in sources.

For each claim:

- Embed claim text  
- Retrieve top-k chunks (k = 3)  
- Store evidence candidates  

### UI

Evidence drawer:

- Source  
- Snippet  
- Relevance score  

✅ **Checkpoint:** Clicking a claim shows evidence snippets.

---

## Phase 5 — Claim verification (60 min)

**Goal:** Make trust measurable.

For each claim:

Prompt LLM with:

- Claim  
- Evidence snippets only  

**Output strict JSON:**

- verdict (supported / weak / unsupported)  
- explanation  
- evidence_quote  
- confidence (0–1)

### UI

- Status badge  
- Reason text  

✅ **Checkpoint:** Claims show ✅ ⚠️ ❌ with explanations.

---

## Phase 6 — Adversarial checks (30 min)

**Goal:** Impress judges.

For each claim:

Run 2 prompts:

- “Disprove this claim using only the sources.”  
- “Find contradictions across sources.”  

If contradiction found:

- Flag claim  
- Store note  

✅ **Checkpoint:** At least one claim shows “contradiction check run”.

---

## Phase 7 — Trust scoring (30 min)

**Goal:** Produce a single decision metric.

### Deterministic scoring

- Supported = +1  
- Weak = +0.5  
- Unsupported = 0  
- Contradiction = −0.5  
- Critical unsupported = −2  
- Domain multiplier (Cyber)

Normalize → **0–100**

### UI

- Big trust score badge  
- Top 3 risks list  

✅ **Checkpoint:** Trust score visibly updates based on claims.

---

## Phase 8 — Auto-redline fix (30 min)

**Goal:** Turn critique into action.

Prompt LLM:

**Input:** draft answer  
**Constraints:**

- Use only supported claims  
- Add caveats where weak  
- Remove unsupported content  

Generate **Verified Answer**

- Compute diff vs draft  

### UI

- Side-by-side or inline diff  

✅ **Checkpoint:** Judges can see hallucinations removed.

---

## Phase 9 — Export (30 min)

**Goal:** Make it feel real.

Generate Markdown report:

- Answer  
- Claims table  
- Evidence  
- Trust score  
- Disclaimers  

Optional:

- PDF if time allows  

- One-click download  

✅ **Checkpoint:** File downloads successfully.

---

## Timeline (1-day hackathon)

- **Morning:** Phases 0–3  
- **Midday:** Phases 4–6  
- **Afternoon:** Phases 7–8  
- **Evening:** Phase 9 + polish + demo  

---

## Team roles (even if solo)

### System Designer
Owns flow and scope discipline

### Verification Engineer
Prompts, schemas, scoring

### UX Curator
Makes Trust Report readable and calm

### Demo Director
Crafts the story judges will remember

---

## Recommended rituals

After every major phase:

- Run full flow end-to-end  

Before demo:

- Use same sample dataset every time  
- Record backup video  

---

## Optional integrations / stretch goals

- Highlight “critical” claims visually  
- Policy rule presets (NIST-style language)  
- Multi-answer comparison  
- Session history
