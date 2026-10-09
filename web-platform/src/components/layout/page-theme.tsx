"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type PageTheme =
  | "home"
  | "campus"
  | "explore"
  | "game"
  | "admin"
  | "login"
  | "default";

function getPageTheme(pathname: string, mode?: string | null): PageTheme {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname === "/login") return "login";
  if (pathname === "/gamemode") return "game";
  if (pathname === "/exploremode") return "explore";
  if (pathname === "/campus" && mode === "game") return "game";
  if (pathname === "/campus") return "campus";
  return "default";
}

export function PageTheme() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const theme = getPageTheme(pathname, searchParams?.get("mode"));

  useEffect(() => {
    document.documentElement.dataset.pageTheme = theme;
    document.body.dataset.pageTheme = theme;

    return () => {
      if (document.documentElement.dataset.pageTheme === theme) {
        delete document.documentElement.dataset.pageTheme;
      }
      if (document.body.dataset.pageTheme === theme) {
        delete document.body.dataset.pageTheme;
      }
    };
  }, [theme]);

  return <div className="page-theme-backdrop" aria-hidden="true" />;
}
