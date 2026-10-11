import { db } from "@/lib/db";
import { demoEnabled } from "@/lib/content-policy";
import { productionEnvironmentIssues } from "@/lib/production-env";
import { operationalFailure } from "@/lib/operational-log";
export const dynamic = "force-dynamic";
export async function GET() {
  const headers = {
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
  };
  if (demoEnabled())
    return Response.json({ status: "ok", mode: "demo" }, { headers });
  try {
    if (productionEnvironmentIssues(process.env).length)
      throw Error("configuration");
    await db.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok" }, { headers });
  } catch {
    operationalFailure("health");
    return Response.json({ status: "unavailable" }, { status: 503, headers });
  }
}
