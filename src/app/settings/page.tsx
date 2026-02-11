const strictnessPresets = ["Fast", "Balanced", "Strict"];

export default function SettingsPage() {
  return (
    <section className="stack">
      <h1>Settings</h1>
      <div className="panel stack">
        <label htmlFor="domain">Domain preset</label>
        <select id="domain" name="domain" defaultValue="Cyber/Security">
          <option>Cyber/Security</option>
        </select>

        <label htmlFor="strictness">Strictness preset</label>
        <select id="strictness" name="strictness" defaultValue="Balanced">
          {strictnessPresets.map((preset) => (
            <option key={preset}>{preset}</option>
          ))}
        </select>

        <p>Phase 1 scaffold only. Presets are static and not persisted yet.</p>
      </div>
    </section>
  );
}
