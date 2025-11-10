"use client";

import { upsertAddress } from "@/actions/employees/one-to-one";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Address</h2>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="rounded-md border px-3 py-1.5 text-sm"
          disabled={status === "executing"}
        >
          {editing ? "Cancel" : initial ? "Edit" : "Add"}
        </button>
      </div>

      {editing ? (
        <form
          onSubmit={save}
          className="grid grid-cols-1 gap-3 lg:grid-cols-3"
        >
          <Input
            label="Present District"
            value={form.presentDistrict}
            onChange={(v) =>
              setForm((s) => ({ ...s, presentDistrict: v }))
            }
          />
          <Input
            label="Present Upazila"
            value={form.presentUpazila}
            onChange={(v) =>
              setForm((s) => ({ ...s, presentUpazila: v }))
            }
          />
          <Input
            label="Present Address"
            value={form.presentAddress}
            onChange={(v) =>
              setForm((s) => ({ ...s, presentAddress: v }))
            }
          />

          <div className="my-1 h-px bg-border sm:col-span-4" />

          <Input
            label="Permanent District"
            value={form.permanentDistrict}
            onChange={(v) =>
              setForm((s) => ({ ...s, permanentDistrict: v }))
            }
          />
          <Input
            label="Permanent Upazila"
            value={form.permanentUpazila}
            onChange={(v) =>
              setForm((s) => ({ ...s, permanentUpazila: v }))
            }
          />
          <Input
            label="Permanent Address"
            value={form.permanentAddress}
            onChange={(v) =>
              setForm((s) => ({ ...s, permanentAddress: v }))
            }
          />

          <div className="col-span-1 flex justify-end gap-2 lg:col-span-4">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border px-3 py-2"
              disabled={status === "executing"}
            >
              Cancel
            </button>
            <button
              disabled={status === "executing"}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-white"
            >
              {status === "executing" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {status === "executing" ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 gap-3 text-sm lg:grid-cols-4">
          <Pair k="Present District" v={form.presentDistrict} />
          <Pair k="Present Upazila" v={form.presentUpazila} />
          <Pair k="Present Address" v={form.presentAddress} />
          <Pair k="Permanent District" v={form.permanentDistrict} />
          <Pair k="Permanent Upazila" v={form.permanentUpazila} />
          <Pair k="Permanent Address" v={form.permanentAddress} />
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
