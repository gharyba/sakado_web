import { redirect } from "next/navigation";
import { authConfigured, currentAdmin } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getSettings } from "@/lib/settings";
import Image from "next/image";
export default async function Login() {
  if (await currentAdmin()) redirect("/admin");
  const s = await getSettings();
  return (
    <main className="admin-login">
      <div className="admin-login-art">
        <p className="eyebrow">SAKADO SFAX · TUNISIE</p>
        <h2>
          De belles aventures.
          <br />
          Une équipe aux commandes.
        </h2>
        <p>
          Votre espace pour préparer les sorties et prendre soin de la
          communauté.
        </p>
      </div>
      <div className="admin-login-form">
        {s.logoPath ? (
          <Image
            src={s.logoPath}
            alt={s.name}
            width={160}
            height={70}
            unoptimized
          />
        ) : (
          <div className="admin-brand">{s.name}</div>
        )}
        <p className="eyebrow">SAKADO ADMIN</p>
        <h1>Heureux de vous retrouver.</h1>
        <p>Connectez-vous à votre espace de travail.</p>
        {!authConfigured() && (
          <p className="notice">
            L’accès doit être configuré par le responsable du site.
          </p>
        )}
        <AdminLoginForm enabled={authConfigured()} />
        <a className="text-link" href={process.env.SITE_URL || "/"}>
          Retour au site ↗
        </a>
      </div>
    </main>
  );
}
