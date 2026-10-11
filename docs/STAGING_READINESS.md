# Staging readiness — Phase 07

Target: **READY FOR LOCAL STAGING REHEARSAL**, subject to the executed evidence in [PHASE_07](PHASE_07.md). **EXTERNAL STAGING BLOCKED; PUBLIC PRODUCTION BLOCKED.** A loopback rehearsal is not Hostinger, HTTPS, Linux runtime or legal validation.

## Architecture and environment separation

Browser → HTTPS/access restriction → hosting reverse proxy → existing Next.js Node application → dedicated PostgreSQL and dedicated persistent media storage. Admin uses `/admin` on the same application, or the existing configured admin origin. No microservices or new database platform.

| Environment              | Data / secrets                                                                | Runtime / storage                                                   | Indexing / exposure                                                          |
| ------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Local development        | Existing development DB only when explicitly needed; demo may avoid it        | Node 24, local uploads                                              | Loopback; never infer content approval                                       |
| CI                       | Fixed disposable service credentials and synthetic fixtures                   | Linux Node 24; temporary storage                                    | No deployment or real data                                                   |
| Local Phase 07 rehearsal | Fresh owned cluster, ephemeral test credentials, synthetic owner/event/swatch | Production build on local Windows Node 24; isolated ignored storage | Loopback, STAGING_MODE=true; HTTP transport is not HTTPS sign-off            |
| External staging         | Unique staging secrets/admin, dedicated DB; no copied production PII          | Production Node runtime, dedicated persistent test storage          | HTTPS, provider/proxy access restriction, STAGING_MODE=true, DEMO_MODE=false |
| Production               | Separately approved business data, secrets and authorized media               | Verified hosting, external PostgreSQL, durable storage              | Official domain and explicit launch approval; currently blocked              |

Use [.env.staging.example](../.env.staging.example) as an empty inventory, not as deployable configuration. Next does not automatically load `.env.staging`; supply process/provider settings. NODE_ENV remains `production`. Required operational values are DATABASE_URL, AUTH_SECRET, SITE_URL HTTPS origin and DEMO_MODE=false. ADMIN_URL is optional for shared-host `/admin`. STAGING_MODE=true adds X-Robots-Tag/no-store to application responses, disallows robots and returns an empty sitemap. It does not authenticate visitors, disable business writes or grant publishing rights. External staging needs an additional provider/proxy access restriction. TRUST_PROXY stays false until replacement of identity headers is proven. Only MEDIA_STORAGE=local exists; MEDIA_LOCAL_DIR must be a dedicated approved path. PORT is assigned to the process, never a Next .env value. No DIRECT_URL or alternative storage adapter is implemented.

## Gates

PASS means scoped local evidence, not approval of external infrastructure.

| Area             | Status     | Evidence / prerequisite                                                                                                                                                        |
| ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Environment      | PASS       | Existing production validator reused; staging flag validated; invalid-start and missing-build checks rehearsed.                                                                |
| Database         | PARTIAL    | Fresh disposable target and server identity checks; migrations/application compatibility rehearsed. External provider, TLS, region, firewall and pooling unresolved.           |
| Storage          | BLOCKED    | Local restart/release-switch evidence cannot prove Hostinger redeploy persistence. External adapter or written persistence guarantee plus actual rehearsal required.           |
| HTTPS/proxy      | NOT TESTED | Actual certificate, redirect, original Host/protocol, header replacement and Secure cookies must be checked externally. No HSTS enabled.                                       |
| Admin            | PARTIAL    | Synthetic first-owner provisioning, hashing and duplicate protection; existing login/role browser regressions. Dedicated staging/live owner still unprovisioned.               |
| Media            | BLOCKED    | 17 BLOCKED / 85 PENDING REVIEW preserved. Test swatch is generated, not participant media. Hardware upload unchanged.                                                          |
| Privacy          | BLOCKED    | Hosting/backup countries, retention, withdrawal, processor arrangements, notices and applicable INPDP decisions TO BE CONFIRMED by qualified reviewers.                        |
| Backup           | PARTIAL    | Synthetic complete custom dump/verification rehearsed; historical real-data recovery proof retained. Off-device encryption, custody, retention and provider backup unresolved. |
| Restore          | PARTIAL    | Synthetic restoration into a separate database, all-table fingerprints and application smoke; real external restore not performed.                                             |
| Rollback         | PARTIAL    | Previous committed artifact/candidate switch rehearsed locally; external release switching, current rights revocation and incident ownership unresolved.                       |
| Monitoring       | BLOCKED    | Health route exists; monitor, alert routing and incident owner TO BE CONFIRMED.                                                                                                |
| Smoke workflows  | PASS       | Existing Phase 04–06 suites reused plus controlled Node HTTP checks; see actual results in PHASE_07.                                                                           |
| Accessibility    | PARTIAL    | Scoped automated checks; manual checklist below remains uncompleted.                                                                                                           |
| Physical devices | NOT TESTED | Browser emulation does not establish phone/tablet/browser-device validation.                                                                                                   |
| Security         | PARTIAL    | Existing guards/regressions retained; five high dev dependency entries remain an explicit security decision.                                                                   |
| Release process  | PARTIAL    | Offline inventory, runbooks and stop conditions prepared; no external staging or release approved.                                                                             |
| Linux/GitHub     | PARTIAL    | User reports repaired Linux CI succeeded and supplied run 38156234009. Connected GitHub access returned 404; no independent verification or Phase 07 pushed run.               |

