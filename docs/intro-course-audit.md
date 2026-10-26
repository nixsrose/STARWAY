# 초반 스테이지 기술 점검

2026-10-22. Full bundled simulation, built-in courses only. Scout skin0, upgrades0; jump6.55, cap15.4m/s (55.44km/h), gravity100. Existing course data is asserted unchanged after every run. No new map geometry or physics rules applied.

## Results

All three courses have a feasible clear at10,12,14 and15.4m/s with a matching jump timing. The harness tested11 obstacle lookahead settings at each of4 paces on3 stages,132 scripted cases total. The proportion of successful scripted cases is not a player completion rate.

| Stage | Rows | Reference clear (full throttle) | Fuel left | Required scripted jumps |
|---|---:|---:|---:|---:|
|1-1|220|14.03s|82.9%|1|
|1-2|374|24.03s|51.3%|2|
|1-3|238|15.20s|63.4%|3|

Reference controller lookahead lead=.04, with actual `step(1/120)` and analog steering constrained to[-1,1]. Full throttle is set at launch for reproducibility. This is not a medal or speedrun record: real ready-to-launch acceleration and human route choices differ.

## Narrower sections to observe

- 1-1: editor rows130–134, four gap rows followed by a raised block. Early takeoff can descend into the block's front rather than onto its top.
- 1-2: editor rows303–307 repeat the gap-to-block transition near the end. Observe whether a long lead-in leaves a newcomer unprepared. Rows93–96 are an earlier gap.
- 1-3: editor rows63–67 introduce gap-to-raised-surface early; subsequent transitions occur around121–125 and185–189. The route requires lateral movement as well as jumping.

At10m/s the successful sampled timing settings cluster later than at15.4m/s. This confirms speed/timing interaction; it does not prove that beginners can identify it. Do not use the lookahead parameter span as a precise independent input timing window.

## Decision

Preserve all three existing maps at this stage. There is no technical evidence of an upgrade requirement, unavoidable obstacle or fuel shortage on the reference paths. Do not infer player accessibility from bot clears.

Next: observe5–10 first-time players without coaching. Record understanding of launch, first failure location/reason, immediate retry, and desire to continue. Pay particular attention to early jump failures at the gap-to-block sections. Revise instructions or a backed-up map copy only when a repeated confusion is observed. Expand to30–50 players after fixing repeated issues.

## Reproduction

`node tests/intro-course-audit.cjs`

Optional JSON report: `STARWAY_INTRO_REPORT=/tmp/starway-intro.json node tests/intro-course-audit.cjs`. Committed results are in `docs/intro-course-audit.json` with build metadata. No analytic data is uploaded by the harness.
