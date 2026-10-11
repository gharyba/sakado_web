export function requestOriginAllowed(
  origin: string | null,
  host: string | null,
  protocol: string,
  configured: (string | undefined)[] = [],
): boolean {
  if (!origin || !host) return false;
  try {
    let expectedProtocol = protocol;
    for (const value of configured) {
      if (!value) continue;
      const url = new URL(value);
      if (url.host === host) expectedProtocol = url.protocol;
    }
    const parsed = new URL(origin);
    return (
      !parsed.username &&
      !parsed.password &&
      parsed.origin === origin &&
      parsed.host === host &&
      ["http:", "https:"].includes(parsed.protocol) &&
      parsed.protocol === expectedProtocol
    );
  } catch {
    return false;
  }
}
