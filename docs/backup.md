# Backup and protected map saves

Options provides a version1 STARWAY JSON export/import. It includes local progress, best story times, endless best, coins, owned/equipped skins, purchase receipt references, preferences, editor buffer and story overrides. Creator maps/profiles/rankings are server records and are not exported. No authentication credentials are included.

Import validates the entire schema and every map before showing an explicit replacement confirmation. Before writing, the current in-memory state is saved as `starway-restore-backup-v1`. Three primary storage keys are written with best-effort rollback to their previous values on failure. A rollback failure is surfaced explicitly, retaining the pre-restore snapshot for recovery. This is localStorage, not a transactional database or cloud sync. Restore undo requires confirmation and swaps the previous/current snapshots. Known purchase receipts are retained across snapshots.

Editor UI save and original reset require target stage/name confirmation. Each successful overwrite stores one previous map per stage in `starway-map-backups-v1`, including a null marker for the original map. Previous-map recovery is itself confirmed and can be reversed by restoring the prior map again. These automatic local recovery snapshots are separate from downloaded backup files.

Tests: `node tests/backup.cjs` covers confirmation/cancel, previous-map restore, full restore/undo, invalid schema, simulated quota failure with rollback, failed-save notice and fresh-boot7-3 record persistence. Downloads use browser Blob URLs; actual Android file-picker/download UX requires device verification.
