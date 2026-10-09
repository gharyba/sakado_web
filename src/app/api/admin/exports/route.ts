import { NextRequest, NextResponse } from "next/server";
import { authorizeApi, jsonError } from "@/lib/http-security";
import { db } from "@/lib/db";
function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[=+@\-\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export async function GET(request: NextRequest) {
  const auth = await authorizeApi("bookings");
  if (auth.response) return auth.response;
  const eventId = request.nextUrl.searchParams.get("eventId");
  if (!eventId) return jsonError("Sortie requise.", 400);
  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) return jsonError("Sortie introuvable.", 404);
  const rows = await db.booking.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" },
  });
  const data = [
    [
      "Référence",
      "Nom",
      "Prénom",
      "Téléphone",
      "Email",
      "Participants",
      "Statut",
      "Paiement",
      "Date inscription",
    ],
    ...rows.map((b) => [
      b.reference,
      b.lastName,
      b.firstName,
      b.phone,
      b.email,
      b.participantCount,
      b.status,
      b.paymentStatus,
      b.createdAt.toISOString(),
    ]),
  ];
  await db.auditLog.create({
    data: {
      adminId: auth.user.id,
      action: "BOOKINGS_EXPORTED",
      entityType: "Event",
      entityId: eventId,
    },
  });
  return new NextResponse(
    "\uFEFF" + data.map((row) => row.map(csvCell).join(";")).join("\r\n"),
    {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="sakado-' + event.slug + '-inscrits.csv"',
        "Cache-Control": "private, no-store",
      },
    },
  );
}
