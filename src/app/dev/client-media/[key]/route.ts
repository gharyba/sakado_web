import {
  clientDemoHeaders,
  clientDemoRequestAllowed,
} from "@/lib/client-demo-policy";
import { readClientDemoImage } from "@/lib/client-demo";

export const runtime = "nodejs";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const denied = () =>
    new Response(null, { status: 404, headers: clientDemoHeaders });
  // Check before reading params or touching the private filesystem.
  if (!clientDemoRequestAllowed(request.headers)) return denied();
  try {
    const { key } = await params;
    if (!/^[a-f0-9]{64}-(240|480|750|900|1440|1800)$/.test(key))
      return denied();
    const data = await readClientDemoImage(key);
    return data
      ? new Response(new Uint8Array(data), {
          headers: { ...clientDemoHeaders, "Content-Type": "image/webp" },
        })
      : denied();
  } catch {
    return denied();
  }
}
