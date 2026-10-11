/** Index suppression is not authentication or a publication authorization. */
export function stagingEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.STAGING_MODE === "true";
}

/** Rehearsal tooling owns a fresh cluster; it never accepts a supplied target URL. */
export function rehearsalTargetAllowed(
  value: string,
  database: "sakado_rehearsal" | "sakado_restore",
): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "postgresql:" &&
      url.hostname === "127.0.0.1" &&
      url.port === "55438" &&
      url.username === "phase07_test" &&
      !!url.password &&
      url.pathname === "/" + database &&
      !url.hash &&
      [...url.searchParams.keys()].every((key) => key === "schema") &&
      url.searchParams.getAll("schema").length <= 1 &&
      (!url.searchParams.has("schema") ||
        url.searchParams.get("schema") === "public")
    );
  } catch {
    return false;
  }
}

export function relativeStoragePathSafe(value: string): boolean {
  const parts = value.replaceAll("\\", "/").split("/");
  return (
    parts[0] === ".local" &&
    parts[1] === "phase07" &&
    parts.length >= 4 &&
    parts.every(
      (part) => !!part && part !== "." && part !== ".." && !part.includes(":"),
    )
  );
}
