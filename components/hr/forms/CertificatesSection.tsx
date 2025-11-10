// components/hr/forms/CertificatesSection.tsx
"use client";

import { useAction } from "next-safe-action/hooks";
import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Trash2, Plus, Link } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertCertificate } from "@/actions/employees/certificates";
import { publicDocUrl } from "@/lib/ftp/images";

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
            />
          ))
        )}
      </div>
    </Card>
  );
}

// ===== Single certificate card  =====

type CertificateRowProps = {
  employeeId: string;
  index: number;
  initial?: RowInitial | null;
};

function CertificateRow({ employeeId, index, initial }: CertificateRowProps) {
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { executeAsync, status, result } = useAction(upsertCertificate);
  const fieldErrors = useMemo(
    () => (result?.validationErrors ?? {}) as Record<string, string[] | undefined>,
    [result],
  );
  const globalError = (result?.serverError as string | undefined) ?? null;

  async function handleUpload(file: File | null) {
    if (!file) return;

    if (file.size > MAX_BYTES) {
      const msg = "Max 5 Mb";
      setUploadError(msg);
      alert(msg);
      return;
    }

    setUploadError(null);
    setDoc((prev) => ({ ...prev, uploading: true }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("employeeId", employeeId);
    formData.append("documentName", "CERTIFICATE");

    try {
      const res = await fetch("/api/upload/document", {
        method: "POST",
        body: formData,
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        // ignore 
      }

      if (!res.ok || !json?.ok) {
        const msg = json?.message || res.statusText || "Upload failed";
        console.error("Upload failed", msg);
        setUploadError(msg);
        setDoc((prev) => ({ ...prev, uploading: false }));
        return;
      }

      setUploadError(null);
      setDoc({
        src: json.src,
        filename: json.filename ?? null,
        format: json.format ?? null,
        uploading: false,
      });
    } catch (err: any) {
      console.error("Upload failed", err);
      setUploadError("Upload failed. Please try again.");
      setDoc((prev) => ({ ...prev, uploading: false }));
    }
  }

  async function handleDeleteDoc() {
    if (!doc.filename) {
      setDoc({ src: null, filename: null, format: null, uploading: false });
      return;
    }

    setUploadError(null);
    setDoc((prev) => ({ ...prev, uploading: true }));

    const params = new URLSearchParams({
      employeeId,
      filename: doc.filename,
    });

    try {
      const res = await fetch(`/api/upload/document?${params.toString()}`, {
        method: "DELETE",
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        // ignore
      }

      if (!res.ok || !json?.ok) {
        const msg = json?.message || res.statusText || "Delete failed";
        console.error("Delete failed", msg);
        setUploadError(msg);
        setDoc((prev) => ({ ...prev, uploading: false }));
        return;
      }

      setDoc({ src: null, filename: null, format: null, uploading: false });
    } catch (err: any) {
      console.error("Delete failed", err);
      setUploadError("Delete failed. Please try again.");
      setDoc((prev) => ({ ...prev, uploading: false }));
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
        <Button
          type="button"
          variant="outline"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? "Cancel" : "Edit"}
        </Button>
      </div>

      {editing ? (
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="grid grid-cols-1  gap-4">

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
        <div className="space-y-3 text-sm grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div className=" gap-2">
            <div>
              <span className="font-medium">Certificate Name:</span>{" "}
              {form.name || "—"}
            </div>
            <div>
              <span className="font-medium">Details:</span>{" "}
              {form.details || "—"}
            </div>
          </div>

          <div className="">
            <p className="text-sm font-medium mb-2">Certificate Document</p>
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
        <div className="relative w-16 h-16 rounded-md overflow-hidden border bg-muted">
          <a href={url} target="_blank">
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
