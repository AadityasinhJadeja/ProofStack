# ProofStack — Context Pack (Read this first)

## One-liner
ProofStack is a verification layer: Draft Answer → Claims → Evidence checks → Trust Score → Redline Fix → Exportable Trust Report.

## Domain
Cyber/Security

## Demo goal (90 sec)
Show Draft Answer with 1–2 wrong claims → ProofStack flags unsupported claims → generates verified answer + Trust Report → export.

## Current status
- Done:
  - Next.js (App Router) + TypeScript project scaffold created.
  - Core pages scaffolded: Home, Report, Claims, Settings.
  - Home includes Upload + Ask placeholders and a wired "Load sample dataset" button that calls `/api/verify`.
  - API health endpoint added at `/api/health` returning `{ "status": "ok" }`.
  - Added shared ProofStack session model types in `/src/lib/types/proofstack.ts`:
    - `SourceDoc`
    - `Chunk`
    - `Claim`
    - `EvidenceSnippet`
    - `ClaimVerdict`
    - `TrustReport`
    - `VerificationSession`
  - Added `/api/verify` endpoint that accepts:
    - `question`
    - `useDemoDataset`
    - `domain`
    - `strictness`
    and returns a complete `VerificationSession`.
  - Home now renders verification output with trust score + claims table.
  - Implemented deterministic demo ingestion via `loadDemoDataset()` for:
    - `/datasets/demo1/incident_report.md`
    - `/datasets/demo1/security_policy.md`
    - `/datasets/demo1/logs.txt`
  - Implemented deterministic chunking via `chunkSources()` with stable chunk IDs.
  - Implemented simple keyword-overlap evidence retrieval via `retrieveEvidence()` with top-3 chunks per claim.
  - Implemented `draftAnswer()` with LLM call (cyber-analyst prompt, low temperature) plus fallback.
  - Implemented `extractClaims()` with JSON guardrails, parse validation, one retry, and fallback (max 12 claims).
  - Implemented `verifyClaims()` with per-claim LLM validation using only retrieved evidence snippets.
  - Implemented deterministic `scoreReport()` (0-100) with risk extraction.
  - `/api/verify` now runs end-to-end: draft answer -> claim extraction -> top-3 retrieval -> claim verification -> trust scoring.
  - Home now displays draft answer, trust score, verdict badges, and an evidence drawer.
  - Added minimal debug logging behind `DEBUG` flag.
  - Implemented Phase 3 Chunk 1 Trust Report UI on `/report`:
    - Trust Score card
    - verdict breakdown counts
    - Top Risks section
    - Claims table with verdict badges and confidence
    - right-side claim inspector drawer showing claim text, verdict, confidence, explanation, and evidence snippets with source names
  - Added latest-session retrieval API route `GET /api/verify/latest` with file-backed latest-session storage for report rendering.
  - Added fallback mock session for `/report` when no runtime verification session exists yet.
  - Implemented Phase 3 Chunk 2 Verified Answer generation step:
    - Added deterministic `redlineAnswer()` pipeline stage that builds a verified answer from draft answer + claim verdicts + evidence snippets.
    - Unsupported claims are moved to an uncertainty section.
    - Weak claims are qualified with caveat language.
    - Inline evidence references (`[E1]`, `[E2]`, ...) are emitted with an evidence index mapped to snippet IDs.
  - `/api/verify` now returns `verifiedAnswer` in `VerificationSession`.
  - `/report` now includes a calm Draft vs Verified compare section.
  - Implemented export endpoint `POST /api/export` that returns downloadable Markdown (`Content-Disposition: attachment`) from a session payload.
  - Exported report includes:
    - metadata (domain, strictness, timestamps)
    - trust score + breakdown + top risks
    - claims table
    - evidence grouped by claim
    - draft answer
    - verified answer
  - Added `Export Report` button on `/report` that calls `/api/export` and downloads the `.md` file.
  - Pipeline module stubs added under `/src/lib/pipeline` with TSDoc + phase-aligned TODOs:
    - `chunkSources.ts`
    - `embedIndex.ts`
    - `draftAnswer.ts`
    - `extractClaims.ts`
    - `retrieveEvidence.ts`
    - `verifyClaims.ts`
    - `scoreReport.ts`
    - `redlineAnswer.ts`
  - Sample files available in `/datasets/demo1` for demo reliability.
- In progress:
  - Phase 4 polish and demo packaging still pending.
- Next:
  - Phase 4 demo polish/video.

## Architecture (MVP)
Sources → chunk/index → draft answer → claim extraction → retrieval → verification → scoring → redline rewrite → report UI → export

## Core JSON Schemas
- Claim schema:
- Verification schema:
- Report schema:

## Key decisions
- Stack:
- Vector store:
- Claim cap:
- Strictness presets:

## Session starter
When resuming, open this file + docs/masterplan.md and follow implementation-plan “Next” section.
