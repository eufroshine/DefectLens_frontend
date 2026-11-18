import type { BenchmarkMeta, FileDetail, FileRow, Health, Job } from "./types";

// Mode demo. Nilai pada contoh ini berasal dari hasil nyata prototipe Streamlit
// (commons-cli dan ant 1.7). Detail file hanya tersedia untuk satu file per contoh.

const DEMO_ID = "demo-commons-cli";
const DEMO_URL = "https://github.com/apache/commons-cli.git";
let demoStart: number | null = null;

const CLI = "src/main/java/org/apache/commons/cli/";
const cliRows: FileRow[] = [
  { id: "f1", path: `${CLI}DefaultParser.java`, score: 0.85, pmdTotal: 2, pmdHigh: 0 },
  { id: "f2", path: `${CLI}HelpFormatter.java`, score: 0.84, pmdTotal: 3, pmdHigh: 0 },
  { id: "f3", path: `${CLI}CommandLine.java`, score: 0.77, pmdTotal: 4, pmdHigh: 3 },
  { id: "f4", path: `${CLI}Option.java`, score: 0.7, pmdTotal: 2, pmdHigh: 1 },
  { id: "f5", path: `${CLI}help/TextHelpAppendable.java`, score: 0.7, pmdTotal: 1, pmdHigh: 0 },
  { id: "f6", path: `${CLI}OptionBuilder.java`, score: 0.66, pmdTotal: 0, pmdHigh: 0 },
  { id: "f7", path: `${CLI}help/AbstractHelpFormatter.java`, score: 0.66, pmdTotal: 0, pmdHigh: 0 },
  { id: "f8", path: `${CLI}Options.java`, score: 0.65, pmdTotal: 0, pmdHigh: 0 },
  { id: "f9", path: `${CLI}Converter.java`, score: 0.64, pmdTotal: 0, pmdHigh: 0 },
  { id: "f10", path: `${CLI}Parser.java`, score: 0.64, pmdTotal: 0, pmdHigh: 0 },
];

const cliDetail: FileDetail = {
  ...cliRows[0],
  shap: [
    { label: "baris kode tanpa komentar", value: 389, contribution: 0.0921 },
    { label: "jumlah token", value: 2828, contribution: 0.0762 },
    { label: "jumlah fungsi", value: 39, contribution: 0.0644 },
    { label: "total kompleksitas siklomatik", value: 137, contribution: 0.0529 },
    { label: "hari sejak perubahan terakhir", value: 11, contribution: 0.0254 },
    { label: "baris ditambah (1 tahun terakhir)", value: 109, contribution: 0.0252 },
    { label: "parameter terbanyak pada satu fungsi", value: 4, contribution: 0.0083 },
    { label: "panjang fungsi terpanjang", value: 50, contribution: 0.0082 },
    { label: "total perubahan baris (1 tahun terakhir)", value: 217, contribution: 0.0059 },
    { label: "jumlah penulis (1 tahun terakhir)", value: 2, contribution: 0.0043 },
  ],
  pmd: [
    { line: 680, priority: 3, rule: "SimplifyBooleanReturns", description: "This if statement can be replaced by `return {condition};`" },
    { line: 723, priority: 3, rule: "SimplifyBooleanReturns", description: "This if statement can be replaced by `return {condition};`" },
  ],
};

const ANT = "src/main/org/apache/tools/ant/";
const antRows: FileRow[] = [
  { id: "b1", path: `${ANT}ComponentHelper.java`, score: 0.82, pmdTotal: 31, pmdHigh: 0 },
  { id: "b2", path: `${ANT}taskdefs/SQLExec.java`, score: 0.82, pmdTotal: 17, pmdHigh: 0 },
  { id: "b3", path: `${ANT}taskdefs/Available.java`, score: 0.81, pmdTotal: 5, pmdHigh: 0 },
  { id: "b4", path: `${ANT}taskdefs/Ant.java`, score: 0.78, pmdTotal: 22, pmdHigh: 0 },
  { id: "b5", path: `${ANT}taskdefs/optional/ssh/Scp.java`, score: 0.78, pmdTotal: 5, pmdHigh: 0 },
  { id: "b6", path: `${ANT}IntrospectionHelper.java`, score: 0.77, pmdTotal: 72, pmdHigh: 0 },
  { id: "b7", path: `${ANT}taskdefs/optional/script/ScriptDef.java`, score: 0.76, pmdTotal: 3, pmdHigh: 0 },
  { id: "b8", path: `${ANT}Project.java`, score: 0.76, pmdTotal: 61, pmdHigh: 0 },
  { id: "b9", path: `${ANT}util/ResourceUtils.java`, score: 0.75, pmdTotal: 13, pmdHigh: 0 },
  { id: "b10", path: `${ANT}taskdefs/Touch.java`, score: 0.74, pmdTotal: 12, pmdHigh: 0 },
];

const LOOSE = "Avoid using implementation types like 'Hashtable'; use the interface instead";
const FOREACH = "This for loop can be replaced by a foreach loop";

