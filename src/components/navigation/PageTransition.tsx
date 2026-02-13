"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const previousPathRef = useRef(pathname);
  const [transitionSeed, setTransitionSeed] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (previousPathRef.current === pathname) {
      return;
    }

    previousPathRef.current = pathname;
    setTransitionSeed((value) => value + 1);
    setIsTransitioning(true);

    const timerId = window.setTimeout(() => {
      setIsTransitioning(false);
    }, 520);

    return () => window.clearTimeout(timerId);
  }, [pathname]);

  return (
    <div className="route-transition-shell">
      <div key={`${pathname}-${transitionSeed}`} className="route-transition-content">
        {children}
      </div>
      <div
        className={isTransitioning ? "route-transition-sheen route-transition-sheen-active" : "route-transition-sheen"}
        aria-hidden="true"
      />
    </div>
  );
}
