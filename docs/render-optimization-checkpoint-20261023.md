> Superseded: the v0.339 rendering experiment was rejected after valid measurements. See render-validation-20261023.md for the accepted v0.341 change. This document records the earlier checkpoint only.

# Render optimization checkpoint — NOT deployed

Production remains v0.337, source 5ce49569efc9f081028618cdd8b993c1ae76e0b3. Local v0.339 (fc1ccc3dab1f) is a draft.

Changes: poly() rejects polygons entirely outside the viewport with a 4px margin. performance draw snapshots constant projection camera/viewport values into a frame-local function, restoring proj and render flags in finally. No map, physics or reward edits.

New tests: viewport-culling (including exception cleanup); render-frame-parity (seeded exact six-frame hashes against v0.337, actual unlocked 2-1/5-2); all-stage-flight-smoke (30 stages, one fixed policy, identical baseline outcome, 9/30 clears is NOT a solvability rating); all-stage-render-benchmark (30 isolated child processes, 3 positions, native Canvas).

Earlier benchmark passes accidentally rendered locked stage 1-1 repeatedly. Those figures are invalid and must not be quoted. The test now sets data.unlocked=29 and asserts level===stage. Correct baseline pass completed but its /tmp JSON and the optimized pass were lost when execution state reset. Do not claim a measured performance gain. Recreate v0.337 bundle via git show, then rerun both sides sequentially and save outputs in docs/qa (not /tmp). Native Canvas timings are not phone FPS or browser stall measurements.

Tunnel diagonal landing, roof fall, hazard tunnels, collision, ship clipping, performance/lifecycle and stage21 render parity tests passed during this session. Re-run final appropriate checks after any changes. Production publication is pending review of valid comparison data.
