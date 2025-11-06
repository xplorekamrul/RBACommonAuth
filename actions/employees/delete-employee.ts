"use server";

import { prisma } from "@/lib/prisma";
import { superAdminActionClient } from "@/lib/safe-action/clients";
import { employeeDeleteSchema } from "@/lib/validations/employees";

export const deleteEmployee = superAdminActionClient
  .schema(employeeDeleteSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    await prisma.employee.delete({ where: { id } });
    return { ok: true as const };
  });
