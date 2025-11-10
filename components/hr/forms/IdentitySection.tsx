"use client";

import { useAction } from "next-safe-action/hooks";
import { useMemo, useState, useRef } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertIdentity } from "@/actions/employees/one-to-one";
import { publicDocUrl } from "@/lib/ftp/images";

const MAX_BYTES = 5 * 1024 * 1024;

type DocState = {
  src: string | null;
  filename: string | null;
  format: string | null;
  uploading: boolean;
};

type IdentityInitial = {
  nid: string;
  passport: string | null;
  nidDoc?: { src: string | null; format: string | null } | null;
  passportDoc?: { src: string | null; format: string | null } | null;
  cvDoc?: { src: string | null; format: string | null } | null;
};

function getFilenameFromSrc(src?: string | null) {
  if (!src) return null;
  const parts = src.split("/");
  return parts[parts.length - 1] || null;
}

export default function IdentitySection({
  employeeId,
  initial,
}: {
  employeeId: string;
  initial?: IdentityInitial | null;
}) {
  const [editing, setEditing] = useState(!initial);
  const [form, setForm] = useState({
    nid: initial?.nid ?? "",
    passport: initial?.passport ?? "",
  });

  const [docs, setDocs] = useState<{
    nid: DocState;
    passport: DocState;
    cv: DocState;
  }>(() => ({
    nid: {
      src: initial?.nidDoc?.src ?? null,
      filename: getFilenameFromSrc(initial?.nidDoc?.src ?? null),
      format: initial?.nidDoc?.format ?? null,
      uploading: false,
    },
    passport: {
      src: initial?.passportDoc?.src ?? null,
      filename: getFilenameFromSrc(initial?.passportDoc?.src ?? null),
      format: initial?.passportDoc?.format ?? null,
      uploading: false,
    },
    cv: {
      src: initial?.cvDoc?.src ?? null,
      filename: getFilenameFromSrc(initial?.cvDoc?.src ?? null),
      format: initial?.cvDoc?.format ?? null,
      uploading: false,
    },
  }));

  const [uploadError, setUploadError] = useState<string | null>(null);

  const nidInputRef = useRef<HTMLInputElement | null>(null);
  const passportInputRef = useRef<HTMLInputElement | null>(null);
  const cvInputRef = useRef<HTMLInputElement | null>(null);

  const { executeAsync, status, result } = useAction(upsertIdentity);
  const fieldErrors = useMemo(
    () => (result?.validationErrors ?? {}) as Record<string, string[] | undefined>,
    [result],
  );
  const globalError = (result?.serverError as string | undefined) ?? null;

  async function handleUpload(
    kind: "nid" | "passport" | "cv",
    file: File | null,
  ) {
    if (!file) return;

    // 5MB frontend guard
    if (file.size > MAX_BYTES) {
      const msg = "Max 5 Mb";
      setUploadError(msg);
      alert(msg);
      return;
    }

    setUploadError(null);
    setDocs((prev) => ({
      ...prev,
      [kind]: { ...prev[kind], uploading: true },
    }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("employeeId", employeeId);

    const documentName =
      kind === "nid" ? "NID" : kind === "passport" ? "PASSPORT" : "CV";
    formData.append("documentName", documentName);

    try {
      const res = await fetch("/api/upload/document", {
        method: "POST",
        body: formData,
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        // ignore non-JSON error responses
      }

      if (!res.ok || !json?.ok) {
        const msg = json?.message || res.statusText || "Upload failed";
        console.error("Upload failed", msg);
        setUploadError(msg);
        setDocs((prev) => ({
          ...prev,
          [kind]: { ...prev[kind], uploading: false },
        }));
        return;
      }

      setUploadError(null);
      setDocs((prev) => ({
        ...prev,
        [kind]: {
          src: json.src,
          filename: json.filename ?? null,
          format: json.format ?? null,
          uploading: false,
        },
      }));
    } catch (err: any) {
      console.error("Upload failed", err);
      setUploadError("Upload failed. Please try again.");
      setDocs((prev) => ({
        ...prev,
        [kind]: { ...prev[kind], uploading: false },
      }));
    }
  }

  async function handleDelete(kind: "nid" | "passport" | "cv") {
    const doc = docs[kind];
    if (!doc.filename) {
      setDocs((prev) => ({
        ...prev,
        [kind]: { src: null, filename: null, format: null, uploading: false },
      }));
      return;
    }

    setUploadError(null);
    setDocs((prev) => ({
      ...prev,
      [kind]: { ...prev[kind], uploading: true },
    }));

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
        // ignore non-JSON
      }

      if (!res.ok || !json?.ok) {
        const msg = json?.message || res.statusText || "Delete failed";
        console.error("Delete failed", msg);
        setUploadError(msg);
      } else {
        setDocs((prev) => ({
          ...prev,
          [kind]: { src: null, filename: null, format: null, uploading: false },
        }));
      }
    } catch (err: any) {
      console.error("Delete failed", err);
      setUploadError("Delete failed. Please try again.");
      setDocs((prev) => ({
        ...prev,
        [kind]: { ...prev[kind], uploading: false },
      }));
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    const res = await executeAsync({
      employeeId,
      nid: form.nid,
      passport: form.passport || null,
      nidDoc: docs.nid.src
        ? { src: docs.nid.src, format: docs.nid.format }
        : null,
      passportDoc: docs.passport.src
        ? { src: docs.passport.src, format: docs.passport.format }
        : null,
      cvDoc: docs.cv.src
        ? { src: docs.cv.src, format: docs.cv.format }
        : null,
    });

    if (res?.data?.ok) {
      setEditing(false);
    }
  }

  const docSlot = (
    kind: "nid" | "passport" | "cv",
    label: string,
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) => {
    const doc = docs[kind];
    const isPdf = doc.format === "pdf";
    const isUploading = doc.uploading;
    const url = doc.src ? publicDocUrl(doc.src) : "";

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => handleUpload(kind, e.target.files?.[0] ?? null)}
        />

        {doc.src ? (
          <div className="inline-block group relative">
            {/* Image preview or PDF URL */}
            {isPdf ? (
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
                <Image
                  src={url}
                  alt={label}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Hover delete */}
            <button
              type="button"
              disabled={isUploading}
              onClick={() => handleDelete(kind)}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-white/90 shadow-md p-1 hover:bg-red-100 border border-red-300 text-red-600 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className="bg-primary hover:bg-primary/80 text-white hover:text-white"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Identity</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? "Cancel" : initial ? "Edit" : "Add"}
        </Button>
      </div>

      {editing ? (
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* NID number */}
              <div>
                <Label className="text-sm font-medium flex items-center gap-1">
                  NID Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="mt-1"
                  value={form.nid}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, nid: e.target.value }))
                  }
                  placeholder="Enter NID number"
                />
                {fieldErrors?.nid?.[0] && (
                  <p className="mt-1 text-xs text-destructive">
                    {fieldErrors.nid[0]}
                  </p>
                )}
              </div>

              {/* Passport number */}
              <div>
                <Label className="text-sm font-medium">Passport Number</Label>
                <Input
                  className="mt-1"
                  value={form.passport}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, passport: e.target.value }))
                  }
                  placeholder="Enter passport number "
                />
                {fieldErrors?.passport?.[0] && (
                  <p className="mt-1 text-xs text-destructive">
                    {fieldErrors.passport[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* NID upload */}
              <div className="lg:w-64">
                {docSlot("nid", "Upload NID", nidInputRef)}
              </div>

              {/* Passport upload */}
              <div className="lg:w-64">
                {docSlot("passport", "Upload Passport", passportInputRef)}
              </div>

              {/* CV upload */}
              <div className="lg:w-64">
                {docSlot("cv", "Upload CV", cvInputRef)}
              </div>
            </div>

            <p className="text-xs text-muted-foreground col-span-2">
              Allowed formats: JPG, JPEG, PNG, GIF, WEBP, PDF (max 5 MB).
            </p>

            {uploadError && (
              <p className="mt-1 text-xs text-destructive">{uploadError}</p>
            )}

            {globalError && (
              <p className="text-sm text-destructive">{globalError}</p>
            )}
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
        <div className="space-y-4 text-sm">
          <div className="">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ReadOnlyDocCard
                kind="nid"
                label="NID"
                number={form.nid}
                doc={docs.nid}
              />
              <ReadOnlyDocCard
                kind="passport"
                label="Passport"
                number={form.passport}
                doc={docs.passport}
              />
              <ReadOnlyDocCard
                kind="cv"
                label="CV"
                number={null}
                doc={docs.cv}
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function ReadOnlyDocCard({
  kind,
  label,
  number,
  doc,
}: {
  kind: "nid" | "passport" | "cv";
  label: string;
  number: string | null;
  doc: DocState;
}) {
  if (!doc.src) {
    if (kind === "cv") {
      return (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">{label}:</span> Not uploaded
        </div>
      );
    }

    return (
      <div className="text-xs text-muted-foreground">
        <span className="font-medium">
          {label} {number ? `: ${number}` : ""}
        </span>{" "}
        {!number && "Not provided"}
      </div>
    );
  }

  const isPdf = doc.format === "pdf";
  const url = publicDocUrl(doc.src!);

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium">
        {label}
        {number ? `: ${number}` : ""}
      </p>

      {isPdf ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-blue-600 underline break-all max-w-xs inline-block"
        >
          {url}
        </a>
      ) : (
        <div className="relative inline-block">
          <div className="relative w-20 h-20 rounded-md overflow-hidden border bg-muted">
            <a href={url} target="_blank">
              <Image
                src={url}
                alt={label}
                fill
                className="object-cover"
              />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
