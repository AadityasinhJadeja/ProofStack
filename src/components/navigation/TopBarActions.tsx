"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopBarActions() {
    const pathname = usePathname();
    const isHome = pathname === "/";

    if (!isHome) return null;

    return (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link
                href="/"
                className="button-primary"
                style={{
                    borderRadius: '999px',
                    minHeight: '40px',
                    padding: '0 24px',
                    boxShadow: 'none',
                    border: '1px solid var(--accent)'
                }}
            >
                Get demo
            </Link>
        </div>
    );
}
