"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/promptEngine";
import clsx from "clsx";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<"prompt" | "model" | null>(
    null
  );

  const handleAnalyze = async () => {
    setError(null);
    setResult(null);

    if (!prompt.trim()) {
      setError("Please enter a prompt to analyze.");
      return;
    }

    try {
      setIsAnalyzing(true);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          typeof data?.error === "string"
            ? data.error
            : "Something went wrong while analyzing the prompt.";
        setError(msg);
        return;
      }

      const data = (await res.json()) as AnalysisResult;
      setResult(data);
    } catch (e) {
      console.error(e);
      setError("Network error while calling /api/analyze.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async (text: string, field: "prompt" | "model") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch (e) {
      console.error(e);
      setError("Unable to copy to clipboard. Please copy manually.");
    }
  };

  const openModelTab = () => {
    if (!result) return;
    if (result.enhancedPrompt) {
      navigator.clipboard.writeText(result.enhancedPrompt).catch(() => {});
    }
    window.open(result.model.url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-start px-4 py-8">
      <div className="w-full max-w-5xl">
        <header className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Prompt Router & Enhancer
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Paste any raw prompt. I’ll infer intent, domain &amp; use case, enhance
              it, and recommend an LLM (powered by OpenAI on the backend).
            </p>
          </div>
          <span className="text-xs text-slate-500 border border-slate-700 rounded-full px-3 py-1">
            Totem Interactive – AI/FE Developer Assignment
          </span>
        </header>

        {/* Input Card */}
        <section className="bg-slate-900 border border-slate-700 rounded-xl p-4 md:p-5 mb-6 shadow-lg shadow-slate-900/40">
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-slate-200 mb-2"
          >
            Original Prompt
          </label>
          <textarea
            id="prompt"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-vertical min-h-[140px]"
            placeholder="E.g. 'Write a Python function that sorts a list of users by age and explain it step by step.'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          {error && (
            <p className="mt-2 text-xs text-red-400">
              {error}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-slate-500">
              Classification runs on the server via OpenAI. If the API key is missing,
              it falls back to simple heuristics.
            </p>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition",
                "bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-800 disabled:cursor-not-allowed"
              )}
            >
              {isAnalyzing ? "Analyzing..." : "Enhance & Route"}
            </button>
          </div>
        </section>

        {/* Results */}
        {result && (
          <section className="grid gap-4 md:grid-cols-[minmax(0,2fr),minmax(0,1.3fr)] items-start">
            {/* Enhanced Prompt Card */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 md:p-5 shadow-lg shadow-slate-900/40">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="text-sm font-semibold text-slate-100">
                  Enhanced Prompt
                </h2>
                <button
                  onClick={() =>
                    copyToClipboard(result.enhancedPrompt, "prompt")
                  }
                  className="text-xs px-3 py-1 border border-slate-600 rounded-full hover:bg-slate-800 transition"
                >
                  {copiedField === "prompt" ? "Copied!" : "Copy prompt"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 max-h-[420px] overflow-auto">
                {result.enhancedPrompt}
              </pre>
            </div>

            {/* Analysis + Follow-ups Card */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg shadow-slate-900/40">
                <h2 className="text-sm font-semibold text-slate-100 mb-3">
                  Intent, Domain &amp; Use Case
                </h2>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Intent</dt>
                    <dd className="text-slate-100 text-right">
                      {result.intent}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Domain</dt>
                    <dd className="text-slate-100 text-right">
                      {result.domain}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Use Case</dt>
                    <dd className="text-slate-100 text-right">
                      {result.useCase}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg shadow-slate-900/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-100">
                      Recommended LLM
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {result.model.name} · {result.model.provider}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {result.model.notes}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(result.model.name, "model")
                    }
                    className="text-xs px-3 py-1 border border-slate-600 rounded-full hover:bg-slate-800 transition mt-1"
                  >
                    {copiedField === "model" ? "Copied!" : "Copy model name"}
                  </button>
                </div>

                <button
                  onClick={openModelTab}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-400 transition"
                >
                  Open {result.model.provider} &amp; paste enhanced prompt
                </button>

                <p className="mt-2 text-[11px] text-slate-500">
                  The enhanced prompt is copied to your clipboard before opening the
                  LLM page so it’s ready to paste.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg shadow-slate-900/40">
                <h2 className="text-sm font-semibold text-slate-100 mb-2">
                  Suggested Follow-up Prompts
                </h2>
                <ul className="space-y-1">
                  {result.followUps.map((f, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-200 border border-slate-700 rounded-lg px-3 py-2 bg-slate-950"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
