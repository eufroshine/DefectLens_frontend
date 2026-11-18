import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import DemoBanner from "@/components/DemoBanner";
import Header from "@/components/Header";
import "./globals.css";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "DefectLens",
  description: "Analisis risiko software defect pada source code Java dengan machine learning, riwayat Git, SHAP, dan PMD.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="mx-auto max-w-[1380px] p-2.5 sm:p-5 lg:p-7">
            <div className="space-y-6 rounded-[28px] border border-line bg-card p-4 shadow-[0_20px_60px_-15px_rgba(24,24,34,0.08)] sm:p-6 lg:p-8 dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.65)]">
              <Suspense fallback={<div className="h-16" />}>
                <Header />
              </Suspense>
              <DemoBanner />
              <main>{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
