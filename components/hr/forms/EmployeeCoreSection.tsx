"use client";

import { useMemo, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { createEmployee, updateEmployee } from "@/actions/employees/core";
import { CONTRACT_TYPE, type ContractType } from "@/lib/enums/enums";
import { formatEnumLabel } from "@/lib/format";

type Props =
  | { mode: "create"; onCreated: (id: string) => void }
  | {
      mode: "edit";
      employee: {
        id: string; name: string; empId: string;
        joiningDate: string; // "YYYY-MM-DDTHH:mm" or ""
        contractType: ContractType;
        departmentId?: string;
        designationId?: string;
      };
    };

export default function EmployeeCoreSection(props: Props) {
  const isCreate = props.mode === "create";

  const [form, setForm] = useState(
    isCreate
      ? { name: "", empId: "", joiningDate: "", contractType: "FULL_TIME" as ContractType, departmentId: "", designationId: "" }
      : { ...props.employee }
  );
  const [editing, setEditing] = useState(isCreate ? true : false);

  const { executeAsync: doCreate, result: r1, status: s1 } = useAction(createEmployee);
  const { executeAsync: doUpdate, result: r2, status: s2 } = useAction(updateEmployee);

  const fieldErrors = useMemo(() => {
    const errs = (isCreate ? r1 : r2)?.validationErrors as Record<string, string[] | undefined> | undefined;
    return {
      name: errs?.name?.[0],
      empId: errs?.empId?.[0],
      joiningDate: errs?.joiningDate?.[0],
    };
  }, [r1, r2, isCreate]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (isCreate) {
      const res = await doCreate({
        name: form.name,
        empId: form.empId,
        joiningDate: form.joiningDate ? new Date(form.joiningDate) : undefined,
        contractType: form.contractType as any,
        departmentId: form.departmentId || undefined,
        designationId: form.designationId || undefined,
      });
      if (res?.data?.ok) {
        (props as any).onCreated(res.data.id);
        setEditing(false);
      }
    } else {
      const res = await doUpdate({
        id: (form as any).id,
        name: form.name,
        empId: form.empId,
        joiningDate: form.joiningDate ? new Date(form.joiningDate) : undefined,
        contractType: form.contractType as any,
        departmentId: form.departmentId || undefined,
        designationId: form.designationId || undefined,
      });
      if (res?.data?.ok) setEditing(false);
    }
  }

  return (
    <section className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Employee</h2>
        {!isCreate && (
          <button onClick={() => setEditing((v) => !v)} className="rounded-md border px-3 py-1.5">
            {editing ? "Cancel" : "Edit"}
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={save} className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Name</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}/>
            {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
          </div>
          <div>
            <label className="text-sm">Employee ID</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.empId}
              onChange={(e) => setForm((s) => ({ ...s, empId: e.target.value }))}/>
            {fieldErrors.empId && <p className="text-xs text-destructive">{fieldErrors.empId}</p>}
          </div>
          <div>
            <label className="text-sm">Joining Date</label>
            <input type="datetime-local" className="mt-1 w-full rounded-md border px-3 py-2" value={form.joiningDate || ""}
              onChange={(e) => setForm((s) => ({ ...s, joiningDate: e.target.value }))}/>
            {fieldErrors.joiningDate && <p className="text-xs text-destructive">{fieldErrors.joiningDate}</p>}
          </div>
          <div>
            <label className="text-sm">Contract Type</label>
            <select className="mt-1 w-full rounded-md border px-3 py-2" value={form.contractType}
              onChange={(e) => setForm((s) => ({ ...s, contractType: e.target.value as ContractType }))}>
              {CONTRACT_TYPE.map((ct) => <option key={ct} value={ct}>{formatEnumLabel(ct)}</option>)}
            </select>
          </div>

          {/* Optional: departmentId / designationId dropdowns if you supply options */}
          <div className="sm:col-span-2 flex gap-2 justify-end">
            {!isCreate && <button type="button" onClick={() => setEditing(false)} className="rounded-md border px-3 py-2">Cancel</button>}
            <button disabled={s1==="executing" || s2==="executing"} className="rounded-md bg-pcolor text-white px-3 py-2">
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Name:</span> {form.name || "—"}</div>
          <div><span className="text-muted-foreground">Employee ID:</span> {form.empId || "—"}</div>
          <div><span className="text-muted-foreground">Joining Date:</span> {form.joiningDate ? form.joiningDate.replace("T"," ") : "—"}</div>
          <div><span className="text-muted-foreground">Contract:</span> {formatEnumLabel(form.contractType)}</div>
        </div>
      )}
    </section>
  );
}
