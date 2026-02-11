"use client";

import { type ReactNode } from "react";
import { useTheme, ThemeContext } from "@/lib/theme";
import { ToastProvider } from "@/components/ui/toast";
import { CommandPalette } from "@/components/command-palette";

export function Providers({ children }: { children: ReactNode }) {
  const themeCtx = useTheme();

  return (
    <ThemeContext.Provider value={themeCtx}>
      <ToastProvider>
        {children}
        <CommandPalette />
      </ToastProvider>
    </ThemeContext.Provider>
  );
}
