"use server";

import { prisma } from "@/lib/prisma";
import { superAdminActionClient } from "@/lib/safe-action/clients";
import { updateUserStatusSchema } from "@/lib/validations/users";
import { Prisma, $Enums } from "@/generated/prisma/client";

export const updateUserStatus = superAdminActionClient
  .schema(updateUserStatusSchema)
  .action(async ({ parsedInput }) => {
    const { id, status } = parsedInput; 

    const data: Prisma.UserUpdateInput =
      status === "SUSPENDED"
        ? { status: status as $Enums.AccountStatus, suspendedAt: new Date() }
        : { status: status as $Enums.AccountStatus, suspendedAt: null };

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        suspendedAt: true,
      },
    });

    return { ok: true as const, user };
  });
