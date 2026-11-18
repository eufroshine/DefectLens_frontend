// Hasil studi pendahuluan (16 rilis, 12 pasangan latih-uji). Angka ini dihitung oleh
// skrip riset (src/model/*.py), bukan oleh aplikasi web.

export const DELTA_CARDS = [
  { title: "PROMISE + Git vs PROMISE saja", value: "+0,022", tone: "good", note: "Selisih PR-AUC rata-rata. Kecil dan tidak merata antarproyek." },
  { title: "Menambah PMD sebagai fitur", value: "-0,002", tone: "bad", note: "Tidak membantu prediksi. PMD hanya ditampilkan sebagai pendamping." },
  { title: "Mandiri (Lizard + Git) vs PROMISE + Git", value: "-0,012", tone: "neutral", note: "Tidak berbeda bermakna, sehingga dipakai untuk repository baru." },
  { title: "Riwayat Git di atas Lizard saja", value: "+0,033", tone: "brand", note: "Riwayat perubahan 365 hari tetap menambah nilai." },
] as const;

export const SCENARIOS = [
  ["A", "20 metrik PROMISE"],
  ["C", "A + riwayat Git 365 hari"],
  ["D", "C + temuan PMD"],
  ["E", "Lizard + riwayat Git 365 hari (dipakai sistem)"],
  ["L", "Lizard saja"],
] as const;

export const PR_AUC = [
  { model: "Logistic Regression", a: 0.519, c: 0.549, d: 0.543, e: 0.543, l: 0.5 },
  { model: "Random Forest", a: 0.486, c: 0.516, d: 0.513, e: 0.499, l: 0.464 },
  { model: "XGBoost", a: 0.493, c: 0.5, d: 0.503, e: 0.487, l: 0.465 },
] as const;

export const RECALL_ROWS = [
  { method: "Acak (teoretis)", short: "Acak", top10: 10, top20: 20, note: "Pembanding dasar" },
  { method: "Ukuran file (LOC)", short: "Ukuran (LOC)", top10: 19.6, top20: 35.7, note: "Mengurutkan berdasarkan jumlah baris kode" },
  { method: "Model (skenario C)", short: "Model", top10: 19.5, top20: 35.0, note: "Metrik kode + riwayat Git 365 hari" },
  { method: "Temuan PMD saja", short: "PMD saja", top10: 18.1, top20: 32.1, note: "Mengurutkan berdasarkan jumlah temuan PMD" },
  { method: "Gabungan model + PMD", short: "Model + PMD", top10: 20.5, top20: 37.2, note: "Rata-rata peringkat model dan PMD" },
] as const;

export const GLOBAL_SHAP = [
  { feature: "wmc", label: "Weighted methods per class", value: 0.033 },
  { feature: "npm", label: "Jumlah method publik", value: 0.032 },
  { feature: "p_lines_added", label: "Baris ditambah (365 hari)", value: 0.029 },
  { feature: "loc", label: "Jumlah baris kode", value: 0.028 },
  { feature: "p_recency_days", label: "Hari sejak perubahan terakhir", value: 0.028 },
  { feature: "p_churn", label: "Total churn (365 hari)", value: 0.024 },
  { feature: "amc", label: "Rata-rata kompleksitas method", value: 0.019 },
  { feature: "dam", label: "Data access metric", value: 0.017 },
] as const;

export const PIPELINE_STEPS = [
  { step: "01", title: "Dataset PROMISE (16 rilis)", desc: "Label dan metrik dari empat proyek Apache (ant, camel, lucene, poi) pada 16 rilis historis." },
  { step: "02", title: "Ekstraksi Lizard dan Git 365 hari", desc: "Ukuran dan kompleksitas kode (Lizard) serta frekuensi perubahan, churn, penulis, kebaruan, dan commit perbaikan (PyDriller)." },
  { step: "03", title: "Validasi kronologis dan Random Forest", desc: "Model dilatih pada rilis lama dan diuji pada rilis berikutnya. Pembanding: XGBoost dan Logistic Regression." },
  { step: "04", title: "Penjelasan SHAP dan pendamping PMD", desc: "Kontribusi fitur per file dihitung dengan SHAP. Temuan PMD ditampilkan berdampingan sebagai indikasi." },
] as const;

export const LIMITATIONS = [
  "Model sekitar dua kali lebih efisien daripada pengurutan acak, tetapi belum terbukti mengungguli pengurutan sederhana berdasarkan ukuran file (LOC).",
  "Nilai p hanya petunjuk kasar karena pasangan latih-uji dalam satu proyek saling tumpang tindih.",
  "Skor risiko adalah keluaran model, bukan probabilitas terkalibrasi. Repository baru tidak punya label bug, jadi gunakan urutannya, bukan angkanya.",
  "Temuan PMD adalah indikasi (code smell atau pelanggaran aturan), bukan bukti bug, dan jumlahnya berkorelasi dengan ukuran file.",
  "Label berasal dari PROMISE. File tanpa laporan bug belum tentu bebas bug.",
  "Model dilatih dari empat proyek Apache berumur lama. Kinerja pada repository kecil atau baru belum teruji.",
  "Hanya mendukung source code Java.",
] as const;

export const TECH = [
  "PROMISE", "PyDriller", "Lizard", "PMD 7.29.0", "scikit-learn", "XGBoost", "SHAP", "FastAPI", "Next.js", "React",
] as const;
