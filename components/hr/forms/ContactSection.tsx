"use client";

import { upsertContact } from "@/actions/employees/one-to-one";
import { useAction } from "next-safe-action/hooks";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";

type FieldError = {
  _errors?: string[];
};

export default function ContactSection({
  employeeId,
  initial,
}: {
  employeeId: string;
  initial?: any | null;
}) {
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
    () =>
      (result?.validationErrors ?? {}) as Record<string, FieldError | undefined>,
    [result]
  );

  const getError = (field: string) => fieldErrors[field]?._errors?.[0] ?? null;

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
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Contact</h2>
        <button
          onClick={() => setEditing((v) => !v)}
          className="rounded-md border px-3 py-1.5 text-sm"
          type="button"
        >
          {editing ? "Cancel" : initial ? "add" : "Edit"}
        </button>
      </div>

      {editing ? (
        <form
          onSubmit={save}
          className="grid grid-cols-1 gap-3 lg:grid-cols-3"
        >
          <Input
            label="Mobile"
            value={form.mobile}
            onChange={(v) => setForm((s) => ({ ...s, mobile: v }))}
            error={getError("mobile")}
          />

          <div>
            <label className="text-sm">Email</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={form.email}
              onChange={(e) =>
                setForm((s) => ({ ...s, email: e.target.value }))
              }
            />
            {getError("email") && (
              <p className="mt-1 text-xs text-destructive">
                {getError("email")}
              </p>
            )}
          </div>

          <Input
            label="Emergency Contact Name"
            value={form.emergencyContactName}
            onChange={(v) =>
              setForm((s) => ({ ...s, emergencyContactName: v }))
            }
            error={getError("emergencyContactName")}
          />
          <Input
            label="Emergency Contact Number"
            value={form.emergencyContactNumber}
            onChange={(v) =>
              setForm((s) => ({ ...s, emergencyContactNumber: v }))
            }
            error={getError("emergencyContactNumber")}
          />
          <Input
            label="Emergency Contact Relation"
            value={form.emergencyContactRelation}
            onChange={(v) =>
              setForm((s) => ({ ...s, emergencyContactRelation: v }))
            }
            error={getError("emergencyContactRelation")}
          />

          <div className="col-span-1 flex justify-end gap-2 lg:col-span-3">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border px-3 py-2"
            >
              Cancel
            </button>
            <button
              disabled={status === "executing"}
              className="rounded-md bg-primary px-3 py-2 text-white"
            >
              {status === "executing" ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 gap-3 text-sm lg:grid-cols-4">
          <Pair k="Mobile" v={form.mobile} />
          <Pair k="Email" v={form.email} />
          <Pair k="Emergency Name" v={form.emergencyContactName} />
          <Pair k="Emergency Number" v={form.emergencyContactNumber} />
          <Pair k="Emergency Relation" v={form.emergencyContactRelation} />
        </div>
      )}
    </Card>
  );
}

function Input({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
}) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <input
        className="mt-1 w-full rounded-md border px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
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
