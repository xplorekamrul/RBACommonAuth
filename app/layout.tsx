// /app/layout.tsx
import Sidebar from "@/components/layout/Sidebar";
import AppProviders from "@/components/providers/AppProviders";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Hr_Plus" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-light dark:bg-background text-foreground">
        <AppProviders>
          <Sidebar />
          <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
