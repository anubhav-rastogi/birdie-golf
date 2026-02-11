"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

/** Wraps protected routes. Redirects to /login if not authenticated. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-clay border-t-transparent" />
      </div>
    );
  }

  if (!user) return null; // Will redirect

  return <>{children}</>;
}
