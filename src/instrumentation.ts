import { productionEnvironmentIssues } from "./lib/production-env";
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const issues = productionEnvironmentIssues(process.env);
  if (issues.length)
    throw new Error("Production configuration invalid: " + issues.join(" "));
}
