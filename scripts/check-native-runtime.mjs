import { randomBytes } from "node:crypto";

// No .env loading, fixtures, files, network calls or database queries.
async function main() {
  if (process.argv.slice(2).some((arg) => arg !== "--linux"))
    throw new Error("Unsupported native check argument");
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
    create: { width: 3, height: 2, channels: 3, background: "#14233d" },
  })
    .webp({ lossless: true })
    .toBuffer();
  // Metadata parsing does not exercise the WebP pixel decoder.
  const { data: pixels, info } = await sharp(image)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (
    info.width !== 3 ||
    info.height !== 2 ||
    info.channels !== 3 ||
    pixels.length !== 18 ||
    !pixels.every((value, index) => value === [0x14, 0x23, 0x3d][index % 3])
  )
    throw new Error("Sharp pixel encode/decode failed");
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
  // Whitelist ABI metadata only. The full diagnostic report includes private data.
  const { glibcVersionRuntime } = process.report.getReport().header;
  console.log(
    JSON.stringify({
      node: process.versions.node,
      platform: process.platform,
      arch: process.arch,
      openssl: process.versions.openssl,
      nodeModuleAbi: process.versions.modules,
      libc:
        process.platform === "linux"
          ? {
              family: glibcVersionRuntime ? "glibc" : "non-glibc",
              version: glibcVersionRuntime ?? null,
            }
          : { family: "not-applicable", version: null },
      libvips: sharp.versions.vips,
      sharpWebpRoundTrip: true,
      sharpDecodedPixelBytes: pixels.length,
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
