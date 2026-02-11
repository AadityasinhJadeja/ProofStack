# Decisions Log

## Product scope
- 2026-02-11: Domain locked to Cyber/Security. Reason: audit + evidence language is native; high judge seriousness; avoids healthcare ethics pitfalls.
- 2026-02-11: MVP scope locked: one end-to-end flow (Upload → Draft → Proof → Fix → Export). Reason: demo reliability > breadth.

## Tech stack
- 2026-02-11: Frontend = Next.js (App Router) + TypeScript. Reason: premium UI, fast iteration, easy deploy, strong routing for 4 pages.
- 2026-02-11: UI components = shadcn/ui + Radix primitives. Reason: predictable, accessible components; matches “calm enterprise” style.
- 2026-02-11: Styling = Tailwind. Reason: consistent spacing (8pt grid), fast layout tuning, avoids CSS drift.
- 2026-02-11: Backend orchestration = Next.js API routes (in-repo). Reason: simplest deployment + no separate service overhead for hackathon.
- 2026-02-11: Vector store = local (FAISS or Chroma). Reason: deterministic, fast, offline demo-safe; avoids external dependencies.
- 2026-02-11: PDF parsing = local parser (pypdf/pdfplumber). Reason: deterministic ingestion; no flaky external conversions.
- 2026-02-11: Export format = Markdown first; PDF optional. Reason: artifact > polish; ensures reliable download.

## UX & IA (non-negotiables)
- 2026-02-11: Page structure locked: Left inputs, Right results. Reason: reduces cognitive load; matches design doc layout.
- 2026-02-11: Navigation pattern: Tabs for Answer / Trust Report / Claims; Evidence via right-side drawer. Reason: tabs > modals; drawer preserves context.
- 2026-02-11: No settings maze. Only Domain + Strictness presets. Reason: trust via restraint; defaults > knobs.

## Visual system
- 2026-02-11: Typography: Inter for UI; monospace for evidence snippets only. Reason: readability + “source of truth” signal.
- 2026-02-11: Max line length ~70 chars; line height >= 1.5. Reason: reading under cognitive load.
- 2026-02-11: Color usage is semantic only (Supported/Weak/Unsupported). Reason: color communicates status, not personality.
- 2026-02-11: Motion: 150–250ms ease-out; no playful animations. Reason: calm SOC vibe; no theatrics.

## Verification pipeline constraints (for speed + clarity)
- 2026-02-11: Claim cap = 12 max. Reason: latency control + table readability.
- 2026-02-11: Retrieval = top-k 3 evidence snippets per claim. Reason: reduces noise + keeps UI scannable.
- 2026-02-11: Verdict set = Supported / Weak / Unsupported + optional “Contradiction flag”. Reason: clear mental model; audit-friendly.
- 2026-02-11: Scoring = deterministic 0–100 with explainable weights. Reason: judges trust explainable math more than mystery scores.

## Accessibility baseline
- 2026-02-11: WCAG AA contrast target; status never color-only; keyboard focus visible. Reason: professionalism + trust.

## Demo invariants
- 2026-02-11: Always ship with /datasets and a “Load sample dataset” button. Reason: demo reliability.
- 2026-02-11: Demo must show at least 1 Supported, 1 Weak, 1 Unsupported claim. Reason: contrast sells the product.
