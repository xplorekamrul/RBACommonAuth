"use server";

import { prisma } from "@/lib/prisma";
import { adminActionClient } from "@/lib/safe-action/clients";
import { employeeCreateSchema } from "@/lib/validations/employees";
import { $Enums, Prisma } from "@/generated/prisma/client";

export const createEmployee = adminActionClient
  .schema(employeeCreateSchema)
  .action(async ({ parsedInput }) => {
    const { name, empId, joiningDate, contractType, departmentId, designationId } = parsedInput;

    const exists = await prisma.employee.findUnique({ where: { empId } });
    if (exists) return { ok: false as const, message: "Employee ID already exists." };

    const data: Prisma.EmployeeCreateInput = {
      name,
      empId,
      joiningDate,
      contractType: contractType as $Enums.ContractType,
      status: $Enums.EmploymentStatus.ACTIVE,
      department: departmentId ? { connect: { id: departmentId } } : undefined,
      designation: designationId ? { connect: { id: designationId } } : undefined,
    };

    const employee = await prisma.employee.create({
      data,
      select: {
        id: true, name: true, empId: true, joiningDate: true, contractType: true, status: true,
        department: { select: { id: true, name: true } },
        designation: { select: { id: true, name: true } },
      },
    });

    return { ok: true as const, employee };
  });
