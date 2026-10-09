import Link from "@/components/link";
import { db } from "@/lib/db";
import { AdminHeading } from "./heading";
import {
  bookingLabels,
  paymentLabels,
  occupied,
  confirmed,
} from "@/lib/event-policy";
import { dateLabel } from "@/lib/format";
import type { Prisma, BookingStatus, PaymentStatus } from "@prisma/client";
export async function Registrations({
  eventId,
  filters,
}: {
  eventId?: string;
  filters: { q?: string; status?: string; payment?: string };
}) {
  const event = eventId
    ? await db.event.findUnique({
        where: { id: eventId },
        include: {
          bookings: { select: { status: true, participantCount: true } },
        },
      })
    : null;
  const where: Prisma.BookingWhereInput = {
    ...(eventId ? { eventId } : {}),
    ...(filters.status && filters.status in bookingLabels
      ? { status: filters.status as BookingStatus }
      : {}),
    ...(filters.payment && filters.payment in paymentLabels
      ? { paymentStatus: filters.payment as PaymentStatus }
      : {}),
    ...(filters.q
      ? {
          OR: ["firstName", "lastName", "email", "phone", "reference"].map(
            (field) => ({
              [field]: { contains: filters.q, mode: "insensitive" },
            }),
          ),
        }
      : {}),
  };
  const rows = await db.booking.findMany({
    where,
    include: { event: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <AdminHeading
        title={event ? "Les inscrits · " + event.title : "Les inscriptions"}
        description={
          event
            ? occupied(event.bookings) +
              " / " +
              (event.capacity ?? "—") +
              " places réservées · " +
              confirmed(event.bookings) +
              " confirmés · " +
              Math.max(0, (event.capacity ?? 0) - occupied(event.bookings)) +
              " places restantes"
            : "Retrouvez et gérez les demandes de votre communauté."
        }
      >
        {eventId && (
          <a href={"/api/admin/exports?eventId=" + eventId} className="button">
            Exporter en CSV
          </a>
        )}
      </AdminHeading>
      <form className="admin-filters">
        <input
          name="q"
          aria-label="Rechercher un inscrit"
          placeholder="Nom, téléphone, e-mail, référence…"
          defaultValue={filters.q}
        />
        <select
          name="status"
          aria-label="Statut de l’inscription"
          defaultValue={filters.status ?? ""}
        >
          <option value="">Tous les statuts</option>
          {Object.entries(bookingLabels).map(([v, l]) => (
            <option value={v} key={v}>
              {l}
            </option>
          ))}
        </select>
        <select
          name="payment"
          aria-label="Paiement"
          defaultValue={filters.payment ?? ""}
        >
          <option value="">Tous les paiements</option>
          {Object.entries(paymentLabels).map(([v, l]) => (
            <option value={v} key={v}>
              {l}
            </option>
          ))}
        </select>
        <button className="button">Filtrer</button>
      </form>
      {rows.length ? (
        <div className="admin-records">
          {rows.map((b) => (
            <article className="admin-record" key={b.id}>
              <div>
                <span className="admin-badge">{bookingLabels[b.status]}</span>
                <h2>
                  <Link href={"/admin/registrations/" + b.id}>
                    {b.firstName} {b.lastName}
                  </Link>
                </h2>
                <p>
                  {b.reference} · {b.event.title}
                </p>
              </div>
              <div>
                <p>
                  {b.email}
                  <br />
                  {b.phone}
                </p>
                <strong>{b.participantCount} participant(s)</strong>
                <p>
                  {paymentLabels[b.paymentStatus]} ·{" "}
                  {dateLabel(b.createdAt.toISOString())}
                </p>
              </div>
              <Link
                className="admin-button-secondary"
                href={"/admin/registrations/" + b.id}
              >
                Voir / gérer
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="admin-empty">Aucune inscription pour ces critères.</p>
      )}
    </>
  );
}
