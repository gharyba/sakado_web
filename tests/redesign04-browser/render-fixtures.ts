import { readFile, mkdir, writeFile } from "node:fs/promises";
import {
  categories,
  renderDiscovery,
  renderEmptyAdventures,
} from "../redesign04/render";

async function main() {
  const paths = [
    "src/app/globals.css",
    "src/styles/company.css",
    "src/styles/cinematic.css",
    "src/styles/forest-environment.css",
    "src/components/home/home-words.module.css",
    "src/components/home/experience-discovery.module.css",
  ];
  const css = (await Promise.all(paths.map((p) => readFile(p, "utf8"))))
    .join("\n")
    .replace(/:global\(([^)]+)\)/g, "$1");
  await mkdir(".local/redesign04/fixtures", { recursive: true });
  for (const count of [0, 1, 7, 9]) {
    const items = categories(count).reverse();
    if (count === 9) {
      items[0].name =
        "Randonnée, exploration et découvertes côtières — " +
        "Échappée".repeat(12);
      items[0].description =
        "Texte français synthétique pour vérifier le retour à la ligne sans troncature. ".repeat(
          18,
        );
    }
    const content =
      (await renderDiscovery(items)) + (await renderEmptyAdventures());
    await writeFile(
      `.local/redesign04/fixtures/${count}.html`,
      `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synthetic component regression fixture</title><style>${css}</style></head><body><div class="s-company-site"><main><h1>Validation synthétique</h1>${content}</main></div></body></html>`,
    );
  }
}
main().catch(() => {
  console.error(
    "Synthetic discovery rendering failed; no private settings printed.",
  );
  process.exitCode = 1;
});
