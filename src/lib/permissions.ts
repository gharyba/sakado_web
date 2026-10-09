export type Role = "OWNER" | "ADMIN" | "EDITOR";
export type Permission =
  | "dashboard"
  | "events"
  | "bookings"
  | "destinations"
  | "gallery"
  | "messages"
  | "site"
  | "settings"
  | "users"
  | "categories";
const editor: Permission[] = [
  "dashboard",
  "events",
  "gallery",
  "site",
  "categories",
];
export function can(role: Role, permission: Permission) {
  return (
    role === "OWNER" ||
    (role === "ADMIN" && !["users", "settings"].includes(permission)) ||
    (role === "EDITOR" && editor.includes(permission))
  );
}
