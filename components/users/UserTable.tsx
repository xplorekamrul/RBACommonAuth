"use client";

import { useEffect, useMemo, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { listUsers } from "@/actions/users/list-users";
import { Role } from "@/generated/prisma/enums";
import UserRowActions from "./UserRowActions";
import CreateUserDialog from "./dialogs/CreateUserDialog";
import { Filter, Plus, Search } from "lucide-react";

type Row = {
  id: string;
  name: string | null;
  email: string;
  role: "DEVELOPER" | "SUPER_ADMIN" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  suspendedAt: string | null;
  createdAt: string;
};

export default function UserTable() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [roles, setRoles] = useState<Array<"DEVELOPER" | "SUPER_ADMIN" | "ADMIN">>([]);
  const [statuses, setStatuses] = useState<Array<"ACTIVE" | "INACTIVE" | "SUSPENDED">>([]);
  const [openCreate, setOpenCreate] = useState(false);

  const { execute: run, result, status } = useAction(listUsers);

  const total = (result?.data as any)?.total ?? 0;
  const items: Row[] = (result?.data as any)?.items ?? [];

  function refresh() {
    run({ page, pageSize, q: q.trim() || undefined, roles: roles.length ? roles : undefined, statuses: statuses.length ? statuses : undefined });
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [page, roles, statuses]);

  function toggle<T extends string>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(v => !v)}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 hover:bg-light"
            title="Filters"
          >
            <Filter className="h-4 w-4" /> Filters
          </button>

          <div className="relative">
            <input
              className="pl-9 pr-3 py-2 rounded-md border border-border bg-background w-72"
              placeholder="Search by name or email"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (setPage(1), refresh())}
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <button
            onClick={() => { setPage(1); refresh(); }}
            className="rounded-md border border-border px-3 py-2 hover:bg-light"
          >
            Search
          </button>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="inline-flex items-center gap-2 rounded-md bg-pcolor text-white px-3 py-2 hover:bg-scolor"
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      {/* Filters panel */}
      {showFilters ? (
        <div className="rounded-lg border border-border p-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium mb-1">Role</p>
            <div className="flex flex-wrap gap-2">
              {(["ADMIN","SUPER_ADMIN","DEVELOPER"] as const).map(r => (
                <button
                  key={r}
                  onClick={() => { setRoles(prev => toggle(prev, r)); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full border ${roles.includes(r) ? "bg-pcolor text-white border-pcolor" : "border-border"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Status</p>
            <div className="flex flex-wrap gap-2">
              {(["ACTIVE","INACTIVE","SUSPENDED"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => { setStatuses(prev => toggle(prev, s)); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full border ${statuses.includes(s) ? "bg-pcolor text-white border-pcolor" : "border-border"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border h-[80vh]">
        <table className="min-w-full text-sm">
          <thead className="bg-light">
            <tr className="text-left">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2 ">Status</th>
              <th className="px-3 py-2 ">Actions</th>
            </tr>
          </thead>
          <tbody>
            {status === "executing" && !items?.length ? (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">Loading…</td></tr>
            ) : items?.length ? (
              items.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-3 py-2">{u.name || "—"}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">{u.role}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border text-center ${
                      u.status === "ACTIVE"
                        ? "border-emerald-600 text-emerald-700"
                        : u.status === "SUSPENDED"
                        ? "border-red-600 text-red-700"
                        : "border-amber-600 text-amber-700"
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <UserRowActions user={u} onChanged={() => refresh()} />
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > pageSize ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / pageSize)} • {total} users
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 rounded-md border disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={page >= Math.ceil(total / pageSize)}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-2 rounded-md border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      <CreateUserDialog open={openCreate} onOpenChange={setOpenCreate} onCreated={() => refresh()} />
    </div>
  );
}
