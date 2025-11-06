"use client";

import { useMemo, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { upsertPersonal } from "@/actions/employees/one-to-one";
import { GENDER, BLOOD_GROUP, type Gender, type BloodGroup } from "@/lib/enums/enums";
import { formatEnumLabel } from "@/lib/format";

export default function PersonalSection({
  employeeId,
  initial,
}: {
  employeeId: string;
  initial?: {
    fathersName?: string | null;
    mothersName?: string | null;
    birthDate?: string | Date | null;
    gender?: Gender | null;
    bloodGroup?: BloodGroup | null;
  } | null;
}) {
  const [editing, setEditing] = useState(!initial);
  const [form, setForm] = useState({
    fathersName: initial?.fathersName ?? "",
    mothersName: initial?.mothersName ?? "",
    birthDate: initial?.birthDate ? toLocalInput(initial.birthDate) : "",
    gender: initial?.gender ?? null,
    bloodGroup: initial?.bloodGroup ?? null,
  });

  const { executeAsync, status, result } = useAction(upsertPersonal);
  const fieldErrors = useMemo(
    () => (result?.validationErrors ?? {}) as Record<string, string[] | undefined>,
    [result]
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await executeAsync({
      employeeId,
      fathersName: emptyToNull(form.fathersName),
      mothersName: emptyToNull(form.mothersName),
      birthDate: form.birthDate || null,
      gender: form.gender,
      bloodGroup: form.bloodGroup,
    });
    if (res?.data?.ok) setEditing(false);
  }

  return (
    <section className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Personal</h2>
        <button onClick={() => setEditing((v) => !v)} className="rounded-md border px-3 py-1.5">
          {editing ? "Cancel" : initial ? "Edit" : "Add"}
        </button>
      </div>

      {editing ? (
        <form onSubmit={save} className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Father’s Name</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2"
              value={form.fathersName}
              onChange={(e) => setForm((s) => ({ ...s, fathersName: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">Mother’s Name</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2"
              value={form.mothersName}
              onChange={(e) => setForm((s) => ({ ...s, mothersName: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">Birth Date</label>
            <input type="date" className="mt-1 w-full rounded-md border px-3 py-2"
              value={form.birthDate}
              onChange={(e) => setForm((s) => ({ ...s, birthDate: e.target.value }))} />
            {fieldErrors.birthDate && <p className="text-xs text-destructive">{fieldErrors.birthDate}</p>}
          </div>
          <div>
            <label className="text-sm">Gender</label>
            <select className="mt-1 w-full rounded-md border px-3 py-2"
              value={form.gender ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, gender: (e.target.value || null) as Gender | null }))}>
              <option value="">—</option>
              {GENDER.map((g) => <option key={g} value={g}>{formatEnumLabel(g)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm">Blood Group</label>
            <select className="mt-1 w-full rounded-md border px-3 py-2"
              value={form.bloodGroup ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, bloodGroup: (e.target.value || null) as BloodGroup | null }))}>
              <option value="">—</option>
              {BLOOD_GROUP.map((b) => <option key={b} value={b}>{formatEnumLabel(b)}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2 flex gap-2 justify-end">
            <button type="button" onClick={() => setEditing(false)} className="rounded-md border px-3 py-2">Cancel</button>
            <button disabled={status === "executing"} className="rounded-md bg-pcolor text-white px-3 py-2">Save</button>
          </div>
        </form>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Father:</span> {form.fathersName || "—"}</div>
          <div><span className="text-muted-foreground">Mother:</span> {form.mothersName || "—"}</div>
          <div><span className="text-muted-foreground">Birth Date:</span> {form.birthDate || "—"}</div>
          <div><span className="text-muted-foreground">Gender:</span> {form.gender ? formatEnumLabel(form.gender) : "—"}</div>
          <div><span className="text-muted-foreground">Blood Group:</span> {form.bloodGroup ? formatEnumLabel(form.bloodGroup) : "—"}</div>
        </div>
      )}
    </section>
  );
}

function emptyToNull(s: string) { return s.trim() ? s : null; }
function toLocalInput(d: string | Date) {
  const iso = (typeof d === "string" ? new Date(d) : d).toISOString().slice(0,10);
  return iso;
}
