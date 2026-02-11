"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState, useRef } from "react";

import { getPrefs, setLastSession, setPrefs } from "@/lib/sessionStore";
import type { DomainPreset, StrictnessPreset, VerificationSession } from "@/lib/types/proofstack";

const DOMAIN_OPTIONS: DomainPreset[] = ["Cyber/Security"];
const STRICTNESS_OPTIONS: StrictnessPreset[] = ["Fast", "Balanced", "Strict"];
const DEFAULT_QUESTION = "Analyze this incident and recommend remediation steps.";

export default function HomePage() {
  const [question, setQuestion] = useState<string>(DEFAULT_QUESTION);
  const [domain, setDomain] = useState<DomainPreset>("Cyber/Security");
  const [strictness, setStrictness] = useState<StrictnessPreset>("Balanced");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const prefs = getPrefs();
    setDomain(prefs.domain);
    setStrictness(prefs.strictness);
  }, []);

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

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("question", question);
      formData.append("domain", domain);
      formData.append("strictness", strictness);

      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach(file => {
          formData.append("files", file);
        });
        formData.append("useDemoDataset", "false");
      } else {
        formData.append("useDemoDataset", "true");
      }

      const response = await fetch("/api/verify", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Verify request failed with status ${response.status}`);
      }

      const data = (await response.json()) as VerificationSession;
      setLastSession(data);
      setLastSessionId(data.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown verify error";
      setErrorMessage(message);
      setLastSessionId(null);
    } finally {
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
    <section className="stack">
      <div className="hero-shell">
        <div className="hero-content">
          <p className="hero-kicker">Cyber Trust Layer</p>
          <h1 className="hero-title">AI output you can actually defend.</h1>
          <p className="hero-subtitle">
            ProofStack turns raw AI draft answers into audit-ready trust reports by extracting claims,
            tracing source evidence, and surfacing hallucination risks before they hit production.
          </p>
          <div className="hero-actions">
            <a href="#run-verification" className="button-primary">
              Run Verification Pass
            </a>
            <Link href="/report" className="button-secondary">
              Inspect Latest Audit
            </Link>
          </div>
        </div>

        <div className="hero-visual-wrapper">
          <img
            src="/images/hero_visual.png"
            alt="ProofStack Verification Visual"
            className="hero-image"
          />
          <div className="hero-glass-card">
            <div className="glass-stat">
              <span className="stat-label">Verification Rate</span>
              <span className="stat-value">99.8%</span>
            </div>
            <div className="glass-divider" />
            <div className="glass-stat">
              <span className="stat-label">Source Traceability</span>
              <span className="stat-value">Instant</span>
            </div>
          </div>
        </div>

        <div className="hero-chip-grid" aria-label="Key Benefits">
          <article className="hero-chip">
            <p className="kicker">Problem</p>
            <p>AI hallucinations in security ops can lead to catastrophic false confidence.</p>
          </article>
          <article className="hero-chip">
            <p className="kicker">Solution</p>
            <p>Rigorous claim-by-claim verification against your own ground-truth docs.</p>
          </article>
          <article className="hero-chip">
            <p className="kicker">Trust</p>
            <p>A verifiable audit trail for every single word the AI generates.</p>
          </article>
          <article className="hero-chip">
            <p className="kicker">Scale</p>
            <p>Maintain manual oversight quality at automated response speeds.</p>
          </article>
        </div>
      </div>

      <div className="mission-grid">
        <article className="panel mission-card">
          <div className="card-icon">🔍</div>
          <h3>Source-Grounded by Design</h3>
          <p className="helper-line">
            Every verdict points directly to exact evidence snippets and source filenames. No more hunting for "receipts."
          </p>
        </article>
        <article className="panel mission-card">
          <div className="card-icon">🛡️</div>
          <h3>Audit-Ready Artifacts</h3>
          <p className="helper-line">
            Generate defensible markdown reports ready for stakeholders, regulators, or incident response leaders.
          </p>
        </article>
        <article className="panel mission-card">
          <div className="card-icon">⚡</div>
          <h3>Incident-Paced Review</h3>
          <p className="helper-line">
            Purpose-built interface for high-pressure security environments where speed and accuracy are non-negotiable.
          </p>
        </article>
      </div>

      <div id="run-verification" className="section-header" style={{ marginTop: '60px' }}>
        <p className="kicker">Verification Engine</p>
        <h2 className="page-heading page-heading-sub">Run an Evidence Pass</h2>
        <p className="page-subtitle">
          Configure your investigation parameters and run the verification engine.
          ProofStack will trace every claim in the draft against your source documents.
        </p>
      </div>

      <div className="engine-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
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

          <button type="submit" className="button-primary" disabled={isLoading} style={{ marginTop: '12px', width: '100%', minHeight: '52px', fontSize: '1.1rem' }}>
            {isLoading ? "Running Verification..." : "Run Verification Engine"}
          </button>

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
    </section>
  );
}
