"use client";

import { useEffect } from "react";

export type ShortcutMap = Record<string, (e: KeyboardEvent) => void>;

/**
 * Register keyboard shortcuts for a page/component.
 * The handler map is keyed by the key to listen for (e.g. "n", "ArrowLeft").
 * Shortcuts are automatically disabled when the active element is an input/textarea.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Don't trigger when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // Don't trigger when Cmd/Ctrl is held (reserved for command palette etc.)
      if (e.metaKey || e.ctrlKey) return;

      const fn = shortcuts[e.key];
      if (fn) {
        fn(e);
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
}
