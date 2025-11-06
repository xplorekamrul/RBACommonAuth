"use server";

import "server-only";
import { prisma } from "@/lib/prisma";
import { adminActionClient } from "@/lib/safe-action/clients";
import {
  identityUpsertSchema,
  personalUpsertSchema,
  addressUpsertSchema,
  contactUpsertSchema,
  familyUpsertSchema,
} from "@/lib/validations/hr-sections";

/** Identity upsert */
export const upsertIdentity = adminActionClient
  .schema(identityUpsertSchema)
  .action(async ({ parsedInput }) => {
    const { employeeId, ...rest } = parsedInput;
    await prisma.identity.upsert({
      where: { employeeId },
      create: { employeeId, ...rest },
      update: { ...rest },
    });
    return { ok: true as const };
  });

/** Personal upsert */
export const upsertPersonal = adminActionClient
  .schema(personalUpsertSchema)
  .action(async ({ parsedInput }) => {
    const { employeeId, ...rest } = parsedInput;
    await prisma.personal.upsert({
      where: { employeeId },
      create: { employeeId, ...rest },
      update: { ...rest },
    });
    return { ok: true as const };
  });

/** Address upsert */
export const upsertAddress = adminActionClient
  .schema(addressUpsertSchema)
  .action(async ({ parsedInput }) => {
    const { employeeId, ...rest } = parsedInput;
    await prisma.address.upsert({
      where: { employeeId },
      create: { employeeId, ...rest },
      update: { ...rest },
    });
    return { ok: true as const };
  });

/** Contact upsert */
export const upsertContact = adminActionClient
  .schema(contactUpsertSchema)
  .action(async ({ parsedInput }) => {
    const { employeeId, ...rest } = parsedInput;
    await prisma.contact.upsert({
      where: { employeeId },
      create: { employeeId, ...rest },
      update: { ...rest },
    });
    return { ok: true as const };
  });

/** Family upsert */
export const upsertFamily = adminActionClient
  .schema(familyUpsertSchema)
  .action(async ({ parsedInput }) => {
    const { employeeId, ...rest } = parsedInput;
    await prisma.family.upsert({
      where: { employeeId },
      create: { employeeId, ...rest },
      update: { ...rest },
    });
    return { ok: true as const };
  });
