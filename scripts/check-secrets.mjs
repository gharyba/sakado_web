import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// High-confidence guard, not an exhaustive secret/history scanner. Never prints matched values.
const files = execFileSync(
  process.env.SAKADO_GIT_PATH || "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);
const issues = [];
for (const file of files) {
  if (
    (/(^|\/)\.env(?:\.|$)/.test(file) && !/\.example$/.test(file)) ||
    /^(?:SAKADO-MEDIA|uploads|\.local)\//.test(file)
  ) {
    issues.push({ file, reason: "private path tracked" });
    continue;
  }
  const bytes = readFileSync(file);
  if (bytes.includes(0)) continue;
  const text = bytes.toString("utf8");
  if (
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text) ||
    /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,}|AKIA[0-9A-Z]{16})\b/.test(
      text,
    )
  )
    issues.push({ file, reason: "potential credential material" });
  for (const match of text.matchAll(/postgres(?:ql)?:\/\/[^\s"'`]+/g)) {
    try {
      const url = new URL(match[0]);
      if (
        url.password &&
        !/dummy|replace|validation|test|disposable|example/i.test(
          decodeURIComponent(url.password),
        )
      )
        issues.push({
          file,
          reason: "database credential requires private review",
        });
    } catch {
      /* Template/interpolation, not a concrete URL. */
    }
  }
}
if (issues.length) {
  for (const issue of issues) console.error(`${issue.file}: ${issue.reason}`);
  process.exitCode = 1;
} else
  console.log(
    `Tracked/proposed-source secret guard passed (${files.length} files); no secret values printed.`,
  );
