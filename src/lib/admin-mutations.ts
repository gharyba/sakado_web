import { Prisma, PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { serializable } from "./transactions";
import { BusinessError, updateBooking } from "./bookings";
import {
  eventSchema,
  destinationSchema,
  categorySchema,
  gallerySchema,
  userSchema,
  siteSchema,
  settingsSchema,
  lines,
  id,
} from "./admin-validation";
import { hashPassword } from "./security";
import { lifecycle, occupied } from "./event-policy";
import { can, type Role, type Permission } from "./permissions";
import { eventWriteIssue } from "./admin-event-policy";
type Admin = { id: string; role: Role };
export async function mutate(
  db: PrismaClient,
  resource: Permission,
  input: Record<string, unknown>,
  admin: Admin,
) {
  if (!can(admin.role, resource))
    throw new BusinessError("Accès non autorisé.", 403);
  if (resource === "bookings") return updateBooking(db, input, admin.id);
  const target = input.id ? id.parse(input.id) : null;
  const intent = String(input.intent ?? "save");
  return serializable(db, async (tx) => {
    const actor = await tx.adminUser.findUnique({
      where: { id: admin.id },
      select: { active: true, role: true },
    });
    if (!actor?.active || !can(actor.role, resource))
      throw new BusinessError("Accès non autorisé.", 403);
    let entityId = target ?? "main";
    let redirect: string | undefined;
    let action = resource.toUpperCase() + "_UPDATED";
    if (resource === "events") {
      if (intent !== "save") {
        if (!target) throw new BusinessError("Sortie manquante.");
        const event = await tx.event.findUniqueOrThrow({
          where: { id: target },
          include: { schedule: true },
        });
        if (intent === "duplicate") {
          const {
            schedule,
            id: _id,
            createdAt: _created,
            updatedAt: _updated,
            ...data
          } = event;
          void _id;
          void _created;
          void _updated;
          const copy = await tx.event.create({
            data: {
              ...data,
              included: data.included ?? Prisma.DbNull,
              excluded: data.excluded ?? Prisma.DbNull,
              equipment: data.equipment ?? Prisma.DbNull,
              slug: event.slug + "-" + randomBytes(3).toString("hex"),
              title: event.title + " (copie)",
              published: false,
              featured: false,
              status: "DRAFT",
              registrationStatus: "CLOSED",
              version: 0,
              schedule: {
                create: schedule.map(
                  ({ day, time, title, description, order }) => ({
                    day,
                    time,
                    title,
                    description,
                    order,
                  }),
                ),
              },
            },
          });
          entityId = copy.id;
          redirect = "/admin/events/" + copy.id + "/edit";
          action = "EVENT_DUPLICATED";
        } else {
          const changes: Prisma.EventUpdateInput =
            intent === "archive"
              ? {
                  status: "ARCHIVED",
                  published: false,
                  registrationStatus: "CLOSED",
                }
              : intent === "cancel"
                ? {
                    status: "CANCELLED",
                    published: false,
                    registrationStatus: "CLOSED",
                  }
                : intent === "close"
                  ? { registrationStatus: "CLOSED" }
                  : intent === "unpublish"
                    ? { published: false }
                    : {};
          if (!Object.keys(changes).length)
            throw new BusinessError("Action inconnue.");
          if (
            input.version !== undefined &&
            Number(input.version) !== event.version
          )
            throw new BusinessError(
              "Cette sortie a été modifiée. Rechargez la page.",
              409,
            );
          if (
            intent === "cancel" &&
            ["ARCHIVED", "COMPLETED"].includes(lifecycle(event))
          )
            throw new BusinessError(
              "Une sortie terminée ou archivée ne peut pas être annulée.",
              409,
            );
          if (
            Object.entries(changes).every(
              ([key, value]) => event[key as keyof typeof event] === value,
            )
          )
            return { message: "Sortie inchangée." };
          await tx.event.update({
            where: { id: target },
            data: { ...changes, version: { increment: 1 } },
          });
          action = "EVENT_" + intent.toUpperCase();
        }
      } else {
        const data = eventSchema.parse(input);
        const { schedule, included, excluded, equipment, ...fields } = data;
        const issue = eventWriteIssue(fields);
        if (issue) throw new BusinessError(issue, 409);
        if (
          fields.coverImage?.startsWith("/media/") &&
          !(await tx.galleryImage.findFirst({
            where: { src: fields.coverImage, authorized: true },
          }))
        )
          throw new BusinessError(
            "Confirmez les droits d’utilisation de l’image.",
          );
        if (target) {
          const current = await tx.event.findUniqueOrThrow({
            where: { id: target },
            include: {
              bookings: { select: { status: true, participantCount: true } },
            },
          });
          if (Number(input.version) !== current.version)
            throw new BusinessError(
              "Cette sortie a été modifiée. Rechargez la page avant d’enregistrer.",
              409,
            );
          const transitionIssue = eventWriteIssue(fields, current);
          if (transitionIssue) throw new BusinessError(transitionIssue, 409);
          if (occupied(current.bookings) > (fields.capacity ?? 0))
            throw new BusinessError(
              "La capacité ne peut pas être inférieure aux places déjà réservées.",
              409,
            );
        }
        const write = {
          ...fields,
          currency: "TND",
          source: "CONFIRMED" as const,
          included: lines(included),
          excluded: lines(excluded),
          equipment: lines(equipment),
        };
        const event = target
          ? await tx.event.update({
              where: { id: target },
              data: { ...write, version: { increment: 1 } },
            })
          : await tx.event.create({ data: write });
        entityId = event.id;
        await tx.eventScheduleItem.deleteMany({ where: { eventId: event.id } });
        if (schedule.length)
          await tx.eventScheduleItem.createMany({
            data: schedule.map((item, order) => ({
              ...item,
              eventId: event.id,
              order,
            })),
          });
        redirect = "/admin/events/" + event.id;
        action = target ? "EVENT_UPDATED" : "EVENT_CREATED";
      }
    } else if (resource === "destinations") {
      const data = destinationSchema.parse(input);
      if (
        data.coverImage?.startsWith("/media/") &&
        !(await tx.galleryImage.findFirst({
          where: { src: data.coverImage, authorized: true },
        }))
      )
        throw new BusinessError("Confirmez les droits de l’image.");
      const row = target
        ? await tx.destination.update({ where: { id: target }, data })
        : await tx.destination.create({
            data: { ...data, source: "CONFIRMED" },
          });
      entityId = row.id;
      redirect = "/admin/destinations";
    } else if (resource === "categories") {
      const data = categorySchema.parse(input);
      const row = target
        ? await tx.eventCategory.update({ where: { id: target }, data })
        : await tx.eventCategory.create({ data });
      entityId = row.id;
      redirect = "/admin/events";
    } else if (resource === "gallery") {
      if (intent === "delete") {
        if (!target) throw new BusinessError("Photo manquante.");
        const row = await tx.galleryImage.findUniqueOrThrow({
          where: { id: target },
        });
        const used =
          (await tx.event.count({ where: { coverImage: row.src } })) +
          (await tx.destination.count({ where: { coverImage: row.src } }));
        const settings = await tx.siteSettings.findUnique({
          where: { id: "main" },
        });
        if (
          used ||
          (await tx.instagramMedia.count({
            where: { previewImage: row.src },
          })) ||
          JSON.stringify(settings?.content ?? {}).includes(row.src)
        )
          throw new BusinessError(
            "Cette photo est utilisée en couverture ou sur le site. Remplacez-la avant de la supprimer.",
            409,
          );
        await tx.galleryImage.delete({ where: { id: target } });
        action = "GALLERY_DELETED";
      } else {
        const data = gallerySchema.parse(input);
        if (data.published && !data.authorized)
          throw new BusinessError(
            "Confirmez les droits d’utilisation avant publication.",
          );
        await tx.galleryImage.update({ where: { id: data.id }, data });
      }
      redirect = "/admin/gallery";
    } else if (resource === "messages") {
      if (!target) throw new BusinessError("Message manquant.");
      if (intent === "delete") {
        await tx.contactMessage.delete({ where: { id: target } });
        action = "MESSAGE_DELETED";
      } else if (["read", "unread", "archive"].includes(intent))
        await tx.contactMessage.update({
          where: { id: target },
          data:
            intent === "archive"
              ? { archived: true }
              : { read: intent === "read", archived: false },
        });
      else throw new BusinessError("Action inconnue.");
      redirect = "/admin/messages";
    } else if (resource === "site" || resource === "settings") {
      const prior = await tx.siteSettings.findUnique({ where: { id: "main" } });
      const original = (prior?.content ?? {}) as Prisma.JsonObject;
      if (resource === "site") {
        const data = siteSchema.parse(input);
        if (
          data.heroImage?.startsWith("/media/") &&
          !(await tx.galleryImage.findFirst({
            where: { src: data.heroImage, authorized: true },
          }))
        )
          throw new BusinessError("Confirmez les droits de l’image.");
        await tx.siteSettings.upsert({
          where: { id: "main" },
          create: {
            content: { ...original, ...data, values: lines(data.values) },
          },
          update: {
            content: { ...original, ...data, values: lines(data.values) },
          },
        });
      } else {
        const {
          socialLinks,
          instagramFollowersLabel,
          instagramPostsLabel,
          communityMembersLabel,
          ...data
        } = settingsSchema.parse(input);
        if (
          data.logoPath?.startsWith("/media/") &&
          !(await tx.galleryImage.findFirst({
            where: { src: data.logoPath, authorized: true },
          }))
        )
          throw new BusinessError("Confirmez les droits du logo.");
        const write = {
          content: { ...original, ...data },
          instagramFollowersLabel,
          instagramPostsLabel,
          communityMembersLabel,
        };
        await tx.siteSettings.upsert({
          where: { id: "main" },
          create: write,
          update: write,
        });
        await tx.socialLink.deleteMany();
        const links = [
          ...socialLinks,
          ...(data.facebookUrl
            ? [{ label: "Facebook", url: data.facebookUrl, enabled: true }]
            : []),
        ];
        if (links.length)
          await tx.socialLink.createMany({
            data: links.map((row, order) => ({ ...row, order })),
          });
      }
    } else if (resource === "users") {
      const data = userSchema.parse(input);
      if (!target && !data.password)
        throw new BusinessError(
          "Un mot de passe de 12 caractères minimum est requis.",
        );
      if (target) {
        const prior = await tx.adminUser.findUniqueOrThrow({
          where: { id: target },
        });
        if (
          prior.active &&
          prior.role === "OWNER" &&
          (!data.active || data.role !== "OWNER") &&
          (await tx.adminUser.count({
            where: { active: true, role: "OWNER" },
          })) <= 1
        )
          throw new BusinessError(
            "Le dernier propriétaire actif doit être conservé.",
            409,
          );
      }
      const { password, ...fields } = data;
      const passwordHash = password ? await hashPassword(password) : undefined;
      const row = target
        ? await tx.adminUser.update({
            where: { id: target },
            data: { ...fields, ...(passwordHash ? { passwordHash } : {}) },
          })
        : await tx.adminUser.create({
            data: { ...fields, passwordHash: passwordHash! },
          });
      if (target)
        await tx.adminSession.deleteMany({ where: { adminId: target } });
      entityId = row.id;
      action = !target
        ? "ADMIN_CREATED"
        : !data.active
          ? "ADMIN_DISABLED"
          : "ADMIN_UPDATED";
      redirect = "/admin/users";
    } else throw new BusinessError("Fonction inconnue.", 404);
    await tx.auditLog.create({
      data: { adminId: admin.id, action, entityType: resource, entityId },
    });
    return {
      message: "Modifications enregistrées.",
      ...(redirect ? { redirect } : {}),
    };
  });
}
