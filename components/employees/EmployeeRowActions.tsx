"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useAction } from "next-safe-action/hooks";
import { updateEmployeeStatus } from "@/actions/employees/update-employee-status";
import { deleteEmployee } from "@/actions/employees/delete-employee";
import EditEmployeeDialog from "./dialogs/EditEmployeeDialog";
import {
  MoreHorizontal,
  UserCheck,
  PauseCircle,
  DoorOpen,
  UserMinus,
  Trash2,
  Pencil,
  Eye,
} from "lucide-react";
import type { ContractType, EmploymentStatus } from "@/lib/enums/enums";

type Opt = { id: string; name: string };

export default function EmployeeRowActions({
  employee,
  onChanged,
}: {
  employee: {
    id: string;
    name: string;
    empId: string;
    status: EmploymentStatus;
    joiningDate: string | null;
    contractType: ContractType;
    department?: Opt | null;
    designation?: Opt | null;
  };
  onChanged: () => void;
}) {
  const [openMenu, setOpenMenu] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const { executeAsync: doStatus } = useAction(updateEmployeeStatus);
  const { executeAsync: doDelete } = useAction(deleteEmployee);

  async function setStatus(status: EmploymentStatus) {
    const res = await doStatus({ id: employee.id, status });
    if (res?.data?.ok) onChanged();
  }

  async function remove() {
    if (!confirm("Delete this employee? This cannot be undone.")) return;
    const res = await doDelete({ id: employee.id });
    if (res?.data?.ok) onChanged();
  }

  const statusItems = useMemo(
    (): { key: EmploymentStatus; label: string; icon: ReactNode; className: string }[] => {
      const all = [
        { key: "ACTIVE" as const, label: "Activate", icon: <UserCheck className="h-4 w-4" />, className: "text-emerald-600" },
        { key: "INACTIVE" as const, label: "Inactivate", icon: <PauseCircle className="h-4 w-4" />, className: "text-orange-600" },
        { key: "ON_LEAVE" as const, label: "On leave", icon: <DoorOpen className="h-4 w-4" />, className: "text-amber-700" },
        { key: "TERMINATED" as const, label: "Terminate", icon: <UserMinus className="h-4 w-4" />, className: "text-red-600" },
      ];
      // Exclude the current status from the dropdown
      return all.filter((s) => s.key !== employee.status);
    },
    [employee.status]
  );

  return (
    <div className="relative">
      <button
        aria-label="Actions"
        onClick={() => setOpenMenu((v) => !v)}
        className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-light"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {openMenu ? (
        <div
          className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-border bg-background shadow-lg"
          onMouseLeave={() => setOpenMenu(false)}
        >
          {/* Manage / View Details link */}
          <Link
            href={`/admin/employees/${employee.id}/manage`}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-light"
            onClick={() => setOpenMenu(false)}
          >
            <Eye className="h-4 w-4" />
             Employee Info
          </Link>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Status actions (excluding current) */}
          {statusItems.map((it) => (
            <button
              key={it.key}
              className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-light ${it.className}`}
              onClick={() => {
                setOpenMenu(false);
                setStatus(it.key);
              }}
            >
              {it.icon} {it.label}
            </button>
          ))}

          {/* Edit basic info */}
          <button
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-light text-emerald-700"
            onClick={() => {
              setOpenMenu(false);
              setOpenEdit(true);
            }}
          >
            <Pencil className="h-4 w-4" /> Edit
          </button>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Delete */}
          <button
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-light text-destructive"
            onClick={() => {
              setOpenMenu(false);
              remove();
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      ) : null}

      <EditEmployeeDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        onSaved={onChanged}
        employee={{
          id: employee.id,
          name: employee.name,
          empId: employee.empId,
          joiningDate: employee.joiningDate,
          contractType: employee.contractType,
          department: employee.department ?? null,
          designation: employee.designation ?? null,
        }}
      />
    </div>
  );
}
