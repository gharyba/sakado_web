import { requireAdmin } from "@/lib/auth";
import { Registrations } from "@/components/admin/registrations";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment?: string }>;
}) {
  await requireAdmin("bookings");
  return <Registrations filters={await searchParams} />;
}
