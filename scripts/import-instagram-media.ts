import { PrismaClient } from "@prisma/client";
import urls from "../src/data/instagram-media.json";
import { importInstagramMedia } from "../src/lib/instagram-import";
import { serializable } from "../src/lib/transactions";
async function main() {
  const db = new PrismaClient();
  try {
    const result = await serializable(db, (tx) =>
      importInstagramMedia(tx, urls),
    );
    console.log(
      JSON.stringify({
        ...result,
        supplied: urls.length,
        publishedByDefault: false,
      }),
    );
  } finally {
    await db.$disconnect();
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Import failed");
  process.exitCode = 1;
});
