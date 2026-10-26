# Jump enable zone — v0.358

Editor brush: 점프 불가 해제 존 (green J✓). Gameplay marking: JUMP ON. Separate from 점프 존 제거, which removes either kind of marker without removing the road.

Maps containing at least one jumpAllowZones marker use persistent block/release behavior: touching a noJumpZones cell blocks jumping until a jumpAllowZones cell is crossed. Leaving the no-jump cell or changing lanes does not release the lock. The enable marker must be passed in its placed lane. Future no-jump cells may block again. Airborne motion is preserved; this affects jump input/buffering only. Run build resets the latch. Pausing does not reset it. Swept cell entries include forward and lateral motion.

Compatibility: maps without enable markers retain the old cell-only no-jump behavior, so existing routes do not acquire an unintended permanent block. Empty marker lists likewise retain legacy behavior. No existing map geometry was rewritten.

Schema and Worker validation, editor paint/erase, cell indicator, gameplay indicator, resize, mirror copy/paste, random-page protections, rectangle application, backup/export/import all retain the metadata. New display strings cover ko/en/ja/zh.

Validation: 41/41 current release suites pass, including jump-allow-zones for persistent blocking, lane-specific release, swept entry, retry/pause/endless isolation, edit/copy/resize, save/backup/reload and invalid support rejection. Browser verified brush selection and green marker at 390×780. Physical device play not performed for this change.
