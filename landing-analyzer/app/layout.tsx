import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LandingLens — CRO Analyzer",
  description: "Paste a URL. Get a conversion rate audit in seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen relative z-10">{children}</body>
    </html>
  );
}
