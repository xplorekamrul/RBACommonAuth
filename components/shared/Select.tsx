"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Opt = { label: string; value: string };

export default function EnumSelect({
  label,
  placeholder = "--Select--",
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
  return (
    <div className={className}>
      {label && <label className="text-sm">{label}</label>}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          className={
            "mt-1 w-full rounded-md border px-3 py-2 text-left " +
            (triggerClassName ?? "")
          }
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
