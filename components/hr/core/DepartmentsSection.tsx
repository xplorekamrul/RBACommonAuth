"use client";

import {
  createDepartment,
  deleteDepartment,
  updateDepartment,
} from "@/actions/hr/core";
import { hasOkData } from "@/lib/safe-action/ok";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";

type Row = { id: string; name: string };

export default function DepartmentsSection({ initial = [] as Row[] }) {
  const [items, setItems] = useState<Row[]>(initial);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const { executeAsync: doCreate, status: sc } = useAction(createDepartment);
  const { executeAsync: doUpdate } = useAction(updateDepartment);
  const { executeAsync: doDelete } = useAction(deleteDepartment);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await doCreate({ name });
    if (hasOkData<{ id: string; item: Row }>(res)) {
      setItems((arr) => [{ id: res.data.id, name }, ...arr]);
      setName("");
      setAdding(false);
    }
  }

  async function save(id: string, newName: string) {
    const res = await doUpdate({ id, name: newName });
    if (hasOkData(res)) {
      setItems((arr) => arr.map((x) => (x.id === id ? { ...x, name: newName } : x)));
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this department?")) return;
    const res = await doDelete({ id });
    if (hasOkData(res)) setItems((arr) => arr.filter((x) => x.id !== id));
  }

  return (
    <section className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Departments</h2>
        <button
          onClick={() => setAdding((v) => !v)}
          className="rounded-md border px-3 py-1.5 inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {adding && (
        <form onSubmit={add} className="flex gap-2 mb-4">
          <input
            className="rounded-md border px-3 py-2 w-full"
            placeholder="Department name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="button"
            className="rounded-md border px-3 py-2"
            onClick={() => setAdding(false)}
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-primary text-white px-3 py-2"
            disabled={sc === "executing"}
          >
            Save
          </button>
        </form>
      )}

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No departments.</p>
        ) : (
          items.map((it) => (
            <RowItem key={it.id} item={it} onSave={save} onDelete={remove} />
          ))
        )}
      </div>
    </section>
  );
}

function RowItem({
  item,
  onSave,
  onDelete,
}: {
  item: Row;
  onSave: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);

  return (
    <div className="rounded-md border px-3 py-2">
      {editing ? (
        <div className="flex gap-2">
          <input
            className="rounded-md border px-3 py-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="rounded-md border px-3 py-2"
            onClick={() => {
              setEditing(false);
              setName(item.name);
            }}
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-primary text-white px-3 py-2"
            onClick={() => {
              onSave(item.id, name.trim());
              setEditing(false);
            }}
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm">{item.name}</div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border px-2 py-1"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              className="rounded-md border px-2 py-1 text-destructive"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
