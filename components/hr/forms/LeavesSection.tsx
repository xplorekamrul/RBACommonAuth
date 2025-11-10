// components/hr/forms/LeavesSection.tsx
"use client";

import { useAction } from "next-safe-action/hooks";
import {
   useMemo,
   useRef,
   useState,
   useEffect,
   useCallback,
   type RefObject,
} from "react";
import Image from "next/image";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
   Select,
   SelectTrigger,
   SelectContent,
   SelectItem,
   SelectValue,
} from "@/components/ui/select";
import {
   upsertLeave,
   deleteLeave,
   getEmployeeLeaves,
} from "@/actions/employees/leaves";
import { publicDocUrl } from "@/lib/ftp/images";
import {
   uploadEmployeeDocument,
   deleteEmployeeDocument,
} from "@/lib/uploads/documentUpload";

import TextEditorField from "@/components/editor/text-editor";
import { stripHtml, truncateText } from "@/lib/richtext/html";

const MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_FORMATS = ["jpg", "jpeg", "png", "gif", "webp"];

type RequestStatusType = "PENDING" | "APPROVED" | "REJECTED";

type DocState = {
   src: string | null;
   filename: string | null;
   format: string | null;
   uploading: boolean;
};

type LeaveInitial = {
   id: string;
   subject: string | null;
   body: string | null; // HTML
   status: RequestStatusType;
   applicationDoc?: { src: string | null; format: string | null } | null;
   statusDoc?: { src: string | null; format: string | null } | null;
};

type RowInitial = LeaveInitial & { _localId: string };

function getFilenameFromSrc(src?: string | null) {
   if (!src) return null;
   const parts = src.split("/");
   return parts[parts.length - 1] || null;
}

function isImageFormat(format: string | null | undefined) {
   if (!format) return false;
   return IMAGE_FORMATS.includes(format.toLowerCase());
}

type LeavesSectionProps = {
   employeeId: string;
   initial?: LeaveInitial[] | LeaveInitial | null;
};

