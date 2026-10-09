import { requireAdmin } from "@/lib/auth";
import { Registrations } from "@/components/admin/registrations";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; status?: string; payment?: string }>;
}) {
  await requireAdmin("bookings");
  const { id } = await params;
  if (!(await db.event.findUnique({ where: { id }, select: { id: true } })))
    notFound();
  return <Registrations eventId={id} filters={await searchParams} />;
}
