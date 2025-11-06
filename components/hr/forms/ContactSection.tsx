"use client";

import { useMemo, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { upsertContact } from "@/actions/employees/one-to-one";

export default function ContactSection({ employeeId, initial }: { employeeId: string; initial?: any | null }) {
  const [editing, setEditing] = useState(!initial);
  const [form, setForm] = useState({
    mobile: initial?.mobile ?? "",
    email: initial?.email ?? "",
    emergencyContactName: initial?.emergencyContactName ?? "",
    emergencyContactNumber: initial?.emergencyContactNumber ?? "",
    emergencyContactRelation: initial?.emergencyContactRelation ?? "",
  });

  const { executeAsync, status, result } = useAction(upsertContact);
  const fieldErrors = useMemo(
    () => (result?.validationErrors ?? {}) as Record<string, string[] | undefined>,
    [result]
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await executeAsync({
      employeeId,
      mobile: nz(form.mobile),
      email: form.email ? form.email : null,
      emergencyContactName: nz(form.emergencyContactName),
      emergencyContactNumber: nz(form.emergencyContactNumber),
      emergencyContactRelation: nz(form.emergencyContactRelation),
    });
    if (res?.data?.ok) setEditing(false);
  }

  return (
    <section className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Contact</h2>
        <button onClick={() => setEditing((v) => !v)} className="rounded-md border px-3 py-1.5">
          {editing ? "Cancel" : initial ? "Edit" : "Add"}
        </button>
      </div>

      {editing ? (
        <form onSubmit={save} className="grid sm:grid-cols-2 gap-3">
          <Input label="Mobile" value={form.mobile} onChange={(v)=>setForm(s=>({...s,mobile:v}))}/>
          <div>
            <label className="text-sm">Email</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.email}
              onChange={(e)=>setForm(s=>({...s,email:e.target.value}))} />
            {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
          </div>
          <Input label="Emergency Contact Name" value={form.emergencyContactName} onChange={(v)=>setForm(s=>({...s,emergencyContactName:v}))}/>
          <Input label="Emergency Contact Number" value={form.emergencyContactNumber} onChange={(v)=>setForm(s=>({...s,emergencyContactNumber:v}))}/>
          <Input label="Emergency Contact Relation" value={form.emergencyContactRelation} onChange={(v)=>setForm(s=>({...s,emergencyContactRelation:v}))}/>
          <div className="sm:col-span-2 flex gap-2 justify-end">
            <button type="button" onClick={() => setEditing(false)} className="rounded-md border px-3 py-2">Cancel</button>
            <button disabled={status === "executing"} className="rounded-md bg-pcolor text-white px-3 py-2">Save</button>
          </div>
        </form>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Pair k="Mobile" v={form.mobile}/>
          <Pair k="Email" v={form.email}/>
          <Pair k="Emergency Name" v={form.emergencyContactName}/>
          <Pair k="Emergency Number" v={form.emergencyContactNumber}/>
          <Pair k="Emergency Relation" v={form.emergencyContactRelation}/>
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
