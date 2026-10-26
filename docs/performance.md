# Mobile runtime performance pass

A single transparent scenery canvas caches static sun/planet/nebula layers at the selected pixel ratio. The moving asteroid layer remains live. The cache is invalidated by theme/viewport/ratio changes and released when hidden. Tunnel meshes are collected at most once per draw, including foreground occlusion. Road geometry, ship projection and simulation substeps are unchanged.

Menu/pause rendering is limited to12.5fps; active flight and ready controls retain native requestAnimationFrame responsiveness. Hidden frames neither simulate nor draw and discard elapsed time on return. Major viewport changes pause play/ready, clear held inputs and retain run progress. Falling/explosion effects no longer auto-resume after app switching; the pause control explicitly resumes them.

Canvas/VM timings on this executor (not Android FPS): 1-1 draw17.912→15.694ms,2-2 draw18.776→16.550ms,6-3 draw10.696→9.727ms across180 repeated frames. Run-to-run noise applies. VM first-menu evaluation148.48→141.70ms; network/authentication startup time is outside that measurement. BGM already loads asynchronously after user audio unlock and remains outside the boot path.

Tests: performance.cjs checks pixel parity across four static themes, cache reuse, Fold-sized resize progress/input/pause, background catch-up suppression, explicit fall resume and idle render cadence. Endless tests retain12km plus three seeded10km runs. Physical-device FPS, temperature, downloads and fold gesture behavior still need device verification.

## Opt-in flight diagnostics (quality phase 1)

Settings → Data → 주행 진단. Enable, run a course, return to Settings → Data, then download `starway-diagnostics.json`. No automatic uploads. Recording defaults OFF after reload. The device retains the latest 20 runs; each run retains at most 500 ten-row buckets and 60 stall/failure events. Delete only diagnostics with the dedicated clear action; normal game saves are independent.

Each run captures build label, local timestamp, viewport/pixel ratio, graphics preset, ship stats, map-content hash, mode/stage and outcome. Each ten-row bucket stores frame-gap totals/max, >33.34ms and >50ms counts, 5ms histogram (500ms+ overflow), rendering and simulation duration totals. P95 displayed is a histogram upper bound, not an exact percentile. Row coordinates are editor rows, not distance meters. Failure events retain position, reason, speed, fuel and gravity. Runs are checkpointed at start/result/menu/pause/page hide, not every frame. Reports include at most the five slowest buckets; JSON contains all retained buckets.

Frame gaps include browser scheduling, GPU/compositor delays and system load, so this is not a pure renderer benchmark. Render and simulation durations measure current-frame CPU work; gap spikes must be interpreted with neighboring frames. Pause/hidden/return intervals are excluded. No device model or account identifier is collected. Hashing the map happens once when an enabled run starts. Diagnostics itself has overhead and is intended for comparison under the same recording settings.

Physical-device protocol: select a graphics preset, enable diagnostics, run 1-1 as a baseline, then 2-1 and the known complex section three times. Record once cold and after 10 minutes of play. Cover/main viewport runs should be separate, because fold transitions pause gameplay. Export before clearing records. Inspect repeated stalls at matching map hashes/rows before changing geometry or collision rules. Do not treat automated VM/Canvas test results as Android FPS verification.

## Compact flight deck (quality phase 2, first pass)

Portrait cover/phone dock reduces from300 to244 CSS px. The top instrument row reduces from126 to70px; the full-width steering/throttle/jump row retains its original height. Gravity sits beside a horizontal speed/fuel readout; fuel remains segmented and all controls keep their existing DOM/input paths. Wide portrait dock reduces224→200px with fixed-size thumb controls retained. Landscape dock stays156px. CSS and `cockpitDockHeight` fallback use the same breakpoints, and the live computed CSS value plus safe-area inset continues to determine canvas height. No physics, camera projection formula or authored map changes.

Native Canvas/VM checks exercise seven viewports plus start/jump/pause, and existing keyboard/lifecycle/diagnostics tests cover regressions. These do not evaluate browser CSS layout; verify fuel text, gravity preview, touch reach and safe-area handling on the real cover/main displays before treating this UI pass as device-validated.
