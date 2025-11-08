"use client";

import { upsertFamily } from "@/actions/employees/one-to-one";
import EnumSelect from "@/components/shared/Select";
import DatePickerDOB from "@/components/shared/date-picker";
import { MARITAL_STATUS, type MaritalStatus } from "@/lib/enums/enums";
import { formatEnumLabel, } from "@/lib/format";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";

type FamilyInitial = {
  maritalStatus?: MaritalStatus;
  spouseName?: string | null;
  spouseOccupation?: string | null;
  noChildren?: number | null;
  anniversary?: string | null;
};

export default function FamilySection({
  employeeId,
  initial,
}: {
  employeeId: string;
  initial?: FamilyInitial | null;
}) {
  const [editing, setEditing] = useState(!initial);
  const [savedOnce, setSavedOnce] = useState<boolean>(!!initial);

  const [form, setForm] = useState({
    maritalStatus: (initial?.maritalStatus ?? "SINGLE") as MaritalStatus,
    spouseName: initial?.spouseName ?? "",
    spouseOccupation: initial?.spouseOccupation ?? "",
    noChildren: Number.isFinite(initial?.noChildren ?? 0) ? Number(initial?.noChildren ?? 0) : 0,
    anniversary: initial?.anniversary ?? null as string | null, // ← remove if not in DB
  });

  const { executeAsync, status } = useAction(upsertFamily);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload: any = {
      employeeId,
      maritalStatus: form.maritalStatus,
      spouseName: nz(form.spouseName),
      spouseOccupation: nz(form.spouseOccupation),
      noChildren: Number.isFinite(form.noChildren) ? form.noChildren : 0,
    };

    const res = await executeAsync(payload);
    if (res?.data?.ok) {
      setEditing(false);
      setSavedOnce(true);
    }
  }

  // red when empty (no saved data), green after first successful save
  const cardTone =
    !savedOnce && !initial
      ? "bg-red-300/5 border-red-500/30"
      : savedOnce
        ? "bg-green-300/5 border-green-500/30"
        : "bg-transparent";

  const msOptions = MARITAL_STATUS.map((m) => ({ value: m, label: formatEnumLabel(m) }));

  return (
    <section className={`rounded-lg border p-4 ${cardTone}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Family</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing((v) => !v)}
            className="rounded-md border px-3 py-1.5"
          >
            {editing ? "Cancel" : initial || savedOnce ? "Edit" : "Add"}
          </button>
          {!editing && (
            <span className="text-xs px-2 py-1 rounded-full border bg-white/70">
              {savedOnce ? "Saved" : "Empty"}
            </span>
          )}
        </div>
      </div>

      {editing ? (
        <form onSubmit={save} className="grid sm:grid-cols-2 gap-3">
          <EnumSelect
            label="Marital Status"
            value={form.maritalStatus}
            onChange={(v) => setForm((s) => ({ ...s, maritalStatus: v as MaritalStatus }))}
            options={msOptions}
            placeholder="Select status"
          />

          <Input
            label="Spouse Name"
            value={form.spouseName}
            onChange={(v) => setForm((s) => ({ ...s, spouseName: v }))}
          />

          <Input
            label="Spouse Occupation"
            value={form.spouseOccupation}
            onChange={(v) => setForm((s) => ({ ...s, spouseOccupation: v }))}
          />

          <div>
            <label className="text-sm">Children</label>
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={form.noChildren}
              onChange={(e) => setForm((s) => ({ ...s, noChildren: Number(e.target.value) }))}
            />
          </div>

          {/* OPTIONAL date field using your custom picker */}
          <div className="sm:col-span-2">
            <DatePickerDOB
              value={form.anniversary}
              onChange={(iso) => setForm((s) => ({ ...s, anniversary: iso }))}
              labelInitial="Anniversary date (optional)"
              labelAfter={() => "Selected anniversary date"}
              allowFutureDates
            />
          </div>

          <div className="sm:col-span-2 flex gap-2 justify-end">
            <button type="button" onClick={() => setEditing(false)} className="rounded-md border px-3 py-2">
              Cancel
            </button>
            <button disabled={status === "executing"} className="rounded-md bg-primary text-white px-3 py-2">
              {status === "executing" ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Pair k="Marital Status" v={formatEnumLabel(form.maritalStatus)} />
          <Pair k="Spouse Name" v={form.spouseName} />
          <Pair k="Spouse Occupation" v={form.spouseOccupation} />
          <Pair k="Children" v={String(form.noChildren)} />
          {form.anniversary && <Pair k="Anniversary" v={form.anniversary} />}
        </div>
      )}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <input
        className="mt-1 w-full rounded-md border px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
function Pair({ k, v }: { k: string; v?: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{k}:</span> {v || "—"}
    </div>
  );
}
function nz(s: string) {
  return s.trim() ? s : null;
}
