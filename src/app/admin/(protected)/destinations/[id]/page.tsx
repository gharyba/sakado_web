import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "@/components/admin/heading";
import { DestinationForm } from "@/components/admin/destination-form";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("destinations");
  const { id } = await params;
  if (
    !(await db.destination.findUnique({ where: { id }, select: { id: true } }))
  )
    notFound();
  return (
    <>
      <AdminHeading title="Modifier la destination" />
      <DestinationForm id={id} />
    </>
  );
}
