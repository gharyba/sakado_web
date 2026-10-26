# Secure SAKADO client review — ngrok Free / Google OAuth

Date: 2026-10-25. Branch: `feat/cinematic-redesign-08`. Starting checkpoint: `8a04c70`. Work remains uncommitted; no deployment or provider-account change is included.

## Scope and current safeguards

The existing production client-review handler still listens **only on 127.0.0.1:3144**, renders the official SAKADO pages, and uses its separate `.next-client-review` artifact. The transport is now pinned in the ignored operator configuration to the account's exact assigned HTTPS ngrok Free origin. The two exact Google emails authorized in the current user request are stored only in that protected configuration/policy, not in client code or this tracked document. No whole-domain/wildcard authorization is generated.

The independent SAKADO access code, bounded session registry, Secure/HttpOnly/SameSite=Strict `__Host-sakado_review` cookie, read-only route policy, signed internal request proof, production validation, loopback binding and per-request private-media checks are preserved. Google authentication does not create a CMS role/session, authorize admin access or grant media rights. Forwarded Google/ngrok/Cloudflare identity headers are not accepted as application authentication.

Latest operator correction: both active access configurations now contain exactly the two Google addresses in the user's latest instruction. The superseded institutional address is absent from both the SAKADO operator configuration and generated OAuth policy. The corrected policy/hash validates, grants remain empty, and the review is deliberately **revoked/stopped with no viewing code** until the operator runs the startup commands. The corrected audience has **not passed a manual authentication test**; user confirmation is required.

There are **zero remote media grants**. Photographic Hero S08/S16, Story/Gallery photos, permanent portraits, private SAKADO artwork and six partner logos remain unavailable remotely. Existing public-safe fallbacks are used. The cinematic source, Gallery, Hero geometry, Story/Team/Partners styling, coin rotation/timing, Footer/signature and business data are unchanged. An email allowlist is not participant/minor clearance or publication approval.

## Origin and OAuth policy binding

`reviewOrigin()` validates a canonical HTTPS origin without a path, port, credentials, query, fragment or trailing slash. The ngrok mode supports the assigned `ngrok-free.dev` domain family, but a syntactically valid ngrok hostname alone is insufficient: startup requires an exact match with `catalog.json.transport.origin`. Runtime validation additionally binds the provider and configured origin. The existing Cloudflare syntax remains for historical compatibility; a pinned ngrok configuration cannot start against a different Cloudflare or ngrok origin.

The preparation command produces `.local/client-review/ngrok-traffic-policy.json` with exactly two unconditional request rules:

1. Authenticate through the managed **Google OAuth** provider.
2. Deny HTTP 403 unless `actions.ngrok.oauth.identity.email` belongs to the exact configured email list.

These rules apply to every path and method; there is no GET-only, public-path, API, POST or media exemption. The implementation follows ngrok's documented [OAuth action and explicit email-list restriction](https://ngrok.com/docs/gateway/traffic-policy/actions/oauth). The [deny action](https://ngrok.com/docs/gateway/traffic-policy/actions/deny) rejects unlisted identities before upstream access. The installed 3.39.11-msix-stable agent supports JSON `--traffic-policy-file`, `--url` and `--inspect=false`, consistent with the [agent CLI](https://ngrok.com/docs/gateway/agent/cli).

The policy's byte SHA-256 is bound into the private operator configuration. Both its hash and its exact semantic structure must match the policy generated for that audience. Deleting OAuth, changing the provider, weakening the exact email test, adding path/method conditions, changing the allowlist or editing bytes without the matching reviewed configuration fails closed. Recomputing a hash for a weaker policy is insufficient. Origin, policy and audience are included in the active-run configuration identity.

Configuration is checked on requests and by the runtime monitor; invalid/missing policy, revocation, expiry or an audience change denies requests and stops the preview. The sharing monitor also stops only its own ngrok child when configuration or the owned preview lock changes/disappears. There is no unauthenticated fallback or endpoint pooling.

The preflight and sharing monitor also probe the recorded process with signal 0 (liveness only, never termination). This avoids trusting a stale lock after an abrupt preview-process exit. An unexpected agent exit is an error, including exit code 0 unless shutdown was explicitly requested.

