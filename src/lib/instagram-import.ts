import type { Prisma } from "@prisma/client";
import { normalizeInstagramImport } from "./instagram-policy";
export async function importInstagramMedia(
  tx: Prisma.TransactionClient,
  values: string[],
) {
  const urls = normalizeInstagramImport(values);
  const last = await tx.instagramMedia.aggregate({
    _max: { displayOrder: true },
  });
  const result = await tx.instagramMedia.createMany({
    data: urls.map((instagramUrl, index) => ({
      instagramUrl,
      displayOrder: (last._max.displayOrder ?? -1) + index + 1,
    })),
    skipDuplicates: true,
  });
  return { imported: result.count, duplicates: values.length - result.count };
}
