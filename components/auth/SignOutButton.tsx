"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="block w-full rounded-md px-2 py-2 text-left text-destructive hover:bg-destructive/10"
    >
      Sign out
    </button>
  );
}
