// "use client";

// import { useCallback, useRef, useState } from "react";
// import { useAction } from "next-safe-action/hooks";
// import { createDocument, deleteDocument } from "@/actions/employees/one-to-many";
// import { hasOkData } from "@/lib/safe-action/ok";
// import { publicDocUrl } from "@/lib/ftp/images";
// import { DOCUMENT_FORMAT, type DocumentFormat } from "@/lib/enums/enums";
// import { DocumentNameCombobox, type DocNameValue } from "@/components/shared/DocumentNameCombobox";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Loader2, Plus, Trash2, Upload } from "lucide-react";
// import Image from "next/image";

// type Doc = {
//   id: string;
//   src: string | null; // "employeeId/filename.ext"
//   format: DocumentFormat;
//   documentName?: { id: string; name: string } | null;
// };

// const ACCEPTED = new Set(["jpg", "jpeg", "png", "gif", "webp", "pdf"]);
// const MAX_BYTES = 5 * 1024 * 1024;

// type PendingRow = {
//   id: string;
//   docName: DocNameValue;
//   file: File | null;
//   uploading: boolean;
//   error?: string | null;
// };

// function getDocDisplayName(doc: Doc): string {
//   if (doc.documentName?.name) return doc.documentName.name;

//   if (doc.src) {
//     const filename = doc.src.split("/").pop() || "";
//     if (!filename) return "(Unnamed)";

//     // Remove extension
//     const base = filename.split(".").slice(0, -1).join(".") || filename;

//     // Remove trailing digits (nid1 -> nid)
//     const noDigits = base.replace(/\d+$/, "");

//     // Replace -, _ with spaces
//     const cleaned = noDigits.replace(/[-_]+/g, " ").trim();

//     if (!cleaned) return filename;

//     // Capitalize first letter
//     return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
//   }

//   return "(Unnamed)";
// }

// export default function DocumentsSection({
//   employeeId,
//   initial = [] as Doc[],
// }: {
//   employeeId: string;
//   initial?: Doc[];
// }) {
//   const [items, setItems] = useState<Doc[]>(initial);

//   // pending upload rows
//   const [rows, setRows] = useState<PendingRow[]>([
//     { id: "row-1", docName: null, file: null, uploading: false, error: null },
//   ]);

//   const rowIdCounter = useRef(2);

//   const { executeAsync: doCreate } = useAction(createDocument);
//   const { executeAsync: doDelete } = useAction(deleteDocument);

//   // ---- row helpers ----

//   const addRow = () => {
//     const id = `row-${rowIdCounter.current++}`;
//     setRows((prev) => [
//       ...prev,
//       { id, docName: null, file: null, uploading: false, error: null },
//     ]);
//   };

//   const removeRow = (id: string) => {
//     setRows((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.id !== id)));
//   };

//   const updateRow = (id: string, patch: Partial<PendingRow>) => {
//     setRows((prev) =>
//       prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
//     );
//   };

//   const handleRowUpload = useCallback(
//     async (row: PendingRow) => {
//       const { id, docName, file } = row;
//       if (!docName) {
//         updateRow(id, { error: "Please select a Document Name.", uploading: false });
//         alert("Please select a Document Name.");
//         return;
//       }
//       if (!file) {
//         updateRow(id, { error: "Please choose a file.", uploading: false });
//         alert("Please choose a file.");
//         return;
//       }

//       const ext = file.name.split(".").pop()?.toLowerCase() || "";
//       if (!ACCEPTED.has(ext)) {
//         updateRow(id, { error: `Invalid file type: ${ext}`, uploading: false });
//         alert(`Invalid file type: ${ext}`);
//         return;
//       }
//       if (file.size > MAX_BYTES) {
//         const sizeMb = (file.size / 1024 / 1024).toFixed(2);
//         updateRow(id, { error: `File too large: ${sizeMb} MB (max 5 MB)`, uploading: false });
//         alert(`File too large: ${sizeMb} MB (max 5 MB)`);
//         return;
//       }

//       updateRow(id, { uploading: true, error: null });

//       try {
//         const fd = new FormData();
//         fd.append("file", file);
//         fd.append("employeeId", employeeId);
//         const baseDocName = docName.name;
//         fd.append("documentName", baseDocName);

//         const res = await fetch("/api/upload/document", { method: "POST", body: fd });
//         const js = await res.json();
//         if (!js?.ok) {
//           const msg = js?.message || "Upload failed";
//           updateRow(id, { uploading: false, error: msg });
//           alert(msg);
//           return;
//         }

//         // create DB record
//         const createRes = await doCreate({
//           employeeId,
//           src: js.src as string,
//           data: null,
//           format: (js.format || ext) as DocumentFormat,
//           ...(docName.type === "existing"
//             ? { documentNameId: docName.id }
//             : { documentNameNew: docName.name }),
//         });

//         if (hasOkData<{ id: string }>(createRes)) {
//           const newDoc: Doc = {
//             id: createRes.data.id,
//             src: js.src,
//             format: (js.format || ext) as DocumentFormat,
//             documentName:
//               docName.type === "existing"
//                 ? { id: docName.id, name: docName.name }
//                 : { id: "", name: docName.name },
//           };
//           setItems((arr) => [newDoc, ...arr]);

