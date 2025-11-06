export function formatEnumLabel(v: string) {
  return v
    .split("_")
    .map((p) => p.charAt(0) + p.slice(1).toLowerCase())
    .join(" ");
}
