import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "@/components/admin/heading";
import { EventForm } from "@/components/admin/event-form";
export default async function Page() {
  await requireAdmin("events");
  return (
    <>
      <AdminHeading
        title="Ajouter une sortie"
        description="Préparez votre aventure, puis publiez-la quand tout est prêt."
      />
      <EventForm />
    </>
  );
}
