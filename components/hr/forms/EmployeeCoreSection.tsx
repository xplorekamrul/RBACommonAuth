"use client";

import { createEmployee, updateEmployee } from "@/actions/employees/core";
import { type ContractType } from "@/lib/enums/enums";
import { formatEnumLabel } from "@/lib/format";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import DatePickerDOB from "@/components/shared/date-picker";

type Opt = { id: string; name: string };

type BaseEmployeeForm = {
  name: string;
  empId: string;
  joiningDate: string;
  contractType: ContractType;
  departmentId?: string;
  designationId?: string;
};

type Props =
  | {
    mode: "create";
    onCreated: (id: string) => void;
    departments?: Opt[];
    designations?: Opt[];
  }
  | {
    mode: "edit";
    employee: {
      id: string;
      name: string;
      empId: string;
      joiningDate: string;
      contractType: ContractType;
      departmentId?: string;
      designationId?: string;
    };
    departments?: Opt[];
    designations?: Opt[];
  };

const CONTRACT_TYPE_OPTIONS: Array<{ value: ContractType; label: string }> = [
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERN", label: "Intern" },
];

const NONE = "__none__";

export default function EmployeeCoreSection(props: Props) {
  const isCreate = props.mode === "create";
  const departments = props.departments ?? [];
  const designations = props.designations ?? [];

  const normalizedEditDate =
    !isCreate && props.employee.joiningDate
      ? props.employee.joiningDate.slice(0, 10)
      : "";

  const [form, setForm] = useState<BaseEmployeeForm & { id?: string }>(
    isCreate
      ? {
        name: "",
        empId: "",
        joiningDate: "",
        contractType: "FULL_TIME",
        departmentId: undefined,
        designationId: undefined,
      }
      : {
        id: props.employee.id,
        name: props.employee.name,
        empId: props.employee.empId,
        joiningDate: normalizedEditDate,
        contractType: props.employee.contractType,
        departmentId: props.employee.departmentId,
        designationId: props.employee.designationId,
      }
  );

  const [editing, setEditing] = useState(isCreate ? true : false);

  const { executeAsync: doCreate, result: rCreate, status: sCreate } = useAction(createEmployee);
  const { executeAsync: doUpdate, result: rUpdate, status: sUpdate } = useAction(updateEmployee);

  const fieldErrors = useMemo(() => {
    const errs =
      (isCreate ? rCreate : rUpdate)?.validationErrors as
      | Record<string, string[] | undefined>
      | undefined;

    return {
      name: errs?.name?.[0],
      empId: errs?.empId?.[0],
      joiningDate: errs?.joiningDate?.[0],
      contractType: errs?.contractType?.[0],
      departmentId: errs?.departmentId?.[0],
      designationId: errs?.designationId?.[0],
    };
  }, [rCreate, rUpdate, isCreate]);

  const loading = sCreate === "executing" || sUpdate === "executing";

  async function save(e: React.FormEvent) {
    e.preventDefault();

    const dateForAction = form.joiningDate ? new Date(form.joiningDate) : undefined;

    if (isCreate) {
      const res = await doCreate({
        name: form.name,
        empId: form.empId,
        joiningDate: dateForAction,
        contractType: form.contractType as any,
        departmentId: form.departmentId || undefined,
        designationId: form.designationId || undefined,
      });

      if (res?.data?.ok) {
        (props as { onCreated: (id: string) => void }).onCreated(res.data.id);
        setEditing(false);
      }
    } else {
      const res = await doUpdate({
        id: (form as any).id ?? (props as any).employee.id,
        name: form.name,
        empId: form.empId,
        joiningDate: dateForAction,
        contractType: form.contractType as any,
        departmentId: form.departmentId || undefined,
        designationId: form.designationId || undefined,
      });

      if (res?.data?.ok) setEditing(false);
    }
  }

  useEffect(() => {
  }, [departments.length, designations.length]);

  return (
    <section className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Employee</h2>

        {!isCreate && (
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="rounded-md border px-3 py-1.5"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={save} className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          {/* Name */}
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

          {/* Contract Type */}
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
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.contractType && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.contractType}</p>
            )}
          </div>
          {/* Employee ID */}
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





          {/* Department (shows when provided) */}
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
                <SelectItem value={NONE}>--Select--</SelectItem>
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

          {/*  Designation (shows when provided) */}
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
                <SelectItem value={NONE}>--Select--</SelectItem>
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

          <div className="">
            {/* <Label>Joining Date</Label> */}
            <div className="mt-2">
              {/* <DatePickerDOB
                value={form.joiningDate || null}
                onChange={(iso) => setForm((s) => ({ ...s, joiningDate: iso ?? "" }))}
                labelInitial="Select joining date"
                labelAfter={(age) => "Selected date"}
              /> */}
              <DatePickerDOB
                value={form.joiningDate || null}
                onChange={(iso) => setForm((s) => ({ ...s, joiningDate: iso ?? "" }))}
                labelInitial="Select joining date"
                labelAfter={() => "Selected date"}
                minYear={1990}
                defaultToToday
              />

              {fieldErrors.joiningDate && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.joiningDate}</p>
              )}
            </div>

            {/* Actions */}
            <div className="sm:col-span-3 mt-2 flex items-center justify-end gap-2">
              {!isCreate && (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition"
                >
                  Cancel
                </button>
              )}
              <button
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white bg-primary hover:opacity-95 transition disabled:opacity-70"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div><span className="text-muted-foreground">Name:</span> {form.name || "Not Provided"}</div>
          <div><span className="text-muted-foreground">Employee ID:</span> {form.empId || "Not Provided"}</div>
          <div>
            <span className="text-muted-foreground">Joining Date:</span>{" "}
            {form.joiningDate || "Not Provided"}
          </div>
          <div>
            <span className="text-muted-foreground">Contract:</span>{" "}
            {formatEnumLabel(form.contractType)}
          </div>
          <div>
            <span className="text-muted-foreground">Department:</span>{" "}
            {formatEnumLabel(form.departmentId
              ? departments.find((d) => d.id === form.departmentId)?.name || "Not Provided"
              : "Not Provided")}
          </div>
          <div>
            <span className="text-muted-foreground">Designation:</span>{" "}
            {formatEnumLabel(form.designationId
              ? designations.find((d) => d.id === form.designationId)?.name || "Not Provided"
              : "Not Provided")}
          </div>

        </div>
      )}
    </section>
  );
}
