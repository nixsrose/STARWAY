# First-run reset

/reset-test.html resets only known local game, editor, map, ghost and diagnostic storage keys. The release checklist and unrelated site storage are preserved. No server account or published creator map is deleted.

Before deleting anything, reset writes and verifies a local snapshot under starway-reset-checkpoint-v1. The page can download/import that snapshot or restore the local checkpoint. Failed checkpoint writes abort reset. Partial deletion errors restore the captured values. Other game tabs must be closed to prevent stale tabs from writing old data back.

Validation: reset-storage test passed for key scope, checklist preservation, restore, invalid keys, quota failure and partial deletion rollback. Browser UI reset reached the first-run language chooser. Screenshot capture timed out; no screenshot is attached.

## Map preservation correction

Progress reset now retains editor workspaces, story map overrides, map backups, restore snapshots and map-recovery metadata. The reset page offers map-only restoration from the previous reset checkpoint or downloaded raw checkpoint. Map restoration does not restore player coins, upgrades or progression. Before a subsequent reset replaces the ordinary checkpoint, an older checkpoint containing map data is retained under a separate map-recovery key. Checkpoint removal or browser storage clearing can make recovery unavailable.

Tests cover old reset checkpoint recovery with fresh progress, map preservation, and repeated-reset recovery retention. Reset page inline script syntax checked.
