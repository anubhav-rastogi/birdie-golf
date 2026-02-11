"use client";

import { type ReactNode } from "react";
import { useTheme, ThemeContext } from "@/lib/theme";
import { AuthContext, useAuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/ui/toast";
import { CommandPalette } from "@/components/command-palette";

export function Providers({ children }: { children: ReactNode }) {
  const themeCtx = useTheme();
  const authCtx = useAuthProvider();

  return (
    <AuthContext.Provider value={authCtx}>
      <ThemeContext.Provider value={themeCtx}>
        <ToastProvider>
          {children}
          <CommandPalette />
        </ToastProvider>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}
