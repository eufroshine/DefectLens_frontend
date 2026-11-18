"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DELTA_CARDS, GLOBAL_SHAP, PR_AUC, RECALL_ROWS, SCENARIOS } from "@/data/research";
import { Card, Notice, PageTitle } from "./ui";

const TONE = {
  good: "text-emerald-500",
  bad: "text-rose-500",
  neutral: "text-ink",
  brand: "text-brand",
} as const;

export default function EvaluationView() {
  const maxShap = Math.max(...GLOBAL_SHAP.map((f) => f.value));
  const cell = "px-4 py-3 text-right font-mono";

  return (
    <div className="space-y-6">
      <PageTitle
        title="Hasil evaluasi model"
        subtitle="Studi pendahuluan pada 16 rilis (12 pasangan latih-uji kronologis) dengan PR-AUC dan recall pada k% file teratas."
      />
      <Notice tone="info">
        Angka pada halaman ini adalah hasil skrip riset (src/model), bukan dihitung ulang oleh aplikasi. Nilai p dari uji statistik
        hanya petunjuk kasar karena pasangan latih-uji saling tumpang tindih.
      </Notice>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {DELTA_CARDS.map((c) => (
          <Card key={c.title}>
            <div className="text-xs font-medium text-muted">{c.title}</div>
            <div className={`mt-2 font-mono text-2xl font-bold ${TONE[c.tone]}`}>{c.value}</div>
            <div className="mt-1 text-[11px] text-muted">{c.note}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="space-y-4 rounded-3xl p-5 sm:p-6">
          <div>
            <h2 className="text-sm font-bold">PR-AUC menurut kelompok fitur</h2>
            <ul className="mt-1 space-y-0.5 text-[11px] text-muted">
              {SCENARIOS.map(([k, v]) => (
                <li key={k}>
                  <span className="font-mono font-semibold">{k}</span> = {v}
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-line bg-card">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="px-4 py-3 text-left font-semibold">Model</th>
                  {["A", "C", "D", "E", "L"].map((h) => (
                    <th key={h} className="px-4 py-3 text-right font-mono font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {PR_AUC.map((r) => (
                  <tr key={r.model}>
                    <td className="px-4 py-3 font-semibold">{r.model}</td>
                    <td className={cell}>{r.a.toFixed(3)}</td>
                    <td className={`${cell} font-bold text-brand`}>{r.c.toFixed(3)}</td>
                    <td className={cell}>{r.d.toFixed(3)}</td>
                    <td className={cell}>{r.e.toFixed(3)}</td>
                    <td className={cell}>{r.l.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="space-y-4 rounded-3xl p-5 sm:p-6">
          <div>
            <h2 className="text-sm font-bold">Prioritas pemeriksaan (recall pada k% teratas)</h2>
            <p className="mt-0.5 text-[11px] text-muted">
              Persentase file bermasalah yang ditemukan bila hanya memeriksa 10% atau 20% file teratas.
            </p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...RECALL_ROWS]} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                <XAxis dataKey="short" tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <YAxis unit="%" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="top10" name="10% teratas" fill="#8e86ff" radius={[6, 6, 0, 0]} />
                <Bar dataKey="top20" name="20% teratas" fill="#5b50ec" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] leading-relaxed text-muted">
            Model menggandakan efisiensi dibanding acak, tetapi pengurutan berdasarkan ukuran file (LOC) hampir sama baiknya.
          </p>
        </Card>
      </div>

      <section className="space-y-5 rounded-[28px] bg-[#181822] p-5 text-white dark:border dark:border-[#222230] dark:bg-[#0d0d14] sm:p-7">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-bold">Fitur paling berpengaruh (SHAP global)</h2>
            <p className="mt-0.5 text-xs text-zinc-400">Rata-rata nilai absolut kontribusi SHAP pada Random Forest.</p>
          </div>
          <span className="self-start rounded-full bg-brand px-3 py-1 font-mono text-xs font-semibold sm:self-auto">
            Random Forest + SHAP
          </span>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-3.5 md:grid-cols-2">
          {GLOBAL_SHAP.map((f) => (
            <div key={f.feature} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-indigo-300">{f.feature}</span>
                  <span className="ml-2 text-[11px] text-zinc-400">{f.label}</span>
                </div>
                <span className="font-mono font-semibold">{f.value.toFixed(3)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-soft" style={{ width: `${(f.value / maxShap) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
