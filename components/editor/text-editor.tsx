"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { SerializedEditorState } from "lexical";
import { lexicalStateToHtml } from "./lexical-to-html";
import { htmlToLexicalState } from "./html-to-lexical";

const Editor = dynamic(
  () => import("@/components/blocks/editor-00/editor").then((m) => m.Editor),
  { ssr: false }
);

// Minimal fallback state 
const fallbackState: SerializedEditorState = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
} as unknown as SerializedEditorState;

type Props = {
  valueHtml?: string | null;
  onHtmlChange?: (html: string) => void;

  docKey: string;
};

export default function TextEditorField({ valueHtml, onHtmlChange, docKey }: Props) {
  const lastHtmlRef = useRef<string>(typeof valueHtml === "string" ? valueHtml : "");

  const seededState: SerializedEditorState = useMemo(() => {
    if (typeof valueHtml === "string") return htmlToLexicalState(valueHtml);
    return fallbackState;
  }, [docKey]); 

  const [reseedNonce, setReseedNonce] = useState(0);
  useEffect(() => {
    const incoming = typeof valueHtml === "string" ? valueHtml : "";
    if (incoming && incoming !== lastHtmlRef.current) {
      setReseedNonce((s) => s + 1);
    }
  }, [valueHtml]);

  return (
    <div className="rounded-md border bg-background">
      <div dir="ltr" className="text-left [[contenteditable='true']]:text-left" style={{ direction: "ltr" }}>
        <Editor
          editorSerializedState={reseedNonce ? htmlToLexicalState(valueHtml ?? "") : seededState}
          onSerializedChange={(val: SerializedEditorState) => {
            try {
              const html = lexicalStateToHtml(val);
              if (html !== lastHtmlRef.current) {
                lastHtmlRef.current = html;
                onHtmlChange?.(html);
              }
            } catch {
            }
          }}
        />
      </div>
    </div>
  );
}
