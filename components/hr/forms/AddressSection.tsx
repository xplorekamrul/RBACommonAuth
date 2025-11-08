"use client";

import { upsertAddress } from "@/actions/employees/one-to-one";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";

export default function AddressSection({
  employeeId,
  initial,
}: {
  employeeId: string;
  initial?: any | null;
}) {
  const [editing, setEditing] = useState(!initial);
  const [form, setForm] = useState({
    presentDistrict: initial?.presentDistrict ?? "",
    presentUpazila: initial?.presentUpazila ?? "",
    presentAddress: initial?.presentAddress ?? "",
    permanentDistrict: initial?.permanentDistrict ?? "",
    permanentUpazila: initial?.permanentUpazila ?? "",
    permanentAddress: initial?.permanentAddress ?? "",
  });

  const { executeAsync, status } = useAction(upsertAddress);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await executeAsync({
      employeeId,
      presentDistrict: nz(form.presentDistrict),
      presentUpazila: nz(form.presentUpazila),
      presentAddress: nz(form.presentAddress),
      permanentDistrict: nz(form.permanentDistrict),
      permanentUpazila: nz(form.permanentUpazila),
      permanentAddress: nz(form.permanentAddress),
    });
    if (res?.data?.ok) setEditing(false);
  }

  return (
    <section className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Address</h2>
        <button onClick={() => setEditing((v) => !v)} className="rounded-md border px-3 py-1.5">
          {editing ? "Cancel" : initial ? "Edit" : "Add"}
        </button>
      </div>

      {editing ? (
        <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <Input label="Present District" value={form.presentDistrict} onChange={(v) => setForm((s) => ({ ...s, presentDistrict: v }))} />
          <Input label="Present Upazila" value={form.presentUpazila} onChange={(v) => setForm((s) => ({ ...s, presentUpazila: v }))} />
          <Input label="Present Address" value={form.presentAddress} onChange={(v) => setForm((s) => ({ ...s, presentAddress: v }))} />
          <div className="sm:col-span-4 h-px bg-border my-1" />
          <Input label="Permanent District" value={form.permanentDistrict} onChange={(v) => setForm((s) => ({ ...s, permanentDistrict: v }))} />
          <Input label="Permanent Upazila" value={form.permanentUpazila} onChange={(v) => setForm((s) => ({ ...s, permanentUpazila: v }))} />
          <Input label="Permanent Address" value={form.permanentAddress} onChange={(v) => setForm((s) => ({ ...s, permanentAddress: v }))} />
          <div className="col-span-1 lg:col-span-4 flex gap-2 justify-end">
            <button type="button" onClick={() => setEditing(false)} className="rounded-md border px-3 py-2">Cancel</button>
            <button disabled={status === "executing"} className="rounded-md bg-primary text-white px-3 py-2">Save</button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
          <Pair k="Present District" v={form.presentDistrict} />
          <Pair k="Present Upazila" v={form.presentUpazila} />
          <Pair k="Present Address" v={form.presentAddress} />
          <Pair k="Permanent District" v={form.permanentDistrict} />
          <Pair k="Permanent Upazila" v={form.permanentUpazila} />
          <Pair k="Permanent Address" v={form.permanentAddress} />
        </div>
      )}
    </section>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <input className="mt-1 w-full rounded-md border px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
function Pair({ k, v }: { k: string; v?: string }) {
  return <div><span className="text-muted-foreground">{k}:</span> {v || "—"}</div>;
}
function nz(s: string) { return s.trim() ? s : null; }
