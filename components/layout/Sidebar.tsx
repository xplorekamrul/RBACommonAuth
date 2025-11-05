"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import SignOutButton from "@/components/auth/SignOutButton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Gauge,
  Wrench,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Home,
  Menu,
  ChevronLeft,
} from "lucide-react";
import clsx from "clsx";

// ===== Types =====

type Role = "DEVELOPER" | "SUPER_ADMIN" | "ADMIN";

type Item = {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

// ===== Helpers =====

function initials(name?: string | null, email?: string | null) {
  const base = (name || email || "U").trim();
  const parts = base.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

// ===== Config Roles =====

const commonNav: Item[] = [
  { label: "Home", href: "/", icon: Home },
];

const roleNav: Record<Role, Item[]> = {
  DEVELOPER: [
    { label: "Dev Tools", href: "/dev/tools", icon: Wrench },
  ],
  SUPER_ADMIN: [
    { label: "Super Dashboard", href: "/super/overview", icon: Gauge },
    { label: "Users", href: "/super/users", icon: Users },
  ],
  ADMIN: [
    { label: "Admin Panel", href: "/admin", icon: LayoutDashboard },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
};

// ===== Sidebar Component =====

export default function Sidebar() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = (user?.role as Role | undefined) ?? undefined;

  const items = useMemo(() => {
    return [...commonNav, ...(role ? roleNav[role] ?? [] : [])];
  }, [role]);

  // Collapsible state with localStorage persistence
  const [collapsed, setCollapsed] = useState<boolean>(false);
  useEffect(() => {
    const saved = localStorage.getItem("_sidebar_collapsed");
    if (saved != null) setCollapsed(saved === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("_sidebar_collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  // Tooltip only when collapsed
  const maybeWrapWithTooltip = (child: React.ReactNode, text: string) => {
    if (!collapsed) return child;
    return (
      <Tooltip>
        <TooltipTrigger asChild>{child}</TooltipTrigger>
        <TooltipContent side="right">
          <span>{text}</span>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 border-r border-border bg-primary/80 backdrop-blur ",
          "transition-[width] duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64"
        )}
        aria-label="Sidebar"
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-2">
          <div
            className={clsx(
              "flex items-center gap-2 overflow-hidden transition-opacity",
              collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            <span className="ml-2 font-semibold text-white">Hr Plus</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((v) => !v)}
            className="h-8 w-8"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Nav */}
        <nav className="mt-2 flex flex-col gap-1 px-2">
          {items.map((it) => {
            const Icon = it.icon;
            const link = (
              <Link
                key={it.href}
                href={it.href}
                className={clsx(
                  "group inline-flex items-center gap-3 rounded-md px-2 py-2 text-sm w-full font-medium transition-colors   hover:bg-primary/80 ",
                  "text-foreground/85 hover:bg-muted/60 hover:text-foreground",
                  collapsed ? "justify-center" : "justify-start"
                )}
                aria-label={it.label}
              >
                <Icon className="h-5 w-5 shrink-0 text-white" />
                {!collapsed && <span className="truncate text-white">{it.label}</span>}
              </Link>
            );

            return (
              <div key={it.href}>
                {maybeWrapWithTooltip(link, it.label)}
              </div>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer (User) */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-2">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                {initials(user.name, user.email)}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user.name ?? user.email}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
                </div>
              )}
            </div>
          ) : (
            !collapsed && <p className="px-1 text-sm text-muted-foreground">Not signed in</p>
          )}

          <div className="mt-2 flex items-center gap-1">
            {maybeWrapWithTooltip(
              <Link
                href="/help"
                className={clsx(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted/60",
                  collapsed ? "justify-center w-8 h-8 p-0" : ""
                )}
                aria-label="Help / Docs"
              >
                <HelpCircle className="h-4 w-4" />
                {!collapsed && <span>Help / Docs</span>}
              </Link>,
              "Help / Docs"
            )}

            {user && (
              maybeWrapWithTooltip(
                <button
                  className={clsx(
                    "flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted/60",
                    collapsed ? "justify-center w-8 h-8 p-0" : ""
                  )}
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>Sign out</span>}
                  <span className="sr-only">Sign out</span>
                  <span className="hidden"><SignOutButton /></span>
                </button>,
                "Sign out"
              )
            )}
          </div>
        </div>
      </aside>

      {/* Content wrapper to offset sidebar width */}
      <div className={clsx("transition-all duration-300", collapsed ? "pl-16" : "pl-64")}></div>
    </TooltipProvider>
  );
}
