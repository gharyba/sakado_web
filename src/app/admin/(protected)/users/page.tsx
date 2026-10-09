import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeading } from "@/components/admin/heading";
import { AdminForm } from "@/components/admin/form";
import { Field, Select, Check, Hidden } from "@/components/admin/fields";
import { dateLabel } from "@/lib/format";
export default async function Page() {
  await requireAdmin("users");
  const users = await db.adminUser.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      lastLoginAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
  return (
    <>
      <AdminHeading
        title="L’équipe Sakado"
        description="Seul le propriétaire peut gérer les comptes. Le dernier propriétaire actif est protégé."
      />
      <div className="admin-user-grid">
        {[...users, null].map((u) => (
          <section className="admin-panel" key={u?.id ?? "new"}>
            <h2>{u ? u.name : "Ajouter un membre"}</h2>
            {u && (
              <p>
                Dernière connexion :{" "}
                {u.lastLoginAt
                  ? dateLabel(u.lastLoginAt.toISOString())
                  : "Jamais"}
              </p>
            )}
            <AdminForm
              endpoint="/api/admin/users"
              submit={u ? "Enregistrer le compte" : "Créer le compte"}
            >
              {u && <Hidden name="id" value={u.id} />}
              <Field label="Nom" name="name" value={u?.name} required />
              <Field
                label="E-mail"
                name="email"
                type="email"
                value={u?.email}
                required
              />
              <Select
                label="Rôle"
                name="role"
                value={u?.role ?? "EDITOR"}
                options={[
                  { value: "OWNER", label: "Propriétaire" },
                  { value: "ADMIN", label: "Administrateur" },
                  { value: "EDITOR", label: "Éditeur" },
                ]}
              />
              <Field
                label={u ? "Nouveau mot de passe (facultatif)" : "Mot de passe"}
                name="password"
                type="password"
                minLength={12}
                maxLength={256}
                autoComplete="new-password"
                required={!u}
              />
              <Check
                name="active"
                label="Compte actif"
                checked={u?.active ?? true}
              />
            </AdminForm>
          </section>
        ))}
      </div>
    </>
  );
}
