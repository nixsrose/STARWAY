# Menu and hangar localization — 2026-10-23

Added English, Japanese and Simplified Chinese translations for lobby buttons, ship names/descriptions/signature jump tooltips, cosmetic tabs/catalog names/descriptions/unlock requirements, coin-shop availability labels, general Settings/backup labels and all ship-upgrade readouts, confirmations and save outcomes. Korean remains the source language. Catalog IDs, prices, progression and physics are unchanged.

An added dictionary extends the existing source-text localizer and covers the upgrade dialog outside the main overlay. Static nodes cached before dictionary initialization are restored and translated once on load, preventing saved-language reloads from leaving Korean lobby labels. Source text and accessibility attributes are retained for language round trips. Additional panel/attribute scanning is skipped during active flight. Translated labels can wrap within existing mobile slots; the English notification label is shortened to Alerts.

Validation: build, git diff --check, startup.cjs, startup-language.cjs, ship-upgrades.cjs and hangar-localization.cjs passed. The localization test covers dictionary completeness, numeric phrases, cached initial labels and JA → EN → ZH → KO source restoration. Browser QA at 390×780 checked English upgrades, Japanese ship/cosmetic shop and reward locks, Settings changes through Japanese/Chinese/Korean/English, saved-language reload, and button fit. Screenshot: qa/hangar-localization-20261023.png.

This is the menu/hangar pass. Quest/notification/challenge bodies, gameplay/editor guidance and detailed technical diagnostic reports still require their own localization pass. No claim of complete game-wide translation.
