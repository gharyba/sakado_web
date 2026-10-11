import { selectableMedia } from "@/lib/media-mutation-guard";
import { db } from "@/lib/db";
import { AdminForm } from "./form";
import {
  Field,
  Area,
  Select,
  Check,
  Hidden,
  Block,
  dateInput,
  options,
} from "./fields";
import { ScheduleEditor } from "./schedule-editor";
import { lifecycleLabels, registrationLabels } from "@/lib/event-policy";
export async function EventForm({ eventId }: { eventId?: string }) {
  const [event, categories, destinations, imagesRaw] = await Promise.all([
    eventId
      ? db.event.findUniqueOrThrow({
          where: { id: eventId },
          include: {
            schedule: { orderBy: [{ day: "asc" }, { order: "asc" }] },
          },
        })
      : null,
    db.eventCategory.findMany({ orderBy: { name: "asc" } }),
    db.destination.findMany({
      where: { archived: false },
      orderBy: { name: "asc" },
    }),
    db.galleryImage.findMany({
      where: { authorized: true },
      orderBy: { order: "asc" },
    }),
  ]);

  const images = await selectableMedia(imagesRaw);
  const arrayText = (v: unknown) => (Array.isArray(v) ? v.join("\n") : "");
  return (
    <AdminForm
      endpoint="/api/admin/events"
      submit={event ? "Enregistrer la sortie" : "Créer la sortie"}
    >
      {event && (
        <>
          <Hidden name="id" value={event.id} />
          <Hidden name="version" value={event.version} />
        </>
      )}
      <Block title="Les informations">
        <Field
          label="Nom de la sortie"
          name="title"
          value={event?.title}
          required
          maxLength={200}
        />
        <Field
          label="Lien de la sortie"
          name="slug"
          value={event?.slug}
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
        />
        <Area
          label="Description courte"
          name="shortDescription"
          value={event?.shortDescription}
        />
        <Area
          label="Description complète"
          name="description"
          value={event?.description}
          rows={6}
        />
        <Select
          label="Catégorie"
          name="categoryId"
          value={event?.categoryId}
          options={[
            { value: "", label: "À préciser" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <Select
          label="Destination"
          name="destinationId"
          value={event?.destinationId}
          options={[
            { value: "", label: "À préciser" },
            ...destinations.map((d) => ({ value: d.id, label: d.name })),
          ]}
        />
        <Field label="Lieu" name="location" value={event?.location} />
        <Field label="Durée" name="duration" value={event?.duration} />
      </Block>
      <Block title="Les dates · heure de Tunisie">
        <Field
          label="Début"
          name="startsAt"
          type="datetime-local"
          value={dateInput(event?.startsAt)}
        />
        <Field
          label="Fin"
          name="endsAt"
          type="datetime-local"
          value={dateInput(event?.endsAt)}
        />
        <Field
          label="Heure de rendez-vous"
          name="meetingTime"
          type="time"
          value={event?.meetingTime}
        />
        <Field
          label="Point de rendez-vous"
          name="meetingPoint"
          value={event?.meetingPoint}
        />
      </Block>
      <Block title="Les inscriptions">
        <Field
          label="Tarif par participant (TND)"
          name="price"
          type="number"
          min="0"
          max="1000000"
          step="0.001"
          value={event?.price?.toString()}
        />
        <Field
          label="Capacité"
          name="capacity"
          type="number"
          min="1"
          max="10000"
          value={event?.capacity}
        />
        <Field
          label="Ouverture des inscriptions"
          name="registrationOpenAt"
          type="datetime-local"
          value={dateInput(event?.registrationOpenAt)}
        />
        <Field
          label="Clôture des inscriptions"
          name="registrationDeadline"
          type="datetime-local"
          value={dateInput(event?.registrationDeadline)}
        />
        <Select
          label="Inscriptions"
          name="registrationStatus"
          value={event?.registrationStatus ?? "CLOSED"}
          options={options(registrationLabels)}
        />
        <Check
          name="showAvailability"
          label="Afficher les places disponibles sur le site"
          checked={event?.showAvailability ?? true}
        />
      </Block>
      <Block title="Difficulté et photo">
        <Select
          name="difficulty"
          label="Difficulté"
          value={event?.difficulty}
          options={["", "Facile", "Moyenne", "Difficile"].map((v) => ({
            value: v,
            label: v || "À préciser",
          }))}
        />
        <Select
          label="Photo de couverture"
          name="coverImage"
          value={event?.coverImage}
          options={[
            { value: "", label: "Aucune photo" },
            ...images.map((i) => ({ value: i.src, label: i.alt })),
          ]}
        />
        <a href="/admin/gallery" target="_blank" rel="noopener noreferrer">
          Ajouter une photo à la galerie ↗
        </a>
      </Block>
      <ScheduleEditor
        initial={
          event?.schedule.map(({ day, time, title, description }) => ({
            day,
            time,
            title,
            description,
          })) ?? []
        }
      />
      <Block title="Bien préparer la sortie">
        <Area
          label="Inclus · un élément par ligne"
          name="included"
          value={arrayText(event?.included)}
        />
        <Area
          label="Non inclus · un élément par ligne"
          name="excluded"
          value={arrayText(event?.excluded)}
        />
        <Area
          label="Équipement · un élément par ligne"
          name="equipment"
          value={arrayText(event?.equipment)}
        />
        <Area
          label="Recommandations"
          name="recommendations"
          value={event?.recommendations}
        />
        <Area
          label="Informations importantes"
          name="importantInfo"
          value={event?.importantInfo}
        />
        <Area label="Conditions" name="conditions" value={event?.conditions} />
        <Area
          label="Annulation"
          name="cancellationInfo"
          value={event?.cancellationInfo}
        />
        <Area
          label="Récit de la sortie passée"
          name="recap"
          value={event?.recap}
        />
      </Block>
      <Block title="Publication">
        <Select
          label="Statut de la sortie"
          name="status"
          value={event?.status ?? "DRAFT"}
          options={options(lifecycleLabels)}
        />
        <Check
          label="Publier sur le site"
          name="published"
          checked={event?.published}
        />
        <Check
          label="Mettre en avant"
          name="featured"
          checked={event?.featured}
        />
      </Block>
    </AdminForm>
  );
}
