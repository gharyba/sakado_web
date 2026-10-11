/** Identities of the original code-drawn demo artwork, not photographic/brand approvals. */
export const illustrationHashes: Readonly<Record<string, string>> =
  Object.freeze({
    "camp.svg":
      "32912c8333e7d3854707d66978a62e533206743b3b37853d9554cdcb876c03c4",
    "coast.svg":
      "4fd1264894c99fcb7b83dbc502270c0ba4ba28d7f9a2be3109397e0be47f2de1",
    "trail.svg":
      "ba1dffbee253782fe8adb09433dbf973cc51520f4fc6183edc6a1919531ae9ca",
  });
export function illustrationIdentityAllowed(
  filename: string | undefined,
  hash: string,
): boolean {
  const name = filename?.split(/[\\/]/).pop() ?? "";
  const expected = illustrationHashes[name];
  return !expected || expected === hash;
}
