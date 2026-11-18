const STEPS = ["Clone dan ekspor file Java", "Lizard dan riwayat Git 365 hari", "Analisis PMD", "Skor model dan SHAP"];

export default function JobProgress({ step }: { step: number }) {
  return (
    <div className="space-y-3 rounded-3xl border border-line bg-card2 p-4 sm:p-5">
      <div className="text-xs font-semibold text-brand">Analisis sedang berjalan</div>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STEPS.map((label, i) => {
          const done = step > i;
          const active = step === i;
          return (
            <li
              key={label}
              className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-[11px] font-medium transition-colors ${
                active
                  ? "border-brand bg-brand text-white"
                  : done
                    ? "border-line bg-card"
                    : "border-transparent bg-card/50 text-muted"
              }`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  active ? "animate-ping bg-white" : done ? "bg-emerald-500" : "bg-zinc-400"
                }`}
              />
              <span>
                {i + 1}. {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
