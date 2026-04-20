"use client";

import { useState, useRef, useEffect } from "react";
import ResultsDashboard, { AnalysisResult } from "@/components/ResultsDashboard";

type Stage = "idle" | "loading" | "done" | "error";

const LOADING_STEPS = [
  "Fetching page content…",
  "Stripping scripts & styles…",
  "Sending to Claude…",
  "Scoring clarity, offer, trust, CTA…",
  "Finalizing audit…",
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzedUrl, setAnalyzedUrl] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage === "loading") {
      setLoadingStep(0);
      intervalRef.current = setInterval(() => {
        setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
      }, 1800);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [stage]);

  useEffect(() => {
    if (stage === "done" && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [stage]);

  const analyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setStage("loading");
    setError("");
    setAnalysis(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong.");
        setStage("error");
        return;
      }

      setAnalysis(data.analysis);
      setAnalyzedUrl(data.url);
      setStage("done");
    } catch {
      setError("Network error. Please try again.");
      setStage("error");
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") analyze();
  };

  const reset = () => {
    setStage("idle");
    setError("");
    setAnalysis(null);
    setUrl("");
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16 relative z-10">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(ellipse, rgba(124,106,247,0.12) 0%, transparent 70%)" }}
      />

      {/* Logo / Header */}
      <div className="text-center mb-14 animate-fade-up">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center accent-glow"
            style={{ background: "var(--accent)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v2h-2v2H9z"/>
              <path d="M13 11h-2v2h2zM11 13h2v-2" opacity="0.6"/>
            </svg>
          </div>
          <span
            className="font-display text-xl font-bold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            LandingLens
          </span>
        </div>
        <h1
          className="font-display text-4xl sm:text-5xl font-extrabold leading-tight mb-3"
          style={{ color: "var(--text)" }}
        >
          CRO Audit in{" "}
          <span style={{ color: "var(--accent)" }}>seconds</span>
        </h1>
        <p className="text-sm sm:text-base max-w-sm mx-auto" style={{ color: "var(--text-dim)" }}>
          Paste any landing page URL. Claude analyzes it like a conversion expert.
        </p>
      </div>

      {/* Input */}
      <div
        className="w-full max-w-xl animate-fade-up delay-1"
        style={{ opacity: 0 }}
      >
        <div
          className="flex items-center gap-2 rounded-2xl p-2 transition-all"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            boxShadow: "0 0 0 0 transparent",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          <div className="pl-3" style={{ color: "var(--muted)" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="6" r="4"/>
              <path d="M9.5 9.5L13 13"/>
              <path d="M6 2a4 4 0 014 4" strokeOpacity="0.4"/>
            </svg>
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKey}
            placeholder="https://yourpage.com"
            disabled={stage === "loading"}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted py-2 pr-1"
            style={{ color: "var(--text)", caretColor: "var(--accent)" }}
          />
          <button
            onClick={analyze}
            disabled={stage === "loading" || !url.trim()}
            className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold font-display transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "var(--accent)",
              color: "#fff",
              boxShadow: "0 2px 12px rgba(124,106,247,0.35)",
            }}
          >
            {stage === "loading" ? "Analyzing…" : "Analyze"}
          </button>
        </div>

        <p className="text-xs text-center mt-3" style={{ color: "var(--muted)" }}>
          Works best with public landing pages · No login required
        </p>
      </div>

      {/* Loading state */}
      {stage === "loading" && (
        <div className="mt-16 flex flex-col items-center gap-6 animate-fade-up">
          {/* Spinner */}
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="var(--border)" strokeWidth="3" />
              <circle
                cx="28" cy="28" r="24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="150.8"
                strokeDashoffset="37.7"
                style={{ animation: "spin 1s linear infinite" }}
              />
            </svg>
            <style>{`@keyframes spin { to { stroke-dashoffset: -150.8; } }`}</style>
          </div>
          <div className="text-center">
            <p
              key={loadingStep}
              className="text-sm font-mono animate-fade-up"
              style={{ color: "var(--text-dim)" }}
            >
              {LOADING_STEPS[loadingStep]}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              This usually takes 10–20 seconds
            </p>
          </div>
          <div className="flex gap-1.5">
            {LOADING_STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: i <= loadingStep ? "20px" : "6px",
                  background: i <= loadingStep ? "var(--accent)" : "var(--border)",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {stage === "error" && (
        <div
          className="mt-10 w-full max-w-xl animate-fade-up rounded-2xl p-5 flex items-start gap-4"
          style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}
        >
          <div className="shrink-0 mt-0.5">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="#f87171" strokeWidth="1.5"/>
              <path d="M9 5v5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="9" cy="13" r="1" fill="#f87171"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold mb-1" style={{ color: "#f87171" }}>
              Analysis failed
            </p>
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>{error}</p>
          </div>
          <button
            onClick={reset}
            className="shrink-0 text-xs font-mono px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Results */}
      {stage === "done" && analysis && (
        <div ref={resultsRef} className="mt-10 w-full max-w-xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
              Audit results
            </p>
            <button
              onClick={reset}
              className="text-xs font-mono px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--text-dim)",
              }}
            >
              ← New analysis
            </button>
          </div>
          <ResultsDashboard analysis={analysis} url={analyzedUrl} />
        </div>
      )}

      {/* Footer */}
      <footer className="mt-24 text-xs text-center" style={{ color: "var(--muted)" }}>
        Powered by Claude · Built with Next.js
      </footer>
    </main>
  );
}
