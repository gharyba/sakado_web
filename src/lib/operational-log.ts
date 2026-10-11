/** Deliberately excludes error messages, stacks, request URLs, bodies and identities. */
export function operationalFailure(
  operation: "admin" | "login" | "logout" | "contact" | "health",
) {
  console.error(
    JSON.stringify({ level: "error", event: "operation_failed", operation }),
  );
}
