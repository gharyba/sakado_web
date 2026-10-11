import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AdminHeading } from "@/components/admin/heading";
import { AdminForm } from "@/components/admin/form";
import {
  Field,
  Area,
  Select,
  Hidden,
  Block,
  options,
} from "@/components/admin/fields";
import { bookingLabels, paymentLabels } from "@/lib/event-policy";
import { priceLabel } from "@/lib/format";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("bookings");
  const { id } = await params;
  const b = await db.booking.findUnique({
    where: { id },
    include: { event: { select: { title: true } } },
  });
  if (!b) notFound();
  return (
    <>
      <AdminHeading
        title={b.firstName + " " + b.lastName}
        description={b.reference + " · " + b.event.title}
      />
      <div className="admin-panel">
        <p>
          Montant enregistré : {priceLabel(Number(b.totalAmount), b.currency)}
        </p>
        <p>Message du participant : {b.notes ?? "Aucun message."}</p>
      </div>
      <AdminForm endpoint="/api/admin/bookings">
        <Hidden name="id" value={id} />
        <Hidden name="expectedUpdatedAt" value={b.updatedAt.toISOString()} />
        <Block title="L’inscription">
          <Field label="Prénom" name="firstName" value={b.firstName} required />
          <Field label="Nom" name="lastName" value={b.lastName} required />
          <Field
            label="E-mail"
            type="email"
            name="email"
            value={b.email}
            required
          />
          <Field label="Téléphone" name="phone" value={b.phone} required />
          <Field
            label="Participants"
            name="participantCount"
            type="number"
            min="1"
            max="100"
            value={b.participantCount}
            required
          />
          <Select
            label="Statut"
            name="status"
            value={b.status}
            options={options(bookingLabels)}
          />
          <Select
            label="Paiement"
            name="paymentStatus"
            value={b.paymentStatus}
            options={options(paymentLabels)}
          />
          <Area
            label="Note interne"
            name="internalNote"
            value={b.internalNote}
          />
        </Block>
        <p className="muted">
          Modifier le nombre de participants conserve le tarif initial par
          personne. Aucun paiement en ligne n’est effectué ici.
        </p>
      </AdminForm>
    </>
  );
}
