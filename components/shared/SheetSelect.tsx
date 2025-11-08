"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Opt = { label: string; value: string };

export default function SheetSelect({
  label = "Select",
  placeholder = "Select…",
  value,
  onChange,
  options,
  disabled,
  className,
  triggerClassName,
}: {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <div className={className}>
      <label className="text-sm">{label}</label>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "mt-1 w-full rounded-md border px-3 py-2 text-left",
              "bg-white/95 backdrop-blur outline-none transition focus:ring-1 focus:ring-neutral-400",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              triggerClassName
            )}
          >
            <span className={current ? "text-neutral-900" : "text-neutral-400"}>
              {current ? current.label : placeholder}
            </span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{label}</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm hover:bg-green-50",
                  o.value === value ? "border-green-600 bg-green-50" : "border-neutral-200"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
