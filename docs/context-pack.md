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
  - Home includes Upload + Ask placeholders and a "Load sample dataset" button that reads `/datasets` and lists file names.
  - API health endpoint added at `/api/health` returning `{ "status": "ok" }`.
  - Pipeline module stubs added under `/src/lib/pipeline` with TSDoc + phase-aligned TODOs:
    - `chunkSources.ts`
    - `embedIndex.ts`
    - `draftAnswer.ts`
    - `extractClaims.ts`
    - `retrieveEvidence.ts`
    - `verifyClaims.ts`
    - `scoreReport.ts`
    - `redlineAnswer.ts`
  - Sample files available in `/datasets` for demo reliability.
- In progress:
  - No runtime pipeline behavior yet (scaffold-only by design for Phase 1 engineering pass).
- Next:
  - Implement source ingestion and indexing internals (Phase 1 pipeline behavior).
  - Connect UI actions to pipeline orchestration for draft-answer and verification flow.

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
