import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofStack",
  description: "ProofStack scaffolding for Cyber/Security verification workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="page-shell">
          <nav className="top-nav" aria-label="Primary">
            <Link href="/">Home</Link>
            <Link href="/report">Report</Link>
            <Link href="/claims">Claims</Link>
            <Link href="/settings">Settings</Link>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}
