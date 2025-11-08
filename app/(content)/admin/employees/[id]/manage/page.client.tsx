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

type Opt = { id: string; name: string };

export default function ManageEmployeeClient({ initial }: { initial: any }) {
  if (!initial) return <p className="text-destructive">Employee not found</p>;

  const e = initial;

  const joiningDate =
    e.joiningDate ? new Date(e.joiningDate).toISOString().slice(0, 10) : "";


  const departments: Opt[] =
    initial.departments ??
    (e.department ? [{ id: e.department.id, name: e.department.name }] : []);

  const designations: Opt[] =
    initial.designations ??
    (e.designation ? [{ id: e.designation.id, name: e.designation.name }] : []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Manage Employee</h1>

      <EmployeeCoreSection
        mode="edit"
        employee={{
          id: e.id,
          name: e.name,
          empId: e.empId,
          joiningDate,
          contractType: e.contractType,
          departmentId: e.departmentId ?? e.department?.id ?? undefined,
          designationId: e.designationId ?? e.designation?.id ?? undefined,
        }}
        departments={departments}
        designations={designations}
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
