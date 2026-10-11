# Phase 08 evidence custody and execution record

Current result: **BLOCKED** prerequisites; external checks **NOT TESTED**. The user reports no staging resources or endpoint and authorizes repository preparation only. No observations in this template are completed results.

## Locations and data minimization

Safe report summaries and inventory belong in docs/PHASE_08.md and docs/release/release-candidate.json. Private screenshots/synthetic test artifacts may live under ignored `.local/phase08/`; private release receipts use the fixed path documented in RELEASE_CANDIDATE. Existing signed media authorizations remain in the ignored media-governance evidence directory. No new sensitive evidence is collected or copied.

Never commit raw provider exports, populated .env, connection strings, cookies, passwords, tokens, DB dumps, HAR/traces, full filesystem paths, participant exports or original/signed personal documents. Do not upload them as CI artifacts. Redact before creating a safe summary; keep only a non-secret evidence ID and reviewer alias. File presence is not an approval decision. A checksum is integrity evidence, not an authorization signature or backup restore proof.

## Human observation template

For each check record these fields in a private reviewed ledger, then place only matching safe metadata in the release receipt:

| Field          | Required record                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| Evidence ID    | Safe lowercase-hyphen identifier; no personal name, URL credential or path                            |
| Reviewer       | Assigned reviewer alias; identity/capability confirmed privately                                      |
| Authorization  | Exact action/target/scope and prior approval reference for external changes                           |
| Scope          | LOCAL, GITHUB_CI or EXTERNAL_STAGING; never interchangeable                                           |
| Candidate      | Full source commit, deployed build ID, artifact/lock/schema/media registry hashes                     |
| Runtime/target | Observed Node/platform and approved staging host/provider reference; private tuple for database       |
| Check          | Expected and observed behavior, controlled synthetic inputs, before/after lifecycle                   |
| Time/device    | Actual UTC test/review time, browser/device/network when relevant                                     |
| Result         | COMPLETE, PARTIAL, BLOCKED or NOT TESTED; unresolved conditions explicit                              |
| Cleanup        | Which owned synthetic records/objects/disposable target were removed, by whom and under what approval |
| Custody        | Restricted evidence location class, retention, encryption status and owner references                 |

No gate is marked COMPLETE until a human verifies the observation and its candidate/environment identity. Distinguish user-reported information from independently examined evidence. Do not turn unavailable tests into NOT APPLICABLE or infer legal permission from Instagram/source presence.

## Persistence ledger — currently NOT TESTED

Use the same generated harmless object/key/hash for every row; do not publish library photographs.

| Lifecycle                           | Before SHA-256 | After SHA-256 | Actual release/time | Result     |
| ----------------------------------- | -------------- | ------------- | ------------------- | ---------- |
| Application restart                 | —              | —             | —                   | NOT TESTED |
| Provider process restart            | —              | —             | —                   | NOT TESTED |
| Build/restart                       | —              | —             | —                   | NOT TESTED |
| Provider redeploy                   | —              | —             | —                   | NOT TESTED |
| Previous release / candidate return | —              | —             | —                   | NOT TESTED |

Actual backup/restore record requires dump format/bytes/SHA, source snapshot/write window, encryption/access/retention/location-class/owner, separate restore identity, schema/table/row comparison, unchanged source and restored application smoke. Rollback requires previous/candidate build, unchanged DB and media hash, health/smoke and candidate return. All remain NOT TESTED externally.

## Manual review — currently NOT TESTED

- Keyboard/focus/skip links/forms/error announcements/dialog closure and restoration.
- Screen-reader language/landmarks/headings/labels/status, 200% zoom, mobile reflow, reduced motion/MotionToggle.
- Android Chrome, iPhone Safari, Windows Chrome/Firefox/Edge and tablet where available; emulation is labeled separately.
- Actual external TLS/cookies/origin, cache isolation, protected admin/CSV, log redaction and restricted media.
- Representative public/admin performance, image optimizer/cache and resource/restart behavior.

Reviewers, external staging evidence, monitoring owner and legal/privacy decisions remain TO BE CONFIRMED. Do not fill these records from Phase 07 local outputs.
