# PostgreSQL backup and restore

Phase 07 rehearsal uses only a **new synthetic cluster**. The historical verified real-data backup remains at the restricted location documented in DEPLOYMENT; this phase does not refresh it or copy its participant/authentication data into staging.

## Approved-target procedure

1. Name the database owner and confirm environment/provider/database identity, schema/migration state, tool/server compatibility and write window. Never rely solely on a URL variable name. Stop if the target is ambiguous.
2. Provision a restricted backup directory outside source/public/release assets. Choose UTC timestamp/run ID, unique names and no overwrites. Real credentials belong in a private PostgreSQL service/password file or secret manager, never shell arguments, logs or Git. Review TLS/certificate verification with the provider.
3. Run full `pg_dump --format=custom --no-password --file="<restricted timestamped dump>"` using privately configured PostgreSQL connection settings. For concurrent writes, coordinate a read-only exported snapshot and fingerprints; otherwise stop writers for a consistent verification window. Do not use filtered/data-only dumps as a complete backup.
4. Record non-zero bytes, PGDMP format, SHA-256, pg_dump/server version, snapshot/time, `pg_restore --list` result and safe evidence ID. A checksum alone is not a successful backup.
5. Create a **separate, newly owned disposable restore database**, with explicit identity/directory guards. Never restore into the original, developer, staging or production DB to test a backup.
6. Use `pg_restore --exit-on-error --single-transaction --no-owner --no-privileges --no-password --dbname="<guarded disposable database>" "<dump>"`. Review ownership/privilege mapping separately; this does not restore cluster-wide roles/passwords/tablespaces or external media.
7. Compare every application/migration table count and sorted row SHA-256, columns/defaults, indexes, constraints and enums; check migration identities and Prisma/application compatibility. Verify media references/objects separately. Preserve the source and verify it remains unchanged. Never publish row contents in evidence reports.
8. Run safe restored-app health and smoke checks with isolated credentials/storage; then stop it, disconnect and dispose of only the verified disposable target. Retain dump/report under the agreed restricted policy. A restore mismatch is a failed verification, not permission to repair the source.

## Executable local rehearsal

`npm run test:staging -- --pg-bin "<existing compatible PostgreSQL tools>"` generates its own source/restore databases, credentials and server directory. It cannot take DATABASE_URL or an existing dump as a target. It runs reviewed existing migrations only on the new source, creates synthetic content, stops application writers, takes a full custom dump, verifies archive format/listing, restores to `sakado_restore`, compares all table/schema hashes and checks application health/detail rendering. The source is re-fingerprinted unchanged. Cleanup drops only the verified restore DB and stops the owned cluster. Actual result: [PHASE_07](PHASE_07.md).

Local artifacts remain under ignored `.local/phase07`. No real backup data is used as test fixtures. Test dumps contain synthetic authentication hashes/session records and still belong outside Git/public. Local test artifacts are not off-device disaster recovery.

## Remaining decisions and limits

Backup owner, frequency, retention, RPO/RTO, encryption/key custody, off-device location/country, access review, legal retention/withdrawal handling and provider snapshots: **TO BE CONFIRMED**. Actual staging/provider restore is **NOT TESTED**. Neither filename nor local ACL proves encryption. Media objects need independent checksummed backups and restore mapping; managed local uploads remain a durability blocker. No live encryption/upload resource was created.

Before staging/production migration require a fresh authorized backup and independently verified restore evidence. If migration fails, stop rollout, preserve `_prisma_migrations` and safe diagnostics, investigate in isolation, then use a reviewed forward-fix or qualified recovery plan. Never `migrate reset`, `db push`, random resolve commands or a blind data restore.
