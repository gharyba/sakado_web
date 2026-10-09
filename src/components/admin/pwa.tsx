"use client";
import { useEffect, useState } from "react";
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
export function AdminPwa() {
  const [offline, setOffline] = useState(false);
  const [install, setInstall] = useState<InstallEvent | null>(null);
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    const capture = (e: Event) => {
      e.preventDefault();
      setInstall(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", capture);
    if ("serviceWorker" in navigator)
      navigator.serviceWorker
        .register("/admin/sw.js", { scope: "/admin" })
        .catch(() => {});
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
      window.removeEventListener("beforeinstallprompt", capture);
    };
  }, []);
  return (
    <>
      {offline && (
        <div className="admin-offline" role="alert">
          Connexion Internet requise pour modifier les données.
        </div>
      )}
      {install && (
        <button
          className="admin-install"
          onClick={async () => {
            await install.prompt();
            await install.userChoice;
            setInstall(null);
          }}
        >
          Installer Sakado Admin
        </button>
      )}
    </>
  );
}
