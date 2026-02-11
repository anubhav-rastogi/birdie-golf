"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, TrendingUp, Plus, Search, Sun, Moon, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeContext } from "@/lib/theme";
import { useAuth } from "@/lib/auth";

const navItems = [
  {
    label: "Rounds",
    href: "/rounds",
    icon: ClipboardList,
  },
  {
    label: "Trends",
    href: "/trends",
    icon: TrendingUp,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle: toggleTheme } = useThemeContext();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-olive/30 bg-forest lg:flex">
      {/* Logo */}
      <div className="flex h-14 items-center px-5">
        <Link href="/" className="text-lg font-bold text-cornsilk">
          Birdie
        </Link>
      </div>

      {/* Command palette trigger */}
      <button
        onClick={() => {
          window.dispatchEvent(
            new KeyboardEvent("keydown", { key: "k", metaKey: true })
          );
        }}
        className="mx-3 mb-2 flex items-center gap-2 rounded-lg border border-olive/50 bg-olive/30 px-3 py-2 text-xs text-cornsilk/40 transition-colors hover:border-olive hover:text-cornsilk/60"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="rounded bg-olive/50 px-1.5 py-0.5 text-[10px] font-medium">
          ⌘K
        </kbd>
      </button>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 px-3 pt-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-olive text-cornsilk"
                  : "text-cornsilk/50 hover:bg-olive/40 hover:text-cornsilk/80"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px]", isActive && "text-clay")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="flex flex-col gap-2 p-3">
        {/* User info */}
        {user && (
          <div className="mb-1 rounded-lg bg-olive/30 px-3 py-2">
            <p className="truncate text-sm font-medium text-cornsilk">{user.name}</p>
            <p className="truncate text-xs text-cornsilk/40">{user.email}</p>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-cornsilk/50 transition-colors duration-150 hover:bg-olive/40 hover:text-cornsilk/80"
        >
          {theme === "dark" ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>

        {/* Sign out */}
        <button
          onClick={logout}
          className="focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-cornsilk/50 transition-colors duration-150 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign Out
        </button>

        {/* New Round CTA */}
        <Link
          href="/new-round"
          className={cn(
            "focus-ring flex items-center justify-center gap-2 rounded-lg bg-clay px-4 py-3 text-sm font-bold text-forest",
            "transition-all duration-150 hover:bg-copper active:scale-[0.98]"
          )}
        >
          <Plus className="h-4 w-4" />
          New Round
        </Link>
      </div>
    </aside>
  );
}
