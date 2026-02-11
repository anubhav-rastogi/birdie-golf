"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RoundList } from "@/components/round-list";
import { mockRounds } from "@/lib/mock-data";

export default function RoundsPage() {
  const router = useRouter();
  const completed = mockRounds.filter((r) => r.status === "completed");
  const [selectedIdx, setSelectedIdx] = useState(-1);

  // Keyboard shortcuts for rounds page
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.metaKey || e.ctrlKey) return;

      switch (e.key) {
        case "n":
        case "N":
          e.preventDefault();
          router.push("/new-round");
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIdx((i) => Math.min(i + 1, completed.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIdx((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIdx >= 0 && completed[selectedIdx]) {
            router.push(`/rounds/${completed[selectedIdx].id}`);
          }
          break;
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, completed, selectedIdx]);

  return <RoundList rounds={mockRounds} selectedIndex={selectedIdx} />;
}
