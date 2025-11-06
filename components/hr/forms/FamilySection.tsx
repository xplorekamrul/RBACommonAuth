"use client";

import { useMemo, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { upsertFamily } from "@/actions/employees/one-to-one";
import { MARITAL_STATUS, type MaritalStatus } from "@/lib/enums/enums";
import { formatEnumLabel } from "@/lib/format";

export default function FamilySection({ employeeId, initial }: { employeeId: string; initial?: any | null }) {
  const [editing, setEditing] = useState(!initial);
  const [form, setForm] = useState({
    maritalStatus: (initial?.maritalStatus ?? "SINGLE") as MaritalStatus,
    spouseName: initial?.spouseName ?? "",
    spouseOccupation: initial?.spouseOccupation ?? "",
    noChildren: (initial?.noChildren ?? 0) as number,
  });

  const { executeAsync, status } = useAction(upsertFamily);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await executeAsync({
      employeeId,
      maritalStatus: form.maritalStatus,
      spouseName: nz(form.spouseName),
      spouseOccupation: nz(form.spouseOccupation),
      noChildren: Number.isFinite(form.noChildren) ? form.noChildren : 0,
    });
    if (res?.data?.ok) setEditing(false);
  }

  return (
    <section className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Family</h2>
        <button onClick={() => setEditing((v) => !v)} className="rounded-md border px-3 py-1.5">
          {editing ? "Cancel" : initial ? "Edit" : "Add"}
        </button>
      </div>

      {editing ? (
        <form onSubmit={save} className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Marital Status</label>
            <select className="mt-1 w-full rounded-md border px-3 py-2"
              value={form.maritalStatus}
              onChange={(e)=>setForm(s=>({ ...s, maritalStatus: e.target.value as MaritalStatus }))}>
              {MARITAL_STATUS.map(m => <option key={m} value={m}>{formatEnumLabel(m)}</option>)}
            </select>
          </div>
          <Input label="Spouse Name" value={form.spouseName} onChange={(v)=>setForm(s=>({...s,spouseName:v}))}/>
          <Input label="Spouse Occupation" value={form.spouseOccupation} onChange={(v)=>setForm(s=>({...s,spouseOccupation:v}))}/>
          <div>
            <label className="text-sm">Children</label>
            <input type="number" className="mt-1 w-full rounded-md border px-3 py-2"
              value={form.noChildren}
              onChange={(e)=>setForm(s=>({...s, noChildren: Number(e.target.value) }))}/>
          </div>

          <div className="sm:col-span-2 flex gap-2 justify-end">
            <button type="button" onClick={() => setEditing(false)} className="rounded-md border px-3 py-2">Cancel</button>
            <button disabled={status === "executing"} className="rounded-md bg-pcolor text-white px-3 py-2">Save</button>
          </div>
        </form>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Pair k="Marital Status" v={formatEnumLabel(form.maritalStatus)}/>
          <Pair k="Spouse Name" v={form.spouseName}/>
          <Pair k="Spouse Occupation" v={form.spouseOccupation}/>
          <Pair k="Children" v={String(form.noChildren)}/>
        </div>
      )}
    </section>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange:(v:string)=>void }) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <input className="mt-1 w-full rounded-md border px-3 py-2" value={value} onChange={(e)=>onChange(e.target.value)} />
    </div>
  );
}
function Pair({ k, v }: { k: string; v?: string }) {
  return <div><span className="text-muted-foreground">{k}:</span> {v || "—"}</div>;
}
function nz(s: string) { return s.trim() ? s : null; }
