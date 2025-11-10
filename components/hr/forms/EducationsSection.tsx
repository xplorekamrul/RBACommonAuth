// components/hr/forms/EducationsSection.tsx
"use client";

import {
  createEducation,
  deleteEducation,
  updateEducation,
} from "@/actions/employees/one-to-many";
import { hasOkData } from "@/lib/safe-action/ok";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { Card } from "../../ui/card";
import Image from "next/image";
import { publicDocUrl } from "@/lib/ftp/images";
import {
  uploadEmployeeDocument,
  deleteEmployeeDocument,
} from "@/lib/uploads/documentUpload";
import { Label } from "../../ui/label";

const MAX_BYTES = 5 * 1024 * 1024;

type DocState = {
  src: string | null;
  filename: string | null;
  format: string | null;
  uploading: boolean;
};

type Education = {
  id: string;
  degree: string | null;
  institution: string | null;
  subject: string | null;
  degreeDoc?: { src: string | null; format: string | null } | null;
};

function getFilenameFromSrc(src?: string | null) {
  if (!src) return null;
  const parts = src.split("/");
  return parts[parts.length - 1] || null;
}

function isPdf(format: string | null): boolean {
  return (format ?? "").toLowerCase() === "pdf";
}

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

  const [newDoc, setNewDoc] = useState<DocState>({
    src: null,
    filename: null,
    format: null,
    uploading: false,
  });

  const [uploadError, setUploadError] = useState<string | null>(null);

  const { executeAsync: doCreate, status: sc } = useAction(createEducation);
  const { executeAsync: doUpdate } = useAction(updateEducation);
  const { executeAsync: doDelete } = useAction(deleteEducation);

  async function handleUploadNew(file: File | null) {
    if (!file) return;

    setNewDoc((prev) => ({ ...prev, uploading: true }));
    const result = await uploadEmployeeDocument({
      employeeId,
      file,
      documentName: "DEGREE",
      maxBytes: MAX_BYTES,
    });

    setNewDoc((prev) => ({ ...prev, uploading: false }));

    if (!result.ok) {
      setUploadError(result.message ?? "Upload failed");
      if (
        result.message &&
        result.message.toLowerCase().includes("too large")
      ) {
        alert(result.message);
      }
      return;
    }

    setUploadError(null);
    setNewDoc({
      src: result.src,
      filename: result.filename,
      format: result.format,
      uploading: false,
    });
  }

  async function handleDeleteNew() {
    if (!newDoc.filename) {
      setNewDoc({
        src: null,
        filename: null,
        format: null,
        uploading: false,
      });
      return;
    }

    setNewDoc((prev) => ({ ...prev, uploading: true }));
    const result = await deleteEmployeeDocument({
      employeeId,
      filename: newDoc.filename,
    });
    setNewDoc({
      src: null,
      filename: null,
      format: null,
      uploading: false,
    });

    if (!result.ok) {
      setUploadError(result.message ?? "Delete failed");
    } else {
      setUploadError(null);
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await doCreate({
      employeeId,
      degree: nz(newItem.degree),
      institution: nz(newItem.institution),
      subject: nz(newItem.subject),
      degreeDoc: newDoc.src
        ? { src: newDoc.src, format: newDoc.format ?? "jpg" }
        : null,
    });

    if (hasOkData<{ id: string; education: Education }>(res)) {
      const created = res.data.education;

      setItems((arr) => [
        {
          id: created.id,
          degree: created.degree,
          institution: created.institution,
          subject: created.subject,
          degreeDoc: created.degreeDoc ?? null,
        },
        ...arr,
      ]);

      setNewItem({ degree: "", institution: "", subject: "" });
      setNewDoc({
        src: null,
        filename: null,
        format: null,
        uploading: false,
      });
      setAdding(false);
    }
  }

  async function save(
    id: string,
    item: Education,
    doc: DocState,
  ) {
    const res = await doUpdate({
      id,
      employeeId,
      degree: nz(item.degree ?? ""),
      institution: nz(item.institution ?? ""),
      subject: nz(item.subject ?? ""),
      degreeDoc: doc.src
        ? { src: doc.src, format: doc.format ?? "jpg" }
        : null,
    });

    if (hasOkData(res)) {
      setItems((arr) =>
        arr.map((x) =>
          x.id === id
            ? { ...item, degreeDoc: doc.src ? { src: doc.src, format: doc.format } : null }
            : x,
        ),
      );
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
        <form onSubmit={add} className="mb-4 space-y-3">
          <div className="grid gap-3 grid-cols-1 lg:grid-cols-4">
            <div>
              <Label className="text-xs">Degree</Label>
              <input
                className="rounded-md border px-3 py-2"
                placeholder="Degree"
                value={newItem.degree}
                onChange={(e) =>
                  setNewItem((s) => ({ ...s, degree: e.target.value }))
                }
              />
            </div>

            <div>
              <Label className="text-xs">Institution</Label>
              <input
                className="rounded-md border px-3 py-2"
                placeholder="Institution"
                value={newItem.institution}
                onChange={(e) =>
                  setNewItem((s) => ({ ...s, institution: e.target.value }))
                }
              />
            </div>

            <div>
              <Label className="text-xs">Subject</Label>
              <input
                className="rounded-md border px-3 py-2"
                placeholder="Subject"
                value={newItem.subject}
                onChange={(e) =>
                  setNewItem((s) => ({ ...s, subject: e.target.value }))
                }
              />
            </div>
            <div>
            {/* Degree document upload for new item */}
            <DocUploadInline
              label="Degree Document "
              doc={newDoc}
              onUpload={handleUploadNew}
              onDelete={handleDeleteNew}
            />

            {uploadError && (
              <p className="mt-1 text-xs text-destructive">{uploadError}</p>
            )}

            <p className="text-xs text-muted-foreground">
              Allowed formats: JPG, JPEG, PNG, GIF, WEBP, PDF (max 5 MB).
            </p>
          </div>
          </div>
          
          <div className="flex justify-end gap-2">
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
              employeeId={employeeId}
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
  employeeId,
  item,
  onSave,
  onDelete,
}: {
  employeeId: string;
  item: Education;
  onSave: (id: string, it: Education, doc: DocState) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(item);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [doc, setDoc] = useState<DocState>(() => ({
    src: item.degreeDoc?.src ?? null,
    filename: getFilenameFromSrc(item.degreeDoc?.src ?? null),
    format: item.degreeDoc?.format ?? null,
    uploading: false,
  }));

  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleUpload(file: File | null) {
    if (!file) return;

    setDoc((prev) => ({ ...prev, uploading: true }));
    const result = await uploadEmployeeDocument({
      employeeId,
      file,
      documentName: "DEGREE",
      maxBytes: MAX_BYTES,
    });
    setDoc((prev) => ({ ...prev, uploading: false }));

    if (!result.ok) {
      setUploadError(result.message ?? "Upload failed");
      if (
        result.message &&
        result.message.toLowerCase().includes("too large")
      ) {
        alert(result.message);
      }
      return;
    }

    setUploadError(null);
    setDoc({
      src: result.src,
      filename: result.filename,
      format: result.format,
      uploading: false,
    });
  }

  async function handleDeleteDoc() {
    if (!doc.filename) {
      setDoc({
        src: null,
        filename: null,
        format: null,
        uploading: false,
      });
      return;
    }

    setDoc((prev) => ({ ...prev, uploading: true }));
    const result = await deleteEmployeeDocument({
      employeeId,
      filename: doc.filename,
    });
    setDoc({
      src: null,
      filename: null,
      format: null,
      uploading: false,
    });

    if (!result.ok) {
      setUploadError(result.message ?? "Delete failed");
    } else {
      setUploadError(null);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await onSave(item.id, form, doc);
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
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-4">
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
          </div>

          <DocUploadInline
            label="Degree Document "
            doc={doc}
            onUpload={handleUpload}
            onDelete={handleDeleteDoc}
          />

          {uploadError && (
            <p className="mt-1 text-xs text-destructive">{uploadError}</p>
          )}

          <p className="text-xs text-muted-foreground">
            Allowed formats: JPG, JPEG, PNG, GIF, WEBP, PDF (max 5 MB).
          </p>

          <div className="sm:col-span-3 flex justify-end gap-2">
            <button
              className="rounded-md border px-3 py-2"
              onClick={() => {
                setEditing(false);
                setForm(item);
                setDoc({
                  src: item.degreeDoc?.src ?? null,
                  filename: getFilenameFromSrc(item.degreeDoc?.src ?? null),
                  format: item.degreeDoc?.format ?? null,
                  uploading: false,
                });
                setUploadError(null);
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

          <div className="flex items-center gap-3">
            <ReadOnlyDegreeDoc doc={doc} />
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
        </div>
      )}
    </div>
  );
}

function DocUploadInline({
  label,
  doc,
  onUpload,
  onDelete,
}: {
  label: string;
  doc: DocState;
  onUpload: (file: File | null) => void;
  onDelete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pdf = isPdf(doc.format);
  const url = doc.src ? publicDocUrl(doc.src) : "";

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium">{label}</p>
      <input
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        ref={inputRef}
        onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
      />

      {doc.src ? (
        <div className="inline-block group relative">
          {pdf ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 underline break-all max-w-xs inline-block"
            >
              {url}
            </a>
          ) : (
            <div className="relative w-16 h-16 rounded-md overflow-hidden border bg-muted">
              <Image src={url} alt="Degree doc" fill className="object-cover" />
            </div>
          )}

          <button
            type="button"
            onClick={onDelete}
            disabled={doc.uploading}
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-white/90 shadow-md p-1 hover:bg-red-100 border border-red-300 text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="rounded-md border px-3 py-1 text-xs bg-primary text-white hover:bg-primary/80"
          disabled={doc.uploading}
          onClick={() => inputRef.current?.click()}
        >
          {doc.uploading ? "Uploading..." : "Upload"}
        </button>
      )}
    </div>
  );
}

function ReadOnlyDegreeDoc({ doc }: { doc: DocState }) {
  if (!doc.src) {
    return (
      <span className="text-[11px] text-muted-foreground">
        No degree document
      </span>
    );
  }

  const pdf = isPdf(doc.format);
  const url = publicDocUrl(doc.src);

  return (
    <div className="text-[11px]">
      {pdf ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline break-all max-w-[140px] inline-block"
        >
          Degree document
        </a>
      ) : (
        <div className="relative w-10 h-10 rounded-md overflow-hidden border bg-muted inline-block">
          <a href={url}><Image src={url} alt="Degree doc" fill className="object-cover" /></a>
        </div>
      )}
    </div>
  );
}

function nz(s?: string | null) {
  const v = (s ?? "").trim();
  return v ? v : null;
}
