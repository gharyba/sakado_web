# Secure remote client review through Cloudflare

Date: 2026-10-25. Branch: `feat/cinematic-redesign-08`. Starting checkpoint: `30b58a4`. Changes remain uncommitted.

## Outcome and authorization boundary

The official application now has a separate opt-in, authenticated, read-only review entry point on **127.0.0.1:3144**, using a separate production artifact in `.next-client-review`. It reuses the official routes, components and motion code. It does not expose the development server on 3134 or the existing application on 3000.

The user explicitly authorized one developer email for initial testing; it is stored only in the ignored, protected operator configuration. The client's email is **not confirmed**. The user also explicitly confirmed **zero remote grants** for the private Hero, Story/Gallery photos, portraits, SAKADO artwork and six partner logos. Those assets remain unavailable remotely. Local review permission is never converted into remote review permission.

The current remote experience therefore uses existing public-safe fallbacks. The complete photographic presentation, private 3D Gallery content and private-artwork coin cannot be claimed available or visually verified remotely. Their approved implementation is preserved; no substitute artwork or photographs were invented. All 17 BLOCKED assets and 85 PENDING REVIEW axes retain their publication status.

## Architecture and established safeguards

- `scripts/start-client-review.ts` validates Node 24, the exact HTTPS Quick Tunnel origin, the existing verified local PostgreSQL URL/identity/data directory, private runtime ACLs and an exclusive runtime lock. It starts the production Next handler behind its own loopback HTTP ingress. It never starts/stops PostgreSQL or reuses another server.
- The launcher explicitly sets `DEMO_MODE=false`, `CLIENT_DEMO=false`, `OFFICIAL_PRESENTATION=false`, `STAGING_MODE=false` for its own process. Explicit conflicting shell modes are refused. The existing `.env` demo default is overridden in memory using the established launcher pattern; `.env` is unchanged.
- `SITE_URL` and `ADMIN_URL` are both the exact supplied HTTPS origin. Normal production configuration validation still runs. Equal origins avoid dedicated admin-host rewriting; admin paths remain denied. `TRUST_PROXY=false` is retained.
- Every request passes an exact host/origin/forwarded-header check, runtime/configuration expiry/revocation checks and an independent application session check. Cloudflare email/JWT/forwarded identity headers never authenticate the application.
- The ingress permits only known official page/static paths and GET/HEAD. All admin, API, export, upload, original-media, filesystem, development, optimizer and mutation paths are denied. Only its bounded login POST and same-origin session DELETE are exceptions. A second Next Proxy check requires a short-lived internal HMAC proof and the same read-only route policy. The proof is never supplied to the browser.
- Incoming conflicting forwarded hosts/protocols are rejected. After authentication, the ingress canonicalizes the already-validated external HTTPS host/protocol for the internal loopback hop. This is not trust in arbitrary forwarding headers.
- Only the review cookie reaches Next; CMS cookies and Authorization credentials are stripped. No CMS identity, business role, database permission or record is created or modified. Public DTO publication rules continue to apply.
- HTML, private media and denials use private/no-store headers, noindex/noarchive/noimageindex and existing CSP protections. Dynamic private media never enters the public image optimizer. No private originals, base64 images, file paths or approval evidence enter client props or public assets.

### Application authentication

The owner reads the random access code locally from `.local/client-review/access-code.txt` and shares it through an appropriate private channel, separately from the URL. The code is valid for five minutes and is deleted afterward. Login requires the exact Origin, a bounded 1024-byte form body, a valid code hash and the global ten-attempts-per-minute limit.

The opaque random viewing token is stored by hash in a bounded in-process registry, separately from CMS sessions. Its `__Host-sakado_review` cookie is Secure, HttpOnly, SameSite=Strict, Path=/, without Domain. Sessions last at most 30 minutes; the entire run lasts at most one hour. Expiry, logout, process restart and revocation deny replay. Multiple viewers have independent tokens. The design is deliberately single-process and is not a distributed production authentication architecture.

## Safe operator startup

Use Node 24 and the existing verified PostgreSQL service on 55432. Do not run migrations, fixtures or database setup. Leave the user's application on 3000 and any user-owned processes running. Do not run the ordinary build against an active `.next` application.

