import Link from "next/link";
import { ArrowRight, Target, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-20">
        <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
          {/* Logo mark */}
          <div
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-olive animate-scale-in"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-clay"
            >
              <path
                d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <h1
            className="text-5xl font-extrabold tracking-tight text-cornsilk sm:text-6xl animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            Birdie
          </h1>

          <p
            className="mt-4 max-w-md text-lg leading-relaxed text-cornsilk/60 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            A serious golfer&apos;s stat tracker. Fast manual entry.
            Coach-grade insights. No hardware required.
          </p>

          {/* CTA */}
          <Link
            href="/rounds"
            className="mt-10 w-full max-w-xs animate-fade-in"
            style={{ animationDelay: "300ms" }}
          >
            <Button
              variant="primary"
              size="lg"
              className="w-full text-base font-bold"
            >
              Open App
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>

          {/* Feature pills */}
          <div className="mt-16 grid w-full max-w-sm grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: <Zap className="h-4 w-4" />, label: "Fast Entry", detail: "< 8 sec per hole", delay: 400 },
              { icon: <Target className="h-4 w-4" />, label: "Miss Patterns", detail: "Know your tendencies", delay: 500 },
              { icon: <TrendingUp className="h-4 w-4" />, label: "Trends", detail: "Track improvement", delay: 600 },
            ].map((pill) => (
              <div
                key={pill.label}
                className="flex flex-col items-center gap-2 rounded-xl border border-olive/30 bg-olive/30 px-4 py-4 animate-fade-in transition-all duration-150 hover:bg-olive/50 hover:border-olive/50"
                style={{ animationDelay: `${pill.delay}ms` }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-clay/20 text-clay">
                  {pill.icon}
                </div>
                <span className="text-sm font-semibold text-cornsilk">{pill.label}</span>
                <span className="text-xs text-cornsilk/50">{pill.detail}</span>
              </div>
            ))}
          </div>

          {/* Cmd+K hint */}
          <div
            className="mt-8 flex items-center gap-2 text-xs text-cornsilk/20 animate-fade-in"
            style={{ animationDelay: "700ms" }}
          >
            <span>Press</span>
            <kbd className="rounded bg-olive/50 px-2 py-0.5 text-[10px] font-medium text-cornsilk/30">
              ⌘K
            </kbd>
            <span>to quick navigate</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-olive/20 px-6 py-4">
        <p className="text-center text-xs text-cornsilk/30">
          Know your misses. Fix your game.
        </p>
      </footer>
    </div>
  );
}
