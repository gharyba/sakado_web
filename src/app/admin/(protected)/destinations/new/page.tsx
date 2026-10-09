import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "@/components/admin/heading";
import { DestinationForm } from "@/components/admin/destination-form";
export default async function Page() {
  await requireAdmin("destinations");
  return (
    <>
      <AdminHeading title="Ajouter une destination" />
      <DestinationForm />
    </>
  );
}
