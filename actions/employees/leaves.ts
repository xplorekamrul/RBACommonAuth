// actions/employees/leaves.ts
"use server";

import "server-only";
import { prisma } from "@/lib/prisma";
import { adminActionClient, authActionClient } from "@/lib/safe-action/clients";
import { leaveUpsertSchema, leaveDeleteSchema } from "@/lib/validations/hr-sections";
import { Prisma, $Enums } from "@/generated/prisma/client";
import { z } from "zod";

export const upsertLeave = adminActionClient
  .schema(leaveUpsertSchema)
  .action(async ({ parsedInput }) => {
    const {
      employeeId,
      leaveId,
      subject,
      body,
      status,
      applicationDoc,
      statusDoc,
    } = parsedInput;

    const safeStatus: $Enums.RequestStatus =
      (status as $Enums.RequestStatus | null | undefined) ??
      $Enums.RequestStatus.PENDING;

    const createData: Prisma.LeaveCreateInput = {
      employee: { connect: { id: employeeId } },
      subject: subject ?? null,
      body: body ?? null,
      status: safeStatus,
      statusAt: safeStatus !== $Enums.RequestStatus.PENDING ? new Date() : null,
    };

    if (applicationDoc && applicationDoc.src && applicationDoc.format) {
      createData.applicationDoc = {
        create: {
          name: "LEAVE_APPLICATION",
          src: applicationDoc.src,
          format: applicationDoc.format as $Enums.DocumentFormat,
        },
      };
    }

    if (statusDoc && statusDoc.src && statusDoc.format) {
      createData.statusDoc = {
        create: {
          name: "LEAVE_STATUS",
          src: statusDoc.src,
          format: statusDoc.format as $Enums.DocumentFormat,
        },
      };
    }

    const updateData: Prisma.LeaveUpdateInput = {
      subject: subject ?? null,
      body: body ?? null,
      status: safeStatus,
      statusAt: safeStatus !== $Enums.RequestStatus.PENDING ? new Date() : null,
    };

    if (applicationDoc && applicationDoc.src && applicationDoc.format) {
      updateData.applicationDoc = {
        upsert: {
          update: {
            src: applicationDoc.src,
            format: applicationDoc.format as $Enums.DocumentFormat,
          },
          create: {
            name: "LEAVE_APPLICATION",
            src: applicationDoc.src,
            format: applicationDoc.format as $Enums.DocumentFormat,
          },
        },
      };
    } else {
      updateData.applicationDoc = { disconnect: true };
    }

    if (statusDoc && statusDoc.src && statusDoc.format) {
      updateData.statusDoc = {
        upsert: {
          update: {
            src: statusDoc.src,
            format: statusDoc.format as $Enums.DocumentFormat,
          },
          create: {
            name: "LEAVE_STATUS",
            src: statusDoc.src,
            format: statusDoc.format as $Enums.DocumentFormat,
          },
        },
      };
    } else {
      updateData.statusDoc = { disconnect: true };
    }

    let leave;

    if (leaveId) {
      leave = await prisma.leave.update({
        where: { id: leaveId },
        data: updateData,
        include: {
          applicationDoc: true,
          statusDoc: true,
        },
      });
    } else {
      leave = await prisma.leave.create({
        data: createData,
        include: {
          applicationDoc: true,
          statusDoc: true,
        },
      });
    }

    return { ok: true as const, leave };
  });

export const deleteLeave = adminActionClient
  .schema(leaveDeleteSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;
    await prisma.leave.delete({ where: { id } });
    return { ok: true as const };
  });

export const getEmployeeLeaves = authActionClient
  .schema(z.object({ employeeId: z.string().cuid() }))
  .action(async ({ parsedInput }) => {
    const { employeeId } = parsedInput;

    const leaves = await prisma.leave.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
      include: {
        applicationDoc: true,
        statusDoc: true,
      },
    });

    return { ok: true as const, leaves };
  });
