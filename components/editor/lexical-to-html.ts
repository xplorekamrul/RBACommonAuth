import type { SerializedEditorState } from "lexical";

export function lexicalStateToHtml(state: SerializedEditorState): string {
  if (!state || typeof state !== "object") return "";
  const root: any = (state as any).root;
  if (!root?.children?.length) return "";

  const htmlParts: string[] = [];
  for (const node of root.children) {
    if (node.type === "paragraph") {
      const inner = (node.children || [])
        .map((child: any) => (child.text ? escapeHtml(child.text) : ""))
        .join("");
      htmlParts.push(`<p>${inner}</p>`);
    }
  }
  return htmlParts.join("");
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
