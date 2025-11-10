// "use client";

// import * as React from "react";
// import { ChevronsUpDown, Loader2, PlusCircle, Check } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { cn } from "@/lib/utils";

// type Opt = { id: string; name: string };

// export type DocNameValue =
//   | { type: "existing"; id: string; name: string }
//   | { type: "new"; name: string }
//   | null;

// export function DocumentNameCombobox({
//   value,
//   onChange,
//   placeholder = "Select or type a document name...",
// }: {
//   value: DocNameValue;
//   onChange: (v: DocNameValue) => void;
//   placeholder?: string;
// }) {
//   const [open, setOpen] = React.useState(false);
//   const [query, setQuery] = React.useState("");
//   const [loading, setLoading] = React.useState(false);
//   const [options, setOptions] = React.useState<Opt[]>([]);

//   // Load options from API on query change
//   React.useEffect(() => {
//     let keep = true;
//     const run = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`/api/document-names?q=${encodeURIComponent(query)}`);
//         const js = await res.json();
//         if (keep && js?.ok) {
//           setOptions(js.items as Opt[]);
//         }
//       } catch (e) {
//         console.error(e);
//       } finally {
//         if (keep) setLoading(false);
//       }
//     };
//     run();
//     return () => {
//       keep = false;
//     };
//   }, [query]);

//   const label =
//     value?.type === "existing"
//       ? value.name
//       : value?.name || "";

//   const hasExactMatch =
//     !!query.trim() &&
//     options.some(
//       (o) =>
//         o.name.toLowerCase() === query.trim().toLowerCase(),
//     );

//   const [popoverOpen, setPopoverOpen] = React.useState(false);

//   const togglePopover = () => setPopoverOpen((o) => !o);

//   const selectExisting = (opt: Opt) => {
//     onChange({ type: "existing", id: opt.id, name: opt.name });
//     setPopoverOpen(false);
//   };

//   const selectNew = (name: string) => {
//     const trimmed = name.trim();
//     if (!trimmed) return;
//     onChange({ type: "new", name: trimmed });
//     setPopoverOpen(false);
//   };

//   return (
//     <div className="relative">
//       {/* Trigger button */}
//       <Button
//         type="button"
//         variant="outline"
//         className="w-full justify-between h-9"
//         onClick={togglePopover}
//       >
//         <span className="truncate text-left">
//           {label || placeholder}
//         </span>
//         <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
//       </Button>

//       {/* Popover panel */}
//       {popoverOpen && (
//         <div
//           className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md"
//         >
//           {/* Search input */}
//           <div className="flex items-center gap-2 border-b px-2 py-1.5">
//             <Input
//               autoFocus
//               placeholder="Search or type..."
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               className="h-8 text-sm"
//             />
//             {loading && (
//               <Loader2 className="h-4 w-4 animate-spin opacity-70" />
//             )}
//           </div>

//           {/* Options list */}
//           <div className="max-h-56 overflow-y-auto py-1 text-sm">
//             {options.length === 0 && !loading && (
//               <div className="px-3 py-2 text-muted-foreground text-xs">
//                 No matches.
//               </div>
//             )}

//             {options.map((opt) => (
//               <button
//                 key={opt.id}
//                 type="button"
//                 onClick={() => selectExisting(opt)}
//                 className={cn(
//                   "w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-accent hover:text-accent-foreground",
//                   value?.type === "existing" && value?.id === opt.id
//                     ? "bg-accent/60 text-accent-foreground"
//                     : "",
//                 )}
//               >
//                 <span className="truncate">{opt.name}</span>
//                 {value?.type === "existing" && value?.id === opt.id && (
//                   <Check className="h-4 w-4" />
//                 )}
//               </button>
//             ))}

//             {/* "Create new" option */}
//             {query.trim() && !hasExactMatch && (
//               <button
//                 type="button"
//                 onClick={() => selectNew(query)}
//                 className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-accent hover:text-accent-foreground"
//               >
//                 <PlusCircle className="h-4 w-4" />
//                 <span>Create “{query.trim()}”</span>
//               </button>
//             )}
//           </div>

//           {/* Close area */}
//           <div className="flex justify-end border-t px-2 py-1.5">
//             <Button
//               type="button"
//               variant="ghost"
//               size="sm"
//               onClick={() => setPopoverOpen(false)}
//             >
//               Close
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
