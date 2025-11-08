"use client";

import { useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { getHrDropdowns } from "@/actions/employees/core";

import EmployeeCoreSection from "@/components/hr/forms/EmployeeCoreSection";
import IdentitySection from "@/components/hr/forms/IdentitySection";
import EducationsSection from "@/components/hr/forms/EducationsSection";
import PersonalSection from "@/components/hr/forms/PersonalSection";
import AddressSection from "@/components/hr/forms/AddressSection";
import ContactSection from "@/components/hr/forms/ContactSection";
import FamilySection from "@/components/hr/forms/FamilySection";
import DocumentsSection from "@/components/hr/forms/DocumentsSection";
import JobHistoriesSection from "@/components/hr/forms/JobHistoriesSection";

type Opt = { id: string; name: string };

export default function NewEmployeeClient() {
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Opt[]>([]);
  const [designations, setDesignations] = useState<Opt[]>([]);
  const [optsErr, setOptsErr] = useState<string | null>(null);

  // Call the server action
  const { executeAsync: loadDropdowns, status: optsStatus } = useAction(getHrDropdowns);

  useEffect(() => {
    (async () => {
      try {
        setOptsErr(null);
        const res = await loadDropdowns();
        if (res?.data?.ok) {
          setDepartments(res.data.departments ?? []);
          setDesignations(res.data.designations ?? []);
        } else {
          setOptsErr("Failed to load dropdown options.");
        }
      } catch (e: any) {
        setOptsErr(e?.message || "Failed to load dropdown options.");
      }
    })();
    // we want this only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Create Employee</h1>

      <div className="rounded-lg border p-4">
        {optsErr ? (
          <p className="text-destructive text-sm">
            Couldn&apos;t load dropdown data: {optsErr}
          </p>
        ) : null}
        {optsStatus === "executing" ? (
          <p className="text-sm text-muted-foreground">Loading department & designation…</p>
        ) : null}

        <EmployeeCoreSection
          mode="create"
          onCreated={(id) => setEmployeeId(id)}
          departments={departments}
          designations={designations}
        />
      </div>

      {employeeId ? (
        <>
          <IdentitySection employeeId={employeeId} />
          <PersonalSection employeeId={employeeId} />
          <AddressSection employeeId={employeeId} />
          <ContactSection employeeId={employeeId} />
          <FamilySection employeeId={employeeId} />

          <EducationsSection employeeId={employeeId} />
          <DocumentsSection employeeId={employeeId} />
          <JobHistoriesSection employeeId={employeeId} />
        </>
      ) : (
        <p className="text-muted-foreground">
          Save the employee details to unlock other sections…
        </p>
      )}
    </div>
  );
}
