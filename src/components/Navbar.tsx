import Link from "next/link";
import UserMenu from "./UserMenu";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/council", label: "New Council" },
  { href: "/history", label: "History" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            FC
          </span>
          <span className="text-base font-semibold tracking-tight text-white">
            FounderCouncil <span className="text-brand-400">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/council"
            className="ml-1 hidden rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-500 sm:inline-block"
          >
            Convene
          </Link>
          <span className="mx-1 hidden h-5 w-px bg-white/10 sm:inline-block" />
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
