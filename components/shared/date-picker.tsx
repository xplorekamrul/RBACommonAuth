// components/shared/date-picker.tsx
"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";

/** ---------- utils ---------- */
function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function daysInMonth(year: number, month1to12: number) {
  if (!year || !month1to12) return 31;
  if (month1to12 === 2) return isLeapYear(year) ? 29 : 28;
  if ([4, 6, 9, 11].includes(month1to12)) return 30;
  return 31;
}
function computeAgeYears(dateISO: string | null): number | null {
  if (!dateISO) return null;
  const dob = new Date(dateISO);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function useOutsideClose<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);
  return ref;
}

/** ---------- select ---------- */
type Opt = { label: string; value: string | number; disabled?: boolean };

function DrawerSelect({
  placeholder,
  value,
  onChange,
  disabled,
  options,
  className,
  width = "w-28",
}: {
  placeholder: string;
  value: string | number | "";
  onChange: (v: string | number) => void;
  disabled?: boolean;
  options: Opt[];
  className?: string;
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose<HTMLDivElement>(() => setOpen(false));
  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((s) => !s)}
        className={`inline-flex items-center justify-between ${width} rounded-xl px-[5px] py-[5px] text-sm border shadow-sm bg-white/95 backdrop-blur outline-none transition focus:ring-1 focus:ring-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed border-neutral-400`}
      >
        <span className={selected ? "text-neutral-900" : "text-neutral-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-70">
          <path
            d="M7 10l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 max-h-64 overflow-auto rounded-md border border-neutral-200 bg-white shadow-xl w-max min-w-full">
          <ul className="p-[5px]">
            {options.map((o) => (
              <li key={String(o.value)}>
                <button
                  type="button"
                  disabled={o.disabled}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-[5px] py-[5px] rounded-lg text-sm hover:bg-green-50 focus:bg-green-50 focus:outline-none disabled:opacity-50 ${
                    o.value === value ? "bg-green-50" : ""
                  }`}
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** ---------- months ---------- */
const MONTHS: { label: string; value: number }[] = [
  { label: "Jan", value: 1 },
  { label: "Feb", value: 2 },
  { label: "Mar", value: 3 },
  { label: "Apr", value: 4 },
  { label: "May", value: 5 },
  { label: "Jun", value: 6 },
  { label: "Jul", value: 7 },
  { label: "Aug", value: 8 },
  { label: "Sep", value: 9 },
  { label: "Oct", value: 10 },
  { label: "Nov", value: 11 },
  { label: "Dec", value: 12 },
];

/** ---------- main ---------- */
export default function DatePickerDOB({
  value,
  onChange,
  labelInitial = "What's your date of birth?",
  labelAfter,
  minYear = 1900,
  maxYear,
  defaultToToday = false,
  allowFutureDates = false,
}: {
  value?: string | Date | null;
  onChange?: (iso: string | null) => void;
  labelInitial?: string;
  labelAfter?: (age: number) => string;
  minYear?: number;
  maxYear?: number;
  defaultToToday?: boolean;
  allowFutureDates?: boolean;
}) {
  const [yearTick, setYearTick] = useState(0); // bump to re-evaluate "current year" at New Year

  // --- auto-bump at the exact moment a new year starts (so current year always appears) ---
  useEffect(() => {
    const now = new Date();
    const nextYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
    const msUntilNextYear = nextYear.getTime() - now.getTime();
    const id = window.setTimeout(() => setYearTick((t) => t + 1), msUntilNextYear);
    return () => window.clearTimeout(id);
  }, [yearTick]);

  const today = useMemo(() => new Date(), [yearTick]); // re-evaluate on New Year tick
  const currentYear = today.getFullYear();

  // resolve effective maxYear
  const effectiveMaxYear = useMemo(() => {
    if (typeof maxYear === "number") return maxYear;
    return allowFutureDates ? currentYear + 100 : currentYear; // generous future headroom when enabled
  }, [maxYear, allowFutureDates, currentYear]);

  // Build years list (newest first)
  const years = useMemo(() => {
    const start = Math.min(minYear, effectiveMaxYear);
    const end = Math.max(minYear, effectiveMaxYear);
    const arr: number[] = [];
    for (let y = end; y >= start; y--) arr.push(y);
    return arr;
  }, [minYear, effectiveMaxYear]);

  const [year, setYear] = useState<number | "">("");
  const [month, setMonth] = useState<number | "">("");
  const [day, setDay] = useState<number | "">("");

  // Guards to prevent loops
  const syncingRef = useRef(false);
  const lastEmittedRef = useRef<string | null | undefined>(undefined);

  // Optional: default to today when no `value` provided
  useEffect(() => {
    if (value != null) return;
    if (!defaultToToday) return;
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    setYear(y);
    setMonth(m);
    setDay(d);
    // don't emit here; the emission effect will run
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultToToday, value, today]); // today changes on New Year tick

  // Sync incoming value -> internal Y/M/D
  useEffect(() => {
    syncingRef.current = true;
    try {
      if (!value) {
        // if defaultToToday already set values, keep them; otherwise clear
        if (!defaultToToday) {
          setYear("");
          setMonth("");
          setDay("");
        }
      } else {
        const iso =
          typeof value === "string"
            ? value
            : new Date(value).toISOString().slice(0, 10);
        const [y, m, d] = iso.split("-").map((s) => Number(s));
        if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
          setYear(y);
          setMonth(m);
          setDay(d);
        } else {
          setYear("");
          setMonth("");
          setDay("");
        }
      }
    } finally {
      setTimeout(() => {
        syncingRef.current = false;
      }, 0);
    }
  }, [value, defaultToToday]);

  const maxDays = useMemo(
    () =>
      typeof year === "number" && typeof month === "number"
        ? daysInMonth(year, month)
        : 31,
    [year, month]
  );

  // Clamp day if switching to a shorter month
  useEffect(() => {
    if (syncingRef.current) return;
    if (typeof day === "number" && typeof maxDays === "number" && day > maxDays) {
      setDay(maxDays);
    }
  }, [maxDays, day]);

  const dayOptions: Opt[] = useMemo(
    () =>
      Array.from({ length: maxDays }, (_, i) => ({
        label: String(i + 1).padStart(2, "0"),
        value: i + 1,
      })),
    [maxDays]
  );
  const yearOptions: Opt[] = useMemo(
    () => years.map((y) => ({ label: String(y), value: y })),
    [years]
  );
  const monthOptions: Opt[] = MONTHS.map((m) => ({
    label: m.label,
    value: m.value,
  }));

  const dateISO =
    typeof year === "number" &&
    typeof month === "number" &&
    typeof day === "number"
      ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      : null;

  // Emit only when composed value actually changes and not during syncing
  useEffect(() => {
    if (syncingRef.current) return;
    if (lastEmittedRef.current !== dateISO) {
      lastEmittedRef.current = dateISO;
      onChange?.(dateISO);
    }
  }, [dateISO, onChange]);

  const age = computeAgeYears(dateISO);
  const dynamicLabel =
    age != null
      ? labelAfter
        ? labelAfter(age)
        : `Your age is (${age}) years`
      : labelInitial;

  return (
    <div className="">
      {/* <div className="text-sm font-medium text-black mb-1">{dynamicLabel}</div> */}

      <div className="flex items-start gap-3">
        <div className="flex items-center gap-3">
          <DrawerSelect
            placeholder="YYYY"
            value={year === "" ? "" : year}
            onChange={(v) => setYear(Number(v))}
            options={yearOptions}
            width="w-24"
          />
          <DrawerSelect
            placeholder="MM"
            value={month === "" ? "" : month}
            onChange={(v) => setMonth(Number(v))}
            options={monthOptions}
            disabled={year === ""}
            width="w-20"
          />
          <DrawerSelect
            placeholder="DD"
            value={day === "" ? "" : day}
            onChange={(v) => setDay(Number(v))}
            options={dayOptions}
            disabled={year === "" || month === ""}
            width="w-20"
          />
        </div>
      </div>
    </div>
  );
}
