# Release candidate audit

Game: v0.397 / 5f85c3bec68c
Checked: 2026-10-26T12:46:37.618Z
Result: 54/54 current suites passed.

The suites cover startup, save/restore rollback, upgrade and quest transactions, notifications, story navigation, retry feedback, challenge rewards/settings, map devices, tunnel contacts, distance units, keyboard input, diagnostics, localization and lifecycle suspension.

21-stage scripted-flight smoke: 1/21 clears using one fixed controller. All finite-state/map-integrity checks must pass; this is NOT a full-stage solvability or human-play test. Non-cleared stages require manual review; do not make the maps easier solely to satisfy this controller.

Actual mobile FPS, heat, multitouch, long sessions and all visible human clears remain unverified. Use /release-checklist.html to record them. Toss packaging/native testing and store publication remain separate blockers; tests/toss-runtime.cjs requires generated platform artifacts and is not part of this web gate. No production creator records were modified.

Failures: none

Full results: qa/release-suite-results.json
