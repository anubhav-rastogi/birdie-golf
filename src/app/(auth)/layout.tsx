"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // If already logged in, redirect to app
  useEffect(() => {
    if (!loading && user) {
      router.replace("/rounds");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-clay border-t-transparent" />
      </div>
    );
  }

  if (user) return null; // Will redirect

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest px-4">
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
