"use client";

import { createEmployee } from "@/actions/employees/create-employee";
import { type ContractType } from "@/lib/enums/enums";
import type { EmployeeCreateValues } from "@/lib/validations/employees";
import { useAction } from "next-safe-action/hooks";
import { useMemo, useState } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type Opt = { id: string; name: string };

type FormState = {
  name: string;
  empId: string;
  joiningDate?: string;
  contractType: ContractType;
  departmentId?: string;
  designationId?: string;
};

// Human-readable labels for ContractType
const CONTRACT_TYPE_OPTIONS: Array<{ value: ContractType; label: string; hint?: string }> = [
  { value: "FULL_TIME", label: "Full time", hint: "40h/week (typical)" },
  { value: "PART_TIME", label: "Part time", hint: "Under full-time hours" },
  { value: "CONTRACT", label: "Contract", hint: "Fixed term / project" },
  { value: "INTERN", label: "Intern", hint: "Trainee / internship" },
];

// Sentinel for “None” in shadcn Select (must not be empty string)
const NONE = "__none__";

export default function CreateEmployeeDialog({
  open,
  onOpenChange,
  onCreated,
  departments = [],
  designations = [],
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
  departments?: Opt[];
  designations?: Opt[];
}) {
  const [form, setForm] = useState<FormState>({
    name: "",
    empId: "",
    joiningDate: undefined,
    contractType: "FULL_TIME",
    departmentId: undefined,
    designationId: undefined,
  });

  const { executeAsync, status, result } = useAction(createEmployee);

  const fieldErrors = useMemo(() => {
    const errs = (result?.validationErrors ?? {}) as Record<string, string[] | undefined>;
    return {
      name: errs?.name?.[0],
      empId: errs?.empId?.[0],
      joiningDate: errs?.joiningDate?.[0],
      contractType: errs?.contractType?.[0],
      departmentId: errs?.departmentId?.[0],
      designationId: errs?.designationId?.[0],
    };
  }, [result]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload: EmployeeCreateValues = {
      name: form.name,
      empId: form.empId,
      joiningDate: form.joiningDate ? new Date(form.joiningDate) : undefined,
      contractType: form.contractType,
      departmentId: form.departmentId || undefined,
      designationId: form.designationId || undefined,
    };
    const res = await executeAsync(payload);
    if (res?.data?.ok) {
      onCreated();
      onOpenChange(false);
      setForm({
        name: "",
        empId: "",
        joiningDate: undefined,
        contractType: "FULL_TIME",
        departmentId: undefined,
        designationId: undefined,
      });
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/45 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-2xl rounded-2xl border border-border bg-background/95 backdrop-blur shadow-2xl p-6"
      >
        <div className="mb-5">
          <h3 className="text-xl font-semibold tracking-tight">Add Employee</h3>
          <p className="text-sm text-muted-foreground">Create a new team member record</p>
        </div>

        {/* Basic */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="emp-name">Name</Label>
            <input
              id="emp-name"
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="e.g. Employee Name"
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>}
          </div>

          <div>
            <Label htmlFor="emp-id">Employee ID</Label>
            <input
              id="emp-id"
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={form.empId}
              onChange={(e) => setForm((s) => ({ ...s, empId: e.target.value }))}
              placeholder="e.g. BIRL-0007"
            />
            {fieldErrors.empId && <p className="mt-1 text-xs text-destructive">{fieldErrors.empId}</p>}
          </div>

          <div>
            <Label htmlFor="join-date">Joining Date</Label>
            <input
              id="join-date"
              type="datetime-local"
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={form.joiningDate ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, joiningDate: e.target.value || undefined }))}
            />
            {fieldErrors.joiningDate && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.joiningDate}</p>
            )}
          </div>

          <div>
            <Label>Contract Type</Label>
            <Select
              value={form.contractType}
              onValueChange={(v) => setForm((s) => ({ ...s, contractType: v as ContractType }))}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue placeholder="Select contract type" />
              </SelectTrigger>
              <SelectContent>
                {CONTRACT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{opt.label}</span>
                      {/* {opt.hint ? (
                        <span className="text-[11px] text-muted-foreground">{opt.hint}</span>
                      ) : null} */}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.contractType && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.contractType}</p>
            )}
          </div>
        </div>

        {/* Org */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Department</Label>
            <Select
              value={form.departmentId ?? NONE}
              onValueChange={(v) =>
                setForm((s) => ({ ...s, departmentId: v === NONE ? undefined : v }))
              }
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>— None —</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.departmentId && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.departmentId}</p>
            )}
          </div>

          <div>
            <Label>Designation</Label>
            <Select
              value={form.designationId ?? NONE}
              onValueChange={(v) =>
                setForm((s) => ({ ...s, designationId: v === NONE ? undefined : v }))
              }
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>— None —</SelectItem>
                {designations.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.designationId && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.designationId}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition"
          >
            Cancel
          </button>
          <button
            disabled={status === "executing"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white bg-primary hover:opacity-95 transition disabled:opacity-70"
          >
            {status === "executing" && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
