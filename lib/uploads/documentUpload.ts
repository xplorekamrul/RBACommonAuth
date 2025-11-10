// lib/uploads/documentUpload.ts

export type DocumentName =
  | "NID"
  | "PASSPORT"
  | "CV"
  | "DEGREE"
  | "CERTIFICATE"
  | string;

export interface DocumentUploadResult {
  ok: boolean;
  src: string | null;
  filename: string | null;
  format: string | null;
  message?: string;
}

export interface DocumentDeleteResult {
  ok: boolean;
  message?: string;
}

interface ApiUploadResponse {
  ok: boolean;
  src?: string;
  filename?: string;
  format?: string;
  message?: string;
}

interface ApiDeleteResponse {
  ok: boolean;
  message?: string;
}

/**
 * Upload a document for an employee via /api/upload/document.
 *
 * Props:
 *  - employeeId: string (required)
 *  - file: File (required)
 *  - documentName: DocumentName (e.g. "DEGREE", "NID", "PASSPORT")
 *  - maxBytes: optional size limit in bytes (e.g. 5 * 1024 * 1024)
 *
 * Returns:
 *  - { ok: true, src, filename, format } on success
 *  - { ok: false, src: null, filename: null, format: null, message } on error
 */
export async function uploadEmployeeDocument(params: {
  employeeId: string;
  file: File;
  documentName: DocumentName;
  maxBytes?: number;
}): Promise<DocumentUploadResult> {
  const { employeeId, file, documentName, maxBytes } = params;

  if (maxBytes !== undefined && file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return {
      ok: false,
      src: null,
      filename: null,
      format: null,
      message: `File too large. Max ${mb} MB`,
    };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("employeeId", employeeId);
  formData.append("documentName", documentName);

  try {
    const res = await fetch("/api/upload/document", {
      method: "POST",
      body: formData,
    });

    let jsonRaw: unknown = null;
    try {
      jsonRaw = await res.json();
    } catch {
      // Non-JSON response 
    }

    const json =
      typeof jsonRaw === "object" && jsonRaw !== null && "ok" in jsonRaw
        ? (jsonRaw as ApiUploadResponse)
        : undefined;

    if (!res.ok || !json || !json.ok) {
      return {
        ok: false,
        src: null,
        filename: null,
        format: null,
        message: json?.message ?? res.statusText ?? "Upload failed",
      };
    }

    return {
      ok: true,
      src: json.src ?? null,
      filename: json.filename ?? null,
      format: json.format ?? null,
      message: json.message,
    };
  } catch (error: unknown) {
    return {
      ok: false,
      src: null,
      filename: null,
      format: null,
      message: "Network error during upload",
    };
  }
}

/**
 * (DELETE) an employee document via /api/upload/document .
 *
 * Props:
 *  - employeeId: string
 *  - filename: string (e.g. "degree1.pdf")
 *
 * Returns:
 *  - { ok: true } on success
 *  - { ok: false, message } on error
 */
export async function deleteEmployeeDocument(params: {
  employeeId: string;
  filename: string;
}): Promise<DocumentDeleteResult> {
  const { employeeId, filename } = params;

  const query = new URLSearchParams({ employeeId, filename });

  try {
    const res = await fetch(`/api/upload/document?${query.toString()}`, {
      method: "DELETE",
    });

    let jsonRaw: unknown = null;
    try {
      jsonRaw = await res.json();
    } catch {
      // Non-JSON response
    }

    const json =
      typeof jsonRaw === "object" && jsonRaw !== null && "ok" in jsonRaw
        ? (jsonRaw as ApiDeleteResponse)
        : undefined;

    if (!res.ok || !json || !json.ok) {
      return {
        ok: false,
        message: json?.message ?? res.statusText ?? "Delete failed",
      };
    }

    return { ok: true, message: json.message };
  } catch (error: unknown) {
    return {
      ok: false,
      message: "Network error during delete",
    };
  }
}
