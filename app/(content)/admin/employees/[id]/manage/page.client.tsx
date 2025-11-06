"use client";

import EmployeeCoreSection from "@/components/hr/forms/EmployeeCoreSection";
import IdentitySection from "@/components/hr/forms/IdentitySection";
import EducationsSection from "@/components/hr/forms/EducationsSection";
import PersonalSection from "@/components/hr/forms/PersonalSection";
import AddressSection from "@/components/hr/forms/AddressSection";
import ContactSection from "@/components/hr/forms/ContactSection";
import FamilySection from "@/components/hr/forms/FamilySection";
import DocumentsSection from "@/components/hr/forms/DocumentsSection";
import JobHistoriesSection from "@/components/hr/forms/JobHistoriesSection";

export default function ManageEmployeeClient({ initial }: { initial: any }) {
  if (!initial) return <p className="text-destructive">Employee not found</p>;

  const e = initial; 

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Manage Employee</h1>

      <EmployeeCoreSection
        mode="edit"
        employee={{
          id: e.id,
          name: e.name,
          empId: e.empId,
          joiningDate: e.joiningDate
            ? new Date(e.joiningDate).toISOString().slice(0, 16)
            : "",
          contractType: e.contractType,
          departmentId: e.departmentId || "",
          designationId: e.designationId || "",
        }}
      />

      {/* One-to-one tables */}
      <IdentitySection employeeId={e.id} initial={e.identity || null} />
      <PersonalSection employeeId={e.id} initial={e.personal || null} />
      <AddressSection employeeId={e.id} initial={e.address || null} />
      <ContactSection employeeId={e.id} initial={e.contact || null} />
      <FamilySection employeeId={e.id} initial={e.family || null} />

      {/* One-to-many tables */}
      <EducationsSection employeeId={e.id} initial={e.educations || []} />
      <DocumentsSection employeeId={e.id} initial={e.documents || []} />
      <JobHistoriesSection employeeId={e.id} initial={e.jobHistories || []} />
    </div>
  );
}
