"use server";

import { prisma } from "@/lib/prisma";
import {
  departmentCreateSchema,
  departmentDeleteSchema,
  departmentUpdateSchema,
  designationCreateSchema,
  designationDeleteSchema,
  designationUpdateSchema,
} from "@/lib/validations/department&designation";
import { adminActionClient } from "@/lib/safe-action/clients";

/* ===================== DEPARTMENTS ===================== */

export const createDepartment = adminActionClient
  .schema(departmentCreateSchema)
  .action(async ({ parsedInput }) => {
    const dep = await prisma.department.create({
      data: { name: parsedInput.name.trim() },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
    return { ok: true as const, id: dep.id, item: dep };
  });

export const updateDepartment = adminActionClient
  .schema(departmentUpdateSchema)
  .action(async ({ parsedInput }) => {
    const dep = await prisma.department.update({
      where: { id: parsedInput.id },
      data: { name: parsedInput.name.trim() },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
    return { ok: true as const, item: dep };
  });

export const deleteDepartment = adminActionClient
  .schema(departmentDeleteSchema)
  .action(async ({ parsedInput }) => {
    await prisma.department.delete({ where: { id: parsedInput.id } });
    return { ok: true as const };
  });

/** Optional fetcher for RSC usage if you prefer actions; not required */
export async function getDepartments() {
  return prisma.department.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });
}

/* ===================== DESIGNATIONS ===================== */

export const createDesignation = adminActionClient
  .schema(designationCreateSchema)
  .action(async ({ parsedInput }) => {
    const des = await prisma.designation.create({
      data: { name: parsedInput.name.trim() },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
    return { ok: true as const, id: des.id, item: des };
  });

export const updateDesignation = adminActionClient
  .schema(designationUpdateSchema)
  .action(async ({ parsedInput }) => {
    const des = await prisma.designation.update({
      where: { id: parsedInput.id },
      data: { name: parsedInput.name.trim() },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
    return { ok: true as const, item: des };
  });

export const deleteDesignation = adminActionClient
  .schema(designationDeleteSchema)
  .action(async ({ parsedInput }) => {
    await prisma.designation.delete({ where: { id: parsedInput.id } });
    return { ok: true as const };
  });

export async function getDesignations() {
  return prisma.designation.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });
}