1. Review the ignored `.local/client-review/catalog.json`. Its current allowlist contains only the explicitly confirmed developer address, `grants` is empty, and configuration expiry is bounded. **The final revocation test deliberately left `revoked: true`; nothing is currently shared.** A future operator must deliberately reauthorize the intended review by setting `revoked: false` and a fresh bounded expiry, preserving the exact confirmed audience and empty grants unless new evidence is approved. The initial configuration expiry is 24 hours. Do not invent a client address, add a wildcard/domain allowlist or add media grants without separate evidence.

   Only on a machine with **no existing review configuration**, initialize it with the explicitly confirmed address:

   ```powershell
   npm run configure:client-review -- --email=CONFIRMED_EXACT_EMAIL
   ```

   Initialization creates owner/SYSTEM-only runtime storage and refuses to overwrite an existing configuration. Later expiry/address/grant changes are deliberate operator reviews of that ignored file; preserve the private ACL and do not put its contents in Git or logs.

2. Validate/build the isolated artifact:

   ```powershell
   npm run typecheck:client-review
   npm run lint
   npm test
   npm run build:client-review
   ```

   The isolated commands use a dedicated Next dist directory and TypeScript configuration, restore the pre-existing `next-env.d.ts`, and run the media gates against the actual preview artifact. They do not regenerate Prisma or alter the build serving port 3000. Dependencies and schema are unchanged.

3. Verify **3144 is free** in a normal PowerShell terminal. Refuse occupied ports; do not terminate or expose an unknown service:

   ```powershell
   $reviewListener = Get-NetTCPConnection -State Listen -ErrorAction Stop |
     Where-Object LocalPort -eq 3144
   if ($reviewListener) { throw 'Port 3144 is occupied; stop here.' }
   ```

4. In a dedicated terminal, start the protected Quick Tunnel with the reviewed exact allowlist:

   ```powershell
   $reviewConfig = Get-Content -LiteralPath '.local/client-review/catalog.json' -Raw | ConvertFrom-Json
   $reviewTunnelArgs = @('tunnel', '--no-autoupdate', '--protocol', 'http2',
     '--url', 'http://127.0.0.1:3144')
   foreach ($reviewEmail in $reviewConfig.allowedEmails) {
     $reviewTunnelArgs += @('--allowed-mail', $reviewEmail)
   }
   & 'C:\Program Files (x86)\cloudflared\cloudflared.exe' @reviewTunnelArgs
   ```

   Never remove `--allowed-mail`, use a wildcard, point at 3000/3134, set `--http-host-header` to a loopback host, disable TLS verification or install a persistent tunnel service for this procedure. Preserve existing Cloudflare configuration; the live test refused to run if a default config file was present. The connector is the sole network bridge; the application itself remains bound to loopback.

5. Copy the **exact generated** `https://<random-name>.trycloudflare.com` origin. In another terminal, start the preview:

   ```powershell
   npm run start:client-review -- --origin=https://ACTUAL-GENERATED-NAME.trycloudflare.com
   ```

   Replace the entire example with the actual lowercase generated origin, without a path or trailing slash. A tunnel can be allocated before the application is listening; until startup succeeds, no application is exposed. If startup refuses, stop the owned tunnel. Do not leave a tunnel targeting an unowned/reusable local port.

6. Open the HTTPS origin, complete Cloudflare's email PIN challenge using the approved address, then enter the independent application code. Do not put the code in URLs, screenshots, diagnostics or tracked documents. The `/_client-review` login is available only through this new entry point; it is not a development route or a normal production endpoint.

Both URLs remain HTTPS throughout configuration; no production HTTPS validation exception was introduced. The loopback connector transport is HTTP inside this computer. The tunnel hostname changes on restart, so restart the preview with the new exact origin and fresh code. A local browser request using `Host: 127.0.0.1:3144` is intentionally denied.

