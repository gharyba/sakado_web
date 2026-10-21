// Local derivatives only. Never imports the production media registry or database.
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

if (
  process.env.NODE_ENV === "production" ||
  process.env.STAGING_MODE === "true"
)
  throw new Error("Client preview preparation is local-only.");
const root = path.resolve(".local/client-demo");
const output = path.resolve(".local/client-preview");
for (const directory of [".local", root, output]) {
  await fs.mkdir(directory, { recursive: true });
  if ((await fs.lstat(directory)).isSymbolicLink())
    throw new Error("Private preview directories must not be links.");
}
const assets = [];
const sources = [];
const seen = new Set();
const team = [
  ["ben-beya-mohamed", "Ben Beya Mohamed", "Fondateur"],
  ["bouzrara-manel", "Bouzrara Manel", "Gérante"],
  ["aladin-jemni", "Aladin Jemni", "Graphiste / Animateur"],
  ["jad-tagougui", "Jad Tagougui", "Photographe / Vidéaste"],
  ["ayoub-hamza", "Ayoub Hamza", "Guitariste / Chanteur"],
];
// Visual curation of the supplied set. These are descriptions, never event claims.
const gallery = [
  ["840577722", "Un groupe au pied d’une montagne"],
  ["832925564", "Des véhicules et des participants dans les dunes"],
  ["838844362", "Un groupe devant une cascade"],
  ["838000645", "Un groupe réuni dans un campement"],
  ["836500427", "Des participants dans une forêt aux feuilles dorées"],
  ["833487753", "Un grand groupe au pied d’une falaise"],
  ["836161923", "Des participants réunis dans un jardin"],
  ["837395885", "Un groupe avec des drapeaux SOPAL en forêt"],
  ["841706777", "Des participants dans un paysage verdoyant"],
  ["836713593", "Un groupe près d’un cours d’eau rocheux"],
  ["836276318", "Des participants entourés de végétation"],
  ["838742897", "Un groupe réuni dans les dunes"],
];
const partners = [
  ["sopal", "SOPAL"],
  ["finlogik", "FINLOGIK"],
  ["belle rose", "Belle Rose Distribution"],
  ["creativas_logo", "Logo partenaire fourni — identité à confirmer"],
  ["الجمعية التونسية للمحامين الشبان", "الجمعية التونسية للمحامين الشبان"],
  ["الهيئة الوطنية للمحامين بتونس", "الهيئة الوطنية للمحامين بتونس"],
];
async function files(folder) {
  const directory = path.join(root, folder);
  if ((await fs.lstat(directory)).isSymbolicLink())
    throw new Error("Asset folders must not be links.");
  return (await fs.readdir(directory))
    .sort()
    .filter((name) => /\.(png|jpe?g|webp|avif)$/i.test(name));
}
async function add(folder, name, slot, label, alt, sizes) {
  const source = path.join(root, folder, name);
  const stat = await fs.lstat(source);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 25_000_000)
    throw new Error("Unsafe or oversized source asset.");
  const data = await fs.readFile(source);
  const hash = crypto.createHash("sha256").update(data).digest("hex");
  const metadata = await sharp(data, {
    limitInputPixels: 40_000_000,
  }).metadata();
  sources.push({
    source: `${folder}/${name}`,
    sha256: hash,
    bytes: data.length,
  });
  if (seen.has(hash)) return;
  seen.add(hash);
  const variants = [];
  for (const width of sizes) {
    const key = `${hash}-${width}`;
    const destination = path.join(output, `${key}.webp`);
    // Preserve aspect ratio and embedded credits; strip EXIF with Sharp defaults.
    const derivative = await sharp(data, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer();
    try {
      await fs.writeFile(destination, derivative, { flag: "wx" });
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      if (
        !(await fs.lstat(destination)).isFile() ||
        (await fs.lstat(destination)).isSymbolicLink()
      )
        throw new Error("Derivative link refused.");
      if (!(await fs.readFile(destination)).equals(derivative))
        throw new Error(
          "Existing derivative differs; preserve and review it before regenerating.",
        );
    }
    const dimensions = await sharp(derivative).metadata();
    variants.push({
      key,
      width: dimensions.width,
      height: dimensions.height,
      bytes: derivative.length,
    });
  }
  assets.push({
    slot,
    label,
    alt,
    width: metadata.width,
    height: metadata.height,
    variants,
  });
}
async function matching(folder, prefix) {
  const matches = (await files(folder)).filter((name) =>
    path.parse(name).name.toLowerCase().startsWith(prefix),
  );
  if (!matches.length)
    throw new Error(`Missing private ${folder} asset: ${prefix}`);
  return matches[0];
}
const hero = await files("hero");
if (hero.length !== 1)
  throw new Error(
    "Select exactly one hero in the private hero folder before preparation.",
  );
await add(
  "hero",
  hero[0],
  "hero",
  "Sakado",
  "Une côte rocheuse et une embarcation sur une mer turquoise",
  [750, 1440],
);
await add(
  "sakado-logo",
  await matching("sakado-logo", "logo-sakado-blanc"),
  "logo",
  "SAKADO SFAX",
  "SAKADO SFAX",
  [240],
);
for (const [index, [stem, name, role]] of team.entries())
  await add(
    "team",
    await matching("team", stem),
    `team-${index}`,
    name,
    `Portrait de ${name} — ${role}`,
    [480],
  );
for (const [index, [prefix, alt]] of gallery.entries())
  await add(
    "gallery",
    await matching("gallery", prefix),
    `gallery-${index}`,
    "",
    alt,
    [900, 1800],
  );
for (const [index, [stem, label]] of partners.entries())
  await add(
    "partners",
    await matching("partners", stem),
    `partner-${index}`,
    label,
    `Logo : ${label}`,
    [480],
  );
async function writeIndex(name, data) {
  const destination = path.join(output, name);
  const temporary = path.join(output, `${crypto.randomUUID()}.tmp`);
  await fs.writeFile(temporary, JSON.stringify(data, null, 2), { flag: "wx" });
  // Atomic replacement does not follow an existing symlink to another file.
  await fs.rename(temporary, destination);
}
await writeIndex("index.json", { version: 1, assets });
await writeIndex("source-inventory.json", sources);
console.log(
  `Private preview prepared: ${assets.length} assets; originals untouched. Output stays in .local/client-preview.`,
);
