"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, validateEmail } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = login(email.trim(), password);
    if (result.success) {
      router.replace("/rounds");
    } else {
      setError(result.error ?? "Login failed");
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-clay">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-forest" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L12 18M12 2C8 6 6 10 12 18M12 2C16 6 18 10 12 18" strokeLinecap="round" />
            <circle cx="12" cy="20.5" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-cornsilk">Welcome back</h1>
        <p className="mt-1 text-sm text-cornsilk/50">Sign in to your Birdie account</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error && (
          <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-cornsilk/60">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value.slice(0, 100))}
            maxLength={100}
            className="rounded-lg border border-olive bg-forest px-4 py-3 text-base text-cornsilk placeholder:text-cornsilk/30 focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-cornsilk/60">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value.slice(0, 128))}
            maxLength={128}
            className="rounded-lg border border-olive bg-forest px-4 py-3 text-base text-cornsilk placeholder:text-cornsilk/30 focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="mt-2 w-full text-base font-bold"
          disabled={submitting || !email.trim() || !password}
        >
          {submitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      {/* Register link */}
      <p className="mt-6 text-center text-sm text-cornsilk/40">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-clay hover:text-clay/80 transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}