Cloudflare documents the exact-email `--allowed-mail` flag, visitor PIN flow and temporary access lifetime in its [protected Quick Tunnel announcement](https://developers.cloudflare.com/changelog/post/2026-10-02-protected-quick-tunnels/) and [Quick Tunnel guide](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/). These are temporary development tunnels, without an uptime guarantee; the guide also documents their concurrency and SSE limitations. The installed binary was independently checked as 2026.10.3 and its help includes `--allowed-mail`.

## Individual private media authorization

There are **no real media grants** in the current configuration. Do not add them merely because a file exists, has a CMS checkbox, appears in a local presentation or passed decoding.

After explicit human authorization for the specific remote audience and purpose, the operator can add an entry in the ignored configuration's `grants` array. The separate `reviewGrantSchema` requires:

| Field                                             | Required meaning                                                                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slot`                                            | Exact existing mapping: selected `hero-s08`/`hero-s16`, `gallery-0` through `gallery-11`, `team-0`/`team-1`, `logo`, or `partner-0` through `partner-5` |
| `sourceSha256`, `derivativeSha256`                | Exact original and existing derivative hashes from the established private catalog, not filenames or environment claims                                 |
| `purpose`                                         | `temporary-remote-client-review`                                                                                                                        |
| `authorizedBy`, `evidenceReference`, `reviewedAt` | Actual reviewed authorization/evidence, retained privately; placeholders are not evidence                                                               |
| `expiresAt`                                       | Future review expiry no later than configuration expiry                                                                                                 |
| `ownerAuthorization`                              | Explicitly `CONFIRMED` for this remote review                                                                                                           |
| `participantClearance`, `minorClearance`          | Reviewed `CONFIRMED` or genuinely documented `NOT_APPLICABLE`; never infer clearance from appearance or filenames                                       |

Each responsive/full-size derivative needs its own exact grant. The approved audience is the configuration's exact email list; changing it invalidates the active run and requires a new reviewed configuration/tunnel. Historical team slots 2–4 cannot receive remote grants through this schema. The existing Hero choice remains S08 by default; S16 requires the explicit `PRESENTATION_HERO=s16` process setting and its own grants, with no automatic substitution. Schema validation checks the operator attestation's shape and exact asset binding, not the truth of legal consent; a human must verify the referenced evidence before adding a grant.

The adapter reads the existing private asset mapping only after authenticated request checks and only when grants exist. Private bytes additionally require the slot-specific partner policy, safe paths without symlinks/traversal, matching current source and derivative hashes, and an active remote grant on every request. The shared established catalog/integrity reader was extracted without relaxing its local checks. Grant removal immediately denies later requests; there is no media approval cache. Invalid/missing grants fall back or return an empty 404. Unauthorized requests do not disclose paths, dimensions, labels or directory contents.

Pending permissions are: selected Hero variants, every Story/Gallery image and its derivatives, both permanent portraits, private SAKADO artwork, and each of the six partner logos. Participant/minor clearance and owner/partner consent must cover transmission to this specific remote audience through the connector. Authorized viewing necessarily delivers pixels to that browser; revocation cannot erase a viewer's prior capture.

## Verification and revocation

For a future fully authorized photographic session, check both desktop and mobile: Hero source decoding, Story images, two portraits, Gallery controls and full-size media, all six logo images, no distortion/overflow, coin intermediate/reverse states, reduced motion, keyboard focus and the signature mailto. Also request each media URL without the application cookie, with an expired/revoked cookie and from the wrong origin; it must fail even after Cloudflare login. Do not attach private screenshots to a public report.

To revoke the current review:

```powershell
npm run revoke:client-review
```

This atomically marks the protected operator configuration revoked. Subsequent requests fail closed; the running process checks configuration every second and shuts itself down, clears its session registry and removes its access code/lock. Expiry, missing/invalid configuration and audience changes also stop the run. Stop the **owned** Cloudflare terminal with Ctrl+C as well. Stop the tunnel before freeing/reusing 3144; do not leave it pointing at another process. A manual Ctrl+C in the owned preview terminal also shuts down its Next handler and Prisma pool, without stopping PostgreSQL.

For just the current browser session, run same-origin `fetch('/_client-review/session', { method: 'DELETE' })` or stop the review. The application revokes the token before deleting its cookie; replay fails. A later review requires explicit operator reauthorization, a non-revoked unexpired configuration, fresh process secrets/code and the appropriate tunnel allowlist. Do not automatically reactivate a revoked configuration.

## Executed validation and limitations

| Check                                             | Final result                                                                                                                     |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Full unit suite                                   | **97/97 PASS**, no skips: 91 existing plus six new security/media cases                                                          |
| TypeScript                                        | PASS, `npm run typecheck:client-review`, including scripts/tests and isolated Next route types                                   |
| ESLint                                            | PASS                                                                                                                             |
| Production compilation and build type checking    | PASS, `npm run build:client-review`                                                                                              |
| Public-file gate                                  | PASS, 17 registered assets checked before/after compilation, including `.next-client-review/static`                              |
| Private deployment-trace gate                     | PASS, 53 traces; no private workspace files                                                                                      |
| New remote-preview browser regressions            | **5/5 PASS** against the final production artifact                                                                               |
| Existing protected local presentation regressions | **25/25 PASS**; actual local media, six logos, Gallery, coin, Story/Team, responsive/reverse/reduced-motion behavior             |
| Temporary live developer-only Cloudflare probe    | PASS: `/`, a private-media URL and `/admin` each returned 302 to `login.trycloudflare.com` before application access             |
| Explicit revocation/automatic shutdown            | PASS: owned preview exited 0 in 1033ms after revocation; code/lock removed; configuration left revoked                           |
| Business-data preservation                        | PASS: all 15 table row fingerprints/counts byte-identical before/after; all 45 Instagram records remain unpublished/homepage-off |
| Existing active build preservation                | PASS: `.next/BUILD_ID` and `next-env.d.ts` match their original hashes                                                           |
| Process preservation                              | Original application remains on 127.0.0.1:3000, PID 13716; PostgreSQL remains on 127.0.0.1:55432, PID 32336                      |

The new browser suite uses a synthetic HTTPS origin intercepted to loopback; it performs no DNS/tunnel exposure during those tests. It renders the official pages at 1440/1024/768/375px and nine official routes, checks secure cookie attributes, prevents unapproved images/coin, checks focus/signature and motion preferences, and exercises administrator/file/optimizer/mutation denial even with an application session. Native HTTP controls independently prove login reaches Next, forged outer identity grants nothing, conflicting host/origin/protocol is refused and logout prevents copied-token replay.

The separate **live** Cloudflare probe used only the explicitly authorized developer email and zero private grants. It verified the outer email challenge on all three paths, then stopped its own tunnel and preview. No email PIN was requested/completed; mailbox delivery, allowed-address OTP completion and the complete two-layer login through the real external link remain **NOT TESTED**. The client email remains unconfirmed. Neither the simulated browser transport nor the outer redirect alone is relabeled as that end-to-end proof.

The six new unit cases include a disposable synthetic media workspace, never a real asset or business fixture. Six synthetic partner slots require exact grants and a live session/proof; an eligible synthetic WebP decodes; changed original/derivative bytes, grant withdrawal, revocation, pending clearances and traversal are denied. This proves the authorization/integrity mechanism within that scope. **No real private photograph, portrait, artwork or partner logo was authorized or decoded remotely.** Local-only decoding in the legacy suite does not clear the remote permission blocker.

All test-owned preview runs shut down without a forced successful exit, closed their Next handler/Prisma pool, and removed viewing codes/locks. The test-owned ordinary public control server was stopped separately with SIGTERM. Final native port inspection shows 3134/3135/3144/3145 released, with only the original 3000 and 55432 listeners in this scope remaining. The temporary Cloudflare connector was also closed. No user-owned server or PostgreSQL process was terminated.

The ordinary `npm run build`/default type-output path was deliberately not used against the active `.next` application. Equivalent production compilation, build type checking, source TypeScript and both media gates ran on the isolated artifact. No Prisma schema/client change required regeneration. No database fixtures, CMS writes, remote database connection, schema migration or production deployment was used. Motion source, styles, Gallery implementation, signature, schema and lockfile remain unchanged from `30b58a4`. The previously documented GSAP orientation-listener/finite-memory limitations are unchanged and outside this security task.

### Recorded failures and corrections

- The first new unit run was 5/6: its synthetic future-clock expiry check pruned a second test session before the later proof assertion. Reordering that clock assertion fixed the test; the lifecycle behavior was retained. Focused cases then passed 6/6.
- Initial launcher attempts refused startup before listening. The sanitized stage diagnostic established an `@next/env` CommonJS default-import mismatch; using its named export corrected it. A subsequent refusal identified the existing `.env` `DEMO_MODE=true` default; the launcher now rejects conflicting explicit shell modes and sets its own operational flags before loading defaults, preserving `.env`.
- Authenticated native ingress initially reached a Next 404. Temporary boolean-only diagnostics established that session/proof were valid but request validation failed: Next inferred `x-forwarded-proto: http` from the loopback socket. The already-authenticated ingress now canonicalizes the exact validated external HTTPS origin. Conflicting inbound headers remain denied. Diagnostics were removed.
- Browser login exposed a real incompatibility between `Referrer-Policy: no-referrer` and the strict form Origin check. `same-origin` preserves same-origin form provenance while suppressing cross-origin referrers; exact Origin enforcement remains. Later failures were in the synthetic HTTPS fixture: it selected duplicate cookies across its API transport/browser domains and attempted a redirected mock hostname through DNS. It now selects only the HTTPS-origin cookie, tests revocation/redirect natively and opens the login route explicitly. No denial assertion was relaxed; final browser results are 5/5.
- A diagnostic build caught strict typing of heterogeneous test-header objects; their type now permits absent headers. The full unit suite then caught a genuine native Node startup compatibility regression: `production-env.ts` acquired an extensionless TypeScript dependency. Moving the pure validation module to explicit `.mjs` plus declarations restored native startup; all 97 tests pass. An ESLint run overlapped that file move and failed ENOENT; a fresh stable-tree lint passed. These failed logs are retained rather than overwritten as passes.

Command logs/results are ignored under `.local/secure-client-preview/`, including `unit-final`, `typecheck-final`, `lint-final`, `build-final`, `browser-final`, `legacy-presentation`, `teardown.json`, `tunnel-probe.json` and `revocation-probe.json`. The new validation-artifact directory also has verified owner/SYSTEM-only permissions. Runtime/tunnel logs are private; do not distribute them as public media evidence.

### Remaining blockers / next review

1. Confirm the client's exact email and deliberately review the audience/configuration. Until then, only the confirmed developer may be allowlisted.
2. Obtain and privately document each actual remote media authorization, including participant/minor clearance, then grant only the exact approved source/derivative/slot/audience/expiry combinations. All real private slots currently remain blocked.
3. Complete a human developer OTP login through a newly generated protected URL, then the independent application code, and repeat unauthenticated/expired/admin/write-denial checks through that real link before a client session.
4. Only after grants exist, verify the real remotely decoded Hero, Story, portraits, Gallery, six logos and coin across desktop/mobile. Until then, the complete photographic preview is **BLOCKED**, while the tested fallback infrastructure is available for technical review.

Finite Windows/Chrome tests and a temporary connector probe are not Linux, physical-device, production-hosting, legal/publication or unlimited-session assurances. Stop for technical review; no tunnel, active preview or viewing capability is left running by this task.

## Files changed

- `.gitignore`, `eslint.config.mjs` — exclude the isolated generated artifact.
- `next.config.ts`, `tsconfig.client-review.json` — opt-in isolated production/type output; normal defaults retained.
- `package.json` — configure/typecheck/build/start/test/revoke commands; dependencies and lockfile unchanged.
- `scripts/build-client-review.mjs` — isolated production checks and restoration of existing generated type entry.
- `scripts/configure-client-review.ts`, `scripts/start-client-review.ts`, `scripts/revoke-client-review.ts` — protected operator configuration, read-only production ingress lifecycle and revocation.
- `scripts/test-client-review.mjs` — owns only its exclusive test servers; Windows IPC shutdown for the preview.
- `scripts/check-public-media.ts`, `scripts/check-client-demo-build.mjs` — audit the selected preview artifact as well as the unchanged default artifact path.
- `src/lib/client-review-environment.mjs`, `src/lib/client-review-environment.d.mts` — native-Node-compatible pure configuration/route/header policy and types.
- `src/lib/client-review-policy.ts` — codes, bounded sessions, expiry, revocation and internal signed request proof.
- `src/lib/client-review-grants.ts`, `src/lib/client-review-media.ts` — audience-bound individual remote grants and authenticated per-request media selection.
- `src/lib/client-review-http.ts` — host/origin/body/rate/authentication/read-only ingress and safe media responses.
- `src/lib/presentation-assets.ts`, `src/lib/official-presentation.ts` — shared unchanged local integrity reader plus separately gated remote adapter.
- `src/lib/production-env.ts`, `src/proxy.ts` — fail-closed preview configuration and defense-in-depth routing.
- `src/lib/db.ts` — retain only the preview process's own Prisma instance for orderly pool shutdown; normal production behavior retained.
- `src/components/home/parallax-hero.tsx`, `src/components/company/company-story.tsx` — recognize the new controlled media URL prefix; no artwork, layout or motion recipe changed.
- `tests/client-review.test.ts`, `tests/client-review-media.test.ts` — policy, ingress, expiry/revocation and synthetic media authorization/integrity cases.
- `playwright.client-review.config.ts`, `tests/client-review-browser/review.spec.ts` — official fallback, host/origin, cookie, denial, read-only, preference, focus/logout and disabled-mode regressions.
- `docs/SECURE_CLIENT_PREVIEW_CLOUDFLARE.md` — this report/procedure.

Ignored `.local/secure-client-preview/` artifacts contain execution logs, synthetic transport diagnostics, source/build preservation measurements and the temporary live tunnel probe. Operator configuration, access codes, media catalogs and captures remain ignored. No originals, approval registries, database records, stylesheet, motion timeline, dependency, schema, commit, push, merge or deployment was changed/performed.
