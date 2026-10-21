import { randomBytes } from "node:crypto";

// No .env loading, fixtures, files, network calls or database queries.
async function main() {
  if (process.versions.node.split(".")[0] !== "24")
    throw new Error("Node 24 required");
  if (process.argv.includes("--linux") && process.platform !== "linux")
    throw new Error("Linux required");
  const [{ default: sharp }, argon2, { Prisma, PrismaClient }] =
    await Promise.all([
      import("sharp"),
      import("argon2"),
      import("@prisma/client"),
    ]);
  const image = await sharp({
    create: { width: 3, height: 2, channels: 3, background: "#163e35" },
  })
    .webp()
    .toBuffer();
  const decoded = await sharp(image).metadata();
  if (decoded.format !== "webp" || decoded.width !== 3 || decoded.height !== 2)
    throw new Error("Sharp encode/decode failed");
  const password = randomBytes(24).toString("base64url");
  const digest = await argon2.hash(password, { type: argon2.argon2id });
  if (
    !(await argon2.verify(digest, password)) ||
    (await argon2.verify(digest, password + "-incorrect"))
  )
    throw new Error("Argon2 verification failed");
  // Construction is not a Prisma engine/query test. Disposable integration does that.
  const client = new PrismaClient({
    datasourceUrl: "postgresql://validation:dummy@127.0.0.1:9/unavailable",
  });
  await client.$disconnect();
  console.log(
    JSON.stringify({
      node: process.versions.node,
      platform: process.platform,
      arch: process.arch,
      sharpWebpRoundTrip: true,
      argon2idVerify: true,
      prismaClient: Prisma.prismaVersion.client,
      prismaConstructed: true,
      databaseQueries: false,
    }),
  );
}
main().catch(() => {
  console.error(
    "Native runtime check failed. Verify Node/platform and installed native dependencies; no settings or secret values printed.",
  );
  process.exitCode = 1;
});
