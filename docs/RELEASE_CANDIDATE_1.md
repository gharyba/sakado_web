# v1.0.0-rc.1 — draft release notes

**BLOCKED — preparation draft, not a released or validated candidate.** No tag or public launch. External staging has not been provisioned or tested. Candidate source/build identifiers remain unset until reviewed code and real staging evidence exist.

## Changes accumulated through Phases 01–08

- Phase 01 established shared styling and accessible progressive motion with reduced-motion support.
- Phase 02 added responsive cinematic navigation and keyboard-capable mobile controls.
- Phase 03 added the rounded hero composition and optional scoped parallax; no approved scenic photograph is implicitly selected.
- Phase 04 enhanced About/activity/gallery presentation and enforced identity/hash-bound photographic readiness. All 17 library assets remain BLOCKED with 85 approvals PENDING REVIEW.
- Phase 05 added existing-system adventure/event discovery, detail and registration workflows with capacity/idempotency protections. This code does not approve unconfirmed business policies.
- Phase 06 hardened CMS workflows, permissions/origin/error handling, safe exports, production configuration and disposable PostgreSQL/Linux CI coverage.
- Phase 07 prepared local production-build startup, storage, backup/restore and rollback rehearsals with synthetic data and explicit staging noindex.
- Phase 08 prepares external staging requirements, operator/evidence runbooks and an offline RC consistency gate. It does not deploy, add storage infrastructure, change the schema or certify provider behavior.

## Scope and known limitations

The working Next.js/React/Prisma/PostgreSQL/CMS/authentication/media architecture and locked dependencies are preserved. No migration files, paid services, payment/SMS/provider integration, redesign, media approvals or production configuration changes are introduced here.

There is no confirmed staging hostname, Node 24 provider runtime, dedicated staging database, persistent upload path, access restriction, HTTPS endpoint or staging owner. No external health/smoke/registration/persistence/backup/restore/rollback evidence exists. Prior local checks and a user-reported older Linux run are not candidate-specific staging proof.

Five high development lint-tool audit entries remain an authorized remediation/risk decision; runtime omit-dev audit has zero findings at the Phase 08 audit, which is not security certification. Manual screen-reader/physical-device testing, operational owners, privacy/hosting/backup-country decisions and business policies remain unresolved. No approved original photograph is integrated or silently published.

## Installation, upgrade and recovery handoff

Use the reviewed Node 24/Linux locked-install/build process and current migration inventory; do not upgrade dependencies, migrate dev/reset or db push. Only a separately authorized operator may provision isolated staging, run reviewed migrate deploy or create its first OWNER. Validate durable storage before assuming uploads survive deployment.

Follow [EXTERNAL_STAGING](EXTERNAL_STAGING.md), [BACKUP_RESTORE](BACKUP_RESTORE.md) and [ROLLBACK](ROLLBACK.md); application rollback is not database rollback. Do not copy real participant data into staging. No public go-live procedure is executed by these notes.

Release acceptance, exact candidate commit/build, CI URLs, actual staging results and a human tagging decision must be attached through [RELEASE_CANDIDATE](RELEASE_CANDIDATE.md). Until then: **RC BLOCKED; PRODUCTION BLOCKED**.
