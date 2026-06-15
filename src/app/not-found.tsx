import Link from "next/link";
import SiteShell from "@/components/SiteShell";

export default function NotFound() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="text-sm font-semibold text-brand-300">404</p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-3 text-slate-400">
          The council session or page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500"
        >
          Back home
        </Link>
      </div>
    </SiteShell>
  );
}
