# Application rollback and incident response

Application rollback and database recovery are separate decisions. No rollback command in Phase 07 targets external infrastructure or automatically restores production data.

## Before a rollout

Retain a previously validated source/artifact, exact commit/build ID/runtime/lockfile, compatible schema expectations, media registry, current configuration inventory and object keys. Verify backup/restore evidence, migration compatibility and who can approve/execute rollback. Never package .env, dumps, signed evidence or uploaded private data in the release. Reconcile current rights revocations in both active and previous registries: an old artifact must not restore withdrawn media permission.

## Decision tree

| Trigger                                                 | Action                                                                                                          | Never assume                                              |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| CI/approvals/backup/restore/env/owner missing           | Pause before rollout                                                                                            | A successful build is launch approval                     |
| Application startup regression, DB unchanged/compatible | Keep/switch to previous validated app, verify health and smoke                                                  | Reverting code requires reverting data                    |
| Failed or unclear migration                             | Stop rollout, preserve DB and migration state, investigate separately; prefer validated forward-fix when safer  | Prisma migrations have automatic safe down scripts        |
| Health failure                                          | Stop rollout, review safe logs/config/DB/storage/proxy, retain previous version if compatible                   | Repeated infrastructure mutation is diagnosis             |
| Data loss/corruption                                    | Incident owner authorizes a separate recovery, assesses new writes and recovery window, rehearses restore first | Blindly restoring yesterday's DB preserves today's writes |
| Rights/privacy withdrawal                               | Block affected publication and reconcile active/rollback artifacts                                              | An old approval remains valid forever                     |

## Local rehearsal

The Phase 07 runner optionally starts a reviewed previous built source directory against the **same new synthetic database** and an absolute synthetic media path. It checks health, event detail and object hash, stops only its child process, checks database fingerprints unchanged, and returns to the candidate build. It applies no down migration and restores no source data. The prepared previous copy was read from committed HEAD without switching branches; copied installed dependencies were used, not a new npm installation. Actual build IDs/results: [PHASE_07](PHASE_07.md).

This proves a local artifact switch only. It does not prove Hostinger atomic releases, cache/CDN invalidation, graceful traffic draining, remote persistent storage, Linux native compatibility or concurrent-user consistency. A previous Phase 06 build lacks the new staging noindex flag; the rehearsal runs only on loopback. External rollback must retain access restriction/noindex at the provider/proxy even when application versions differ.

## Post-rollback checks

Verify health over the intended HTTPS host, public event/detail/registration, admin login/roles/CSV, storage/readiness/withdrawn assets, data compatibility, caches, secure cookies/origins and sanitized logs. Confirm no lost or duplicated registrations; reconcile any intervening writes. Record artifact/config/evidence references and decision time. Monitor through an assigned incident owner before ending rollback.

Deployment owner, database owner, backup owner and incident approver/contact/escalation window are **TO BE CONFIRMED**. No live rollback is authorized by this runbook.
