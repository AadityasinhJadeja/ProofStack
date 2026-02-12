export default function AboutPage() {
  return (
    <section className="about-page stack">
      <div className="about-hero panel-raised">
        <div className="about-hero-copy stack">
          <p className="kicker">About ProofStack</p>
          <h1 className="about-hero-title">From AI Guesswork to Security Decisions You Can Defend</h1>
          <p className="helper-line">
            ProofStack is a verification layer for cybersecurity teams. It audits AI output against your real
            sources, quantifies trust, and produces an artifact you can hand to a reviewer without hand-waving.
          </p>
          <p className="section-note">
            Claim cap: 12 | Evidence per claim: top-3 | Trust score: deterministic 0-100
          </p>
        </div>

        <div className="about-orbit" aria-hidden="true">
          <div className="about-orbit-core">
            <p>ProofStack</p>
            <strong>Trust Engine</strong>
          </div>
          <div className="about-orbit-node about-orbit-node-a">Ingest Sources</div>
          <div className="about-orbit-node about-orbit-node-b">Verify Claims</div>
          <div className="about-orbit-node about-orbit-node-c">Export Report</div>
        </div>
      </div>

      <div className="about-value-grid">
        <article className="panel about-value-card">
          <p className="kicker">What It Is</p>
          <h3>Verification Instrument, Not a Chatbot</h3>
          <p className="helper-line">
            AI answer in, auditable trust report out. Every score and citation remains inspectable.
          </p>
        </article>
        <article className="panel about-value-card">
          <p className="kicker">Why It Exists</p>
          <h3>Security Work Needs Defensible Output</h3>
          <p className="helper-line">
            Confident language without evidence creates incident and compliance risk.
          </p>
        </article>
        <article className="panel about-value-card">
          <p className="kicker">Mission</p>
          <h3>Make AI Outputs Review-Ready</h3>
          <p className="helper-line">
            Replace “trust me” with traceable claims, evidence lineage, and risk metrics.
          </p>
        </article>
      </div>

      <div className="panel stack about-flow-shell">
        <div className="about-flow-header">
          <p className="kicker">How It Works</p>
          <h2>One Calm, End-to-End Verification Flow</h2>
        </div>
        <div className="about-flow-rail" aria-hidden="true" />
        <div className="about-flow-grid">
          <article className="about-flow-step">
            <span className="about-step-index">1</span>
            <h3>Ingest</h3>
            <p className="helper-line">Load incident reports, policies, and logs as source-of-truth evidence.</p>
          </article>
          <article className="about-flow-step">
            <span className="about-step-index">2</span>
            <h3>Generate + Decompose</h3>
            <p className="helper-line">Draft answer is split into atomic claims that can each be tested.</p>
          </article>
          <article className="about-flow-step">
            <span className="about-step-index">3</span>
            <h3>Verify</h3>
            <p className="helper-line">Each claim is judged Supported, Weak, or Unsupported using retrieved snippets.</p>
          </article>
          <article className="about-flow-step">
            <span className="about-step-index">4</span>
            <h3>Score + Redline + Export</h3>
            <p className="helper-line">Produce trust score, rewrite safely, and export report for audit handoff.</p>
          </article>
        </div>
      </div>

      <div className="results-layout">
        <div className="panel stack">
          <p className="kicker">What You See</p>
          <h2>Built for First-Time Clarity</h2>
          <ul>
            <li>Score Explainability with formula and per-claim contribution.</li>
            <li>Evidence Lineage clickthrough from citations to source chunks.</li>
            <li>Challenge demo mode that intentionally injects a false claim.</li>
            <li>Quantified impact metrics for decision and review speed.</li>
          </ul>
        </div>
        <div className="panel stack">
          <p className="kicker">Judge Lens</p>
          <h2>Why This Is More Than an API Wrapper</h2>
          <ul>
            <li>Deterministic scoring logic with visible weights and penalties.</li>
            <li>Structured claims and verdicts, not one-shot text generation.</li>
            <li>Traceable lineage from conclusion back to source evidence.</li>
            <li>Audit-ready markdown artifact export by session.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
