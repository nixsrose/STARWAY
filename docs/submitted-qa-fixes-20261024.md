# Submitted v0.353 QA — fixes in v0.355

Report: Galaxy Fold main display / Chrome, submitted 2026-10-24. The user passed 22 general checks and 27 courses, and reported three course issues plus map restoration and challenge fairness requests.

- 1-1 coin at editor row 123: replace sparse occlusion samples with continuous finite ray/box and ray/tunnel-shell intersections. Sweep z=100..122 at five lateral positions changes visibility once per position; the old implementation changed 5–7 times. Dense independent ray samples confirm shell intersections. Map, coin positions and collision physics are unchanged.
- 4-1 tunnel beginning at editor row 107: draw mixed tunnel/block corridors in depth intervals and lateral camera order. Long tunnel batches remain intact between geometry changes. Before/after Canvas images show the block side cutting across the shell removed. Approximate same-host render samples: old 18.32 ms, new 17.79 ms at the reviewed position; these are not device FPS measurements.
- Tutorial: automatic controls lessons only in 1-1. The obsolete 1-2 replay entry is hidden/disabled; contextual failure advice remains available.
- Challenge: assigned Scout, speed 22 internal / 792 km/h, jump 7.8, efficiency 1.0. Ownership/upgrades and editor reference-profile selection cannot change it. Flight appearance uses Scout without changing equipped inventory. Old best times are retained as legacyBest; fixed-profile best times start separately. Stars, cosmetics and already awarded rewards remain intact.
- Map restoration: story selection now labels edited maps versus built-ins. Existing local map recovery is retained; no replacement layouts or automatic difficulty edits were applied. The actual user's 5-2+ maps must be verified on their device after recovery.

Validation: 38 current release suites passed, plus scoped reset/recovery tests. Browser QA checked 4-1 rendering, compact challenge menu and absent 1-2 guide. Same-host Canvas timings and browser screenshots do not establish physical Fold performance. Retest 1-1 row 123, 4-1 row 107+, 1-2 startup and challenge fixed performance on device.
