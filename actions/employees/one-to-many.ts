"use server";

import "server-only";
import { prisma } from "@/lib/prisma";
import { adminActionClient } from "@/lib/safe-action/clients";
import {
  educationCreateSchema, educationUpdateSchema, educationDeleteSchema,
  jobHistoryCreateSchema, jobHistoryUpdateSchema, jobHistoryDeleteSchema,
} from "@/lib/validations/hr-sections";
import { Prisma, $Enums } from "@/generated/prisma/client";

/** Education */
export const createEducation = adminActionClient
  .schema(educationCreateSchema)
  .action(async ({ parsedInput }) => {
    const { employeeId, degree, institution, subject, degreeDoc } = parsedInput;

    const data: Prisma.EducationCreateInput = {
      employee: { connect: { id: employeeId } },
      degree: degree ?? null,
      institution: institution ?? null,
      subject: subject ?? null,
    };

    if (degreeDoc && degreeDoc.src && degreeDoc.format) {
      data.degreeDoc = {
        create: {
          name: "DEGREE",
          src: degreeDoc.src,
          format: degreeDoc.format as $Enums.DocumentFormat,
        },
      };
    }

    const e = await prisma.education.create({
      data,
      include: {
        degreeDoc: true,
      },
    });

    return {
      ok: true as const,
      id: e.id,
      education: e,
    };
  });

export const updateEducation = adminActionClient
  .schema(educationUpdateSchema)
  .action(async ({ parsedInput }) => {
    const { id, employeeId, degree, institution, subject, degreeDoc } =
      parsedInput;

    const data: Prisma.EducationUpdateInput = {
      degree: degree ?? null,
      institution: institution ?? null,
      subject: subject ?? null,
    };

    if (degreeDoc && degreeDoc.src && degreeDoc.format) {
      data.degreeDoc = {
        upsert: {
          update: {
            src: degreeDoc.src,
            format: degreeDoc.format as $Enums.DocumentFormat,
          },
          create: {
            name: "DEGREE",
            src: degreeDoc.src,
            format: degreeDoc.format as $Enums.DocumentFormat,
          },
        },
      };
    } else {
      // user removed doc in UI
      data.degreeDoc = { disconnect: true };
    }

    await prisma.education.update({
      where: { id },
      data,
    });

    return { ok: true as const };
  });

export const deleteEducation = adminActionClient
  .schema(educationDeleteSchema)
  .action(async ({ parsedInput }) => {
    await prisma.education.delete({ where: { id: parsedInput.id } });
    return { ok: true as const };
  });



/** JobHistory */
export const createJobHistory = adminActionClient
  .schema(jobHistoryCreateSchema)
  .action(async ({ parsedInput }) => {
    const j = await prisma.jobHistory.create({ data: parsedInput });
    return { ok: true as const, id: j.id };
  });

export const updateJobHistory = adminActionClient
  .schema(jobHistoryUpdateSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...data } = parsedInput;
    await prisma.jobHistory.update({ where: { id }, data });
    return { ok: true as const };
  });

export const deleteJobHistory = adminActionClient
  .schema(jobHistoryDeleteSchema)
  .action(async ({ parsedInput }) => {
    await prisma.jobHistory.delete({ where: { id: parsedInput.id } });
    return { ok: true as const };
  });


