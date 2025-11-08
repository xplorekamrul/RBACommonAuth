"use client";

import { upsertIdentity } from "@/actions/employees/one-to-one";
import { useAction } from "next-safe-action/hooks";
import { useMemo, useState } from "react";

export default function IdentitySection({ employeeId, initial }: { employeeId: string; initial?: any | null }) {
  const [editing, setEditing] = useState(!initial);
  const [form, setForm] = useState({
    nid: initial?.nid ?? "",
    nidId: initial?.nidId ?? "",
    passport: initial?.passport ?? "",
    passportId: initial?.passportId ?? "",
  });

  const { executeAsync, status, result } = useAction(upsertIdentity);
  const fieldErrors = useMemo(() => (result?.validationErrors ?? {}) as Record<string, string[] | undefined>, [result]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await executeAsync({ employeeId, ...form });
    if (res?.data?.ok) setEditing(false);
  }

  return (
    <section className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Identity</h2>
        <button onClick={() => setEditing((v) => !v)} className="rounded-md border px-3 py-1.5">
          {editing ? "Cancel" : initial ? "Add" : "Edit"}
        </button>
      </div>

      {editing ? (
        <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-sm">NID</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2"
              value={form.nid} onChange={(e) => setForm((s) => ({ ...s, nid: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">NID ID</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2"
              value={form.nidId} onChange={(e) => setForm((s) => ({ ...s, nidId: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">Passport</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2"
              value={form.passport} onChange={(e) => setForm((s) => ({ ...s, passport: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">Passport ID</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2"
              value={form.passportId} onChange={(e) => setForm((s) => ({ ...s, passportId: e.target.value }))} />
          </div>

          <div className="sm:col-span-4 flex gap-2 justify-end">
            <button type="button" onClick={() => setEditing(false)} className="rounded-md border px-3 py-2">Cancel</button>
            <button disabled={status === "executing"} className="rounded-md bg-primary text-white px-3 py-2">Save</button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 text-sm">
          <div><span className="text-muted-foreground">NID:</span> {form.nid || "—"}</div>
          <div><span className="text-muted-foreground">NID ID:</span> {form.nidId || "—"}</div>
          <div><span className="text-muted-foreground">Passport:</span> {form.passport || "—"}</div>
          <div><span className="text-muted-foreground">Passport ID:</span> {form.passportId || "—"}</div>
        </div>
      )}
    </section>
  );
}
