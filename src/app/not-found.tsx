import Link from "next/link";

export default function NotFound() {
  return (
    <section className="stack">
      <div className="section-header">
        <p className="kicker">Route Not Found</p>
        <h1 className="page-heading">This page is unavailable</h1>
        <p className="page-subtitle">
          The link may be outdated, or the route may have been mistyped. Use one of the shortcuts below to
          continue.
        </p>
      </div>

      <div className="panel stack empty-state">
        <div className="filter-row">
          <Link href="/" className="button-link">
            Go to Home
          </Link>
          <Link href="/report" className="button-link">
            Open Report
          </Link>
          <Link href="/claims" className="button-link">
            Open Claims
          </Link>
        </div>
      </div>
    </section>
  );
}
