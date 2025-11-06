"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { createJobHistory, updateJobHistory, deleteJobHistory } from "@/actions/employees/one-to-many";
import { hasOkData } from "@/lib/safe-action/ok";
import { Pencil, Trash2, Plus } from "lucide-react";

type JH = {
  id: string;
  companyName: string;
  designation: string;
  startDate: string;   // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD or null
};

export default function JobHistoriesSection({
  employeeId,
  initial = [] as any[],
}: {
  employeeId: string;
  initial?: any[];
}) {
  const seed: JH[] = initial.map((j) => ({
    id: j.id,
    companyName: j.companyName,
    designation: j.designation,
    startDate: toDateInput(j.startDate),
    endDate: j.endDate ? toDateInput(j.endDate) : null,
  }));
  const [items, setItems] = useState<JH[]>(seed);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState<JH>({
    id: "",
    companyName: "",
    designation: "",
    startDate: "",
    endDate: null,
  });

  const { executeAsync: doCreate, status: sc } = useAction(createJobHistory);
  const { executeAsync: doUpdate } = useAction(updateJobHistory);
  const { executeAsync: doDelete } = useAction(deleteJobHistory);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await doCreate({
      employeeId,
      companyName: newItem.companyName,
      designation: newItem.designation,
      startDate: newItem.startDate,
      endDate: newItem.endDate || null,
    });
    if (hasOkData<{ id: string }>(res)) {
      setItems((arr) => [{ ...newItem, id: res.data.id }, ...arr]);
      setNewItem({ id: "", companyName: "", designation: "", startDate: "", endDate: null });
      setAdding(false);
    }
  }

  async function save(id: string, item: JH) {
    const res = await doUpdate({
      id,
      employeeId,
      companyName: item.companyName,
      designation: item.designation,
      startDate: item.startDate,
      endDate: item.endDate || null,
    });
    if (hasOkData(res)) setItems((arr) => arr.map((x) => (x.id === id ? item : x)));
  }

  async function remove(id: string) {
    if (!confirm("Delete this job history?")) return;
    const res = await doDelete({ id });
    if (hasOkData(res)) setItems((arr) => arr.filter((x) => x.id !== id));
  }

  return (
    <section className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Job History</h2>
        <button onClick={() => setAdding((v) => !v)} className="rounded-md border px-3 py-1.5 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {adding && (
        <form onSubmit={add} className="grid sm:grid-cols-4 gap-3 mb-4">
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Company Name"
            value={newItem.companyName}
            onChange={(e) => setNewItem((s) => ({ ...s, companyName: e.target.value }))}
          />
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Designation"
            value={newItem.designation}
            onChange={(e) => setNewItem((s) => ({ ...s, designation: e.target.value }))}
          />
          <input
            type="date"
            className="rounded-md border px-3 py-2"
            value={newItem.startDate}
            onChange={(e) => setNewItem((s) => ({ ...s, startDate: e.target.value }))}
          />
          <input
            type="date"
            className="rounded-md border px-3 py-2"
            value={newItem.endDate ?? ""}
            onChange={(e) => setNewItem((s) => ({ ...s, endDate: e.target.value || null }))}
          />
          <div className="sm:col-span-4 flex justify-end gap-2">
            <button type="button" className="rounded-md border px-3 py-2" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button className="rounded-md bg-pcolor text-white px-3 py-2" disabled={sc === "executing"}>
              Save
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No job records.</p>
        ) : (
          items.map((it) => <Row key={it.id} item={it} onSave={save} onDelete={remove} />)
        )}
      </div>
    </section>
  );
}

function Row({
  item,
  onSave,
  onDelete,
}: {
  item: JH;
  onSave: (id: string, it: JH) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(item);

  return (
    <div className="rounded-md border px-3 py-2">
      {editing ? (
        <div className="grid sm:grid-cols-4 gap-3">
          <input
            className="rounded-md border px-3 py-2"
            value={form.companyName}
            onChange={(e) => setForm((s) => ({ ...s, companyName: e.target.value }))}
          />
          <input
            className="rounded-md border px-3 py-2"
            value={form.designation}
            onChange={(e) => setForm((s) => ({ ...s, designation: e.target.value }))}
          />
          <input
            type="date"
            className="rounded-md border px-3 py-2"
            value={form.startDate}
            onChange={(e) => setForm((s) => ({ ...s, startDate: e.target.value }))}
          />
          <input
            type="date"
            className="rounded-md border px-3 py-2"
            value={form.endDate ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, endDate: e.target.value || null }))}
          />
          <div className="sm:col-span-4 flex gap-2 justify-end">
            <button className="rounded-md border px-3 py-2" onClick={() => (setEditing(false), setForm(item))}>
              Cancel
            </button>
            <button
              className="rounded-md bg-pcolor text-white px-3 py-2"
              onClick={() => (onSave(item.id, form), setEditing(false))}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Company:</span> {item.companyName} •{" "}
            <span className="text-muted-foreground">Designation:</span> {item.designation} •{" "}
            <span className="text-muted-foreground">Start:</span> {item.startDate} •{" "}
            <span className="text-muted-foreground">End:</span> {item.endDate || "—"}
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-md border px-2 py-1" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" />
            </button>
            <button className="rounded-md border px-2 py-1 text-destructive" onClick={() => onDelete(item.id)}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function toDateInput(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}
