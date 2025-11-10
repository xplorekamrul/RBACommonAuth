// lib/ftp/ftp.ts
import "server-only";
import ftp from "basic-ftp";
import { Readable } from "stream";

const {
  FTP_HOST,
  FTP_PORT,
  FTP_USER,
  FTP_PASS,
  FTP_SECURE,
  // NOTE: we don't read NEXT_PUBLIC_IMG_EMP_DIR directly here,
  // we'll resolve it below to support both spellings.
} = process.env;

// Support both: NEXT_PUBLIC_IMG_EMP_DIR (correct) and NEXT_PUBLIC_IMG_EM_DIR (old typo)
const IMG_EMP_DIR =
  process.env.NEXT_PUBLIC_IMG_EMP_DIR ??
  process.env.NEXT_PUBLIC_IMG_EM_DIR ??
  "";

if (!FTP_HOST || !FTP_USER || !FTP_PASS || !IMG_EMP_DIR) {
  throw new Error("Missing FTP/IMG env vars. Check .env.");
}

export async function withFtp<T>(fn: (client: ftp.Client) => Promise<T>) {
  const client = new ftp.Client(20_000);
  client.ftp.verbose = false;
  try {
    await client.access({
      host: FTP_HOST!,
      port: FTP_PORT ? Number(FTP_PORT) : 21,
      user: FTP_USER!,
      password: FTP_PASS!,
      secure: FTP_SECURE === "true",
    });
    return await fn(client);
  } finally {
    client.close();
  }
}

export async function ensureDir(path: string) {
  return withFtp(async (c) => {
    await c.ensureDir(path);
  });
}

export async function listFiles(path: string): Promise<string[]> {
  return withFtp(async (c) => {
    try {
      const list = await c.list(path);
      return list.filter((x) => x.isFile).map((x) => x.name);
    } catch {
      return [];
    }
  });
}

// Buffer / Uint8Array -> Readable for basic-ftp typings
export async function uploadBuffer(path: string, buf: Buffer | Uint8Array) {
  return withFtp(async (c) => {
    const stream = Readable.from(buf);
    await c.uploadFrom(stream, path);
  });
}

export async function deleteFile(path: string) {
  return withFtp(async (c) => {
    await c.remove(path);
  });
}

export function ftpEmployeeFolder(employeeId: string) {
  // IMG_EMP_DIR will be "uploads"
  return `/${IMG_EMP_DIR}/${employeeId}`;
}

export function ftpEmployeeFilePath(employeeId: string, filename: string) {
  return `${ftpEmployeeFolder(employeeId)}/${filename}`;
}
