"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopBarActions() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (!isHome) {
    return null;
  }

  return (
    <div className="topbar-actions">
      <Link href="/" className="button-primary topbar-demo-button">
        Get demo
      </Link>
    </div>
  );
}
