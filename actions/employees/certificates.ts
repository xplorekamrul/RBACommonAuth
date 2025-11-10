"use server";

import "server-only";
import { prisma } from "@/lib/prisma";
import { adminActionClient } from "@/lib/safe-action/clients";
import { certificateUpsertSchema } from "@/lib/validations/hr-sections";
import { Prisma, $Enums } from "@/generated/prisma/client";

export const upsertCertificate = adminActionClient
  .schema(certificateUpsertSchema)
  .action(async ({ parsedInput }) => {
    const { employeeId, certificateId, name, details, certificateDoc } =
      parsedInput;

    const safeName =
      (name && name.trim().length > 0 ? name.trim() : "Certificate") ?? "Certificate";

    const createData: Prisma.CertificateCreateInput = {
      employee: { connect: { id: employeeId } },
      name: safeName,
      details: details ?? null,
    };

    if (certificateDoc && certificateDoc.src && certificateDoc.format) {
      createData.certificateDoc = {
        create: {
          name: "CERTIFICATE",
          src: certificateDoc.src,
          format: certificateDoc.format as $Enums.DocumentFormat,
        },
      };
    }

    const updateData: Prisma.CertificateUpdateInput = {
      name: safeName,
      details: details ?? null,
    };

    if (certificateDoc && certificateDoc.src && certificateDoc.format) {
      updateData.certificateDoc = {
        upsert: {
          update: {
            src: certificateDoc.src,
            format: certificateDoc.format as $Enums.DocumentFormat,
          },
          create: {
            name: "CERTIFICATE",
            src: certificateDoc.src,
            format: certificateDoc.format as $Enums.DocumentFormat,
          },
        },
      };
    } else {
      updateData.certificateDoc = { disconnect: true };
    }

    let cert;

    if (certificateId) {
      cert = await prisma.certificate.update({
        where: { id: certificateId },
        data: updateData,
        include: { certificateDoc: true },
      });
    } else {
      cert = await prisma.certificate.create({
        data: createData,
        include: { certificateDoc: true },
      });
    }

    return { ok: true as const, certificate: cert };
  });