export default function LeavesSection({
   employeeId,
   initial,
}: LeavesSectionProps) {
   const initialArray: LeaveInitial[] = Array.isArray(initial)
      ? initial
      : initial
         ? [initial]
         : [];

   const [rows, setRows] = useState<RowInitial[]>([]);
   const [loading, setLoading] = useState(false);
   const [detailModal, setDetailModal] = useState<{
      subject: string;
      body: string; // HTML
   } | null>(null);

   const [editingRow, setEditingRow] = useState<RowInitial | null>(null);
   const [editingIndex, setEditingIndex] = useState<number | null>(null);

   const { executeAsync: fetchLeaves } = useAction(getEmployeeLeaves);
   const { executeAsync: doDelete } = useAction(deleteLeave);

   useEffect(() => {
      let cancelled = false;
      async function load() {
         try {
            setLoading(true);

            if (!cancelled && initialArray.length) {
               setRows(
                  initialArray.map((l) => ({
                     ...l,
                     _localId: l.id,
                  })),
               );
            }

            const res = await fetchLeaves({ employeeId });
            if (!cancelled && res?.data?.ok) {
               const serverLeaves = res.data.leaves as LeaveInitial[];
               setRows(
                  serverLeaves.map((l) => ({
                     ...l,
                     _localId: l.id,
                  })),
               );
            }
         } finally {
            if (!cancelled) setLoading(false);
         }
      }
      void load();
      return () => {
         cancelled = true;
      };
   }, [employeeId, fetchLeaves, initialArray.length]);

   function addRow() {
      const id = `new-${Date.now()}-${Math.random()}`;
      const newRow: RowInitial = {
         _localId: id,
         id: "",
         subject: "",
         body: "",
         status: "PENDING",
         applicationDoc: null,
         statusDoc: null,
      };
      setRows((prev) => [newRow, ...prev]);
      setEditingRow(newRow);
      setEditingIndex(0);
   }

   async function removeRow(row: RowInitial) {
      if (!confirm("Delete this leave request?")) return;

      if (!row.id) {
         setRows((prev) => prev.filter((r) => r._localId !== row._localId));
         if (editingRow?._localId === row._localId) {
            setEditingRow(null);
            setEditingIndex(null);
         }
         return;
      }

      const res = await doDelete({ id: row.id });
      if (res?.data?.ok) {
         setRows((prev) => prev.filter((r) => r._localId !== row._localId));
         if (editingRow?._localId === row._localId) {
            setEditingRow(null);
            setEditingIndex(null);
         }
      }
   }

   function onEdit(row: RowInitial, idx: number) {
      setEditingRow(row);
      setEditingIndex(idx);
   }

   function onEditorSaved(updated: LeaveInitial) {
      setRows((prev) =>
         prev.map((r) =>
            r._localId === editingRow?._localId
               ? { ...updated, _localId: updated.id }
               : r,
         ),
      );
      setEditingRow(null);
      setEditingIndex(null);
   }

   function onEditorCancel() {
      if (editingRow && !editingRow.id) {
         setRows((prev) => prev.filter((r) => r._localId !== editingRow._localId));
      }
      setEditingRow(null);
      setEditingIndex(null);
   }

   return (
      <Card className="p-4">
         <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Leaves</h2>
            <Button
               type="button"
               size="sm"
               variant="outline"
               onClick={addRow}
               className="flex items-center gap-1"
            >
               <Plus className="w-4 h-4" />
               Add
            </Button>
         </div>

         {loading && rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading leaves…</p>
         ) : (
            <div className="space-y-4">
               {editingRow && editingIndex !== null && (
                  <LeaveEditor
                     key={editingRow._localId}
                     employeeId={employeeId}
                     initial={editingRow}
                     onSaved={onEditorSaved}
                     onCancel={onEditorCancel}
                     onDeleted={(deletedId) => {
                        setRows((prev) =>
                           prev.filter((r) => r._localId !== deletedId),
                        );
                        setEditingRow(null);
                        setEditingIndex(null);
                     }}
                  />
               )}

               {rows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                     No leaves yet. Click <span className="font-medium">Add</span> to create one.
                  </p>
               ) : (
                  <div className="overflow-x-auto rounded-md border">
                     <table className="min-w-full text-sm">
                        <thead className="bg-muted">
                           <tr>
                              <th className="px-3 py-2 text-left font-medium w-[20%]">Subject</th>
                              <th className="px-3 py-2 text-left font-medium w-[25%]">Detail</th>
                              <th className="px-3 py-2 text-left font-medium w-[10%]">Status</th>
                              <th className="px-3 py-2 text-left font-medium w-[15%]">App Doc</th>
                              <th className="px-3 py-2 text-left font-medium w-[15%]">Status Doc</th>
                              <th className="px-3 py-2 text-center font-medium w-[15%]">Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {rows.map((row, idx) => {
                              const bodyHtml = row.body || "";
                              const previewText = truncateText(stripHtml(bodyHtml), 50);

                              return (
                                 <tr key={row._localId} className="border-t last:border-b">
                                    <td className="px-3 py-2 align-middle w-[20%] text-left">
                                       <div className="wrap-break-word">{row.subject || "—"}</div>
                                    </td>

                                    <td className="px-3 py-2 align-middle w-[25%] text-left">
                                       <button
                                          type="button"
                                          className="text-left text-xs text-blue-600 hover:underline wrap-break-word w-full"
                                          onClick={() =>
                                             setDetailModal({
                                                subject: row.subject || "(No subject)",
                                                body: bodyHtml,
                                             })
                                          }
                                       >
                                          {previewText || "—"}
                                       </button>
                                    </td>

                                    <td className="px-3 py-2 align-middle w-[10%]">
                                       <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] whitespace-nowrap">
                                          {row.status}
                                       </span>
                                    </td>

                                    <td className="px-3 py-2 align-middle w-[15%] ">
                                       <TinyDocPreview doc={docStateFromInitial(row.applicationDoc)} />
                                    </td>
                                    <td className="px-3 py-2 align-middle w-[15%]">
                                       <TinyDocPreview doc={docStateFromInitial(row.statusDoc)} />
                                    </td>

                                    <td className="px-3 py-2 align-middle text-center w-[15%]">
                                       <div className="inline-flex items-center gap-2">
                                          <button
                                             type="button"
                                             className="rounded-md border px-2 py-1 hover:bg-muted"
                                             onClick={() => onEdit(row, idx)}
                                          >
                                             <Pencil className="h-4 w-4" />
                                          </button>
                                          <button
                                             type="button"
                                             className="rounded-md border px-2 py-1 text-destructive hover:bg-destructive/10"
                                             onClick={() => void removeRow(row)}
                                          >
                                             <Trash2 className="h-4 w-4" />
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>
         )}

         {detailModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
               <div className="w-full max-w-lg rounded-xl bg-background shadow-lg border p-4 max-h-[80vh] overflow-auto">
                  <div className="flex items-center justify-between mb-3">
                     <h3 className="text-lg font-semibold">{detailModal.subject}</h3>
                     <button
                        type="button"
                        className="h-8 w-8 grid place-items-center rounded-md border hover:bg-muted"
                        onClick={() => setDetailModal(null)}
                     >
                        ✕
                     </button>
                  </div>

                  <div
                     className="prose prose-sm dark:prose-invert max-w-none"
                     dangerouslySetInnerHTML={{ __html: detailModal.body }}
                  />
               </div>
            </div>
         )}
      </Card>
   );
}

function docStateFromInitial(
   doc?: { src: string | null; format: string | null } | null,
): DocState {
   const src = doc?.src ?? null;
   return {
      src,
      filename: src ? getFilenameFromSrc(src) : null,
      format: doc?.format ?? null,
      uploading: false,
   };
}

function TinyDocPreview({ doc }: { doc: DocState }) {
   if (!doc.src) {
      return <p className="text-[11px] text-muted-foreground text-left ml-6" >Null</p>;
   }

   const url = publicDocUrl(doc.src);
   const isImage = isImageFormat(doc.format);

   if (isImage) {
      return (
         <div className="relative w-10 h-10 rounded-md overflow-hidden border bg-muted ml-4">
            <a href={url} target="_blank" rel="noreferrer">
               <Image src={url} alt="Document" fill className="object-cover" />
            </a>
         </div>
      );
   }

   const truncateUrl = (fullUrl: string, maxLength: number = 25) => {
      if (fullUrl.length <= maxLength) return fullUrl;
      return fullUrl.slice(0, maxLength) + "...";
   };
   return (
      <a
         href={url}
         target="_blank"
         rel="noreferrer"
         className="text-[11px] text-blue-600 underline block truncate max-w-[150px]"
         title={url}
      >
         {truncateUrl(url)}
      </a>
   );
}

type LeaveEditorProps = {
   employeeId: string;
   initial: RowInitial;
   onSaved: (updated: LeaveInitial) => void;
   onCancel: () => void;
   onDeleted: (localId: string) => void;
};

function LeaveEditor({
   employeeId,
   initial,
   onSaved,
   onCancel,
   onDeleted,
}: LeaveEditorProps) {
   const [form, setForm] = useState({
      id: initial.id ?? "",
      subject: initial.subject ?? "",
      body: initial.body ?? "", // HTML string
      status:
         (["PENDING", "APPROVED", "REJECTED"].includes((initial.status as string) || "")
            ? initial.status
            : "PENDING") as RequestStatusType,
   });

   const [applicationDoc, setApplicationDoc] = useState<DocState>({
      src: initial.applicationDoc?.src ?? null,
      filename: getFilenameFromSrc(initial.applicationDoc?.src ?? null),
      format: initial.applicationDoc?.format ?? null,
      uploading: false,
   });

   const [statusDoc, setStatusDoc] = useState<DocState>({
      src: initial.statusDoc?.src ?? null,
      filename: getFilenameFromSrc(initial.statusDoc?.src ?? null),
      format: initial.statusDoc?.format ?? null,
      uploading: false,
   });

   const [uploadError, setUploadError] = useState<string | null>(null);

   const appInputRef: RefObject<HTMLInputElement | null> = useRef(null);
   const statusInputRef: RefObject<HTMLInputElement | null> = useRef(null);

   const { executeAsync, status, result } = useAction(upsertLeave);
   const fieldErrors = useMemo(
      () =>
         (result?.validationErrors ?? {}) as Record<string, string[] | undefined>,
      [result],
   );
   const globalError = (result?.serverError as string | undefined) ?? null;

   const handleHtmlChange = useCallback((html: string) => {
      setForm((s) => (s.body === html ? s : { ...s, body: html }));
   }, []);

   async function uploadDoc(
      kind: "application" | "status",
      file: File | null,
   ) {
      if (!file) return;
      const setDoc = kind === "application" ? setApplicationDoc : setStatusDoc;
      setDoc((prev) => ({ ...prev, uploading: true }));

      const res = await uploadEmployeeDocument({
         employeeId,
         file,
         documentName: kind === "application" ? "LEAVE_APPLICATION" : "LEAVE_STATUS",
         maxBytes: MAX_BYTES,
      });

      setDoc((prev) => ({ ...prev, uploading: false }));

      if (!res.ok) {
         const msg = res.message ?? "Upload failed";
         setUploadError(msg);
         if (msg.toLowerCase().includes("too large")) {
            alert(msg);
         }
         return;
      }

      setUploadError(null);
      setDoc({
         src: res.src,
         filename: res.filename,
         format: res.format,
         uploading: false,
      });
   }

   async function deleteDoc(kind: "application" | "status") {
      const doc = kind === "application" ? applicationDoc : statusDoc;
      const setDoc = kind === "application" ? setApplicationDoc : setStatusDoc;

      if (!doc.filename) {
         setDoc({ src: null, filename: null, format: null, uploading: false });
         return;
      }

      setDoc((prev) => ({ ...prev, uploading: true }));
      const res = await deleteEmployeeDocument({
         employeeId,
         filename: doc.filename,
      });
      setDoc({ src: null, filename: null, format: null, uploading: false });

      if (!res.ok) {
         setUploadError(res.message ?? "Delete failed");
      } else {
         setUploadError(null);
      }
   }

   async function onSubmit(e: React.FormEvent) {
      const submitter = (e as any).nativeEvent?.submitter as
         | HTMLButtonElement
         | undefined;
      const isSave =
         submitter?.getAttribute("data-role") === "save" ||
         submitter?.id === "leave-save";

      if (!isSave) {
         e.preventDefault();
         return;
      }

      e.preventDefault();

      const res = await executeAsync({
         employeeId,
         leaveId: form.id || undefined,
         subject: form.subject || undefined,
         body: form.body || undefined,
         status: form.status as RequestStatusType,
         applicationDoc: applicationDoc.src
            ? { src: applicationDoc.src, format: applicationDoc.format ?? "jpg" }
            : null,
         statusDoc: statusDoc.src
            ? { src: statusDoc.src, format: statusDoc.format ?? "jpg" }
            : null,
      });

      if (res?.data?.ok) {
         const leave = res.data.leave as LeaveInitial;
         onSaved(leave);
      }
   }

   async function handleDelete() {
      if (!form.id) {
         onDeleted(initial._localId);
         return;
      }
      if (!confirm("Delete this leave?")) return;
      onDeleted(initial._localId);
   }

   const renderDocSlot = (
      kind: "application" | "status",
      label: string,
      doc: DocState,
      inputRef: RefObject<HTMLInputElement | null>,
   ) => {
      const isUploading = doc.uploading;
      const isImage = isImageFormat(doc.format);
      const url = doc.src ? publicDocUrl(doc.src) : "";

      return (
         <div className="space-y-2">
            <Label className="text-sm font-medium">{label}</Label>

            <input
               ref={inputRef}
               type="file"
               accept="image/*,.pdf"
               className="hidden"
               onChange={(e) => uploadDoc(kind, e.target.files?.[0] ?? null)}
            />

            {doc.src ? (
               <div className="flex justify-start group relative">
                  {isImage ? (
                     <div className="relative w-10 h-10 rounded-md overflow-hidden border bg-muted">
                        <a href={url} target="_blank" rel="noreferrer">
                           <Image src={url} alt={label} fill className="object-cover" />
                        </a>
                     </div>
                  ) : (
                     <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 underline break-all max-w-xs inline-block"
                     >
                        {url}
                     </a>
                  )}

                  <button
                     type="button"
                     disabled={isUploading}
                     onClick={() => deleteDoc(kind)}
                     className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-white/90 shadow-md p-1 hover:bg-red-100 border border-red-300 text-red-600"
                  >
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            ) : (
               <Button
                  type="button"
                  variant="outline"
                  disabled={isUploading}
                  onClick={() => inputRef.current?.click()}
                  className="bg-primary hover:bg-primary/80 text-white hover:text-white flex justify-start items-center gap-2"
               >
                  {isUploading ? "Uploading..." : "Upload"}
               </Button>
            )}
         </div>
      );
   };

   return (
      <div className="rounded-md border bg-muted/30 p-3 space-y-4">
         <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
               {form.id ? "Edit Leave" : "New Leave"}
            </p>
            <div className="flex gap-2">
               <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  onClick={handleDelete}
               >
                  <Trash2 className="h-4 w-4" />
               </Button>
            </div>
         </div>

         <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
               <div className="flex justify-between col-span-3">
                  <div className="w-[70%]">
                     <Label className="text-sm font-medium">Subject</Label>
                     <Input
                        className="mt-1"
                        value={form.subject}
                        onChange={(e) =>
                           setForm((s) => ({ ...s, subject: e.target.value }))
                        }
                        placeholder="Leave subject"
                     />
                     {fieldErrors?.subject?.[0] && (
                        <p className="mt-1 text-xs text-destructive">
                           {fieldErrors.subject[0]}
                        </p>
                     )}
                  </div>

                  <div className="w-[25%]">
                     <Label className="text-sm font-medium">Status</Label>
                     <div className="mt-1">
                        <Select
                           value={form.status}
                           onValueChange={(val) =>
                              setForm((s) => ({
                                 ...s,
                                 status: (["PENDING", "APPROVED", "REJECTED"].includes(val as string)
                                    ? (val as RequestStatusType)
                                    : "PENDING") as RequestStatusType,
                              }))
                           }
                        >
                           <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select status" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="APPROVED">Approved</SelectItem>
                              <SelectItem value="REJECTED">Rejected</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     {fieldErrors?.status?.[0] && (
                        <p className="mt-1 text-xs text-destructive">
                           {fieldErrors.status[0]}
                        </p>
                     )}
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 col-span-2">
                  {renderDocSlot(
                     "application",
                     "Application Document",
                     applicationDoc,
                     appInputRef,
                  )}
                  {renderDocSlot("status", "Status Document", statusDoc, statusInputRef)}

                  <div className="col-span-2 text-start">
                     <p className="text-xs text-muted-foreground ">
                        Allowed formats: JPG, JPEG, PNG, GIF, WEBP, PDF (max 5 MB).
                     </p>

                     {uploadError && (
                        <p className="mt-1 text-xs text-destructive">{uploadError}</p>
                     )}

                     {globalError && (
                        <p className="text-sm text-destructive">{globalError}</p>
                     )}
                  </div>
               </div>
            </div>

            <div className="col-span-5">
               <Label className="text-sm font-medium">Details</Label>
               <div className="mt-1">
                  <TextEditorField
                     docKey={form.id || initial._localId}
                     valueHtml={form.body}
                     onHtmlChange={handleHtmlChange}
                  />
               </div>
               {fieldErrors?.body?.[0] && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.body[0]}</p>
               )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
               <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
               </Button>
               <Button id="leave-save" data-role="save" type="submit" disabled={status === "executing"}>
                  {status === "executing" ? "Saving..." : "Save"}
               </Button>
            </div>
         </form>
      </div>
   );
}
