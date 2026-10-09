export function demoEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.DEMO_MODE === "true";
}
export function publicOrigin(value = process.env.SITE_URL): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.origin
      : null;
  } catch {
    return null;
  }
}
export function whatsappLink(number: string | null | undefined): string | null {
  if (!number || !/^\+?[1-9]\d{7,14}$/.test(number)) return null;
  return `https://wa.me/${number.replace("+", "")}`;
}
export function approvedImagePath(
  path: string | null | undefined,
): string | null {
  // First version accepts reviewed local assets only. Add explicit remotePatterns for a future trusted media host.
  return path &&
    (/^\/images\/[a-zA-Z0-9/_-]+\.(?:svg|png|jpe?g|webp|avif)$/.test(path) ||
      /^\/media\/[0-9a-f-]{36}\.webp$/.test(path))
    ? path
    : null;
}
export function safeSocialUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
