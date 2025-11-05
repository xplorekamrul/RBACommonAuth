"use client";

import { useState, useMemo, type ReactNode } from "react"; 
import { useAction } from "next-safe-action/hooks";
import { updateUserStatus } from "@/actions/users/update-user-status";
import { deleteUser } from "@/actions/users/delete-user";
import { Pencil, KeyRound, Trash2, MoreHorizontal, PlayCircle, PauseCircle, UserX } from "lucide-react";
import EditInfoDialog from "./dialogs/EditInfoDialog";
import EditPasswordDialog from "./dialogs/EditPasswordDialog";

type Role = "DEVELOPER" | "SUPER_ADMIN" | "ADMIN";
type Status = "ACTIVE" | "INACTIVE" | "SUSPENDED";

type Props = {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: Role;
    status: Status;
  };
  onChanged: () => void;
};

export default function UserRowActions({ user, onChanged }: Props) {
  const [openMenu, setOpenMenu] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [openPass, setOpenPass] = useState(false);

  const { executeAsync: doStatus } = useAction(updateUserStatus);
  const { executeAsync: doDelete } = useAction(deleteUser);

  async function setStatus(status: Status) {
    const res = await doStatus({ id: user.id, status });
    if (res?.data?.ok) onChanged();
  }

  async function remove() {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    const res = await doDelete({ id: user.id });
    if (res?.data?.ok) onChanged();
  }

  const statusOptions = useMemo((): { key: Status; label: string; icon: ReactNode; className: string }[] => {
    const all = [
      { key: "ACTIVE" as const,   label: "Activate",   icon: <PlayCircle className="h-4 w-4" />,  className: "text-emerald-600" },
      { key: "INACTIVE" as const, label: "Inactivate", icon: <PauseCircle className="h-4 w-4" />, className: "text-orange-600" },
      { key: "SUSPENDED" as const,label: "Suspend",    icon: <UserX className="h-4 w-4" />,       className: "text-amber-700" },
    ];
    return all.filter(o => o.key !== user.status);
  }, [user.status]);

  return (
    <div className="relative">
      <button
        aria-label="Actions"
        onClick={() => setOpenMenu(v => !v)}
        className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-light"
      >
        <MoreHorizontal className="h-4 w-4 text-center" />
      </button>

      {openMenu ? (
        <div
          className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-border bg-background shadow-lg"
          onMouseLeave={() => setOpenMenu(false)}
        >
          {statusOptions.map(opt => (
            <button
              key={opt.key}
              className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-light ${opt.className}`}
              onClick={() => { setOpenMenu(false); setStatus(opt.key); }}
            >
              {opt.icon} {opt.label}
            </button>
          ))}

          <button
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-light text-emerald-600"
            onClick={() => { setOpenMenu(false); setOpenInfo(true); }}
          >
            <Pencil className="h-4 w-4" /> Edit Info
          </button>

          <button
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-light text-red-600"
            onClick={() => { setOpenMenu(false); setOpenPass(true); }}
          >
            <KeyRound className="h-4 w-4" /> Edit Password
          </button>

          <div className="h-px bg-border" />

          <button
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-light text-destructive"
            onClick={() => { setOpenMenu(false); remove(); }}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      ) : null}

      <EditInfoDialog open={openInfo} onOpenChange={setOpenInfo} user={user} onSaved={onChanged} />
      <EditPasswordDialog open={openPass} onOpenChange={setOpenPass} userId={user.id} onSaved={onChanged} />
    </div>
  );
}