## Manual accessibility and device record

All boxes below are **NOT TESTED** manually in this phase; record reviewer/date/device/build/evidence rather than checking them based on automation.

- [ ] Keyboard: public/admin navigation, skip links, focus order/visibility, event filters and registration review.
- [ ] Screen reader: French language, landmarks/headings, field labels/required state, error summaries and status announcements.
- [ ] Dialogs: mobile menu/gallery focus containment, Escape, cancel/destructive confirmations and focus restoration.
- [ ] Zoom 200%, narrow reflow, landscape/orientation, text scaling and no obscured essential actions.
- [ ] Reduced motion/system changes and MotionToggle; static content and controls stay usable.
- [ ] Android Chrome and iPhone Safari (if available): navigation, event/registration, gallery, touch targets and admin essentials.
- [ ] Desktop Chrome, Firefox and Edge; tablet if available. Record actual versions and input methods.
- [ ] Slow network, failed image, latency/retry, reduced data and warmed scrolling on representative hardware.

## Hostinger assumptions and questions

No hosting account, settings, SSL, DNS or remote commands were used. Assessment is based on repository behavior only.

| Assumption            | Classification                  | Required confirmation                                                                                                                                                |
| --------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node 24.x requirement | CONFIRMED LOCALLY               | Does the exact plan offer Node 24 and required native modules? Provider runtime still REQUIRES HOSTINGER VERIFICATION.                                               |
| Production start      | CONFIRMED LOCALLY               | `npm start` validates configuration/build and binds loopback. `start:hostinger` selects 0.0.0.0 in source; provider execution REQUIRES HOSTINGER VERIFICATION.       |
| PORT                  | CONFIRMED LOCALLY               | Process-assigned port rehearsed; how does Hostinger inject it and route traffic?                                                                                     |
| External PostgreSQL   | REQUIRES HOSTINGER VERIFICATION | Outbound TCP/TLS/network restrictions, DNS resolution, connection limits, region and pooler/migration endpoint requirements?                                         |
| Media persistence     | BLOCKED                         | Is there a persistent writable path outside versioned releases? Does it survive restart, rebuild, redeploy and rollback? Can it be backed up/restored independently? |
| Writable Next cache   | REQUIRES HOSTINGER VERIFICATION | Is runtime image optimization/cache writable, and what are memory/disk/CPU quotas?                                                                                   |
| HTTPS/proxy           | REQUIRES HOSTINGER VERIFICATION | TLS termination, HTTP redirect, original Host and protocol handling, replacement of forwarded identity headers, request limits/timeouts?                             |
| Secrets               | REQUIRES HOSTINGER VERIFICATION | Who can read environment settings/logs? Are secrets encrypted, masked, rotated and separated per app/environment?                                                    |
| Releases/rollback     | REQUIRES HOSTINGER VERIFICATION | Atomic artifact switch, graceful shutdown, retained previous release, working directory and uploaded-object retention?                                               |
| Backups/monitoring    | BLOCKED                         | Provider snapshot scope/country/retention, restore access, health probes, log custody and incident responsibility?                                                   |

Deployment owner, database owner, backup owner, incident owner, media approval owner and privacy/legal reviewer: **TO BE CONFIRMED**. Payment, deposit, refunds, cancellation communication, waitlist promotion, participant confirmation/count visibility and support responsibilities remain **TO BE CONFIRMED**. No policy was invented or activated.
