import "server-only";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
export interface MediaStorage {
  put(bytes: Buffer): Promise<string>;
  read(key: string): Promise<Buffer>;
  remove(key: string): Promise<void>;
}
function localPath(key: string) {
  if (!/^[0-9a-f-]{36}\.webp$/.test(key)) throw Error("Invalid media key");
  return resolve(process.env.MEDIA_LOCAL_DIR ?? "uploads", key);
}
export const localStorage: MediaStorage = {
  async put(bytes) {
    const key = randomUUID() + ".webp";
    await mkdir(resolve(/* turbopackIgnore: true */ process.env.MEDIA_LOCAL_DIR ?? "uploads"), {
      recursive: true,
    });
    await writeFile(/* turbopackIgnore: true */ localPath(key), bytes, { flag: "wx" });
    return "/media/" + key;
  },
  async read(key) {
    return readFile(/* turbopackIgnore: true */ localPath(key));
  },
  async remove(key) {
    await unlink(/* turbopackIgnore: true */ localPath(key));
  },
};
export function storage() {
  if (process.env.MEDIA_STORAGE && process.env.MEDIA_STORAGE !== "local")
    throw Error("Configured storage adapter is unavailable");
  return localStorage;
}
export async function normalizeImage(file: File) {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    !/^.+\.(jpe?g|png|webp)$/i.test(file.name) ||
    file.size > 10 * 1024 * 1024 ||
    file.size === 0
  )
    throw Error("Choisissez une image JPEG, PNG ou WebP de 10 Mo maximum.");
  const source = Buffer.from(await file.arrayBuffer());
  const processor = sharp(source, {
    limitInputPixels: 40_000_000,
    animated: false,
  });
  const metadata = await processor.metadata();
  if (!["jpeg", "png", "webp"].includes(metadata.format ?? ""))
    throw Error("Format d’image non autorisé.");
  return processor
    .rotate()
    .resize({
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toBuffer();
}
