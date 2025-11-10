"use client";

import { useMemo, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { upsertPersonal } from "@/actions/employees/one-to-one";
import {
  GENDER,
  BLOOD_GROUP,
  type Gender,
  type BloodGroup,
} from "@/lib/enums/enums";
import { formatEnumLabel, formatBloodGroup } from "@/lib/format";
import EnumSelect from "@/components/shared/Select";
import DatePickerDOB from "@/components/shared/date-picker";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type PersonalInitial = {
  fathersName?: string | null;
  mothersName?: string | null;
  birthDate?: string | Date | null;
  gender?: Gender | null;
  bloodGroup?: BloodGroup | null;
};

export default function PersonalSection({
  employeeId,
  initial,
}: {
  employeeId: string;
  initial?: PersonalInitial | null;
}) {
  const [editing, setEditing] = useState(!initial);

  const [form, setForm] = useState<{
    fathersName: string;
    mothersName: string;
    birthDate: string; // YYYY-MM-DD or ""
    gender: Gender | null;
    bloodGroup: BloodGroup | null;
  }>({
    fathersName: initial?.fathersName ?? "",
    mothersName: initial?.mothersName ?? "",
    birthDate: initial?.birthDate ? toYmd(initial.birthDate) : "",
    gender: (initial?.gender ?? null) as Gender | null,
    bloodGroup: (initial?.bloodGroup ?? null) as BloodGroup | null,
  });

  const { executeAsync, status, result } = useAction(upsertPersonal);

  const fieldErrors = useMemo(
    () =>
      (result?.validationErrors ?? {}) as Record<string, string[] | undefined>,
    [result]
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();

    const res = await executeAsync({
      employeeId,
      fathersName: emptyToNull(form.fathersName),
      mothersName: emptyToNull(form.mothersName),
      // Send "YYYY-MM-DD" or null; server will convert to Date
      birthDate: form.birthDate || null,
      gender: form.gender,
      bloodGroup: form.bloodGroup,
    });

    if (res?.data?.ok) {
      setEditing(false);
    }
  }

  const genderOptions = GENDER.map((g) => ({
    value: g,
    label: formatEnumLabel(g),
  }));

  const bloodOptions = BLOOD_GROUP.map((b) => ({
    value: b,
    label: formatBloodGroup(b),
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-semibold">Personal</CardTitle>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          {editing ? "Cancel" : initial ? "Edit" : "Add"}
        </button>
      </CardHeader>

      <CardContent>
        {editing ? (
          <form
            onSubmit={save}
            className="grid grid-cols-1 gap-3 lg:grid-cols-4"
          >
            {/* Father’s Name */}
            <div>
              <label className="text-sm">Father’s Name</label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={form.fathersName}
                onChange={(e) =>
                  setForm((s) => ({ ...s, fathersName: e.target.value }))
                }
              />
              {fieldErrors.fathersName && (
                <p className="mt-1 text-xs text-destructive">
                  {fieldErrors.fathersName[0]}
                </p>
              )}
            </div>

            {/* Mother’s Name */}
            <div>
              <label className="text-sm">Mother’s Name</label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={form.mothersName}
                onChange={(e) =>
                  setForm((s) => ({ ...s, mothersName: e.target.value }))
                }
              />
              {fieldErrors.mothersName && (
                <p className="mt-1 text-xs text-destructive">
                  {fieldErrors.mothersName[0]}
                </p>
              )}
            </div>

            {/* Gender */}
            <EnumSelect
              label="Gender"
              placeholder="Select gender"
              value={form.gender ?? ""}
              onChange={(v) =>
                setForm((s) => ({
                  ...s,
                  gender: (v || null) as Gender | null,
                }))
              }
              options={genderOptions}
              className=""
            />
            {fieldErrors.gender && (
              <p className="mt-1 text-xs text-destructive lg:col-span-1">
                {fieldErrors.gender[0]}
              </p>
            )}

            {/* Blood Group */}
            <EnumSelect
              label="Blood Group"
              placeholder="Select blood group"
              value={form.bloodGroup ?? ""}
              onChange={(v) =>
                setForm((s) => ({
                  ...s,
                  bloodGroup: (v || null) as BloodGroup | null,
                }))
              }
              options={bloodOptions}
              className=""
            />
            {fieldErrors.bloodGroup && (
              <p className="mt-1 text-xs text-destructive lg:col-span-1">
                {fieldErrors.bloodGroup[0]}
              </p>
            )}

            {/* Birth Date */}
            <div>
              <label className="text-sm">Birth Date</label>
              <DatePickerDOB
                value={form.birthDate || null}
                onChange={(iso) =>
                  setForm((s) => ({ ...s, birthDate: iso || "" }))
                }
                allowFutureDates={false}
                defaultToToday={false}
              />
              {fieldErrors.birthDate && (
                <p className="mt-1 text-xs text-destructive">
                  {fieldErrors.birthDate[0]}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="lg:col-span-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-md border px-3 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "executing"}
                className="rounded-md bg-primary px-3 py-2 text-white"
              >
                {status === "executing" ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 gap-3 text-sm lg:grid-cols-4">
            <div>
              <span className="text-muted-foreground">Father:</span>{" "}
              {form.fathersName || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Mother:</span>{" "}
              {form.mothersName || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Birth Date:</span>{" "}
              {form.birthDate || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Gender:</span>{" "}
              {form.gender ? formatEnumLabel(form.gender) : "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Blood Group:</span>{" "}
              {form.bloodGroup ? formatBloodGroup(form.bloodGroup) : "—"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function emptyToNull(s: string) {
  return s.trim() ? s : null;
}

function toYmd(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10); // YYYY-MM-DD
}
