"use client";

import {
  createEducation,
  deleteEducation,
  updateEducation,
} from "@/actions/employees/one-to-many";
import { hasOkData } from "@/lib/safe-action/ok";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { Card } from "../../ui/card";

type Education = {
  id: string;
  degree: string | null;
  institution: string | null;
  subject: string | null;
};

export default function EducationsSection({
  employeeId,
  initial = [] as Education[],
}: {
  employeeId: string;
  initial?: Education[];
}) {
  const [items, setItems] = useState<Education[]>(initial);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    degree: "",
    institution: "",
    subject: "",
  });

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
      setItems((arr) => [
        {
          id: res.data.id,
          degree: nz(newItem.degree),
          institution: nz(newItem.institution),
          subject: nz(newItem.subject),
        },
        ...arr,
      ]);
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
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Education</h2>
        <button
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
          type="button"
          disabled={sc === "executing"}
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {adding ? (
        <form
          onSubmit={add}
          className="mb-4 grid gap-3 sm:grid-cols-3"
        >
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Degree"
            value={newItem.degree}
            onChange={(e) =>
              setNewItem((s) => ({ ...s, degree: e.target.value }))
            }
          />
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Institution"
            value={newItem.institution}
            onChange={(e) =>
              setNewItem((s) => ({ ...s, institution: e.target.value }))
            }
          />
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Subject"
            value={newItem.subject}
            onChange={(e) =>
              setNewItem((s) => ({ ...s, subject: e.target.value }))
            }
          />
          <div className="sm:col-span-3 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md border px-3 py-2"
              onClick={() => setAdding(false)}
              disabled={sc === "executing"}
            >
              Cancel
            </button>
            <button
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-white"
              disabled={sc === "executing"}
            >
              {sc === "executing" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {sc === "executing" ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      ) : null}

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No education records.
          </p>
        ) : (
          items.map((it) => (
            <Row
              key={it.id}
              item={it}
              onSave={save}
              onDelete={remove}
            />
          ))
        )}
      </div>
    </Card>
  );
}

function Row({
  item,
  onSave,
  onDelete,
}: {
  item: Education;
  onSave: (id: string, it: Education) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(item);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);
      await onSave(item.id, form);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setRemoving(true);
      await onDelete(item.id);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="rounded-md border px-3 py-2">
      {editing ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            className="rounded-md border px-3 py-2"
            value={form.degree ?? ""}
            onChange={(e) =>
              setForm((s) => ({ ...s, degree: e.target.value }))
            }
          />
          <input
            className="rounded-md border px-3 py-2"
            value={form.institution ?? ""}
            onChange={(e) =>
              setForm((s) => ({ ...s, institution: e.target.value }))
            }
          />
          <input
            className="rounded-md border px-3 py-2"
            value={form.subject ?? ""}
            onChange={(e) =>
              setForm((s) => ({ ...s, subject: e.target.value }))
            }
          />
          <div className="sm:col-span-3 flex justify-end gap-2">
            <button
              className="rounded-md border px-3 py-2"
              onClick={() => {
                setEditing(false);
                setForm(item);
              }}
              type="button"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-white"
              onClick={handleSave}
              type="button"
              disabled={saving}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div className="grid w-[90%] grid-cols-1 gap-4 text-sm lg:grid-cols-3">
            <div>
              <span className="text-muted-foreground">Degree:</span>{" "}
              {item.degree || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Institution:</span>{" "}
              {item.institution || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Subject:</span>{" "}
              {item.subject || "—"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border px-2 py-1"
              onClick={() => setEditing(true)}
              type="button"
              disabled={removing}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              className="rounded-md border px-2 py-1 text-destructive"
              onClick={handleDelete}
              type="button"
              disabled={removing}
            >
              {removing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
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
