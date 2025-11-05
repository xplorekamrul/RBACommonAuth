"use server";

import { prisma } from "@/lib/prisma";
import { superAdminActionClient } from "@/lib/safe-action/clients";
import { deleteUserSchema } from "@/lib/validations/users";

export const deleteUser = superAdminActionClient
  .schema(deleteUserSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    await prisma.user.delete({ where: { id } });
    return { ok: true as const };
  });
