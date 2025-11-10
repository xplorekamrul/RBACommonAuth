

// lib/richtext/html.ts
export function stripHtml(html: string) {
  if (!html) return "";
  if (typeof window !== "undefined") {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || "").trim();
  }
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function truncateText(s: string, max = 50) {
  if (!s) return "—";
  return s.length > max ? s.slice(0, max) + "…" : s;
}
