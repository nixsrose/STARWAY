# 1-1 onboarding pass

Inspected the existing 220-row course: center-road launch, side routes, center split, full gap at rows 129–132, raised center landing and final narrow road. Preserve the authored layout, physics and medal conditions in this pass.

The first-flight guide now explains moderate launch speed, braking before narrow sections, steering in the air and the gold finish. Jump guidance stays hidden on safe road and appears for an upcoming gap/block or during an actual jump. Ascent followed by landing advances the guide; falling alone does not. Failure during the guide leaves it available for the next attempt. Explicit dismissal, completing the guide or clearing 1-1 marks it seen. Existing completed-player preferences remain respected; Settings can replay the guide.

The guide advances once per outer simulation step, avoiding recursive substep time duplication. It does not change throttle, physics, rewards or timing. Existing English/Japanese/Chinese equivalents remain supported.

Validation: flight-guide tests (including identical simulation, pause, replay, gap detection, fall/ascent/landing, retry and clear state) and flight-diagnostics tests passed. Browser inspected the initial 390×780 cover layout, visible controls and clock at 0.00. Screenshot: `qa/first-flight-20261022.jpg`. Real novice comprehension and completion rate still need player testing.

Development preview adds `kind=guide` to local QA fixtures; production has no such route.
