"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "@/lib/safe-action/clients";
import { employeeListSchema } from "@/lib/validations/employees";
import { Prisma, $Enums } from "@/generated/prisma/client";

export const listEmployees = authActionClient
  .schema(employeeListSchema)
  .action(async ({ parsedInput }) => {
    const { page, pageSize, q, statuses, contracts, departmentId, designationId } = parsedInput;

    const and: Prisma.EmployeeWhereInput[] = [];

    if (q && q.trim().length) {
      and.push({
        OR: [
          { name: { contains: q.trim(), mode: Prisma.QueryMode.insensitive } },
          { empId: { contains: q.trim(), mode: Prisma.QueryMode.insensitive } },
        ],
      });
    }

    if (statuses?.length) and.push({ status: { in: statuses as $Enums.EmploymentStatus[] } });
    if (contracts?.length) and.push({ contractType: { in: contracts as $Enums.ContractType[] } });
    if (departmentId) and.push({ departmentId });
    if (designationId) and.push({ designationId });

    const where: Prisma.EmployeeWhereInput = and.length ? { AND: and } : {};

    const [items, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          empId: true,
          joiningDate: true,
          contractType: true,
          status: true,
          department: { select: { id: true, name: true } },
          designation: { select: { id: true, name: true } },
          createdAt: true,
        },
      }),
      prisma.employee.count({ where }),
    ]);

    return { ok: true as const, items, total, page, pageSize };
  });
