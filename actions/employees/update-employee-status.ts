"use server";

import { prisma } from "@/lib/prisma";
import { superAdminActionClient } from "@/lib/safe-action/clients";
import { employeeStatusSchema } from "@/lib/validations/employees";
import { Prisma, $Enums } from "@/generated/prisma/client";

export const updateEmployeeStatus = superAdminActionClient
  .schema(employeeStatusSchema)
  .action(async ({ parsedInput }) => {
    const { id, status } = parsedInput;

    const data: Prisma.EmployeeUpdateInput = {
      status: status as $Enums.EmploymentStatus,
    };

    const employee = await prisma.employee.update({
      where: { id },
      data,
      select: {
        id: true, name: true, empId: true, status: true, contractType: true,
        department: { select: { id: true, name: true } },
        designation: { select: { id: true, name: true } },
      },
    });

    return { ok: true as const, employee };
  });
