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
import { $Enums, Prisma } from "@/generated/prisma/client";

/** Identity upsert */
export const upsertIdentity = adminActionClient
  .schema(identityUpsertSchema)
  .action(async ({ parsedInput }) => {
    const { employeeId, nid, passport, nidDoc, passportDoc, cvDoc } = parsedInput;

    const createData: Prisma.IdentityCreateInput = {
      employee: { connect: { id: employeeId } },
      nid,
      passport: passport ?? null,
    };

    if (nidDoc && nidDoc.src && nidDoc.format) {
      createData.nidDoc = {
        create: {
          name: "NID",
          src: nidDoc.src,
          format: nidDoc.format as $Enums.DocumentFormat,
        },
      };
    }

    if (passportDoc && passportDoc.src && passportDoc.format) {
      createData.passportDoc = {
        create: {
          name: "PASSPORT",
          src: passportDoc.src,
          format: passportDoc.format as $Enums.DocumentFormat,
        },
      };
    }

    if (cvDoc && cvDoc.src && cvDoc.format) {
      createData.cvDoc = {
        create: {
          name: "CV",
          src: cvDoc.src,
          format: cvDoc.format as $Enums.DocumentFormat,
        },
      };
    }

    const updateData: Prisma.IdentityUpdateInput = {
      nid,
      passport: passport ?? null,
    };

    if (nidDoc && nidDoc.src && nidDoc.format) {
      updateData.nidDoc = {
        upsert: {
          update: {
            src: nidDoc.src,
            format: nidDoc.format as $Enums.DocumentFormat,
          },
          create: {
            name: "NID",
            src: nidDoc.src,
            format: nidDoc.format as $Enums.DocumentFormat,
          },
        },
      };
    } else {
      updateData.nidDoc = { disconnect: true };
    }

    if (passportDoc && passportDoc.src && passportDoc.format) {
      updateData.passportDoc = {
        upsert: {
          update: {
            src: passportDoc.src,
            format: passportDoc.format as $Enums.DocumentFormat,
          },
          create: {
            name: "PASSPORT",
            src: passportDoc.src,
            format: passportDoc.format as $Enums.DocumentFormat,
          },
        },
      };
    } else {
      updateData.passportDoc = { disconnect: true };
    }

    if (cvDoc && cvDoc.src && cvDoc.format) {
      updateData.cvDoc = {
        upsert: {
          update: {
            src: cvDoc.src,
            format: cvDoc.format as $Enums.DocumentFormat,
          },
          create: {
            name: "CV",
            src: cvDoc.src,
            format: cvDoc.format as $Enums.DocumentFormat,
          },
        },
      };
    } else {
      updateData.cvDoc = { disconnect: true };
    }

    await prisma.identity.upsert({
      where: { employeeId },
      create: createData,
      update: updateData,
    });

    return { ok: true as const };
  });


/** Personal upsert */
export const upsertPersonal = adminActionClient
  .schema(personalUpsertSchema)
  .action(async ({ parsedInput }) => {
    const { employeeId, birthDate, ...rest } = parsedInput;

    // birthDate comes as "YYYY-MM-DD" | null from the form
    const birthDateValue = birthDate ? new Date(birthDate) : null;

    await prisma.personal.upsert({
      where: { employeeId },
      create: {
        employeeId,
        ...rest,
        birthDate: birthDateValue,
      },
      update: {
        ...rest,
        birthDate: birthDateValue,
      },
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
