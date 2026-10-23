import { readOfficialPresentationImage } from "@/lib/official-presentation";
import { presentationHeaders } from "@/lib/official-presentation-policy";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const data = await readOfficialPresentationImage(request, (await params).key);
  return new Response(data ? new Uint8Array(data) : null, {
    status: data ? 200 : 404,
    headers: {
      ...presentationHeaders,
      ...(data ? { "Content-Type": "image/webp" } : {}),
    },
  });
}
