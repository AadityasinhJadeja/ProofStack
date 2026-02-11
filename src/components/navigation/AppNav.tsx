"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/report", label: "Report" },
  { href: "/claims", label: "Claims" },
  { href: "/settings", label: "Settings" },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="top-nav" aria-label="Primary">
      {NAV_LINKS.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/" && pathname?.startsWith(`${link.href}/`)) ||
          (link.href === "/report" && pathname === "/reports") ||
          (link.href === "/claims" && pathname === "/claim");

        return (
          <Link
            key={link.href}
            href={link.href}
            className={isActive ? "top-nav-link top-nav-link-active" : "top-nav-link"}
            aria-current={isActive ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
