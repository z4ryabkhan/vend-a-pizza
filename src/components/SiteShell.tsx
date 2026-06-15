import Navbar from "./Navbar";
import Footer from "./Footer";

/** Standard app chrome: navbar + content + footer. */
export default function SiteShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className={`flex-1 ${className}`}>{children}</main>
      <Footer />
    </div>
  );
}
