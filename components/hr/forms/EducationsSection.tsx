"use client";

import { createEducation, deleteEducation, updateEducation } from "@/actions/employees/one-to-many";
import { hasOkData } from "@/lib/safe-action/ok";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";

type Education = { id: string; degree: string | null; institution: string | null; subject: string | null };

export default function EducationsSection({
  employeeId,
  initial = [] as Education[],
}: {
  employeeId: string;
  initial?: Education[];
}) {
  const [items, setItems] = useState<Education[]>(initial);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ degree: "", institution: "", subject: "" });

  const { executeAsync: doCreate, status: sc } = useAction(createEducation);
  const { executeAsync: doUpdate } = useAction(updateEducation);
  const { executeAsync: doDelete } = useAction(deleteEducation);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await doCreate({
      employeeId,
      degree: nz(newItem.degree),
      institution: nz(newItem.institution),
      subject: nz(newItem.subject),
    });
    if (hasOkData<{ id: string }>(res)) {
      setItems((arr) => [{ id: res.data.id, degree: nz(newItem.degree), institution: nz(newItem.institution), subject: nz(newItem.subject) }, ...arr]);
      setNewItem({ degree: "", institution: "", subject: "" });
      setAdding(false);
    }
  }

  async function save(id: string, item: Education) {
    const res = await doUpdate({
      id,
      employeeId,
      degree: nz(item.degree ?? ""),
      institution: nz(item.institution ?? ""),
      subject: nz(item.subject ?? ""),
    });
    if (hasOkData(res)) {
      setItems((arr) => arr.map((x) => (x.id === id ? item : x)));
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this education record?")) return;
    const res = await doDelete({ id });
    if (hasOkData(res)) setItems((arr) => arr.filter((x) => x.id !== id));
  }

  return (
    <section className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Education</h2>
        <button onClick={() => setAdding((v) => !v)} className="rounded-md border px-3 py-1.5 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {adding ? (
        <form onSubmit={add} className="grid sm:grid-cols-3 gap-3 mb-4">
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Degree"
            value={newItem.degree}
            onChange={(e) => setNewItem((s) => ({ ...s, degree: e.target.value }))}
          />
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Institution"
            value={newItem.institution}
            onChange={(e) => setNewItem((s) => ({ ...s, institution: e.target.value }))}
          />
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Subject"
            value={newItem.subject}
            onChange={(e) => setNewItem((s) => ({ ...s, subject: e.target.value }))}
          />
          <div className="sm:col-span-3 flex gap-2 justify-end">
            <button type="button" className="rounded-md border px-3 py-2" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button className="rounded-md bg-primary text-white px-3 py-2" disabled={sc === "executing"}>
              Save
            </button>
          </div>
        </form>
      ) : null}

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No education records.</p>
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
  item: Education;
  onSave: (id: string, it: Education) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(item);

  return (
    <div className="rounded-md border px-3 py-2">
      {editing ? (
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            className="rounded-md border px-3 py-2"
            value={form.degree ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, degree: e.target.value }))}
          />
          <input
            className="rounded-md border px-3 py-2"
            value={form.institution ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, institution: e.target.value }))}
          />
          <input
            className="rounded-md border px-3 py-2"
            value={form.subject ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))}
          />
          <div className="sm:col-span-3 flex gap-2 justify-end">
            <button className="rounded-md border px-3 py-2" onClick={() => (setEditing(false), setForm(item))}>
              Cancel
            </button>
            <button
              className="rounded-md bg-primary text-white px-3 py-2"
              onClick={() => (onSave(item.id, form), setEditing(false))}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Degree:</span> {item.degree || "—"} •{" "}
            <span className="text-muted-foreground">Institution:</span> {item.institution || "—"} •{" "}
            <span className="text-muted-foreground">Subject:</span> {item.subject || "—"}
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

function nz(s?: string | null) {
  const v = (s ?? "").trim();
  return v ? v : null;
}
