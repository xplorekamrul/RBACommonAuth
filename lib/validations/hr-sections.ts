// lib/validations/hr-sections.ts
import "server-only";
import * as z from "zod";
import {
  EMPLOYMENT_STATUS, CONTRACT_TYPE, GENDER, BLOOD_GROUP, DOCUMENT_FORMAT, MARITAL_STATUS,
} from "@/lib/enums/enums";

/** Employee (core) */
export const employeeCreateSchema = z.object({
  name: z.string().min(2).max(120),
  empId: z.string().min(2).max(50),
  joiningDate: z.union([z.string().datetime(), z.date()]).optional().transform(v => typeof v === "string" ? new Date(v) : v),
  contractType: z.enum(CONTRACT_TYPE),
  departmentId: z.string().cuid().optional(),
  designationId: z.string().cuid().optional(),
});
export type EmployeeCreateValues = z.infer<typeof employeeCreateSchema>;

export const employeeUpdateSchema = employeeCreateSchema.extend({
  id: z.string().cuid(),
});
export const employeeStatusSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(EMPLOYMENT_STATUS),
});
export const employeeListSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  q: z.string().trim().optional(),
  statuses: z.array(z.enum(EMPLOYMENT_STATUS)).optional(),
  contracts: z.array(z.enum(CONTRACT_TYPE)).optional(),
  departmentId: z.string().cuid().optional(),
  designationId: z.string().cuid().optional(),
});


const DocSchema = z
  .object({
    src: z.string(),
    format: z.string().nullable(),
  })
  .nullable();

export const identityUpsertSchema = z.object({
  employeeId: z.string().min(1),
  nid: z.string().min(1, "NID is required"),
  passport: z.string().optional().nullable(),

  nidDoc: DocSchema,
  passportDoc: DocSchema,
  cvDoc: DocSchema,
});

export const personalUpsertSchema = z.object({
  employeeId: z.string().cuid(),
  fathersName: z.string().trim().optional().nullable(),
  mothersName: z.string().trim().optional().nullable(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional()
    .nullable(),
  gender: z.enum(GENDER).optional().nullable(),
  bloodGroup: z.enum(BLOOD_GROUP).optional().nullable(),
});

export const addressUpsertSchema = z.object({
  employeeId: z.string().cuid(),
  presentDistrict: z.string().trim().optional().nullable(),
  presentUpazila: z.string().trim().optional().nullable(),
  presentAddress: z.string().trim().optional().nullable(),
  permanentDistrict: z.string().trim().optional().nullable(),
  permanentUpazila: z.string().trim().optional().nullable(),
  permanentAddress: z.string().trim().optional().nullable(),
});

export const contactUpsertSchema = z.object({
  employeeId: z.string().cuid(),
  mobile: z.string().trim().optional().nullable(),
  email: z.string().email().optional().nullable(),
  emergencyContactName: z.string().trim().optional().nullable(),
  emergencyContactNumber: z.string().trim().optional().nullable(),
  emergencyContactRelation: z.string().trim().optional().nullable(),
});

export const familyUpsertSchema = z.object({
  employeeId: z.string().cuid(),
  maritalStatus: z.enum(MARITAL_STATUS),
  spouseName: z.string().trim().optional().nullable(),
  spouseOccupation: z.string().trim().optional().nullable(),
  noChildren: z.number().int().min(0).optional().nullable(),
  anniversary: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional()
    .nullable(), 
});

/** One-to-many: Education */
export const educationCreateSchema = z.object({
  employeeId: z.string().cuid(),
  degree: z.string().trim().optional().nullable(),
  institution: z.string().trim().optional().nullable(),
  subject: z.string().trim().optional().nullable(),
  degreeDoc: z
    .object({
      src: z.string(),
      format: z.string(), 
    })
    .nullable()
    .optional(),
});

export const educationUpdateSchema = educationCreateSchema.extend({
  id: z.string().cuid(),
});

export const educationDeleteSchema = z.object({ id: z.string().cuid() });
/** One-to-many: JobHistory */
export const jobHistoryCreateSchema = z.object({
  employeeId: z.string().cuid(),
  companyName: z.string().min(1),
  designation: z.string().min(1),
  startDate: z.union([z.string().date(), z.date()]).transform(v => typeof v === "string" ? new Date(v) : v),
  endDate: z.union([z.string().date(), z.date()]).optional().nullable().transform(v => !v ? null : (typeof v === "string" ? new Date(v) : v)),
});
export const jobHistoryUpdateSchema = jobHistoryCreateSchema.extend({
  id: z.string().cuid(),
});
export const jobHistoryDeleteSchema = z.object({ id: z.string().cuid() });


// certificates 

export const certificateUpsertSchema = z.object({
  employeeId: z.string().cuid(),
  certificateId: z.string().cuid().optional().nullable(),
  name: z.string().trim().optional().nullable(),
  details: z.string().trim().optional().nullable(),
  certificateDoc: z
    .object({
      src: z.string(),
      format: z.string(), 
    })
    .nullable()
    .optional(),
});

export const certificateDeleteSchema = z.object({
  id: z.string().cuid(),
});