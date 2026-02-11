# ProofStack

ProofStack is a verification layer for AI outputs (Cyber/Security).
Draft Answer → Claims → Evidence checks → Trust Score → Redlined Fix → Exportable Trust Report.

## Demo (local)
1) Install deps: `npm install`
2) Run: `npm run dev`
3) Open: http://localhost:3000
4) Click "Load sample dataset" (demo1)
5) Ask: "Analyze this incident report and recommend remediation steps."

## Repo structure
- /docs: product + design docs (source of truth)
- /datasets/demo1: demo-safe cyber dataset
- /src/lib/pipeline: verification pipeline modules (stubs in Phase 1)

## Status
Phase 1 complete: scaffolding + docs + demo dataset.
