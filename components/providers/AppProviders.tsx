// /components/providers/AppProviders.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
