"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useRef } from "react";

import { getPrefs, setLastSession, setPrefs } from "@/lib/sessionStore";
import type { DomainPreset, StrictnessPreset, VerificationSession } from "@/lib/types/proofstack";

const DOMAIN_OPTIONS: DomainPreset[] = ["Cyber/Security"];
const STRICTNESS_OPTIONS: StrictnessPreset[] = ["Fast", "Balanced", "Strict"];
const DEFAULT_QUESTION = "Analyze this incident and recommend remediation steps.";
const CHALLENGE_QUESTION =
  "Challenge demo: Analyze this incident and determine whether all authentication attempts were successful.";

const LOADING_STEPS = [
  "Ingesting source documents...",
  "Extracting security claims...",
  "Retrieving evidence snippets...",
  "Running verification engine...",
  "Finalizing trust report...",
];

export default function HomePage() {
  const router = useRouter();
  const [question, setQuestion] = useState<string>(DEFAULT_QUESTION);
  const [domain, setDomain] = useState<DomainPreset>("Cyber/Security");
  const [strictness, setStrictness] = useState<StrictnessPreset>("Balanced");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const prefs = getPrefs();
    setDomain(prefs.domain);
    setStrictness(prefs.strictness);
  }, []);

  // Cycle loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  function completeVerificationRun(data: VerificationSession) {
    setLastSession(data);
    setLastSessionId(data.id);

    // Navigate to report automatically after 800ms success delay
    setTimeout(() => {
      router.push("/report");
    }, 800);
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (uploadedFiles.length === 0) {
      setErrorMessage("Please attach source documents before running verification.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("question", question);
      formData.append("domain", domain);
      formData.append("strictness", strictness);

      uploadedFiles.forEach(file => {
        formData.append("files", file);
      });
      formData.append("useDemoDataset", "false");

      const response = await fetch("/api/verify", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Verify request failed with status ${response.status}`);
      }

      const data = (await response.json()) as VerificationSession;
      completeVerificationRun(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown verify error";
      setErrorMessage(message);
      setLastSessionId(null);
      setIsLoading(false);
    }
  }

  async function handleRunChallengeDemo() {
    setIsLoading(true);
    setErrorMessage("");
    setQuestion(CHALLENGE_QUESTION);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: CHALLENGE_QUESTION,
          domain,
          strictness,
          useDemoDataset: true,
          challengeMode: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Challenge demo failed with status ${response.status}`);
      }

      const data = (await response.json()) as VerificationSession;
      completeVerificationRun(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown challenge demo error";
      setErrorMessage(message);
      setLastSessionId(null);
      setIsLoading(false);
    }
  }

  function handleDomainChange(value: DomainPreset) {
    setDomain(value);
    setPrefs({ domain: value });
  }

  function handleStrictnessChange(value: StrictnessPreset) {
    setStrictness(value);
    setPrefs({ strictness: value });
  }

  return (
    <section className="stack" style={{ gap: '0' }}>
      <div className="hero-shell">
        {/* Floating Background Intelligence Assets */}
        <div className="hero-visual-wrapper">
          <div className="floating-asset asset-sticky">
            <div className="panel" style={{
              padding: '16px',
              maxWidth: '220px',
              background: 'rgba(254, 249, 195, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(234, 179, 8, 0.2)',
              transform: 'rotate(-2deg)',
              boxShadow: '0 20px 40px -15px rgba(133, 77, 14, 0.15)',
              borderRadius: '12px'
            }}>
              <div style={{ width: '8px', height: '8px', background: '#dc2626', borderRadius: '50%', margin: '0 auto 10px' }} />
              <p style={{ fontSize: '0.9rem', color: '#854d0e', fontWeight: 600, lineHeight: 1.4, textAlign: 'left' }}>
                Double check the breach incident report for claim extraction...
              </p>
            </div>
          </div>

          <div className="floating-asset asset-checkbox">
            <div className="panel" style={{
              padding: '24px',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'white',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'var(--accent)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.25rem',
                fontWeight: 800
              }}>✓</div>
            </div>
          </div>

          <div className="floating-asset asset-reminder">
            <div className="panel" style={{
              padding: '24px',
              borderRadius: '32px',
              textAlign: 'left',
              minWidth: '280px',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-xl)'
            }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.08em' }}>Active Audit</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  background: 'var(--canvas)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                }}>🕒</div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', margin: 0 }}>Soc2 Compliance</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Verification in progress</p>
                </div>
              </div>
            </div>
          </div>

          <div className="floating-asset asset-integrations">
            <div className="panel" style={{
              padding: '28px',
              borderRadius: '34px',
              minWidth: '320px',
              background: 'white',
              boxShadow: '0 30px 60px -12px rgba(0,0,0,0.1)',
              border: '1px solid var(--border)'
            }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '0.08em' }}>Verified Intelligence</p>
              <div style={{ display: 'flex', gap: '14px' }}>
                {['📄', '📊', '🛡️', '⚡'].map((emoji, i) => (
                  <div key={i} style={{
                    width: '48px',
                    height: '48px',
                    background: 'var(--surface-soft)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    transition: 'transform 0.2s ease'
                  }}>{emoji}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="hero-content">
          <div style={{ marginBottom: '12px' }}>
            <span className="hero-kicker" style={{ borderRadius: '999px', padding: '8px 20px', fontSize: '0.85rem' }}>ProofStack AI Auditor v2.1</span>
          </div>
          <h1 className="hero-title">Think, verify, and trace <br /> all in one place.</h1>
          <p className="hero-subtitle" style={{ fontSize: '1.3rem', maxWidth: '42ch' }}>
            Bridge the trust gap in security operations. ProofStack automatically
            audits AI-generated security briefs against your ground-truth data.
          </p>
          <div className="hero-actions">
            <a href="#run-verification" className="button-primary">
              Run Verification Engine
            </a>
            <Link href="/report" className="button-secondary">
              Inspect Latest Audit
            </Link>
          </div>
        </div>
      </div>

      <div className="mission-grid">
        <article className="mission-card">
          <div className="card-icon">🔍</div>
          <h3>Traceable by Design</h3>
          <p className="helper-line">
            Every AI verdict points directly to exact evidence snippets. No more hunting for "receipts."
          </p>
        </article>
        <article className="mission-card">
          <div className="card-icon">🛡️</div>
          <h3>Defensible Reports</h3>
          <p className="helper-line">
            Generate audit-ready artifacts for stakeholders, regulators, or incident response leaders.
          </p>
        </article>
        <article className="mission-card">
          <div className="card-icon">⚡</div>
          <h3>Paced for Security</h3>
          <p className="helper-line">
            Built for high-pressure security environments where speed and accuracy are non-negotiable.
          </p>
        </article>
      </div>

      <div id="run-verification" className="section-header">
        <p className="kicker">Evidence Launchpad</p>
        <h2 className="page-heading">Run a Verification Pass</h2>
        <p className="page-subtitle">
          Configure your investigation parameters and run the verification engine.
        </p>
      </div>


      <div className="engine-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px', padding: '0 60px 140px' }}>
        <div className="panel stack">
          <h3>1. Source Documents</h3>
          <p className="helper-line">Upload security documents such as Incident Reports, Security Policies, System Logs, or Threat Intel feeds for evidence-backed verification.</p>

          <div
            className="upload-zone"
            onClick={triggerFileUpload}
          >
            <span className="upload-icon">📁</span>
            <p style={{ fontWeight: 600 }}>Click to upload files</p>
            <p className="helper-line">Supports PDF, TXT, MD</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept=".pdf,.txt,.md"
              style={{ display: 'none' }}
            />
          </div>

          <div className="source-grid" style={{ marginTop: '16px' }}>
            {uploadedFiles.length > 0 ? (
              uploadedFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="source-chip">
                  <span className="source-icon">📄</span>
                  <strong>{file.name}</strong>
                  <button
                    type="button"
                    className="remove-source-btn"
                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <p className="section-note" style={{ textAlign: 'center', opacity: 0.6 }}>
                No files uploaded. Will use <code>datasets/demo1</code> if empty.
              </p>
            )}
          </div>
        </div>

        <form className="panel stack" onSubmit={handleVerify}>
          <h3>2. Configuration & Execution</h3>
          <p className="helper-line">
            Define your inquiry and set the verification rigor level.
          </p>

          <div className="stack" style={{ gap: '8px' }}>
            <label htmlFor="question">Investigation Question</label>
            <textarea
              id="question"
              rows={4}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Enter your security-related question..."
            />
          </div>

          <div className="form-grid">
            <div className="stack" style={{ gap: '8px' }}>
              <label htmlFor="domain">Domain</label>
              <select
                id="domain"
                value={domain}
                onChange={(event) => handleDomainChange(event.target.value as DomainPreset)}
              >
                {DOMAIN_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="stack" style={{ gap: '8px' }}>
              <label htmlFor="strictness">Strictness Level</label>
              <select
                id="strictness"
                value={strictness}
                onChange={(event) => handleStrictnessChange(event.target.value as StrictnessPreset)}
              >
                {STRICTNESS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
            <button type="submit" className="button-primary" disabled={isLoading} style={{ width: '100%', minHeight: '52px', fontSize: '1.1rem' }}>
              {isLoading ? "Running Verification..." : "Run Verification Engine"}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={handleRunChallengeDemo}
              disabled={isLoading}
              style={{ width: "100%", minHeight: "48px" }}
            >
              {isLoading ? "Preparing Demo..." : "Run Failure Challenge Demo"}
            </button>
            <p className="helper-line" style={{ margin: 0 }}>
              Challenge demo uses <code>datasets/demo1</code> and injects one false claim so you can show ProofStack catching it.
            </p>
          </div>

          {errorMessage ? (
            <p role="alert" className="alert">
              {errorMessage}
            </p>
          ) : null}
        </form>
      </div>

      {lastSessionId ? (
        <div className="panel cta-card panel-raised" style={{ marginTop: '24px', borderLeft: '4px solid var(--success)' }}>
          <p className="status-banner" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <span>Verification complete and saved locally.</span>
          </p>
          <p style={{ marginLeft: '40px', color: 'var(--text-secondary)' }}>
            Session ID: <code>{lastSessionId}</code>
          </p>
          <div style={{ marginLeft: '40px', marginTop: '12px' }}>
            <Link href="/report" className="button-primary">
              View Trust Report & Evidence
            </Link>
          </div>
        </div>
      ) : null}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="loading-spinner-wrapper">
              <div className="loading-pulse" />
              <div className="loading-spinner" />
            </div>
            <div className="loading-text-stack">
              <p className="loading-subtext">Verification in progress</p>
              <p className="loading-step-text">{LOADING_STEPS[loadingStep]}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
