"use client";

import { useEffect, useMemo, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { updateEmployee } from "@/actions/employees/update-employee";
import { CONTRACT_TYPE, type ContractType } from "@/lib/enums/enums";

type Opt = { id: string; name: string };

export default function EditEmployeeDialog({
  open, onOpenChange, onSaved, employee, departments = [], designations = [],
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
  employee: {
    id: string; name: string; empId: string;
    joiningDate: string | null;
    contractType: ContractType;
    department?: Opt | null;
    designation?: Opt | null;
  };
  departments?: Opt[];
  designations?: Opt[];
}) {
  const [form, setForm] = useState({
    id: employee.id,
    name: employee.name,
    empId: employee.empId,
    joiningDate: employee.joiningDate || "",
    contractType: employee.contractType as ContractType,
    departmentId: employee.department?.id ?? "",
    designationId: employee.designation?.id ?? "",
  });

  useEffect(() => {
    setForm({
      id: employee.id,
      name: employee.name,
      empId: employee.empId,
      joiningDate: employee.joiningDate || "",
      contractType: employee.contractType as ContractType,
      departmentId: employee.department?.id ?? "",
      designationId: employee.designation?.id ?? "",
    });
  }, [employee]);

  const { executeAsync, status, result } = useAction(updateEmployee);
  const fieldErrors = useMemo(() => {
    const errs = (result?.validationErrors ?? {}) as Record<string, string[] | undefined>;
    return {
      name: errs?.name?.[0],
      empId: errs?.empId?.[0],
      joiningDate: errs?.joiningDate?.[0],
    };
  }, [result]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      joiningDate: form.joiningDate ? new Date(form.joiningDate).toISOString() : "",
      departmentId: form.departmentId || undefined,
      designationId: form.designationId || undefined,
    };
    const res = await executeAsync(payload as any);
    if (res?.data?.ok) {
      onSaved();
      onOpenChange(false);
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/40 p-4">
      <form onSubmit={submit} className="w-full max-w-2xl rounded-xl border border-border bg-background p-4 shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Edit Employee</h3>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Name</label>
            <input className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              value={form.name} onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))} />
            {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
          </div>
          <div>
            <label className="text-sm">Employee ID</label>
            <input className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              value={form.empId} onChange={(e) => setForm(s => ({ ...s, empId: e.target.value }))} />
            {fieldErrors.empId && <p className="text-xs text-destructive">{fieldErrors.empId}</p>}
          </div>
          <div>
            <label className="text-sm">Joining Date</label>
            <input type="datetime-local"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              value={form.joiningDate ? form.joiningDate.toString().slice(0,16) : ""}
              onChange={(e) => setForm(s => ({ ...s, joiningDate: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">Contract Type</label>
            <select
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              value={form.contractType}
              onChange={(e) => setForm(s => ({ ...s, contractType: e.target.value as ContractType }))}
            >
              {CONTRACT_TYPE.map(ct => (
                <option key={ct} value={ct}>{ct}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Department</label>
            <select
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              value={form.departmentId}
              onChange={(e) => setForm(s => ({ ...s, departmentId: e.target.value }))}
            >
              <option value="">—</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm">Designation</label>
            <select
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              value={form.designationId}
              onChange={(e) => setForm(s => ({ ...s, designationId: e.target.value }))}
            >
              <option value="">—</option>
              {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => onOpenChange(false)} className="px-3 py-2 rounded-md border">Cancel</button>
          <button disabled={status === "executing"} className="px-3 py-2 rounded-md bg-pcolor text-white">Save</button>
        </div>
      </form>
    </div>
  );
}
