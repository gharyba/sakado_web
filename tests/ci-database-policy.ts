export function ciDatabaseUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  if (
    env.CI !== "true" ||
    env.GITHUB_ACTIONS !== "true" ||
    env.RUNNER_OS !== "Linux" ||
    env.SAKADO_CI_DATABASE !== "disposable-service"
  )
    throw Error(
      "CI service database requires the explicit GitHub Linux test contract.",
    );
  const value = env.DATABASE_URL ?? "";
  const url = new URL(value);
  if (
    url.protocol !== "postgresql:" ||
    url.hostname !== "127.0.0.1" ||
    url.port !== "55435" ||
    url.pathname !== "/sakado_test" ||
    url.username !== "sakado_ci" ||
    url.password !== "ci-disposable-only"
  )
    throw Error(
      "Refusing a database outside the disposable CI service contract.",
    );
  return value;
}
