"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

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

  useEffect(() => {
    const prefs = getPrefs();
    setDomain(prefs.domain);
    setStrictness(prefs.strictness);
  }, []);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          useDemoDataset: true,
          domain,
          strictness,
        }),
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
      <h1>Session Setup + Run</h1>

      <div className="panel stack">
        <h2>Upload</h2>
        <p>Demo sources loaded (Phase 4: uploads)</p>
        <input type="file" disabled aria-label="Upload source documents" />
      </div>

      <form className="panel stack" onSubmit={handleVerify}>
        <h2>Run Verification</h2>

        <label htmlFor="question">Question</label>
        <textarea
          id="question"
          rows={4}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />

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

        <label htmlFor="strictness">Strictness</label>
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

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Verifying..." : "Run Verification"}
        </button>

        {errorMessage ? <p role="alert">{errorMessage}</p> : null}
      </form>

      {lastSessionId ? (
        <div className="panel stack">
          <p>Verification complete.</p>
          <p>
            Session ID: <code>{lastSessionId}</code>
          </p>
          <div>
            <Link href="/report" className="button-link">
              View Trust Report
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
