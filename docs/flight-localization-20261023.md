# Challenges and flight guidance localization — 2026-10-23

Added English, Japanese and Simplified Chinese display phrases for challenge names, hints, configurable time/coin/fuel goals, records, rewards, unlocks and result details. Whole templates retain dynamic values and preserve user-authored map titles. Challenge dialogs participate in source-text and accessibility localization. The live challenge HUD and no-jump warning use the current language directly. Added default road-section, launch, throttle and collision-reason translations. Existing gravity-preview and tutorial translations remain in use.

Translated warnings wrap within screen width. Challenge HUD uses its content width and no-jump warning sits below it to prevent overlap. Reward amounts, thresholds, physics, map content and save schema are unchanged.

Validation: build and git diff --check passed. Tests passed: flight-localization, challenges, challenge-settings, challenge-rewards, challenge-failure-fx, no-jump-zones, flight-guide, second-flight-guide, gravity-extended, progress-localization, hangar-localization and startup-language. The old reward test assumed a 16-second reserve run earned gold; it now uses the existing configured goldTime (10 seconds). No target rules were changed.

Browser QA: English challenge cards fit 390×780; Japanese no-jump warning and disabled jump button fit with the HUD; Chinese challenge result and retry label verified at 749×780. Screenshots: qa/zone-ja-20261023.png and qa/challenge-zh-20261023.png. Development fixtures are excluded from the Worker package.

Remaining translation work includes detailed editor and diagnostic screens; this is not a claim of full game-wide localization.
