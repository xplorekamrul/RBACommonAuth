export function formatEnumLabel(v: string) {
  return v
    .split("_")
    .map((p) => p.charAt(0) + p.slice(1).toLowerCase())
    .join(" ");
}



const BLOOD_MAP: Record<string, string> = {
  A_POS: "A+",
  A_NEG: "A-",
  B_POS: "B+",
  B_NEG: "B-",
  AB_POS: "AB+",
  AB_NEG: "AB-",
  O_POS: "O+",
  O_NEG: "O-",
};

export function formatBloodGroup(v: string | null | undefined) {
  if (!v) return "";
  return BLOOD_MAP[v] ?? formatEnumLabel(v);
}
