## Emotional tone (one sentence)

Feels like a calm security operations room at 2am — quiet, focused, respectful, and trustworthy.

No panic.  
No theatrics.  
Just clarity, confidence, and receipts.

---

## Design intent (big picture)

ProofStack is **not a flashy AI toy**.  
It is a **verification instrument**.

The interface should:

- Reduce anxiety
- Encourage careful reading
- Reward scrutiny
- Never rush the user
- Never exaggerate confidence

**Trust is built through restraint, not decoration.**

---

## Typography system

**Primary goal:** readability under cognitive load.

### Font choices

- **Primary:** Inter (or similar humanist sans)  
  → Clear, neutral, enterprise-safe

- **Secondary (optional):** Monospace for evidence snippets  
  → Signals “source of truth”

### Hierarchy

- **H1:** 32px / Semibold — page titles (“Trust Report”)
- **H2:** 24px / Semibold — section headers
- **H3:** 18px / Medium — subsections
- **Body:** 14–16px / Regular — default reading
- **Caption:** 12px / Regular — metadata, timestamps

### Rules

- Line height ≥ 1.5×
- Max line width: ~70 characters
- Never use decorative fonts

---

## Color system

**Philosophy:** color communicates status, not personality.

### Base palette

- Background: near-white or soft charcoal (dark mode optional)
- Text: high-contrast neutral gray
- Borders: subtle, low-contrast dividers

### Semantic colors (used sparingly)

- **Supported:** muted green (confidence without celebration)
- **Weak:** amber / yellow (caution, not alarm)
- **Unsupported:** restrained red (serious, not loud)
- **Critical risk:** deep red accent (rare, intentional)

### Rules

- Never color large surfaces aggressively
- Color appears after text, not instead of it
- Contrast ≥ WCAG AA (4.5:1)

---

## Spacing & layout

**System:** 8pt grid

### Layout principles

- Generous whitespace
- Clear vertical rhythm
- Content breathes; nothing feels cramped

### Page structure

- Left: inputs (sources, question)
- Right: results (Answer / Trust Report / Claims)

### Interaction patterns

- Tabs > modals
- Drawers for evidence (don’t steal focus)

---

## Motion & interaction

**Motion philosophy:** gentle acknowledgment, never distraction.

### Interaction rules

- Hover: subtle opacity or elevation change
- Transitions: 150–250ms ease-out
- No bouncing, no playful springs

### Feedback moments

- Verification running → calm progress indicator
- Completion → quiet checkmark + timestamp
- Errors → informative, non-blaming copy

Example:

> “This claim could not be verified with the provided sources.”

Not:

> “Verification failed.”

---

## Voice & tone (copy rules)

**Personality:** confident, neutral, supportive.

### Keywords

- Precise
- Calm
- Non-judgmental
- Audit-friendly

### Microcopy examples

**Onboarding**
> “Upload the sources you trust. ProofStack will verify everything else.”

**Success**
> “Verification complete. 9 of 12 claims supported.”

**Error**
> “This claim lacks sufficient evidence in the provided sources.”

### Rules

- Never shame the user
- Never anthropomorphize the AI

---

## System consistency

### Repeating patterns

- Claim = row
- Evidence = expandable drawer
- Verdict = badge + explanation
- Risk = summarized, then detailed

### Style anchors

- Linear → clarity and restraint
- Notion → calm density
- shadcn/ui → predictable components

**Consistency builds trust faster than novelty.**

---

## Accessibility

- Semantic headings and landmarks
- Keyboard navigation for all controls
- Visible focus states
- Status never conveyed by color alone
- Tables readable by screen readers

**Accessibility = professionalism.**

---

## Emotional audit checklist

Before shipping, ask:

- Does this screen reduce anxiety or increase it?
- Are we ever overstating confidence?
- Can a tired analyst understand this instantly?
- Do errors feel supportive, not punitive?
- Would I trust this during an incident review?

If unsure → **simplify.**

---

## Technical QA checklist

- Typography follows defined scale
- Contrast meets WCAG AA+
- Status colors used only semantically
- Motion stays within 150–300ms
- No critical info hidden behind hover-only states

---

## Design snapshot

### Color palette

- Supported:   `#4CAF50`
- Weak:        `#FFC107`
- Unsupported: `#E53935`
- Text:        `#1F2937`
- Border:      `#E5E7EB`
- Background:  `#FFFFFF / #0B0F14`

### Typography scale

- H1:   32px / Semibold
- H2:   24px / Semibold
- H3:   18px / Medium
- Body: 15px / Regular
- Mono: Evidence snippets only

### Spacing

- Base unit: 8px
- Section spacing: 24–32px
- Card padding: 16–24px

---

## Emotional thesis

ProofStack feels like a trusted colleague quietly checking your work — thorough, calm, and never dramatic.

---

## Design integrity review

The design aligns emotional calm with technical rigor.  
It avoids false confidence while reinforcing trust through clarity, restraint, and explanation.

### One improvement to consider

Introduce a subtle **“confidence gradient” over time** (e.g., trust score trend) to reinforce ProofStack as a long-term auditing companion, not just a one-off checker.
