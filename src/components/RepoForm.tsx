"use client";

import { GitBranch } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { Card, Notice } from "./ui";

const URL_RE = /^https:\/\/[^\s/]+\/[^\s]+$/;
const SAMPLE_URL = "https://github.com/apache/commons-cli.git";

export default function RepoForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const value = url.trim();
    if (!URL_RE.test(value)) {
      setError("Masukkan URL repository yang diawali https://");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const job = await api.createAnalysis(value);
      router.push(`/analyses/${encodeURIComponent(job.id)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat analisis.");
      setBusy(false);
    }
  }

  return (
    <Card className="space-y-4 rounded-3xl p-5">
      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand">
        <GitBranch className="h-3.5 w-3.5" />
        <span>URL repository Git (Java)</span>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-2.5 sm:flex-row">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={SAMPLE_URL}
          aria-label="URL repository"
          className="flex-1 rounded-full border border-line bg-card px-4 py-2.5 font-mono text-xs transition-colors focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-2 disabled:opacity-50"
        >
          {busy ? "Membuat job..." : "Mulai Analisis"}
        </button>
        <button
          type="button"
          onClick={() => setUrl(SAMPLE_URL)}
          className="rounded-full border border-line bg-card px-4 py-2.5 text-xs font-medium transition-colors hover:border-brand"
        >
          Pakai contoh
        </button>
      </form>
      {error && <Notice tone="error">{error}</Notice>}
      <p className="text-[11px] leading-relaxed text-muted">
        Hanya URL https yang diterima. Kode repository dianalisis, tidak pernah dijalankan. Hanya file Java di luar folder test
        yang dinilai, dan repository besar dapat memerlukan beberapa menit.
      </p>
    </Card>
  );
}
