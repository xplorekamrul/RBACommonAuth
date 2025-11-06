import { prisma } from "@/lib/prisma";
import DepartmentsSection from "@/components/hr/core/DepartmentsSection";
import DesignationsSection from "@/components/hr/core/DesignationsSection";

export const dynamic = "force-dynamic";

export default async function HrCorePage() {
  const [departments, designations] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.designation.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <main className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">HR Core</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DepartmentsSection initial={departments} />
        <DesignationsSection initial={designations} />
      </div>
    </main>
  );
}
