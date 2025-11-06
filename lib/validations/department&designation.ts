import { z } from "zod";

/** Department */
export const departmentCreateSchema = z.object({
  name: z.string().min(2, "Department name is too short"),
});
export type DepartmentCreateValues = z.infer<typeof departmentCreateSchema>;

export const departmentUpdateSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(2, "Department name is too short"),
});
export type DepartmentUpdateValues = z.infer<typeof departmentUpdateSchema>;

export const departmentDeleteSchema = z.object({
  id: z.string().cuid(),
});
export type DepartmentDeleteValues = z.infer<typeof departmentDeleteSchema>;

/** Designation */
export const designationCreateSchema = z.object({
  name: z.string().min(2, "Designation name is too short"),
});
export type DesignationCreateValues = z.infer<typeof designationCreateSchema>;

export const designationUpdateSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(2, "Designation name is too short"),
});
export type DesignationUpdateValues = z.infer<typeof designationUpdateSchema>;

export const designationDeleteSchema = z.object({
  id: z.string().cuid(),
});
export type DesignationDeleteValues = z.infer<typeof designationDeleteSchema>;
