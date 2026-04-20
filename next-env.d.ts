"use client";

import { useState } from "react";

export interface AnalysisResult {
  overall_score: number;
  clarity_score: number;
  offer_score: number;
  trust_score: number;
  cta_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface Props {
  analysis: AnalysisResult;
  url: string;
}

function scoreColor(score: number): string {
  if (score >= 70) return "#4ade80"; // green
  if (score >= 45) return "#fbbf24"; // yellow
  return "#f87171"; // red
}

function scoreBg(score: number): string {
  if (score >= 70) return "rgba(74, 222, 128, 0.08)";
  if (score >= 45) return "rgba(251, 191, 36, 0.08)";
  return "rgba(248, 113, 113, 0.08)";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 45) return "Average";
  if (score >= 25) return "Weak";
  return "Poor";
}

function ScoreBar({ label, score, delay }: { label: string; score: number; delay: number }) {
  const color = scoreColor(score);
  return (
    <div
      className="animate-fade-up"
      style={{ animationDelay: `${delay}s`, opacity: 0 }}
    >
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
          {label}
        </span>
        <span className="text-sm font-mono font-semibold" style={{ color }}>
          {score}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div
          className="h-full rounded-full score-bar-inner"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
          }}
        />
      </div>
    </div>
  );
}

function BulletList({
  items,
  icon,
  color,
}: {
  items: string[];
  icon: string;
  color: string;
}) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
          <span className="mt-0.5 shrink-0 text-base" style={{ color }}>
            {icon}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ResultsDashboard({ analysis, url }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify({ url, analysis }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const overallColor = scoreColor(analysis.overall_score);
  const overallBg = scoreBg(analysis.overall_score);

  const subScores = [
    { label: "Clarity", score: analysis.clarity_score },
    { label: "Offer", score: analysis.offer_score },
    { label: "Trust", score: analysis.trust_score },
    { label: "CTA", score: analysis.cta_score },
  ];

  const hostname = (() => {
    try { return new URL(url).hostname; } catch { return url; }
  })();

  return (
    <div className="w-full space-y-4">
      {/* Header row */}
      <div
        className="animate-fade-up rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ background: overallBg, border: `1px solid ${overallColor}22`, opacity: 0 }}
      >
        <div>
          <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "var(--text-dim)" }}>
            Analysis complete
          </p>
          <p className="text-sm font-mono truncate max-w-xs" style={{ color: "var(--text-dim)" }}>
            {hostname}
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div className="text-right">
            <div
              className="font-display text-6xl font-extrabold leading-none tabular-nums"
              style={{ color: overallColor }}
            >
              {analysis.overall_score}
            </div>
            <div className="text-xs font-mono mt-1" style={{ color: overallColor }}>
              {scoreLabel(analysis.overall_score)}
            </div>
          </div>
          <div className="text-2xl mb-1" style={{ color: "var(--text-dim)" }}>/100</div>
        </div>
      </div>

      {/* Sub scores */}
      <div
        className="animate-fade-up delay-1 rounded-2xl p-6 space-y-4"
        style={{ background: "var(--card)", border: "1px solid var(--border)", opacity: 0 }}
      >
        <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
          Score breakdown
        </p>
        {subScores.map((s, i) => (
          <ScoreBar key={s.label} label={s.label} score={s.score} delay={0.1 + i * 0.07} />
        ))}
      </div>

      {/* Summary */}
      <div
        className="animate-fade-up delay-2 rounded-2xl p-6"
        style={{ background: "var(--card)", border: "1px solid var(--border)", opacity: 0 }}
      >
        <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "var(--text-dim)" }}>
          Summary
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
          {analysis.summary}
        </p>
      </div>

      {/* Strengths + Weaknesses */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div
          className="animate-fade-up delay-3 rounded-2xl p-6"
          style={{ background: "var(--card)", border: "1px solid var(--border)", opacity: 0 }}
        >
          <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "var(--text-dim)" }}>
            Strengths
          </p>
          <BulletList items={analysis.strengths} icon="◆" color="#4ade80" />
        </div>
        <div
          className="animate-fade-up delay-4 rounded-2xl p-6"
          style={{ background: "var(--card)", border: "1px solid var(--border)", opacity: 0 }}
        >
          <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "var(--text-dim)" }}>
            Weaknesses
          </p>
          <BulletList items={analysis.weaknesses} icon="◆" color="#f87171" />
        </div>
      </div>

      {/* Suggestions */}
      <div
        className="animate-fade-up delay-5 rounded-2xl p-6"
        style={{ background: "var(--card)", border: "1px solid var(--border)", opacity: 0 }}
      >
        <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "var(--text-dim)" }}>
          Actionable suggestions
        </p>
        <ol className="space-y-3">
          {analysis.suggestions.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span
                className="shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs font-mono font-bold mt-0.5"
                style={{ background: "rgba(124,106,247,0.15)", color: "#7c6af7" }}
              >
                {i + 1}
              </span>
              <span style={{ color: "var(--text)" }}>{s}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Copy button */}
      <div className="animate-fade-up delay-6 flex justify-end pb-4" style={{ opacity: 0 }}>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all"
          style={{
            background: copied ? "rgba(74,222,128,0.12)" : "var(--card)",
            border: `1px solid ${copied ? "#4ade8044" : "var(--border)"}`,
            color: copied ? "#4ade80" : "var(--text-dim)",
          }}
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M10.28 2.28L4.5 8.06 1.72 5.28a1 1 0 00-1.44 1.44l3.5 3.5a1 1 0 001.44 0l6.5-6.5a1 1 0 10-1.44-1.44z"/>
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="4" y="4" width="7" height="7" rx="1"/>
                <path d="M1 8V1h7"/>
              </svg>
              Copy JSON
            </>
          )}
        </button>
      </div>
    </div>
  );
}