## Exact PowerShell startup

Use Node 24 and the existing verified PostgreSQL service. Do not initialize/reset/migrate the database, edit `.env`, copy credentials, expose 3000/3134, or terminate user-owned processes. The ngrok account/authentication configuration already used by the successful independent test is preserved; do not paste its authtoken into project files or commands in this report.

### 1. Review the private configuration

The exact assigned origin and the two confirmed email strings already exist in `.local/client-review/catalog.json`. Read them locally and preserve this exact audience. If the old independent ngrok test is still running, stop **its own terminal with Ctrl+C** when finished; the sharing command refuses an occupied local agent port 4040 and will not reuse/kill it.

Prepare or deliberately reactivate a bounded review using those reviewed values, with no media grants:

```powershell
Set-Location -LiteralPath 'C:\Users\Dell\Desktop\sakado_web'
$reviewConfig = Get-Content -LiteralPath '.local/client-review/catalog.json' -Raw | ConvertFrom-Json
$reviewOrigin = $reviewConfig.transport.origin
$reviewEmails = @($reviewConfig.allowedEmails)
if (-not $reviewOrigin -or $reviewEmails.Count -ne 2) {
  throw 'Review the exact assigned origin and the two explicitly confirmed emails first.'
}
npm run configure:client-review:ngrok -- "--origin=$reviewOrigin" "--email=$($reviewEmails[0])" "--email=$($reviewEmails[1])" --activate
```

The origin must be the actual assigned HTTPS origin from the account/verified independent test, never another account's hostname or an invented URL. Preparation validates exact email syntax, rejects duplicates/wildcards, preserves/refuses an active lock and refuses to change an audience with existing media grants. It creates the policy/configuration through the owner/SYSTEM-only atomic runtime writer. It starts **no tunnel**. Without `--activate` the prepared configuration is revoked. Reauthorization is explicit; expiry is 24 hours and each running review remains limited to one hour.

### 2. Validate the isolated production artifact

```powershell
npm run typecheck:client-review
npm run lint
npm test
npm run build:client-review
npm run test:client-review
ngrok version
ngrok config check
```

Use the isolated build rather than rebuilding a live `.next` application. Its build/type commands preserve `next-env.d.ts`; public-file/private deployment-trace gates inspect the actual preview artifact. No dependency/schema/Prisma regeneration change is required.

The browser command owns exclusive loopback ports **443, 3144 and 3145** and refuses occupied ports without terminating services. Its disposable self-signed certificate is only for the local test fixture, never installed in Windows or used for public ngrok traffic. It uses the existing OpenSSL executable (Git for Windows provides it here; `OPENSSL_EXECUTABLE` can explicitly select an existing installation). Only that loopback test browser accepts the fixture certificate and maps the exact host to 127.0.0.1. Google/live ngrok HTTPS validation is not disabled. Foreign browser resources are refused, so redirects cannot reach the public endpoint during these local tests.

### 3. Start the review server in terminal A

```powershell
$reviewConfig = Get-Content -LiteralPath '.local/client-review/catalog.json' -Raw | ConvertFrom-Json
$reviewOrigin = $reviewConfig.transport.origin
npm run start:client-review -- "--origin=$reviewOrigin"
```

Startup rechecks the exact local PostgreSQL URL/identity/data directory in a read-only transaction, private ACL, inactive lock, valid policy/configuration and exclusive loopback port. Both `SITE_URL` and `ADMIN_URL` become the exact HTTPS origin inside this process; normal production configuration validation remains active. `DEMO_MODE`, `CLIENT_DEMO`, `OFFICIAL_PRESENTATION` and `STAGING_MODE` remain false; `TRUST_PROXY=false`. Private originals and existing approval records are untouched.

The owner reads `.local/client-review/access-code.txt` locally. Do not put the code in a URL, Git, log, public screenshot or report. It is valid five minutes; its file is removed afterward. Application sessions last at most 30 minutes, bounded by the one-hour run. If the startup/preflight code window expires, stop the owned preview and start a fresh run; do not weaken or extend validation to recover it.

