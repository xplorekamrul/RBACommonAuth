// components/hr/forms/CertificatesSection.tsx
"use client";

import { useAction } from "next-safe-action/hooks";
import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Trash2, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertCertificate, deleteCertificate } from "@/actions/employees/certificates";
import { publicDocUrl } from "@/lib/ftp/images";
import {
  uploadEmployeeDocument,
  deleteEmployeeDocument,
} from "@/lib/uploads/documentUpload";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const IMAGE_FORMATS = ["jpg", "jpeg", "png", "gif", "webp"];

type DocState = {
  src: string | null;
  filename: string | null;
  format: string | null;
  uploading: boolean;
};

type CertificateInitial = {
  id: string;
  name: string;
  details: string | null;
  certificateDoc?: { src: string | null; format: string | null } | null;
};

type RowInitial = CertificateInitial & { _localId: string };

function getFilenameFromSrc(src?: string | null) {
  if (!src) return null;
  const parts = src.split("/");
  return parts[parts.length - 1] || null;
}

function isImageFormat(format: string | null | undefined) {
  if (!format) return false;
  return IMAGE_FORMATS.includes(format.toLowerCase());
}

type CertificatesSectionProps = {
  employeeId: string;
  initial?: CertificateInitial[] | CertificateInitial | null;
};

export default function CertificatesSection({
  employeeId,
  initial,
}: CertificatesSectionProps) {
  const initialArray: CertificateInitial[] = Array.isArray(initial)
    ? initial
    : initial
      ? [initial]
      : [];

  const [rows, setRows] = useState<RowInitial[]>(() =>
    initialArray.map((c) => ({
      ...c,
      _localId: c.id,
    })),
  );

  const { executeAsync: doDelete } = useAction(deleteCertificate);

  function addRow() {
    const id = `new-${Date.now()}-${Math.random()}`;
    setRows((prev) => [
      ...prev,
      {
        _localId: id,
        id: "",
        name: "",
        details: "",
        certificateDoc: null,
      },
    ]);
  }

  async function removeRow(localId: string, certificateId?: string) {
    if (!confirm("Delete this certificate?")) return;

    // If not saved yet (no id), just remove locally
    if (!certificateId) {
      setRows((prev) => prev.filter((r) => r._localId !== localId));
      return;
    }

    const res = await doDelete({ id: certificateId });
    if (res?.data?.ok) {
      setRows((prev) => prev.filter((r) => r._localId !== localId));
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Certificates</h2>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addRow}
          className="flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      <div className="space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No certificates yet. Click <span className="font-medium">Add</span> to create one.
          </p>
        ) : (
          rows.map((row, idx) => (
            <CertificateRow
              key={row._localId}
              employeeId={employeeId}
              index={idx + 1}
              initial={row}
              onRemove={removeRow}
            />
          ))
        )}
      </div>
    </Card>
  );
}

// ===== Single certificate card =====

type CertificateRowProps = {
  employeeId: string;
  index: number;
  initial: RowInitial;
  onRemove: (localId: string, certificateId?: string) => Promise<void> | void;
};

