import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AppNav } from "@/components/navigation/AppNav";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <main className="page-shell">
          <header className="app-header">
            <div className="app-topbar">
              <Link href="/" className="brand-link" aria-label="ProofStack Home">
                <span className="brand-icon" aria-hidden="true">
                  <span className="brand-dot brand-dot-active" />
                  <span className="brand-dot" />
                  <span className="brand-dot" />
                  <span className="brand-dot" />
                </span>
                <span className="brand-name">ProofStack</span>
              </Link>
              <AppNav />
              <Link href="/" className="button-secondary topbar-cta">
                Run Demo
              </Link>
            </div>
            <p className="brand-subtitle">Evidence-backed AI verification for security decisions</p>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
