"use client";

import { createDocument, deleteDocument, updateDocument } from "@/actions/employees/one-to-many";
import { DOCUMENT_FORMAT, type DocumentFormat } from "@/lib/enums/enums";
import { formatEnumLabel } from "@/lib/format";
import { hasOkData } from "@/lib/safe-action/ok";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";

type Doc = { id: string; name: string; src: string | null; format: DocumentFormat };

export default function DocumentsSection({
  employeeId,
  initial = [] as Doc[],
}: {
  employeeId: string;
  initial?: Doc[];
}) {
  const [items, setItems] = useState<Doc[]>(initial);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState<{ name: string; src: string; format: DocumentFormat }>({
    name: "",
    src: "",
    format: "jpg",
  });

  const { executeAsync: doCreate, status: sc } = useAction(createDocument);
  const { executeAsync: doUpdate } = useAction(updateDocument);
  const { executeAsync: doDelete } = useAction(deleteDocument);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await doCreate({
      employeeId,
      name: newItem.name,
      src: newItem.src ? newItem.src : null,
      data: null,
      format: newItem.format,
    });

    if (hasOkData<{ id: string }>(res)) {
      const id = res.data.id;
      setItems((arr) => [{ id, ...newItem, src: newItem.src || null }, ...arr]);
      setNewItem({ name: "", src: "", format: "jpg" });
      setAdding(false);
    }
  }

  async function save(id: string, item: Doc) {
    const res = await doUpdate({
      id,
      employeeId,
      name: item.name,
      src: item.src,
      data: null,
      format: item.format,
    });
    if (hasOkData(res)) {
      setItems((arr) => arr.map((x) => (x.id === id ? item : x)));
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this document?")) return;
    const res = await doDelete({ id });
    if (hasOkData(res)) {
      setItems((arr) => arr.filter((x) => x.id !== id));
    }
  }

  return (
    <section className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Documents</h2>
        <button onClick={() => setAdding((v) => !v)} className="rounded-md border px-3 py-1.5 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {adding && (
        <form onSubmit={add} className="grid sm:grid-cols-3 gap-3 mb-4">
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Name"
            value={newItem.name}
            onChange={(e) => setNewItem((s) => ({ ...s, name: e.target.value }))}
          />
          <input
            className="rounded-md border px-3 py-2"
            placeholder="URL (optional)"
            value={newItem.src}
            onChange={(e) => setNewItem((s) => ({ ...s, src: e.target.value }))}
          />
          <select
            className="rounded-md border px-3 py-2"
            value={newItem.format}
            onChange={(e) => setNewItem((s) => ({ ...s, format: e.target.value as DocumentFormat }))}
          >
            {DOCUMENT_FORMAT.map((f) => (
              <option key={f} value={f}>
                {formatEnumLabel(f)}
              </option>
            ))}
          </select>
          <div className="sm:col-span-3 flex justify-end gap-2">
            <button type="button" className="rounded-md border px-3 py-2" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button className="rounded-md bg-primary text-white px-3 py-2" disabled={sc === "executing"}>
              Save
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents.</p>
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
  item: Doc;
  onSave: (id: string, it: Doc) => void;
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
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          />
          <input
            className="rounded-md border px-3 py-2"
            value={form.src ?? ""}
            placeholder="URL (optional)"
            onChange={(e) => setForm((s) => ({ ...s, src: e.target.value || null }))}
          />
          <select
            className="rounded-md border px-3 py-2"
            value={form.format}
            onChange={(e) => setForm((s) => ({ ...s, format: e.target.value as DocumentFormat }))}
          >
            {DOCUMENT_FORMAT.map((f) => (
              <option key={f} value={f}>
                {formatEnumLabel(f)}
              </option>
            ))}
          </select>
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
            <span className="text-muted-foreground">Name:</span> {item.name} •{" "}
            <span className="text-muted-foreground">Format:</span> {formatEnumLabel(item.format)} •{" "}
            <span className="text-muted-foreground">URL:</span> {item.src || "—"}
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
