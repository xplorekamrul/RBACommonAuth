// app/api/upload/document/route.ts
import { NextResponse } from "next/server";
import { ensureDir, listFiles, uploadBuffer, deleteFile, ftpEmployeeFilePath, ftpEmployeeFolder } from "@/lib/ftp/ftp";
import { extractExt } from "@/lib/ftp/images";

const ACCEPTED = ["jpg","jpeg","png","gif","webp","pdf"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function sanitizeBaseName(s: string) {
  // Use doc name as filename base; keep simple: letters, digits, hyphen, underscore
  return s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\-_]/g, "");
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const employeeId = String(form.get("employeeId") || "");
    const documentName = String(form.get("documentName") || "document");

    if (!file) return NextResponse.json({ ok: false, message: "No file" }, { status: 400 });
    if (!employeeId) return NextResponse.json({ ok: false, message: "Missing employeeId" }, { status: 400 });

    const arrBuf = await file.arrayBuffer();
    const buf = Buffer.from(arrBuf);

    if (buf.byteLength > MAX_BYTES) {
      return NextResponse.json({ ok: false, message: "File too large (max 5 MB)" }, { status: 400 });
    }

    const ext = extractExt(file.name);
    if (!ACCEPTED.includes(ext)) {
      return NextResponse.json({ ok: false, message: `Invalid extension. Allowed: ${ACCEPTED.join(", ")}` }, { status: 400 });
    }

    const baseName = sanitizeBaseName(documentName) || "document";
    const folder = ftpEmployeeFolder(employeeId);

    await ensureDir(folder);
    const existing = await listFiles(folder);

    // Find next available filename: base.ext, base1.ext, base2.ext, ...
    const nextName = (() => {
      const taken = new Set(existing);
      if (!taken.has(`${baseName}.${ext}`)) return `${baseName}.${ext}`;
      let i = 1;
      while (taken.has(`${baseName}${i}.${ext}`)) i++;
      return `${baseName}${i}.${ext}`;
    })();

    const ftpPath = ftpEmployeeFilePath(employeeId, nextName);
    await uploadBuffer(ftpPath, buf);

    // Return DB src (employeeId/filename.ext) and ext/format
    return NextResponse.json({
      ok: true,
      src: `${employeeId}/${nextName}`,
      format: ext,
      filename: nextName,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = String(searchParams.get("employeeId") || "");
    const filename = String(searchParams.get("filename") || "");

    if (!employeeId || !filename) {
      return NextResponse.json({ ok: false, message: "Missing employeeId or filename" }, { status: 400 });
    }

    const ftpPath = ftpEmployeeFilePath(employeeId, filename);
    await deleteFile(ftpPath);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Delete failed" }, { status: 500 });
  }
}
