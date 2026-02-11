"use client";

import { useEffect, useState } from "react";

import { getPrefs, setPrefs } from "@/lib/sessionStore";
import type { DomainPreset, StrictnessPreset } from "@/lib/types/proofstack";

const domainPresets: DomainPreset[] = ["Cyber/Security"];
const strictnessPresets: StrictnessPreset[] = ["Fast", "Balanced", "Strict"];

export default function SettingsPage() {
  const [domain, setDomain] = useState<DomainPreset>("Cyber/Security");
  const [strictness, setStrictness] = useState<StrictnessPreset>("Balanced");
  const [status, setStatus] = useState<string>("Preferences are saved locally.");

  useEffect(() => {
    const prefs = getPrefs();
    setDomain(prefs.domain);
    setStrictness(prefs.strictness);
  }, []);

  function save(nextDomain: DomainPreset, nextStrictness: StrictnessPreset) {
    setPrefs({ domain: nextDomain, strictness: nextStrictness });
    setStatus("Saved locally.");
  }

  return (
    <section className="stack">
      <div className="section-header">
        <p className="kicker">Workspace Controls</p>
        <h1 className="page-heading">Preferences (saved locally)</h1>
        <p className="page-subtitle">
          Set your default domain and strictness presets. Home page will preload these values.
        </p>
      </div>
      <div className="panel stack">
        <label htmlFor="domain">Domain preset</label>
        <select
          id="domain"
          name="domain"
          value={domain}
          onChange={(event) => {
            const next = event.target.value as DomainPreset;
            setDomain(next);
            save(next, strictness);
          }}
        >
          {domainPresets.map((preset) => (
            <option key={preset} value={preset}>
              {preset}
            </option>
          ))}
        </select>

        <label htmlFor="strictness">Strictness preset</label>
        <select
          id="strictness"
          name="strictness"
          value={strictness}
          onChange={(event) => {
            const next = event.target.value as StrictnessPreset;
            setStrictness(next);
            save(domain, next);
          }}
        >
          {strictnessPresets.map((preset) => (
            <option key={preset} value={preset}>
              {preset}
            </option>
          ))}
        </select>

        <p className="status-banner">{status}</p>
      </div>
    </section>
  );
}
