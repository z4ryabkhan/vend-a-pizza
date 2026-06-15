import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FounderCouncil AI — Your AI advisory board",
  description:
    "Ask a business question and get a four-model AI advisory council plus a " +
    "Chairman verdict: recommendation, risks, financials, action plan, and a " +
    "go / no-go decision.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
