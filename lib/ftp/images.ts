// lib/images.ts
export function publicDocUrl(src: string) {
  const base = process.env.NEXT_PUBLIC_IMG_BASE_URL ?? "";
  const cleanBase = base.replace(/\/+$/, ""); 
  const cleanSrc = src.replace(/^\/+/, "");   
  return `${cleanBase}/${cleanSrc}`;
}

export function extractExt(filename: string) {
  const idx = filename.lastIndexOf(".");
  return idx >= 0 ? filename.slice(idx + 1).toLowerCase() : "";
}
 