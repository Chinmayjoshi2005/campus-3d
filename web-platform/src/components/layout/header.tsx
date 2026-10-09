"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Compass, Gamepad2 } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/campus?mode=explore", label: "Explore Campus" },
  { href: "/campus?mode=game", label: "Game Mode" },
  { href: "/campus?mode=directory", label: "Directory" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentMode = searchParams.get("mode");
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" && !currentMode;
    if (href.includes("mode=")) {
      const targetMode = href.split("mode=")[1];
      return pathname === "/campus" && currentMode === targetMode;
    }
    return pathname === href;
  };

  return (
    <header className="neo-header" role="banner">
      <div className="neo-header-inner">
        <div className="neo-history">
          <button
            className="neo-nav-btn"
            onClick={() => router.back()}
            aria-label="Go back"
            type="button"
          >
            &lt;
          </button>
          <button
            className="neo-nav-btn"
            onClick={() => router.forward()}
            aria-label="Go forward"
            type="button"
          >
            &gt;
          </button>
        </div>

        <Link href="/" className="neo-logo">
          <span className="neo-logo-dot" aria-hidden="true" />
          <span className="neo-logo-text">Campus Guide 3D</span>
        </Link>

        <nav className="neo-nav" aria-label="Primary">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`neo-nav-link${isActive(href) ? " active" : ""}`}
              aria-current={isActive(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="neo-actions">
          <Link
            href="/campus?mode=game"
            className="neo-nav-btn flex items-center gap-1.5"
            aria-label="Game Mode"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Game</span>
          </Link>
          <Link href="/campus?mode=explore" className="neo-cta flex items-center gap-1.5">
            <Compass className="w-4 h-4" />
            <span>Enter 3D</span>
          </Link>
        </div>

        <button
          className="neo-mobile-toggle"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
          type="button"
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>

      <div className={`neo-mobile-menu${mobileOpen ? " open" : ""}`}>
        <nav aria-label="Mobile">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`neo-nav-link${isActive(href) ? " active" : ""}`}
              onClick={() => setMobileOpen(false)}
              aria-current={isActive(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/campus?mode=explore"
            className="neo-cta"
            onClick={() => setMobileOpen(false)}
          >
            Enter Campus 3D
          </Link>
        </nav>
      </div>
    </header>
  );
}
