"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  ClipboardList,
  TrendingUp,
  Plus,
  BarChart3,
  Target,
  Sun,
  Moon,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeContext } from "@/lib/theme";
import { mockRounds } from "@/lib/mock-data";

interface PaletteItem {
  id: string;
  label: string;
  detail?: string;
  icon: React.ReactNode;
  action: () => void;
  section: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggle: toggleTheme } = useThemeContext();

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
    },
    [router]
  );

  const items = useMemo<PaletteItem[]>(() => {
    const nav: PaletteItem[] = [
      {
        id: "rounds",
        label: "Go to Rounds",
        detail: "Round history",
        icon: <ClipboardList className="h-4 w-4" />,
        action: () => navigate("/rounds"),
        section: "Navigation",
      },
      {
        id: "trends",
        label: "Go to Trends",
        detail: "Performance analytics",
        icon: <TrendingUp className="h-4 w-4" />,
        action: () => navigate("/trends"),
        section: "Navigation",
      },
      {
        id: "new-round",
        label: "Start New Round",
        detail: "Set up and go",
        icon: <Plus className="h-4 w-4" />,
        action: () => navigate("/new-round"),
        section: "Navigation",
      },
    ];

    const actions: PaletteItem[] = [
      {
        id: "toggle-theme",
        label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        detail: `Currently ${theme}`,
        icon: theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
        action: () => {
          toggleTheme();
          setOpen(false);
        },
        section: "Actions",
      },
      {
        id: "shortcuts",
        label: "Keyboard Shortcuts",
        detail: "View all shortcuts",
        icon: <Keyboard className="h-4 w-4" />,
        action: () => {
          setOpen(false);
          // Could open a shortcuts help modal — for now just a toast
        },
        section: "Actions",
      },
    ];

    const rounds: PaletteItem[] = mockRounds
      .filter((r) => r.status === "completed")
      .slice(0, 5)
      .map((r) => ({
        id: `round-${r.id}`,
        label: r.courseName,
        detail: `${r.date} — ${r.score} (${r.vsPar > 0 ? "+" : ""}${r.vsPar === 0 ? "E" : r.vsPar})`,
        icon: <BarChart3 className="h-4 w-4" />,
        action: () => navigate(`/rounds/${r.id}`),
        section: "Recent Rounds",
      }));

    // Active round shortcut
    const active = mockRounds.find((r) => r.status === "active");
    if (active) {
      rounds.unshift({
        id: "active-round",
        label: `Continue: ${active.courseName}`,
        detail: active.holeProgress ?? "In progress",
        icon: <Target className="h-4 w-4" />,
        action: () => navigate(`/round/${active.id}`),
        section: "Active Round",
      });
    }

    return [...nav, ...actions, ...rounds];
  }, [navigate, theme, toggleTheme]);

  // Fuzzy filter
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.detail && item.detail.toLowerCase().includes(q)) ||
        item.section.toLowerCase().includes(q)
    );
  }, [items, query]);

  // Group by section
  const grouped = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    for (const item of filtered) {
      const arr = map.get(item.section) ?? [];
      arr.push(item);
      map.set(item.section, arr);
    }
    return map;
  }, [filtered]);

  // Reset selection on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Cmd+K listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard nav inside palette
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    }
  }

  if (!open) return null;

  let flatIdx = 0;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-forest/80 animate-backdrop"
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div className="relative z-10 w-full max-w-lg animate-slide-up rounded-xl border border-olive/50 bg-forest shadow-md">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-olive/30 px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-cornsilk/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-cornsilk placeholder:text-cornsilk/30 outline-none"
          />
          <kbd className="hidden rounded bg-olive/50 px-2 py-0.5 text-[10px] font-medium text-cornsilk/40 sm:block">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto py-2 scrollbar-hide">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-cornsilk/40">
              No results found.
            </p>
          )}

          {Array.from(grouped.entries()).map(([section, sectionItems]) => (
            <div key={section}>
              <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-cornsilk/30">
                {section}
              </p>
              {sectionItems.map((item) => {
                const thisIdx = flatIdx++;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(thisIdx)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                      thisIdx === selectedIndex
                        ? "bg-olive text-cornsilk"
                        : "text-cornsilk/70 hover:bg-olive/50"
                    )}
                  >
                    <span className="shrink-0 text-clay">{item.icon}</span>
                    <span className="flex-1">
                      <span className="font-medium">{item.label}</span>
                      {item.detail && (
                        <span className="ml-2 text-xs text-cornsilk/40">
                          {item.detail}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-olive/30 px-4 py-2">
          <div className="flex gap-2">
            <kbd className="rounded bg-olive/50 px-1.5 py-0.5 text-[10px] font-medium text-cornsilk/40">
              ↑↓
            </kbd>
            <span className="text-[10px] text-cornsilk/30">navigate</span>
          </div>
          <div className="flex gap-2">
            <kbd className="rounded bg-olive/50 px-1.5 py-0.5 text-[10px] font-medium text-cornsilk/40">
              ↵
            </kbd>
            <span className="text-[10px] text-cornsilk/30">select</span>
          </div>
          <div className="flex gap-2">
            <kbd className="rounded bg-olive/50 px-1.5 py-0.5 text-[10px] font-medium text-cornsilk/40">
              ⌘K
            </kbd>
            <span className="text-[10px] text-cornsilk/30">toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
