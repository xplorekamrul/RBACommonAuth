"use server";

import "server-only";
import { prisma } from "@/lib/prisma";
import { authActionClient, adminActionClient } from "@/lib/safe-action/clients";
import {
  employeeCreateSchema,
  employeeUpdateSchema,
  employeeStatusSchema,
  employeeListSchema,
} from "@/lib/validations/hr-sections";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";

function toDateOrNull(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === "string" && v.trim().length) return new Date(v);
  return null;
}

export const listEmployees = authActionClient
  .schema(employeeListSchema)
  .action(async ({ parsedInput }) => {
    const { page, pageSize, q, statuses, contracts, departmentId, designationId } = parsedInput;

    const and: Prisma.EmployeeWhereInput[] = [];
    if (q && q.trim()) {
      and.push({
        OR: [
          { name: { contains: q.trim(), mode: Prisma.QueryMode.insensitive } },
          { empId: { contains: q.trim(), mode: Prisma.QueryMode.insensitive } },
        ],
      });
    }
    if (statuses?.length) and.push({ status: { in: statuses as any } });
    if (contracts?.length) and.push({ contractType: { in: contracts as any } });
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

    const safeItems = items.map((it) => ({
      ...it,
      joiningDate: it.joiningDate ? it.joiningDate.toISOString().slice(0, 16) : null,
      createdAt: it.createdAt.toISOString(),
    }));

    return { ok: true as const, items: safeItems, total, page, pageSize };
  });

export const createEmployee = adminActionClient
  .schema(employeeCreateSchema)
  .action(async ({ parsedInput }) => {
    const employee = await prisma.employee.create({
      data: {
        name: parsedInput.name,
        empId: parsedInput.empId,
        joiningDate: toDateOrNull(parsedInput.joiningDate), 
        contractType: parsedInput.contractType as any,
        departmentId: parsedInput.departmentId ?? null,
        designationId: parsedInput.designationId ?? null,
      },
      select: { id: true },
    });
    return { ok: true as const, id: employee.id };
  });

export const updateEmployee = adminActionClient
  .schema(employeeUpdateSchema)
  .action(async ({ parsedInput }) => {
    await prisma.employee.update({
      where: { id: parsedInput.id },
      data: {
        name: parsedInput.name,
        empId: parsedInput.empId,
        joiningDate: toDateOrNull(parsedInput.joiningDate),
        contractType: parsedInput.contractType as any,
        departmentId: parsedInput.departmentId ?? null,
        designationId: parsedInput.designationId ?? null,
      },
    });
    return { ok: true as const };
  });

export const updateEmployeeStatus = adminActionClient
  .schema(employeeStatusSchema)
  .action(async ({ parsedInput }) => {
    const data: Prisma.EmployeeUpdateInput = {
      status: parsedInput.status as any,
    };
    await prisma.employee.update({ where: { id: parsedInput.id }, data });
    return { ok: true as const };
  });

export const getEmployeeDetail = authActionClient
  .schema(z.object({ id: z.string() })) 
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    const e = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        designation: true,
        identity: true,
        personal: true,
        address: true,
        contact: true,
        family: true,
        educations: true,
        documents: true,
        jobHistories: true,
      },
    });

    if (!e) return { ok: false as const, message: "Not found" };

    return { ok: true as const, employee: e };
  });
