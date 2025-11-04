// /app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = { title: "YourApp" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-light dark:bg-background text-foreground">
        <AppProviders>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
