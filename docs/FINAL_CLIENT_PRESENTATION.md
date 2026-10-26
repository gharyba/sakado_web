# Final SAKADO client presentation — live execution report

Date: 2026-10-25. Branch: `feat/cinematic-redesign-08`. No commit, push, merge or production deployment.

## Post-launch user acceptance — visual failure

The user's subsequent manual result confirms that secure ngrok access works and official SAKADO pages open successfully. This is **user-reported successful authentication/access**, not an independently automated Google-account test. Unlisted Google-account denial was explicitly **not tested**.

The same result explicitly **FAILS visual acceptance**: the user reports unexpected forest palette/gradients, missing Floating Memories/logo/Coin Flip and missing or insufficiently visible cinematic scroll effects. The client presentation is **NOT READY**. Passing local regression/security suites does not supersede this failed live acceptance.

Gallery/logo/coin absence is consistent with the current zero private-media grants; the palette and remaining motion observations are being investigated separately. The active review, user session and restrictions are preserved. Direct authenticated-window inspection was attempted, but the computer-use native connection was unavailable (native pipe not found). A separate loopback control of the same unchanged artifact is used for computed-style, dynamic-chunk and rendered-motion observations; it does not establish the state of the user's actual browser. No credentials/cookies are requested or copied.

The user identifies the failing view as **Opera private browsing on Windows desktop**, at the homepage. Its animation-status caption has **not yet been verified**. No assumption is made that reduced motion, a saved preference, data saving, an extension, session expiry or a rendering defect caused this particular user's result.

Focused follow-up results, without modifying application or animation code:

- **Five Chromium control cases passed**: actual normal-motion rendering at 1440/1024/768/375px, plus intentionally saved-off/system-reduced states. Each control used the same existing production artifact on exclusive loopback 3145 with public-safe media eligibility and the guarded existing local database.
- **One installed Opera GX 137.0.6036.65 control passed** at 1440px, launched through the existing Opera executable with a clean headless/private test context. It did not read/reuse the user's profile or authentication cookies. This is a browser-build control, not the user's authenticated window.
- Actual computed colors were night `#07110f`, pine `#0b1714` and the existing multi-stop forest background. Ambient root opacity was 1. The initial plane opacities 0.9/0/0 changed to 0.15/0.2/0.85 by the page end; desktop vertical travel changed from -24px to +24px and returned on reverse scroll. Mobile retained opacity-only movement as designed.
- Story progress rendered from scaleX 0 to scaleX 1 at desktop/tablet widths. All measured CSS/JS requests succeeded, including the lazy motion bundle; no page errors or failed HTTP resources were observed. Every observed Next static-resource path is admitted by the current review path policy.
- Explicit saved-off and system-reduced controls correctly produced static content. This proves those branches work; it does not identify the user's active preference.
- At the elapsed-time check, the live run was about 20 minutes old. Its original valid sessions could not yet have reached the 30-minute time-expiry boundary. This does not establish cookie presence or rule out explicit logout; it avoids blaming the reported failure on an unobserved timeout.

The six cases exited cleanly and released 3145; the original live review/ngrok/PostgreSQL PIDs were retained. Screenshots, computed states, network paths and logs remain in owner/SYSTEM-only `.local/live-visual-diagnosis/` and `.local/secure-client-preview/`. All 15 database fingerprints still match the pre-live baseline; the active review configuration remains byte-identical to its before-diagnosis copy.

**Actual live palette/motion root cause remains unresolved.** Direct user-window inspection is blocked by the unavailable computer-use connection. The visible status caption (and, if motion is on, sanitized failed-resource/JavaScript observations from that actual window) is needed to distinguish preference suppression from a live loading/rendering failure. No palette/timing change, preference override, grant, session restart or security bypass was made to force a passing result.

## A. Official website status

