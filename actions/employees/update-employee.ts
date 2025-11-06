"use server";

import { prisma } from "@/lib/prisma";
import { superAdminActionClient } from "@/lib/safe-action/clients";
import { employeeUpdateSchema } from "@/lib/validations/employees";
import { $Enums, Prisma } from "@/generated/prisma/client";

export const updateEmployee = superAdminActionClient
  .schema(employeeUpdateSchema)
  .action(async ({ parsedInput }) => {
    const { id, name, empId, joiningDate, contractType, departmentId, designationId } = parsedInput;

    const taken = await prisma.employee.findFirst({
      where: { empId, NOT: { id } },
      select: { id: true },
    });
    if (taken) return { ok: false as const, message: "Employee ID is already used by another employee." };

    const data: Prisma.EmployeeUpdateInput = {
      name,
      empId,
      joiningDate,
      contractType: contractType as $Enums.ContractType,
      department: departmentId
        ? { connect: { id: departmentId } }
        : { disconnect: true },
      designation: designationId
        ? { connect: { id: designationId } }
        : { disconnect: true },
    };

    const employee = await prisma.employee.update({
      where: { id },
      data,
      select: {
        id: true, name: true, empId: true, joiningDate: true, contractType: true, status: true,
        department: { select: { id: true, name: true } },
        designation: { select: { id: true, name: true } },
      },
    });

    return { ok: true as const, employee };
  });
