"use server";

import { prisma } from "@/lib/prisma";
import { superAdminActionClient } from "@/lib/safe-action/clients";
import { updateUserPasswordSchema } from "@/lib/validations/users";
import { hashPassword } from "@/lib/hash";

export const updateUserPassword = superAdminActionClient
  .schema(updateUserPasswordSchema)
  .action(async ({ parsedInput }) => {
    const { id, password } = parsedInput;

    const pwd = await hashPassword(password);

    await prisma.user.update({
      where: { id },
      data: { password: pwd },
      select: { id: true },
    });

    return { ok: true as const };
  });