**Running.** The existing official Next.js production client-review artifact serves only on **127.0.0.1:3144**. DEMO_MODE, CLIENT_DEMO, OFFICIAL_PRESENTATION and STAGING_MODE are false. The existing PostgreSQL-backed official content is retained; no disconnected demo was selected.

The authorized existing ngrok endpoint is **https://moonshine-barrel-caviar.ngrok-free.dev**. The running agent reports precisely that URL forwarding to `http://127.0.0.1:3144`, with request inspection disabled. Its management listener is also loopback-only.

The review and tunnel were launched as hidden persistent Windows processes using the existing project entry points. At verification: review PID 26676, ngrok launcher PID 10632, agent PID 34452; original PostgreSQL PID 32336 remains unchanged on 127.0.0.1:55432. The operator can stop access through the existing revocation command; no terminal needs to stay attached to these background processes. Process persistence beyond the current Windows/app session cannot be guaranteed.

The runtime remains capped at one hour, application sessions at 30 minutes and new code login at five minutes after startup. Configuration expiry is a separate 24-hour technical cap. These are security limits, not invented media-license terms.

## B. Media status and exact authorization outcome

**Enabled private slots: none. Runtime grants: zero.** Existing eligible public text/illustrations remain available under their existing policy.

The new written-authorization assurance is recorded in the protected `USER_REPORTED_WRITTEN_AUTHORIZATION.json`, the private inventory, management CSV/checklist and contact sheet. Reference: `OWNER-DEVELOPER-REPORTED-WRITTEN-AUTHORIZATION-2026-10-25`. Classification: **owner/developer-reported authorization, not independently reviewed documentary evidence**. The phone/evidence was not requested, accessed, copied, uploaded or exposed. The actual photographer identity, credit terms and rights duration were not invented.

The assurance covers the stated SAKADO-use portion for these **17 identified slots**: two Hero photographs, 12 Gallery photographs, two permanent portraits and the official logo. This count is unrelated to the separate 17-entry public-media registry. The report includes this two-account ngrok review, WebP conversion and the existing design resizing/cropping. The user's reported permission to publish is recorded separately; it does not change the public-publication register.

The user's subsequent explicit response leaves the following other clearance fields unresolved. The existing strict grant schema requires confirmed or not-applicable participant/minor findings; no values were invented to unlock media.