### 4. Verify controls, then share in terminal B

```powershell
# Normal terminals should resolve the already-installed ngrok command.
$env:NGROK_EXECUTABLE = (Get-Command ngrok -ErrorAction Stop).Source
npm run check:client-review:ngrok
npm run share:client-review:ngrok
```

`check` opens no public endpoint. It verifies the pinned origin and protected OAuth policy, anonymous-media/forged-identity denial, wrong-host/origin denial, real application GET/login POST, cookie flags, admin/dev/export/write denial, logout and copied-token rejection. Its temporary application session is revoked before it returns.

`share` repeats that preflight **before** launching ngrok, verifies the policy again, refuses an existing local agent, and launches only this equivalent command:

```powershell
$reviewConfig = Get-Content -LiteralPath '.local/client-review/catalog.json' -Raw | ConvertFrom-Json
$reviewOrigin = $reviewConfig.transport.origin
$reviewPolicy = (Resolve-Path -LiteralPath '.local/client-review/ngrok-traffic-policy.json').Path
& $env:NGROK_EXECUTABLE http 'http://127.0.0.1:3144' --url $reviewOrigin --traffic-policy-file $reviewPolicy --inspect=false --log=stdout --log-format=json --log-level=warn
```

Use the `share` command for the monitored lifecycle rather than manually bypassing it. Do not omit the policy, use deprecated OAuth flags as an unverified fallback, rewrite Host to localhost, enable pooling, lower HTTPS checks, enable debug/request-body logging, add a wildcard email/domain, or point at an unrelated listener. Request inspection is disabled so the agent's local traffic inspector does not retain login form bodies/cookies. Existing account configuration is consumed by ngrok itself and is not copied or modified by SAKADO.

## Authentication, testing and shutdown

The visitor opens the exact HTTPS origin, passes ngrok's Google OAuth and exact-email rule, then completes the independent SAKADO access-code form. An initial Google redirect is expected. For the application login, POST returns **303 to `/`**, followed by GET 200; this is correct behavior, distinct from the independent test server's reported POST 200. Business/contact/booking/admin POST requests remain denied even after both authentications.

The Free-plan informational interstitial is separate from Google authentication. It cannot prove login or authorization. Scripted outer-challenge measurements may use ngrok's informational-warning header; it does not bypass OAuth, the email rule or SAKADO authentication.

Validate each permitted identity through Google when credentials are available. With an unlisted Google identity, expect edge 403 and no SAKADO access. After Google succeeds but without a SAKADO cookie, private media must still fail and the homepage must require the code. With both authentications, verify official navigation, secure cookie flags, desktop/mobile fallbacks and admin/export/upload/mutation denial. Test logout/replayed/expired application tokens, plus full revocation. Do not send passwords, codes, provider cookies or OAuth tokens in chat/report evidence.

To stop/revoke:

```powershell
npm run revoke:client-review
```

The configuration is marked revoked atomically. New requests fail closed; the app clears its session registry and code/lock on shutdown, and the sharing monitor stops its own ngrok child. Also use Ctrl+C in the owned sharing terminal, then Ctrl+C in the owned preview terminal if still running. Do not kill all `ngrok`, `node` or PostgreSQL processes. Confirm 3144 and the owned agent listener are released; PostgreSQL 55432 must remain. Neither logout nor an existing Google cookie grants future application access after revocation/restart.

Per-browser SAKADO logout remains same-origin `fetch('/_client-review/session', {method:'DELETE'})`. Ngrok's documented `/ngrok/logout` ends its outer OAuth session; it does not substitute for application revocation. Reauthorize a later run deliberately, with the same reviewed audience or newly verified consent. Do not reactivate revoked grants automatically.

## Media and design preservation