//           // clear row file, keep docName for next upload
//           updateRow(id, { uploading: false, file: null, error: null });
//         } else {
//           console.error("DB create failed", createRes);
//           updateRow(id, { uploading: false, error: "Failed to save in database." });
//           alert("Failed to save in database.");
//         }
//       } catch (err: any) {
//         console.error(err);
//         updateRow(id, { uploading: false, error: err?.message || "Upload failed." });
//         alert(err?.message || "Upload failed.");
//       }
//     },
//     [doCreate, employeeId],
//   );

//   async function onDeleteClick(item: Doc) {
//     if (!item.id || !item.src) return;
//     const filename = item.src.split("/").pop()!;
//     const employee = item.src.split("/")[0]!;

//     if (!confirm("Delete this document?")) return;

//     //  delete from FTP
//     const delRes = await fetch(
//       `/api/upload/document?employeeId=${encodeURIComponent(
//         employee,
//       )}&filename=${encodeURIComponent(filename)}`,
//       { method: "DELETE" },
//     );
//     const delJs = await delRes.json();
//     if (!delJs?.ok) {
//       alert(delJs?.message || "Failed to delete on server");
//       return;
//     }

//     // delete from DB
//     const res = await doDelete({ id: item.id });
//     if (hasOkData(res)) {
//       setItems((arr) => arr.filter((x) => x.id !== item.id));
//     } else {
//       alert("Failed to delete database record.");
//     }
//   }

//   return (
//     <Card className="p-4 space-y-4">
//       <div className="flex items-center justify-between gap-3 flex-wrap">
//         <h2 className="text-lg font-semibold">Documents</h2>
//         {/* <Button
//           variant="outline"
//           size="sm"
//           type="button"
//           onClick={addRow}
//           className="flex items-center gap-1"
//         >
//           <Plus className="h-3 w-3" />
//           Add
//         </Button> */}
//       </div>

//       <div className="space-y-2">
//         {rows.map((row) => (
//           <div
//             key={row.id}
//             className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-md border px-3 py-2 bg-muted/40"
//           >
//             {/* Document Name */}
//             <div className="flex-1 min-w-[180px]">
//               <DocumentNameCombobox
//                 value={row.docName}
//                 onChange={(v) => updateRow(row.id, { docName: v })}
//                 placeholder="Document name (e.g. NID, Passport)..."
//               />
//             </div>

//             {/* File input */}
//             <div className="flex-1 min-w-[180px] flex items-center gap-2">
//               <label className="flex items-center gap-2">
//                 <Input
//                   type="file"
//                   className="h-9 py-1 text-xs"
//                   onChange={(e) => {
//                     const file = e.target.files?.[0] ?? null;
//                     updateRow(row.id, { file, error: null });
//                   }}
//                   accept={Array.from(ACCEPTED)
//                     .map((x) => "." + x)
//                     .join(",")}
//                 />
//               </label>
//             </div>

//             {/* Actions */}
//             <div className="flex items-center gap-2">
//               <Button
//                 type="button"
//                 size="sm"
//                 onClick={() => handleRowUpload(row)}
//                 disabled={row.uploading}
//                 className="flex items-center gap-1"
//               >
//                 {row.uploading ? (
//                   <>
//                     <Loader2 className="h-3 w-3 animate-spin" />
//                     Uploading
//                   </>
//                 ) : (
//                   <>
//                     <Upload className="h-3 w-3" />
//                     Upload
//                   </>
//                 )}
//               </Button>

//               {/* <Button
//                 type="button"
//                 size="icon"
//                 variant="ghost"
//                 onClick={() => removeRow(row.id)}
//                 disabled={rows.length === 1}
//                 className="h-8 w-8"
//               >
//                 <Trash2 className="h-4 w-4 text-destructive" />
//               </Button> */}
//             </div>

//             {row.error && (
//               <div className="text-xs text-destructive sm:ml-2">
//                 {row.error}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Uploaded documents grid */}
//       {items.length === 0 ? (
//         <p className="text-sm text-muted-foreground">No documents yet.</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {items.map((it) => (
//             <Card key={it.id} className="relative overflow-hidden group py-0">
//               <CardContent className="p-0">
//                 <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition">
//                   <Button
//                     size="icon"
//                     variant="secondary"
//                     className="h-8 w-8"
//                     onClick={() => onDeleteClick(it)}
//                   >
//                     <Trash2 className="h-4 w-4 text-destructive" />
//                   </Button>
//                 </div>

//                 {it.format !== "pdf" ? (
//                   <div className="aspect-video relative bg-muted">
//                     {it.src ? (
//                       <Image
//                         src={publicDocUrl(it.src)}
//                         alt={getDocDisplayName(it)}
//                         fill
//                         className="object-cover"
//                         sizes="(max-width: 768px) 100vw, 33vw"
//                       />
//                     ) : (
//                       <div className="w-full h-full grid place-items-center text-sm text-muted-foreground">
//                         No preview
//                       </div>
//                     )}
//                   </div>
//                 ) : (
//                   <div className="aspect-video grid place-items-center bg-muted text-xs text-muted-foreground">
//                     PDF: {it.src?.split("/").pop()}
//                   </div>
//                 )}

//                 <div className="p-3 text-sm">
//                   <div className="font-medium">
//                     {getDocDisplayName(it)}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </Card>
//   );
// }
