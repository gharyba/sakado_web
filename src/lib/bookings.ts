import { Prisma, PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { serializable } from "./transactions";
import { bookingInput, bookingEdit } from "./admin-validation";
import { occupied, registrationAllowed, lifecycle } from "./event-policy";
export class BusinessError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function createBooking(db: PrismaClient, input: unknown) {
  const data = bookingInput.parse(input);
  return serializable(db, async (tx) => {
    const prior = await tx.booking.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
      select: {
        reference: true,
        eventId: true,
        email: true,
        participantCount: true,
      },
    });
    if (prior) {
      if (
        prior.eventId !== data.eventId ||
        prior.email !== data.email ||
        prior.participantCount !== data.participantCount
      )
        throw new BusinessError(
          "La demande a changé. Rechargez le formulaire.",
          409,
        );
      return { reference: prior.reference };
    }
    const event = await tx.event.findUnique({
      where: { id: data.eventId },
      include: {
        bookings: { select: { status: true, participantCount: true } },
      },
    });
    if (!event || !registrationAllowed(event))
      throw new BusinessError(
        "Les inscriptions sont fermées pour cette sortie.",
        409,
      );
    if (event.capacity === null || event.price === null)
      throw new BusinessError(
        "Les modalités de cette sortie doivent être confirmées.",
        409,
      );
    const waiting = event.registrationStatus === "WAITLIST_ONLY";
    const remaining = event.capacity - occupied(event.bookings);
    if (!waiting && data.participantCount > remaining)
      throw new BusinessError(
        "Le nombre de places demandé n’est plus disponible.",
        409,
      );
    const reference =
      "SAK-" +
      new Date().getFullYear() +
      "-" +
      randomBytes(6).toString("hex").toUpperCase();
    await tx.event.update({
      where: { id: event.id },
      data: {
        version: { increment: 1 },
        ...(!waiting && remaining === data.participantCount
          ? { registrationStatus: "FULL" }
          : {}),
      },
    });
    await tx.booking.create({
      data: {
        ...data,
        reference,
        status: waiting ? "WAITLIST" : "PENDING",
        totalAmount: new Prisma.Decimal(event.price).mul(data.participantCount),
        currency: event.currency,
      },
    });
    await tx.auditLog.create({
      data: {
        action: "BOOKING_CREATED",
        entityType: "Booking",
        entityId: reference,
      },
    });
    return { reference };
  });
}
export async function updateBooking(
  db: PrismaClient,
  input: unknown,
  adminId: string,
) {
  const data = bookingEdit.parse(input);
  return serializable(db, async (tx) => {
    const current = await tx.booking.findUnique({
      where: { id: data.id },
      include: {
        event: {
          include: {
            bookings: {
              select: { id: true, status: true, participantCount: true },
            },
          },
        },
      },
    });
    if (!current) throw new BusinessError("Inscription introuvable.", 404);
    const consumes = ["PENDING", "CONFIRMED", "COMPLETED"].includes(
      data.status,
    );
    if (
      consumes &&
      ["CANCELLED", "ARCHIVED"].includes(lifecycle(current.event))
    )
      throw new BusinessError("Cette sortie est annulée ou archivée.", 409);
    const others = occupied(
      current.event.bookings.filter((b) => b.id !== current.id),
    );
    const capacity = current.event.capacity;
    if (
      consumes &&
      (capacity === null || others + data.participantCount > capacity)
    )
      throw new BusinessError("La capacité serait dépassée.", 409);
    const remaining =
      (capacity ?? 0) - others - (consumes ? data.participantCount : 0);
    const next =
      current.event.registrationStatus === "WAITLIST_ONLY" ||
      current.event.registrationStatus === "CLOSED"
        ? current.event.registrationStatus
        : remaining === 0
          ? "FULL"
          : current.event.registrationStatus === "FULL"
            ? "OPEN"
            : current.event.registrationStatus;
    await tx.event.update({
      where: { id: current.eventId },
      data: { version: { increment: 1 }, registrationStatus: next },
    });
    // Preserve the original unit price after a later event price change.
    const totalAmount = new Prisma.Decimal(current.totalAmount)
      .div(current.participantCount)
      .mul(data.participantCount)
      .toDecimalPlaces(3);
    await tx.booking.update({
      where: { id: data.id },
      data: { ...data, totalAmount },
    });
    await tx.auditLog.create({
      data: {
        adminId,
        action: "BOOKING_" + data.status,
        entityType: "Booking",
        entityId: current.id,
      },
    });
    return { message: "Inscription enregistrée." };
  });
}
