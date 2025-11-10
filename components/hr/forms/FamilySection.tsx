"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { upsertFamily } from "@/actions/employees/one-to-one";
import { MARITAL_STATUS, type MaritalStatus } from "@/lib/enums/enums";
import { formatEnumLabel } from "@/lib/format";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function FamilySection({
  employeeId,
  initial,
}: {
  employeeId: string;
  initial?: any | null;
}) {
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
    <Card className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Family</h2>
        <button
          onClick={() => setEditing((v) => !v)}
          className="rounded-md border px-3 py-1.5"
        >
          {editing ? "Cancel" : initial ? "Edit" : "Add"}
        </button>
      </div>

      {editing ? (
        <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Marital Status (shadcn Select) */}
          <div>
            <label className="text-sm mb-2 block">Marital Status</label>
            <Select
              value={form.maritalStatus}
              onValueChange={(value) =>
                setForm((s) => ({ ...s, maritalStatus: value as MaritalStatus }))
              }
            >
              <SelectTrigger className="w-full ]">
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                {MARITAL_STATUS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {formatEnumLabel(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={form.noChildren}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  noChildren: Number(e.target.value),
                }))
              }
            />
          </div>

          <div className="col-span-1 lg:col-span-4 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border px-3 py-2"
            >
              Cancel
            </button>
            <button
              disabled={status === "executing"}
              className="rounded-md bg-primary text-white px-3 py-2"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 text-sm">
          <Pair k="Marital Status" v={formatEnumLabel(form.maritalStatus)} />
          <Pair k="Spouse Name" v={form.spouseName} />
          <Pair k="Spouse Occupation" v={form.spouseOccupation} />
          <Pair k="Children" v={String(form.noChildren)} />
        </div>
      )}
    </Card>
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
