# 1-2 flight practice

Reviewed the authored 374-row course. The first full gap occupies zero-based rows 92–95, followed by twelve rows of broad road before the narrow center section at 108. The later full gap at 302–305 leads to a raised center block at 306. Preserve this geometry and existing medal thresholds; the earlier simulation audit already establishes a feasible base-Scout path, not novice usability.

New localized, nonblocking practice cues follow actual course geometry and speed: moderate launch, narrow-road approach, gap preparation, near-gap jump reminder and a two-second landing/alignment reminder. Safe sections hide cues. Ascent followed by landing triggers the landing reminder; falling alone does not. Pause/hidden time does not advance the guide. Failure leaves the guide available on retry; dismissal or clear persists an independent 1-2 completion flag. Existing cleared users keep their preference and can replay through Settings. Replay respects the stage unlock.

Failure reports for 1-2 add gap/raised-block or narrow-road advice near matching geometry. Fuel, hazard and tunnel failures retain the existing cause-specific advice. Road-edge and landing-edge visual cues now include 1-2 using the existing bounded renderer. Editor testing and creator runs are excluded from practice guidance.

Checks passed: second-flight-guide, flight-guide, result-report and flight-diagnostics. Tests cover cue transitions, pause, failure contexts, persistence/retry, unlock/replay, unaffected stages and identical simulation/course data. Browser checked the initial 390×780 cover screen and clock at 0.00; screenshot `qa/second-flight-20261022.jpg`. Human learning and completion rates remain unmeasured. Local preview fixture `kind=second-guide` is development-only.
