import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EmployeeTable from "@/components/employees/EmployeeTable";

export default async function EmployeesPage() {
   const session = await auth();
   if (!session?.user) {
      return <div className="p-6">Unauthorized</div>;
   }
   // Fetch dropdown
   const [departments, designations] = await Promise.all([
      prisma.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
      prisma.designation.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
   ]);

   return (
      <main className="p-4 sm:p-6 space-y-4">
         <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Employee Management</h1>
            <p className="text-sm text-muted-foreground">Create, update and manage staff</p>
         </div>

         <EmployeeTable
            departments={departments}
            designations={designations}
         />
      </main>
   );
}
