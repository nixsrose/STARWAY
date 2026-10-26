# Language integration validation — v0.337

Validated Korean, English, Japanese and Simplified Chinese first-run selection, settings cycling and reload persistence. Storage-unavailable entry remains playable with a localized session-only notice; saved progress is retained.

Fixed stale HUD labels and jump/ghost descriptions after language changes, missing cockpit/header accessibility translations, saved-language boot text caches, and notification unread-count templates being split before translation. Simplified Chinese keeps the zh-CN document language through subsequent localization.

Automated checks: startup-language (all four choices/reloads, round trips, storage failure, save/purchase/reward prompts), hangar-localization, editor-localization, progress-localization, flight-localization, medal-localization and flight-diagnostics. Production build succeeds.

Browser QA: first-run Chinese selection and reload; English to Japanese immediate settings/HUD change; English notification counts/reward prompts at 390×780; Japanese saved-language reload and display settings at 768×820. No game-page browser errors observed; browser-extension metadata errors are external to the game. These are browser viewport samples, not a physical foldable-device test.

Map names, save/export schemas, physics and rewards are unchanged.
