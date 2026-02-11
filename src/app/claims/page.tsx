export default function ClaimsPage() {
  return (
    <section className="stack">
      <h1>Claims Table</h1>
      <div className="panel">
        <p>Claims Table placeholder.</p>
        <table>
          <thead>
            <tr>
              <th align="left">Claim</th>
              <th align="left">Verdict</th>
              <th align="left">Confidence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sample claim row (not connected to pipeline yet)</td>
              <td>Pending</td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