function CertificateRow({ employeeId, index, initial, onRemove }: CertificateRowProps) {
  const [editing, setEditing] = useState(!initial || !initial.id);

  const [form, setForm] = useState({
    id: initial?.id ?? "",
    name: initial?.name ?? "",
    details: initial?.details ?? "",
  });

  const [doc, setDoc] = useState<DocState>({
    src: initial?.certificateDoc?.src ?? null,
    filename: getFilenameFromSrc(initial?.certificateDoc?.src ?? null),
    format: initial?.certificateDoc?.format ?? null,
    uploading: false,
  });

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [removingRow, setRemovingRow] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { executeAsync, status, result } = useAction(upsertCertificate);
  const fieldErrors = useMemo(
    () => (result?.validationErrors ?? {}) as Record<string, string[] | undefined>,
    [result],
  );
  const globalError = (result?.serverError as string | undefined) ?? null;

  async function handleUpload(file: File | null) {
    if (!file) return;

    setDoc((prev) => ({ ...prev, uploading: true }));
    const res = await uploadEmployeeDocument({
      employeeId,
      file,
      documentName: "CERTIFICATE",
      maxBytes: MAX_BYTES,
    });
    setDoc((prev) => ({ ...prev, uploading: false }));

    if (!res.ok) {
      const msg = res.message ?? "Upload failed";
      setUploadError(msg);
      if (msg.toLowerCase().includes("too large")) {
        alert(msg);
      }
      return;
    }

    setUploadError(null);
    setDoc({
      src: res.src,
      filename: res.filename,
      format: res.format,
      uploading: false,
    });
  }

  async function handleDeleteDoc() {
    // If never actually uploaded (no filename), just clear
    if (!doc.filename) {
      setDoc({ src: null, filename: null, format: null, uploading: false });
      return;
    }

    setDoc((prev) => ({ ...prev, uploading: true }));
    const res = await deleteEmployeeDocument({
      employeeId,
      filename: doc.filename,
    });
    setDoc({ src: null, filename: null, format: null, uploading: false });

    if (!res.ok) {
      setUploadError(res.message ?? "Delete failed");
    } else {
      setUploadError(null);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    const res = await executeAsync({
      employeeId,
      certificateId: form.id || undefined,
      name: form.name || undefined,
      details: form.details || undefined,
      certificateDoc: doc.src
        ? { src: doc.src, format: doc.format ?? "jpg" }
        : null,
    });

    if (res?.data?.ok) {
      const cert = res.data.certificate;
      setForm({
        id: cert.id,
        name: cert.name,
        details: cert.details ?? "",
      });
      setDoc({
        src: cert.certificateDoc?.src ?? null,
        filename: getFilenameFromSrc(cert.certificateDoc?.src ?? null),
        format: cert.certificateDoc?.format ?? null,
        uploading: false,
      });
      setEditing(false);
    }
  }

  async function handleRemoveRow() {
    try {
      setRemovingRow(true);
      await onRemove(initial._localId, form.id || undefined);
    } finally {
      setRemovingRow(false);
    }
  }

  const renderDocSlot = () => {
    const isUploading = doc.uploading;
    const isImage = isImageFormat(doc.format);
    const url = doc.src ? publicDocUrl(doc.src) : "";

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Certificate File
        </Label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
        />

        {doc.src ? (
          <div className="inline-block group relative">
            {isImage ? (
              <div className="relative w-32 h-32 rounded-md overflow-hidden border bg-muted">
                <Image
                  src={url}
                  alt="Certificate"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              // PDF or any non-image: show URL only
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 underline break-all max-w-xs inline-block"
              >
                {url}
              </a>
            )}

            <button
              type="button"
              disabled={isUploading}
              onClick={handleDeleteDoc}
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-white/90 shadow-md p-1 hover:bg-red-100 border border-red-300 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary hover:bg-primary/80 text-white hover:text-white"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-md border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Certificate #{index}</p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? "Cancel" : "Edit"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="border-destructive text-destructive hover:bg-destructive/10"
            onClick={handleRemoveRow}
            disabled={removingRow}
          >
            {removingRow ? (
              <Trash2 className="w-4 h-4 animate-pulse" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {editing ? (
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="grid grid-cols-1 gap-4">
                <Label className="text-sm font-medium">Certificate Name</Label>
                <Input
                  className="mt-1"
                  value={form.name}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, name: e.target.value }))
                  }
                  placeholder="Certificate name "
                />
                {fieldErrors?.name?.[0] && (
                  <p className="mt-1 text-xs text-destructive">
                    {fieldErrors.name[0]}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Details </Label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={form.details}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, details: e.target.value }))
                  }
                  placeholder="Certificate details, description, etc."
                />
              </div>
            </div>
            <div>
              <div>{renderDocSlot()}</div>

              <p className="text-xs text-muted-foreground">
                Allowed formats: JPG, JPEG, PNG, GIF, WEBP, PDF (max 5 MB).
              </p>

              {uploadError && (
                <p className="mt-1 text-xs text-destructive">{uploadError}</p>
              )}

              {globalError && (
                <p className="text-sm text-destructive">{globalError}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={status === "executing"}>
              {status === "executing" ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      ) : (
        // Read-only view
        <div className="space-y-3 text-sm grid grid-cols-1 lg:grid-cols-3 gap-2">
          <div>
            <span className="font-medium">Certificate Name:</span>{" "}
            {form.name || "—"}
          </div>
          <div>
            <span className="font-medium">Details:</span>{" "}
            {form.details || "—"}
          </div>
          <div>
            {/* <p className="text-sm font-medium mb-2">Certificate Document</p> */}
            <ReadOnlyDocPreview doc={doc} />
          </div>

        </div>
      )}
    </div>
  );
}

// ===== Read-only preview for a single doc =====

function ReadOnlyDocPreview({ doc }: { doc: DocState }) {
  if (!doc.src) {
    return (
      <p className="text-xs text-muted-foreground">Not uploaded</p>
    );
  }

  const url = publicDocUrl(doc.src);
  const isImage = isImageFormat(doc.format);

  return (
    <div className="space-y-1">
      {isImage ? (
        <div className="relative w-10 h-10 rounded-md overflow-hidden border bg-muted">
          <a href={url} target="_blank" rel="noreferrer">
            <Image
              src={url}
              alt="Certificate"
              fill
              className="object-cover"
            />
          </a>
        </div>
      ) : (
        // PDF / non-image: show URL only
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-blue-600 underline break-all max-w-xs inline-block"
        >
          {url}
        </a>
      )}
    </div>
  );
}
