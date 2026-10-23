import { registerHooks } from "node:module";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { companyActivities } from "../../src/data/confirmed/company";
import type { Experience } from "../../src/lib/types";

// Test-only Node renderer: stable local class names, never loaded by the application.
registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith(".module.css"))
      return {
        format: "module",
        shortCircuit: true,
        source:
          "export default new Proxy({}, { get: (_, key) => String(key) });",
      };
    return nextLoad(url, context);
  },
});
export function categories(count = 7): Experience[] {
  return Array.from({ length: count }, (_, index) => {
    const item = companyActivities[index % companyActivities.length];
    return {
      ...item,
      id: `synthetic-${index}`,
      slug: index < 7 ? item.slug : `synthetic-${index}`,
      enabled: true,
      demo: false,
    };
  });
}
export async function renderDiscovery(items: readonly Experience[]) {
  const { ExperienceDiscovery } =
    await import("../../src/components/home/experience-discovery");
  return renderToStaticMarkup(
    createElement(ExperienceDiscovery, { categories: items }),
  );
}
export async function renderEmptyAdventures() {
  const { UpcomingAdventures } =
    await import("../../src/components/home/upcoming-adventures");
  return renderToStaticMarkup(
    createElement(UpcomingAdventures, { events: [], demo: false }),
  );
}