const antDetail: FileDetail = {
  ...antRows[0],
  shap: [
    { label: "response for class (rfc)", value: 154, contribution: 0.1022 },
    { label: "jumlah baris kode (loc)", value: 1711, contribution: 0.0542 },
    { label: "efferent coupling (ce)", value: 16, contribution: 0.0383 },
    { label: "keterkaitan antar kelas (cbo)", value: 26, contribution: 0.0276 },
    { label: "cohesion among methods (cam)", value: 0.1789, contribution: 0.024 },
    { label: "kompleksitas kelas (wmc)", value: 39, contribution: 0.0198 },
    { label: "rata-rata kompleksitas method (amc)", value: 42.3333, contribution: 0.0178 },
    { label: "jumlah perubahan (1 tahun terakhir)", value: 17, contribution: 0.0162 },
    { label: "baris dihapus (1 tahun terakhir)", value: 282, contribution: -0.0139 },
    { label: "method inheritance factor (mfa)", value: 0, contribution: 0.0125 },
  ],
  pmd: [
    { line: 60, priority: 3, rule: "LooseCoupling", description: LOOSE },
    { line: 63, priority: 3, rule: "LooseCoupling", description: LOOSE },
    { line: 68, priority: 3, rule: "LooseCoupling", description: LOOSE },
    { line: 79, priority: 3, rule: "LooseCoupling", description: LOOSE },
    { line: 149, priority: 3, rule: "UncommentedEmptyConstructor", description: "Document empty constructor" },
    { line: 188, priority: 3, rule: "LooseCoupling", description: LOOSE },
    { line: 189, priority: 3, rule: "ForLoopCanBeForeach", description: FOREACH },
    { line: 194, priority: 3, rule: "ForLoopCanBeForeach", description: FOREACH },
    { line: 334, priority: 3, rule: "PreserveStackTrace", description: "Thrown exception does not preserve the stack trace of exception" },
    { line: 348, priority: 3, rule: "LooseCoupling", description: LOOSE },
  ],
};

const benchmarks: BenchmarkMeta[] = [
  { id: "ant-1.7", label: "ant 1.7", project: "Apache Ant", release: "1.7", nEval: 743, nTrain: 943, recallTop20: 0.52 },
  { id: "camel-1.6", label: "camel 1.6", project: "Apache Camel", release: "1.6", nEval: 935, nTrain: 1782 },
  { id: "lucene-2.4", label: "lucene 2.4", project: "Apache Lucene", release: "2.4", nEval: 330, nTrain: 420 },
  { id: "poi-3.0", label: "poi 3.0", project: "Apache POI", release: "3.0", nEval: 438, nTrain: 924 },
];

function demoJob(): Job {
  const step = demoStart === null ? 4 : Math.min(4, Math.floor((Date.now() - demoStart) / 800));
  const done = step >= 4;
  return {
    id: DEMO_ID,
    status: done ? "done" : "running",
    step,
    source: DEMO_URL,
    name: "apache/commons-cli",
    createdAt: "2026-11-17T09:00:00.000Z",
    warnings: [],
    note: "Contoh: 10 file teratas dari 36 file hasil analisis commons-cli pada prototipe Streamlit.",
    summary: done ? { nFiles: cliRows.length, commits365: 205, lastCommit: "2026-11-09" } : undefined,
  };
}

const NOT_IN_DEMO = "Detail file ini tidak tersedia pada mode demo.";

export async function health(): Promise<Health> {
  return { status: "demo" };
}

export async function listAnalyses(): Promise<Job[]> {
  return [demoJob()];
}

export async function createAnalysis(source: string): Promise<Job> {
  if (!source.toLowerCase().includes("commons-cli")) {
    throw new Error(
      "Mode demo hanya mendukung contoh https://github.com/apache/commons-cli.git. Atur NEXT_PUBLIC_API_URL untuk analisis repository lain.",
    );
  }
  demoStart = Date.now();
  return demoJob();
}

export async function getAnalysis(id: string): Promise<Job> {
  if (id !== DEMO_ID) throw new Error("Analisis tidak ditemukan pada mode demo.");
  return demoJob();
}

export async function getFiles(id: string): Promise<FileRow[]> {
  if (id !== DEMO_ID) throw new Error("Analisis tidak ditemukan pada mode demo.");
  return cliRows;
}

export async function getFileDetail(id: string, fileId: string): Promise<FileDetail> {
  if (id !== DEMO_ID || fileId !== "f1") throw new Error(NOT_IN_DEMO);
  return cliDetail;
}

export async function listBenchmarks(): Promise<BenchmarkMeta[]> {
  return benchmarks;
}

export async function getBenchmarkFiles(id: string): Promise<FileRow[]> {
  return id === "ant-1.7" ? antRows : [];
}

export async function getBenchmarkFileDetail(id: string, fileId: string): Promise<FileDetail> {
  if (id !== "ant-1.7" || fileId !== "b1") throw new Error(NOT_IN_DEMO);
  return antDetail;
}
