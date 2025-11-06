import * as z from "zod";
import { $Enums } from "@/generated/prisma/client";

export const statusEnum = z.nativeEnum($Enums.EmploymentStatus);
export const contractEnum = z.nativeEnum($Enums.ContractType);

const zDateInput = z
  .union([z.string().datetime(), z.date()])
  .optional()
  .transform((v) => (typeof v === "string" ? new Date(v) : v));

export const employeeCreateSchema = z.object({
  name: z.string().min(2).max(120),
  empId: z.string().min(2).max(50),
  joiningDate: zDateInput, // normalized to Date | undefined
  contractType: contractEnum,
  departmentId: z.string().cuid().optional(),
  designationId: z.string().cuid().optional(),
});
export type EmployeeCreateValues = z.infer<typeof employeeCreateSchema>;

export const employeeUpdateSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(2).max(120),
  empId: z.string().min(2).max(50),
  joiningDate: zDateInput, // normalized to Date | undefined
  contractType: contractEnum,
  departmentId: z.string().cuid().optional(),
  designationId: z.string().cuid().optional(),
});

export const employeeStatusSchema = z.object({
  id: z.string().cuid(),
  status: statusEnum,
});

export const employeeDeleteSchema = z.object({
  id: z.string().cuid(),
});

export const employeeListSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  q: z.string().trim().optional(),
  statuses: z.array(statusEnum).optional(),
  contracts: z.array(contractEnum).optional(),
  departmentId: z.string().cuid().optional(),
  designationId: z.string().cuid().optional(),
});