Remote media still requires a valid application session/internal proof, explicit slot/source/derivative/audience/expiry grant, source/derivative integrity and safe path checks on every request. Partner-specific restrictions and no-store delivery are retained. No private bytes enter public assets, the optimizer, client data URLs or deployment traces. See the historical [private grant requirements](SECURE_CLIENT_PREVIEW_CLOUDFLARE.md#individual-private-media-authorization); configuring Google emails grants no photo/portrait/branding/partner permission.

Current blockers remain the selected Hero variants, each Story/Gallery image/derivative, both permanent portraits, private SAKADO artwork and six partner logos, including participant/minor clearance where applicable. Only after evidence is human-verified may exact individual remote grants be added. Until then the full photographic Gallery/coin presentation cannot be claimed available remotely; the approved source remains unchanged.

## Validation evidence

| Check                                                                            | Result and scope                                                                                                                                                                    |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full unit/security suite                                                         | **101/101 PASS**, no skips: 97 existing plus four ngrok origin/policy/audience/file-integrity cases                                                                                 |
| TypeScript                                                                       | PASS, final isolated typecheck including scripts/tests                                                                                                                              |
| ESLint                                                                           | PASS                                                                                                                                                                                |
| Production build                                                                 | PASS, final isolated production artifact                                                                                                                                            |
| Media build gates                                                                | PASS: 17 registered assets; 53 traces without private workspace files                                                                                                               |
| Local ngrok-origin browser regressions                                           | **5/5 PASS** through real loopback TLS/DNS mapping; official pages at 1440/1024/768/375px, cookies, read-only/media/admin denial, focus/preferences/logout and disabled-review mode |
| Existing local presentation regressions                                          | **25/25 PASS**, including protected local photographs, six partner logos, Gallery, coin, Story/Team and responsive/reverse/reduced-motion behavior; no new remote approval          |
| New public-launch preflight                                                      | PASS before the temporary owned endpoint was started: policy validation, application GET 200/login POST 303, Secure/HttpOnly/Strict cookie, denial and copied-token revocation      |
| Live ngrok TLS and outer Google challenge                                        | PASS for the pre-correction test run: endpoint 302 → `idp.ngrok.com` 302 → `accounts.google.com`; certificates validated normally                                                   |
| Live anonymous GET/POST/media/admin/forged identity                              | PASS for the pre-correction test run: all required outer authentication, with synthetic invalid form data only                                                                      |
| Expired-code / occupied-agent negative preflights                                | Expected exit 1; no new endpoint launched, no active process interrupted                                                                                                            |
| Full revocation                                                                  | PASS: configuration revoked; app exited 0, sharing monitor stopped its owned agent, code/lock removed; no remaining owned TLS/preview/agent listener                                |
| Corrected audience/configuration/policy                                          | PASS: exact latest two-address set, superseded address absent from both active access files, strict policy/hash validated, zero grants, left revoked                                |
| Manual Google allowed-account and unlisted-account checks for corrected audience | **NOT PASSED / awaiting user confirmation**                                                                                                                                         |
| PostgreSQL / existing build preservation                                         | PASS: all 15 table fingerprints/counts byte-identical; `.next/BUILD_ID` and `next-env.d.ts` retain original hashes; PostgreSQL remains on loopback 55432, PID 32336                 |

The user reported the prior independent ngrok Free test as HTTPS/Google OAuth/GET 200/POST 200/unauthorized-account denial PASS. Those are **user-reported independent-test results**, not a completed manual authentication test of the corrected SAKADO audience. A human sign-in was requested for the integrated run, but that code window expired and the run was subsequently revoked for the shutdown test. The user's latest instruction corrected the audience and requested operator-controlled reactivation. No manual account acceptance/denial is inferred from an OAuth redirect, static allowlist or local browser test.

The [computer-use skill](C:/Users/Dell/.codex/plugins/cache/openai-bundled/computer-use/26.1021.31345/skills/computer-use/SKILL.md) delegates to its [guidance](C:/Users/Dell/.codex/plugins/cache/openai-bundled/computer-use/26.1021.31345/docs/guidance.md), which says: “Do not automate user authentication dialogs.” Accordingly, no Google credentials/dialogs or SAKADO login dialog in the user's browser were automated. The human account check remains an explicit handoff rather than a fabricated PASS.

The live checks preceded the final audience correction. The corrected configuration/policy was verified locally and intentionally not activated or exposed afterward; its next real Google sign-in must be performed by the operator using the fresh-code procedure. Real private media remains blocked. No complete photographic remote preview is claimed.

### Failures investigated

- The first ngrok-domain browser run was **3/5**, because the previous Playwright interception fixture did not contain browser redirect chains. The result was ngrok's informational warning/offline page rather than official page content. That run was not accepted as visual/login evidence. The fixture was replaced with a real loopback HTTPS proxy, explicit browser DNS mapping, no proxy-server use and foreign-resource denial. The complete rerun passed **5/5**, without relaxing application authorization or denial assertions.
- The first live probe incorrectly required a direct redirect to Google. Captured status/hostname metadata showed the legitimate `idp.ngrok.com/oauth2/authn` intermediary. The probe was corrected to follow that specific intermediary and establish the subsequent Google Accounts redirect; the product policy was not weakened. Each earlier owned run shut down during probe cleanup.
- The expired-code and occupied-agent checks deliberately refused. A missing access code after five minutes, a revoked configuration or no 3144 listener is an inactive review, not proof of a successful manual login. Reactivation and fresh-code generation remain explicit.

No failed security assertion was skipped. No unprotected fallback, forced successful test exit, credential copy, provider-account modification, media approval or business write was added.

Private logs/results are under `.local/secure-ngrok-review` (`unit-final`, `typecheck-final`, `lint-complete`, `build-final`, `browser-tls`, `live-ready.json`, `live-transport.json`, `live-teardown.json` and the two expected-refusal logs). The 25-case legacy log and browser server teardown are retained under `.local/secure-client-preview`. The earlier private configuration snapshot is historical evidence only; startup reads exclusively the current protected `catalog.json` and bound `ngrok-traffic-policy.json`.

Next step: use the commands above when ready, complete Google plus the independent SAKADO code, confirm the allowed identity reaches the official site, and verify a genuinely unlisted identity is denied. Report results without passwords, codes or cookies. The real Google-authenticated end-to-end check for the corrected audience and real remote private-media decoding remain unconfirmed until the relevant human authorization/testing actually occurs.

## Modified files

- `src/lib/client-review-environment.mjs` — canonical ngrok syntax plus runtime provider/origin binding.
- `src/lib/client-review-grants.ts` — optional pinned transport; audience identity includes origin/policy.
- `src/lib/client-review-ngrok.ts` — unconditional Google OAuth/exact-email policy generator and strict verification.
- `src/lib/client-review-media.ts` — verify the bound policy whenever operator configuration is read.
- `scripts/presentation-runtime.mjs` — allow one additional fixed private policy filename through the existing verified atomic writer; no arbitrary path capability.
- `scripts/configure-client-review-ngrok.ts` — safely prepare/reactivate exact origin/audience/policy without modifying grants or starting a tunnel.
- `scripts/start-client-review.ts` — require the pinned origin and set the verified transport identity.
- `scripts/client-review-ngrok-preflight.ts`, `scripts/check-client-review-ngrok.ts`, `scripts/share-client-review-ngrok.ts` — pre-publication control checks and owned protected agent lifecycle.
- `scripts/revoke-client-review.ts` — provider-neutral operator wording.
- `scripts/test-client-review.mjs`, `playwright.client-review.config.ts`, `tests/client-review-browser/review.spec.ts` — real loopback HTTPS/DNS-mapped testing, configured-origin coverage and forged ngrok identity denial.
- `tests/client-review-ngrok.test.ts` — exact-origin, policy/allowlist/tamper, audience and on-disk policy validation.
- `package.json` — prepare/check/share scripts; no dependency or lockfile change.
- `docs/SECURE_CLIENT_PREVIEW_CLOUDFLARE.md`, `docs/SECURE_CLIENT_PREVIEW_NGROK.md` — historical-provider notice and current operator/validation report.

Ignored private evidence/configuration stays under `.local/secure-ngrok-review` and `.local/client-review`. No cinematic component, stylesheet, motion recipe, media approval registry, original private media, database record, schema, commit, push, merge or deployment is changed by this adaptation.
