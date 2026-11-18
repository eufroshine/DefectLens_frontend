import { Card, PageTitle } from "@/components/ui";
import { LIMITATIONS, PIPELINE_STEPS, TECH } from "@/data/research";

export default function MethodologyPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Metodologi dan keterbatasan"
        subtitle="Alur ekstraksi fitur, evaluasi kronologis, dan batasan penggunaan prototipe skripsi Software Engineering."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="space-y-4 rounded-3xl p-5 sm:p-6 lg:col-span-6">
          <h2 className="text-sm font-bold">Alur pipeline penelitian</h2>
          <div className="space-y-3">
            {PIPELINE_STEPS.map((s) => (
              <div key={s.step} className="flex items-start gap-3.5 rounded-2xl border border-line bg-card p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand font-mono text-xs font-bold text-white">
                  {s.step}
                </span>
                <div>
                  <h3 className="text-xs font-bold sm:text-sm">{s.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {TECH.map((t) => (
              <span key={t} className="rounded-full border border-line bg-card px-3 py-1 font-mono text-[11px] text-muted">
                {t}
              </span>
            ))}
          </div>
        </Card>

        <section className="space-y-4 rounded-[28px] bg-[#181822] p-5 text-white dark:border dark:border-[#222230] dark:bg-[#0d0d14] sm:p-6 lg:col-span-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Hal yang perlu diperhatikan</h2>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
              Prototipe riset
            </span>
          </div>
          <ol className="space-y-2.5">
            {LIMITATIONS.map((text, i) => (
              <li key={text} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-[#222230] p-3.5 dark:border-[#262636] dark:bg-[#181824]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/30 font-mono text-[11px] font-bold text-indigo-300">
                  {i + 1}
                </span>
                <p className="text-xs leading-relaxed text-zinc-300">{text}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
