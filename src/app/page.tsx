import RecentAnalyses from "@/components/RecentAnalyses";
import RepoForm from "@/components/RepoForm";
import { PageTitle } from "@/components/ui";

export default function Home() {
  return (
    <div className="space-y-8">
      <PageTitle
        title="Analisis risiko repository Java"
        subtitle="Masukkan repository untuk mengurutkan file Java berdasarkan skor risiko defect, lengkap dengan alasan (SHAP) dan temuan PMD."
      />
      <RepoForm />
      <RecentAnalyses />
    </div>
  );
}
