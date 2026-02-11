"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Sun, Moon } from "lucide-react";
import { useThemeContext } from "@/lib/theme";

export function TopBar() {
  const pathname = usePathname();
  const { theme, toggle: toggleTheme } = useThemeContext();

  let title = "Birdie";
  if (pathname === "/rounds") title = "Rounds";
  else if (pathname === "/trends") title = "Trends";
  else if (pathname === "/new-round") title = "New Round";
  else if (pathname.startsWith("/rounds/")) title = "Dashboard";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-olive/30 bg-forest px-4 lg:hidden">
      <Link href="/" className="text-lg font-bold text-cornsilk">
        Birdie
      </Link>
      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="mr-2 flex h-9 w-9 items-center justify-center rounded-lg text-cornsilk/50 transition-colors hover:bg-olive/40 hover:text-cornsilk/80"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>

      {/* Search trigger */}
      <button
        onClick={() => {
          window.dispatchEvent(
            new KeyboardEvent("keydown", { key: "k", metaKey: true })
          );
        }}
        className="mr-2 flex h-9 w-9 items-center justify-center rounded-lg text-cornsilk/50 transition-colors hover:bg-olive/40 hover:text-cornsilk/80"
        aria-label="Open command palette"
      >
        <Search className="h-4 w-4" />
      </button>

      <span className="text-sm font-medium text-cornsilk/50">{title}</span>
    </header>
  );
}
