import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import CouncilForm from "@/components/CouncilForm";

export const metadata: Metadata = {
  title: "New Council — FounderCouncil AI",
};

export default function CouncilPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-4 py-6 pb-safe sm:px-6 sm:py-12">
        <header className="mb-6 sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Convene your council
          </h1>
          <p className="mt-1 text-sm text-slate-400 sm:mt-2 sm:text-base">
            Pose a business question. Four AI advisors answer independently, then
            the Chairman delivers a final verdict.
          </p>
        </header>
        <CouncilForm />
      </div>
    </SiteShell>
  );
}