| Exact blocked slots                                                                                                                                          | Reported owner/use portion                                | Remaining condition                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hero-s08`, `logo`                                                                                                                                           | Confirmed by developer report; not independently reviewed | A recorded human determination of participant/minor applicability, or applicable clearance. The user explicitly did not confirm that determination, even though the inventory observes no identifiable participant in S08. |
| `hero-s16`                                                                                                                                                   | Confirmed by developer report                             | Visible paddler consent assessment and applicable permission/minor findings.                                                                                                                                               |
| `gallery-0`, `gallery-1`, `gallery-2`, `gallery-3`, `gallery-4`, `gallery-5`, `gallery-6`, `gallery-7`, `gallery-8`, `gallery-9`, `gallery-10`, `gallery-11` | Confirmed by developer report                             | Applicable participant consent and minor/guardian clearance or documented applicability findings. Slots 0–2 also supply Storytelling.                                                                                      |
| `team-0`, `team-1`                                                                                                                                           | Confirmed by developer report                             | Individual portrait/participant permission and applicable minor findings. Exactly two permanent profiles remain.                                                                                                           |
| `partner-0`, `partner-1`, `partner-2`, `partner-4`, `partner-5`                                                                                              | Organization/artwork authority not confirmed              | Permission from the relevant organization/brand/artwork authority for the stated review scope.                                                                                                                             |
| `partner-3`                                                                                                                                                  | Identity and permission unconfirmed                       | Identify the actual organization first, then establish the relevant authority/permission. No identity inferred from a monogram.                                                                                            |

The private checklist now requests **only these remaining decisions**, allowing legitimate grouped attestations over explicitly named slots/source identities. It does not request the already confirmed general owner assurance again or ask for a copy of private evidence. Earlier unverified inventory requirements are retained privately as history. The initial inventory generator now refuses to overwrite the recorded management review.

Rights duration/conditions remain as reported or unspecified, independently of technical session expiry and revocation. An attestation must be truthful; unknown continues to block a grant. A later authorization update must be reviewed against exact source and derivative hashes, the two-account audience, purpose and expiry. No private file was copied into public/static/optimizer storage.

## C. Cinematic status

No application component, CSS, typography, geometry, GSAP/ScrollTrigger source, timing, route or animation was changed. The locally authorized complete photographic presentation was tested; the remotely permitted subset is currently the official fallback presentation.

| Section           | Locally authorized presentation                                                                                        | Current remote presentation                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Hero              | Real S08, original crop/camera/scroll behavior passed                                                                  | No private image; existing static Hero fallback.                                                                         |
| Coin Flip         | Actual 0°/90°/180°/270°/360° render assertions, both thin edges, back face, movement/reverse and reduced motion passed | Coin DOM omitted because eligible Hero and artwork are both required. No replacement logo or animation was invented.     |
| Floating Memories | Existing real-photo Gallery and interactive behavior passed the protected presentation tests                           | Private photos withheld; existing empty eligible-media state. No duplicates or substitute photography.                   |
| Storytelling      | Existing photographs, chapters, crossfades/reverse/static restoration passed                                           | Same chapters with established trail/camp/coast illustrations.                                                           |
| Team              | Two permanent portraits and responsive/reduced-motion behavior passed                                                  | Same two permanent profiles with initials/portrait placeholders.                                                         |
| Partners          | Six supplied local marks and original section design passed                                                            | Existing confirmation message; all six marks withheld. partner-3 remains unidentified.                                   |
| Global            | Midnight Forest, continuous gradients, navigation, signature and responsive composition retained                       | Same approved forest styling and public-safe content. Missing photography exposes more of the existing green background. |

The existing local-only notice wording and potential Story array compaction with a partially granted subset remain follow-up integration checks for the first genuinely eligible subset. They do not affect the current zero-grant output; no unnecessary redesign was performed to address a hypothetical granted configuration.

## D. Validation and preservation

Fresh validation for this final mission:

| Check                                                         | Result                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Isolated TypeScript / Next type generation                    | **PASS**, exit 0; next-env restored.                                                                                                                                                                                                                              |
| ESLint                                                        | **PASS**, exit 0.                                                                                                                                                                                                                                                 |
| Isolated production build                                     | **PASS**, exit 0, including public-media and private deployment-trace gates.                                                                                                                                                                                      |
| Unit/security tests                                           | **101 passed**, zero failed/skipped/cancelled. Includes grant/clearance/hash/audience/expiry policy and synthetic session/code/proof expiry/revocation.                                                                                                           |
| Protected presentation browser suite                          | **25 passed**, exit 0 in 219.4 seconds. Actual local Hero/artwork/Gallery/Story/team/Partners, coin states/reverse, responsive/reduced-motion/no-JS and existing access-denial checks.                                                                            |
| Local HTTPS authentication/security browser suite             | **5 passed**, exit 0 in 12.0 seconds including runner cleanup. GET/login POST, Secure/HttpOnly/SameSite Strict cookies, exact origin, forged identity denial, private/admin/write/optimizer restrictions, four widths, navigation/focus and logout replay denial. |
| Actual private derivative requests against the running review | **74/74 denied**: authenticated GET and HEAD for each of the 37 real derivative URLs returned 404 with no-store. Its temporary audit session was logged out and replay denied. No secret or private body was printed.                                             |
| Source/derivative integrity                                   | **23 sources and 37 derivative hashes/full decodes passed**. No substitutions or regeneration.                                                                                                                                                                    |
| Updated offline contact sheet                                 | **23/23 thumbnails decoded**, kept in protected local storage.                                                                                                                                                                                                    |
| Whole-review revocation monitor                               | **PASS**, owned local run exited 0 and closed its listener 1.036 seconds after revocation.                                                                                                                                                                        |
| Configuration-expiry monitor                                  | **PASS**, separate owned local run exited 0 and closed its listener at 20.526 seconds from launch with a 20-second test configuration lifetime. This is not a 30-minute live session-expiry wait; session expiry uses an explicit unit-test clock.                |
| Actual live ngrok boundary                                    | **PASS**, HTTPS certificate validation enabled; five anonymous GET/POST/admin/media probes received HTTP 302 to idp.ngrok.com; provider then returned HTTP 302 to accounts.google.com. No anonymous protected content was served.                                 |
| Exact live preflight                                          | **PASS**, existing origin/policy hash/allowlist, real application login GET/POST, secure cookie, read-only/admin/media denial and logout replay. Sharing script repeated its preflight before launching ngrok.                                                    |

No assertion failed in this mission's fresh suites. Existing development LCP advice for a lazy image and NO_COLOR/FORCE_COLOR warnings remain observations, not suppressed failures; loading policy was not changed. The earlier diagnostic readiness correction is documented in REMOTE_CLIENT_MEDIA_REVIEW.md, separately from this run.

Before/after fingerprints for **all 15 PostgreSQL tables are identical**, including a snapshot while the actual preview/tunnel are running. All 45 imported Instagram records remain unpublished/homepage-off; current categories/content are retained. No migrations, fixtures, CMS writes or real-data mutation occurred.

All **19 pre-existing uncommitted files remain byte-identical** at live verification. The original official `.next/BUILD_ID`, next-env, exact ngrok policy and separate publication-readiness register are unchanged. The registry remains **17 BLOCKED assets / 85 PENDING REVIEW axes**. Runtime configuration changed only deliberate activation and its technical expiry; origin/audience/security/grants are preserved.

All inventory, logs, hash manifests, HTTP observations and screenshots/coin recording remain ignored in owner/SYSTEM-only local review folders. Review processes keep secrets in their intended protected runtime files/in-memory sessions, not this document or console output.

## E. ngrok and interactive acceptance

**Running:** https://moonshine-barrel-caviar.ngrok-free.dev.

The exact Google allowlist is retained for `ygharbi955@gmail.com` and `ygharbi198@gmail.com`; there is no domain/wildcard allowance or superseded institutional address. The strict policy/hash was checked before launch and continues to be checked by the monitors. SAKADO auth is independent; provider headers cannot create an application/CMS session. Admin, APIs, writes, uploads and private files remain denied inside the authenticated review.

Live anonymous requests and Google challenge routing were tested. **The user subsequently confirmed successful secure access and official pages opening; visual acceptance FAILED.** Unlisted Google-account denial remains **NOT TESTED**. No Google-account interaction was automated or bypassed, and no password, code or cookie is requested. The current Opera-specific investigation is recorded at the top of this report.

The code is in `.local/client-review/access-code.txt` while its short window remains open. If it expires before a new viewer logs in, deliberately revoke the owned run and start a new bounded review; do not extend timers or disable cookie/origin checks. Existing authenticated sessions last at most 30 minutes, bounded by the one-hour run.

At the earlier handoff the five-minute code window had expired and its file was removed as designed; the manual result arrived afterward and confirmed access. The review/tunnel were still running and the HTTPS endpoint still returned the expected Google OAuth challenge to anonymous requests. Existing viewer sessions were not interrupted by an automatic restart. A new viewer who has not logged in needs the deliberate fresh-run commands below.

## F. Exact PowerShell runbook

**The review/tunnel are already running. Do not run duplicate launch commands or rebuild their artifact.** The following commands are for a later owned run after revoking the current one. Do not stop PostgreSQL or unrelated user processes.

Terminal A — activate the reviewed two-account configuration and start the official loopback review:

```powershell
Set-Location -LiteralPath 'C:\Users\Dell\Desktop\sakado_web'
$env:DEMO_MODE = 'false'
$env:CLIENT_DEMO = 'false'
$env:OFFICIAL_PRESENTATION = 'false'
$env:STAGING_MODE = 'false'
$reviewOrigin = 'https://moonshine-barrel-caviar.ngrok-free.dev'
npm run configure:client-review:ngrok -- "--origin=$reviewOrigin" --email=ygharbi955@gmail.com --email=ygharbi198@gmail.com --activate
if ($LASTEXITCODE -ne 0) { throw 'Configuration refused; do not continue.' }
npm run start:client-review -- "--origin=$reviewOrigin"
```

This configuration command preserves/refuses existing nonzero media grants rather than silently discarding or expanding them. It is not a media-approval command. Review any future granted subset through the private workflow before reconfiguration.

Terminal B — verify local controls, then launch the existing protected endpoint:

```powershell
Set-Location -LiteralPath 'C:\Users\Dell\Desktop\sakado_web'
$env:NGROK_EXECUTABLE = 'C:\Program Files\WindowsApps\ngrok.ngrok_3.39.11.0_x64__1g87z0zv29zzc\ngrok.exe'
npm run check:client-review:ngrok
if ($LASTEXITCODE -ne 0) { throw 'Security preflight failed; do not share.' }
npm run share:client-review:ngrok
```

The sharing script refuses an existing agent on 4040 and rechecks the exact traffic policy. It uses Google OAuth plus the exact email-deny rule and `--inspect=false`; no second tunnel system or Cloudflare fallback is used. The installation path above is the existing CLI verified in this session, version 3.39.11-msix-stable.

Manual login: open the HTTPS URL; sign in with an allowed account; read the code file locally and enter it into the SAKADO form. Do not copy credentials/codes/cookies into chat, URLs, logs or screenshots. Test an unlisted Google account separately if available and report denial. No media permissions are implied by successful authentication.

Terminal C — revoke and stop the owned review/tunnel:

```powershell
Set-Location -LiteralPath 'C:\Users\Dell\Desktop\sakado_web'
npm run revoke:client-review
```

Monitors stop the owned server/agent. For foreground runs, Ctrl+C in their own terminals is also available; revocation is the explicit access-withdrawal action. Do not use broad taskkill/Stop-Process commands against Node, ngrok or PostgreSQL.

Tests/build before a later launch, only while test ports and the served artifact are free:

```powershell
npm run typecheck:client-review
npm run lint
npm test
npm run build:client-review
node .local/live-client-presentation/run-local-https.mjs
```

Stop on any nonzero exit. The protected local wrapper starts no tunnel, requires zero private grants, refuses occupied ports and restores its original operator configuration after the local HTTPS cases. Do not substitute the fixture-based database E2E scripts.

## G. Client delivery readiness

**BLOCKED for the complete photographic client presentation.** The official secure fallback presentation is running and its actual external Google challenge has been verified. Two conditions remain distinct:

1. Resolve the **failed live visual acceptance**, including the actual Opera window's palette/gradient and missing-motion observations. Access/page opening is now confirmed by the user. Unlisted-account denial remains a separate untested security acceptance item.
2. Obtain only the remaining truthful participant/minor/applicability/portrait/partner findings identified per slot above. The reported SAKADO owner/use authorization is already recorded and is not being requested again. No private proof is requested.

The maximum currently permitted presentation is the official site structure, copy, approved forest styling, existing motion where eligible, public-safe illustrations/initials and unchanged signature. It is not represented as the complete photographic/coin experience. The complete local experience remains intact and passed its real-render tests.

Files changed by this mission: this new tracked report; protected local workflow records/checklist/CSV/contact sheet/generator guard; ignored validation/runtime/process artifacts; deliberate activation/technical expiry in the private operator catalog. No application or cinematic source, original media, public approval registry, business data or dependency was changed. Nothing was staged, committed, pushed, merged or deployed.
