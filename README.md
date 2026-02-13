# ProofStack

ProofStack is an audit layer for AI-generated cybersecurity analysis.

It takes a draft answer, decomposes it into claims, verifies each claim against uploaded evidence, and produces a Trust Report with verdicts, score explainability, and exportable artifacts.

## Problem

Security teams increasingly use AI for incident analysis and recommendations, but raw model output is hard to trust because it can be confident, uncited, or wrong.

ProofStack addresses this by adding a verification pipeline:

1. Draft answer generation
2. Claim extraction
3. Evidence retrieval
4. Claim verification
5. Trust scoring
6. Redlined verified answer
7. Exportable report

## Current Product Scope

- Domain: Cyber/Security
- Input: Uploaded files (`.pdf`, `.txt`, `.md`) or bundled demo dataset
- Output: Trust Report, claim verdicts, evidence lineage, and markdown export
- Modes:
  - Standard verification
  - Challenge mode (injects one false claim to show failure detection)

## Key Features

- Deterministic trust scoring with explainability
- Claim-level verdicts: `supported`, `weak`, `unsupported`
- Evidence references (`[E#]`) with clickthrough lineage
- Draft vs Verified output comparison
- Quantified impact metrics:
  - supported claim rate
  - critical unsupported count
  - estimated review time
- Go/No-Go decision banner (`HOLD` or `SAFE TO SHARE`)
- Limitations and confidence panel for reviewer clarity
- Local export endpoint for audit-ready markdown output

## System Architecture

Pipeline execution in `POST /api/verify`:

1. Load sources (uploaded files or `datasets/demo1`)
2. Chunk sources into deterministic text segments
3. Generate draft answer
4. Extract up to 12 claims
5. Retrieve top-3 evidence snippets per claim
6. Verify each claim against retrieved snippets
7. Apply challenge-mode override (if enabled)
8. Score trust report
9. Redline final verified answer
10. Persist latest session for report retrieval

Main pipeline modules:

- `src/lib/pipeline/chunkSources.ts`
- `src/lib/pipeline/draftAnswer.ts`
- `src/lib/pipeline/extractClaims.ts`
- `src/lib/pipeline/retrieveEvidence.ts`
- `src/lib/pipeline/verifyClaims.ts`
- `src/lib/pipeline/scoreReport.ts`
- `src/lib/pipeline/redlineAnswer.ts`

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Custom CSS design system (no UI framework dependency)
- Next.js API routes for backend orchestration
- Local session persistence:
  - browser localStorage (`src/lib/sessionStore.ts`)
  - latest-session file (`.proofstack/latest-session.json`)

LLM usage:

- OpenAI Chat Completions via `src/lib/llm/openaiChat.ts`
- If OpenAI is unavailable, pipeline falls back to deterministic logic for demo reliability

## Repository Structure

```text
src/
  app/
    page.tsx                 # Home: run verification
    report/page.tsx          # Trust report artifact
    claims/page.tsx          # Claim-level review
    about/page.tsx           # Product overview
    api/
      verify/route.ts        # Main verification pipeline
      verify/latest/route.ts # Get/clear latest session
      export/route.ts        # Markdown export
      health/route.ts        # Health endpoint
  components/
    navigation/              # Top nav and page transitions
    report/                  # Report UI modules (score, claims, decision banner)
  lib/
    pipeline/                # Verification pipeline stages
    report/                  # Report decision logic
    session/                 # Latest session file storage
    types/                   # Shared domain types
datasets/
  demo1/                     # Stable demo dataset
docs/                        # Product and implementation docs
```

## API Endpoints

- `GET /api/health`
  - Returns health status
- `POST /api/verify`
  - Runs full verification pipeline
  - Supports `multipart/form-data` (file uploads) and JSON payloads
- `GET /api/verify/latest`
  - Returns latest persisted verification session
- `DELETE /api/verify/latest`
  - Clears latest persisted verification session
- `POST /api/export`
  - Returns downloadable markdown report

## Local Development

Prerequisites:

- Node.js 18+
- npm

Setup:

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000`

Build and type-check:

```bash
npm run typecheck
npm run build
```

## Environment Variables

Create `.env.local` if you want live model calls:

```bash
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4.1-mini
```

Without `OPENAI_API_KEY`, the app still runs using fallback behavior for draft, claims, and verification.

## Demo Script (Judge Friendly)

Recommended 90-second flow:

1. Home page: upload dataset or use demo content
2. Run normal verification to show supported and weak claims
3. Run challenge mode to inject one false claim
4. Open Report:
   - show Go/No-Go decision
   - open claim verdicts
   - click evidence reference lineage
   - show quantified impact
5. Export markdown report

## How This Maps to Judging Criteria

Innovation and creativity:
- Applies claim-level verification and redlined correction to AI security output

Technical complexity and implementation:
- End-to-end pipeline with structured claim/evidence graph, verdicting, scoring, and exports

Impact and usefulness:
- Converts AI output into actionable, auditable artifacts for analyst workflows

Presentation and clarity:
- Dedicated report artifact page with explainable score logic and explicit limitations

## Documentation Map

- `docs/masterplan.md` - product mission and roadmap
- `docs/implementation-plan.md` - delivery plan
- `docs/DECISIONS.md` - key design and scope decisions
- `docs/app-flow-pages-and-roles.md` - UX flow and user roles
- `docs/context-pack.md` - quick project context

## Known Limitations

- Domain is currently fixed to Cyber/Security
- Verification quality depends on source coverage and source quality
- Current persistence is local and file-based for hackathon simplicity
- External fact checking beyond provided sources is out of scope

## Next Iterations

- PDF export with fixed report template
- Persistent multi-session history
- SOC/compliance control mapping on claims
- CI integration for automated verification in review workflows
