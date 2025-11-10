// components/editor/html-to-lexical.ts
import type { SerializedEditorState } from "lexical";

export function htmlToLexicalState(html: string): SerializedEditorState {
  if (!html || typeof html !== "string") {
    return emptyState();
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const container = document.createElement("div");
    container.innerHTML = html;

    const paragraphs: any[] = [];
    const blocks = getBlocks(container);

    if (blocks.length === 0) {
      const text = container.textContent || "";
      paragraphs.push(makeParagraph(text));
    } else {
      for (const block of blocks) {
        const txt = block.textContent || "";
        paragraphs.push(makeParagraph(txt));
      }
    }

    return makeState(paragraphs) as unknown as SerializedEditorState;
  }

  const textOnly = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return makeState([makeParagraph(textOnly)]) as unknown as SerializedEditorState;
}

function getBlocks(root: HTMLElement): HTMLElement[] {
  const result: HTMLElement[] = [];
  root.childNodes.forEach((node) => {
    if (node.nodeType === 1) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (["p", "div", "li", "h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) {
        result.push(el);
      } else if (el.childElementCount > 0) {
        result.push(...getBlocks(el));
      }
    }
  });
  return result;
}

function makeParagraph(text: string) {
  return {
    children: [
      {
        detail: 0,
        format: 0,
        mode: "normal",
        style: "",
        text,
        type: "text",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "paragraph",
    version: 1,
  };
}

function makeState(paragraphs: any[]) {
  return {
    root: {
      children: paragraphs,
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

function emptyState(): SerializedEditorState {
  return makeState([makeParagraph("")]) as unknown as SerializedEditorState;
}
