import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import CouncilForm from "@/components/CouncilForm";

export const metadata: Metadata = {
  title: "New Council — FounderCouncil AI",
};

export default function CouncilPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Convene your council
          </h1>
          <p className="mt-2 text-slate-400">
            Pose a business question. Four AI advisors answer independently, then
            the Chairman delivers a final verdict.
          </p>
        </header>
        <CouncilForm />
      </div>
    </SiteShell>
  );
}
