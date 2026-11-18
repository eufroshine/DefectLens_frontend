import { Suspense } from "react";
import AnalysisView from "@/components/AnalysisView";

export default function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-6">Memuat analisis...</div>}>
      <AnalysisContent params={params} />
    </Suspense>
  );
}

async function AnalysisContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AnalysisView id={id} />;
}