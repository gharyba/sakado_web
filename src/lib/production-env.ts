type Environment = Record<string, string | undefined>;
/** Checks configuration, not legal clearance, storage durability or connectivity. Never returns values. */
export function productionEnvironmentIssues(env: Environment): string[] {
  if (env.NODE_ENV !== "production" || env.DEMO_MODE === "true") return [];
  const issues: string[] = [];
  try {
    const url = new URL(env.DATABASE_URL ?? "");
    if (
      !["postgres:", "postgresql:"].includes(url.protocol) ||
      !url.hostname ||
      url.pathname.length < 2
    )
      issues.push("DATABASE_URL must identify a PostgreSQL database.");
  } catch {
    issues.push("DATABASE_URL must identify a PostgreSQL database.");
  }
  if (
    (env.AUTH_SECRET?.length ?? 0) < 32 ||
    /replace|placeholder|example|ci-only/i.test(env.AUTH_SECRET ?? "")
  )
    issues.push(
      "AUTH_SECRET must be a unique random secret of at least 32 characters.",
    );
  for (const key of ["SITE_URL", "ADMIN_URL"] as const) {
    if (key === "ADMIN_URL" && !env[key]) continue;
    try {
      const url = new URL(env[key] ?? "");
      if (
        url.protocol !== "https:" ||
        url.username ||
        url.password ||
        url.pathname !== "/" ||
        url.search ||
        url.hash
      )
        issues.push(`${key} must be an HTTPS origin.`);
    } catch {
      issues.push(`${key} must be an HTTPS origin.`);
    }
  }
  if (env.DEMO_MODE !== "false")
    issues.push(
      "DEMO_MODE must explicitly be false for operational production.",
    );
  if (env.TRUST_PROXY && !["true", "false"].includes(env.TRUST_PROXY))
    issues.push("TRUST_PROXY must be true or false.");
  if (env.MEDIA_STORAGE && env.MEDIA_STORAGE !== "local")
    issues.push("MEDIA_STORAGE adapter is not implemented.");
  return issues;
}
