import { requireAdmin } from "@/lib/auth";
import { getMediaRegistry } from "@/lib/media-readiness";
import { AdminHeading } from "@/components/admin/heading";
import { MediaReadinessView } from "@/components/admin/media-readiness";

export default async function MediaReadinessPage() {
  await requireAdmin("gallery");
  return (
    <>
      <AdminHeading
        title="Droits et publication des photos"
        description="Registre MEDIA-04 : statut de préparation, sans modification des autorisations."
      />
      <MediaReadinessView registry={await getMediaRegistry()} />
    </>
  );
}
