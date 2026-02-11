import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AppNav } from "@/components/navigation/AppNav";
import { TopBarActions } from "@/components/navigation/TopBarActions";


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
              <div className="topbar-left">
                <Link href="/" className="brand-link" aria-label="ProofStack Home">
                  <span className="brand-icon" aria-hidden="true">
                    <span className="brand-dot" />
                    <span className="brand-dot" />
                    <span className="brand-dot" />
                    <span className="brand-dot" />
                  </span>
                  <span className="brand-name">ProofStack</span>
                </Link>
              </div>

              <AppNav />

              <div className="topbar-right" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <TopBarActions />
              </div>
            </div>



          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
