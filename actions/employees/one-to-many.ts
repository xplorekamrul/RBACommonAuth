"use server";

import "server-only";
import { prisma } from "@/lib/prisma";
import { adminActionClient } from "@/lib/safe-action/clients";
import {
  educationCreateSchema, educationUpdateSchema, educationDeleteSchema,
  jobHistoryCreateSchema, jobHistoryUpdateSchema, jobHistoryDeleteSchema,
} from "@/lib/validations/hr-sections";

/** Education */
export const createEducation = adminActionClient
  .schema(educationCreateSchema)
  .action(async ({ parsedInput }) => {
    const e = await prisma.education.create({ data: parsedInput });
    return { ok: true as const, id: e.id };
  });

export const updateEducation = adminActionClient
  .schema(educationUpdateSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...data } = parsedInput;
    await prisma.education.update({ where: { id }, data });
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


