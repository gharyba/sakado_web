import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "@/components/admin/heading";
import { EventForm } from "@/components/admin/event-form";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("events");
  const { id } = await params;
  if (!(await db.event.findUnique({ where: { id }, select: { id: true } })))
    notFound();
  return (
    <>
      <AdminHeading title="Modifier la sortie" />
      <EventForm eventId={id} />
    </>
  );
}
