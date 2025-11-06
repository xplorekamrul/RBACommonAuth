"use client";

import { useState } from "react";
import EmployeeCoreSection from "@/components/hr/forms/EmployeeCoreSection";
import IdentitySection from "@/components/hr/forms/IdentitySection";
import EducationsSection from "@/components/hr/forms/EducationsSection";
import PersonalSection from "@/components/hr/forms/PersonalSection";
import AddressSection from "@/components/hr/forms/AddressSection";
import ContactSection from "@/components/hr/forms/ContactSection";
import FamilySection from "@/components/hr/forms/FamilySection";
import DocumentsSection from "@/components/hr/forms/DocumentsSection";
import JobHistoriesSection from "@/components/hr/forms/JobHistoriesSection";


export default function NewEmployeeClient() {
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Create Employee</h1>

      {/* 1) Employee core (must be saved first) */}
      <EmployeeCoreSection mode="create" onCreated={(id) => setEmployeeId(id)} />

      {/* Locked until employee exists */}
      {employeeId ? (
        <>
          <IdentitySection  employeeId={employeeId} />
          <PersonalSection  employeeId={employeeId} />
          <AddressSection  employeeId={employeeId} />
          <ContactSection   employeeId={employeeId} />
          <FamilySection    employeeId={employeeId} />

          <EducationsSection   employeeId={employeeId} />
          <DocumentsSection   employeeId={employeeId} />
          <JobHistoriesSection employeeId={employeeId} />
        </>
      ) : (
        <p className="text-muted-foreground">Save the employee details to unlock other sections…</p>
      )}
    </div>
  );
}
