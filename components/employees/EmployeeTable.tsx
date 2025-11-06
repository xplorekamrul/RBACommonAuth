"use client";

import { useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { listEmployees } from "@/actions/employees/list-employees";
import EmployeeRowActions from "./EmployeeRowActions";
import CreateEmployeeDialog from "./dialogs/CreateEmployeeDialog";
import { Filter, Plus, Search, Check } from "lucide-react";
import { CONTRACT_TYPE, EMPLOYMENT_STATUS, type ContractType, type EmploymentStatus } from "@/lib/enums/enums";

type Row = {
  id: string;
  name: string;
  empId: string;
  joiningDate: string | null;
  contractType: ContractType;
  status: EmploymentStatus;
  department?: { id: string; name: string } | null;
  designation?: { id: string; name: string } | null;
  createdAt: string;
};

type Opt = { id: string; name: string };

/* ===========================
   Human-readable label maps
   =========================== */
const CONTRACT_LABEL: Record<ContractType, string> = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  CONTRACT: "Contract",
  INTERN: "Intern",
};

const STATUS_LABEL: Record<EmploymentStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  ON_LEAVE: "On leave",
  TERMINATED: "Terminated",
};

// (Optional fallback if you reuse elsewhere)
const humanizeEnum = (s: string) =>
  s.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function EmployeeTable({
  departments = [],
  designations = [],
}: {
  departments?: Opt[];
  designations?: Opt[];
}) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statuses, setStatuses] = useState<EmploymentStatus[]>([]);
  const [contracts, setContracts] = useState<ContractType[]>([]);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [designationId, setDesignationId] = useState<string>("");
  const [openCreate, setOpenCreate] = useState(false);

  const { execute: run, result, status } = useAction(listEmployees);
  const total = (result?.data as any)?.total ?? 0;
  const items: Row[] = (result?.data as any)?.items ?? [];

  function refresh() {
    run({
      page,
      pageSize,
      q: q.trim() || undefined,
      statuses: statuses.length ? (statuses as any) : undefined,
      contracts: contracts.length ? (contracts as any) : undefined,
      departmentId: departmentId || undefined,
      designationId: designationId || undefined,
    });
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statuses, contracts, departmentId, designationId]);

  function toggle<T>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 hover:bg-light"
            title="Filters"
          >
            <Filter className="h-4 w-4" /> Filters
          </button>

          <div className="relative">
            <input
              className="pl-9 pr-3 py-2 rounded-md border border-border bg-background w-72"
              placeholder="Search by name or employee ID"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (setPage(1), refresh())}
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <button
            onClick={() => {
              setPage(1);
              refresh();
            }}
            className="rounded-md border border-border px-3 py-2 hover:bg-light"
          >
            Search
          </button>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="inline-flex items-center gap-2 rounded-md bg-pcolor text-white px-3 py-2 hover:bg-scolor"
        >
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      {/* Filters panel */}
      {showFilters ? (
        <div className="rounded-lg border border-border p-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-medium mb-1">Status</p>
            <div className="flex flex-wrap gap-2">
              {EMPLOYMENT_STATUS.map((s) => {
                const active = statuses.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => {
                      setStatuses((prev) => toggle(prev, s));
                      setPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition ${
                      active
                        ? "bg-pcolor text-white border-pcolor"
                        : "border-border hover:bg-light"
                    }`}
                    title={STATUS_LABEL[s] ?? humanizeEnum(s)}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    {STATUS_LABEL[s] ?? humanizeEnum(s)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Contract</p>
            <div className="flex flex-wrap gap-2">
              {CONTRACT_TYPE.map((c) => {
                const active = contracts.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => {
                      setContracts((prev) => toggle(prev, c));
                      setPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition ${
                      active
                        ? "bg-pcolor text-white border-pcolor"
                        : "border-border hover:bg-light"
                    }`}
                    title={CONTRACT_LABEL[c] ?? humanizeEnum(c)}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    {CONTRACT_LABEL[c] ?? humanizeEnum(c)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Department</p>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Designation</p>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={designationId}
              onChange={(e) => {
                setDesignationId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All</option>
              {designations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div className="overflow-x-auto h-[80vh] rounded-lg border border-border">
        <table className="min-w-full text-sm">
          <thead className="bg-light">
            <tr className="text-left">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Employee ID</th>
              <th className="px-3 py-2">Department</th>
              <th className="px-3 py-2">Designation</th>
              <th className="px-3 py-2">Contract</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 ">Actions</th>
            </tr>
          </thead>
          <tbody>
            {status === "executing" && !items?.length ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : items?.length ? (
              items.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="px-3 py-2">{e.name}</td>
                  <td className="px-3 py-2">{e.empId}</td>
                  <td className="px-3 py-2">{e.department?.name || "—"}</td>
                  <td className="px-3 py-2">{e.designation?.name || "—"}</td>

                  {/* Contract: pretty label */}
                  <td className="px-3 py-2">
                    {CONTRACT_LABEL[e.contractType] ?? humanizeEnum(e.contractType)}
                  </td>

                  {/* Status: pretty label in colored chip */}
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border ${
                        e.status === "ACTIVE"
                          ? "border-emerald-600 text-emerald-700"
                          : e.status === "TERMINATED"
                          ? "border-red-600 text-red-700"
                          : e.status === "ON_LEAVE"
                          ? "border-amber-600 text-amber-700"
                          : "border-orange-600 text-orange-700"
                      }`}
                      title={STATUS_LABEL[e.status] ?? humanizeEnum(e.status)}
                    >
                      {STATUS_LABEL[e.status] ?? humanizeEnum(e.status)}
                    </span>
                  </td>

                  <td className="px-3 py-2 text-right">
                    <EmployeeRowActions
                      employee={{
                        id: e.id,
                        name: e.name,
                        empId: e.empId,
                        status: e.status,
                        joiningDate: e.joiningDate,
                        contractType: e.contractType,
                        department: e.department ?? null,
                        designation: e.designation ?? null,
                      }}
                      onChanged={() => refresh()}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > pageSize ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / pageSize)} • {total} employees
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 rounded-md border disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={page >= Math.ceil(total / pageSize)}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-2 rounded-md border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      {/* Hidden click target for external buttons if needed */}
      <button id="create-employee-open" type="button" className="hidden" onClick={() => {}} />

      <CreateEmployeeDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onCreated={() => refresh()}
        departments={departments}
        designations={designations}
      />
    </div>
  );
}
