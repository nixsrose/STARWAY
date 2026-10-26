# Render validation and accepted optimization — v0.341

The v0.339 projection snapshot + polygon culling experiment was rejected, not shipped. Sequential 30-stage/90-position native-Canvas sweeps were noisy (mean 31.62 to 31.04ms; 2-1 and 5-2 disagreed). A three-pair interleaved comparison produced median whole-case means 2-1: 22.67 to 30.25ms; 5-2: 32.24 to 33.16ms. These measurements do not justify keeping the experiment. game.js and performance.js were restored exactly to v0.337. The experiment-only culling test was removed; its source remains in the checkpoint commit.

Accepted change: localization skips hidden root panels for text and attribute scans. Previously, every HUD text update could cause the body MutationObserver to scan populated hidden editor/menu content. Panels translate when opened, using the existing source cache and current language. Visible flight labels continue to update. No simulation, geometry, reward or collision changes.

A deterministic fixture with a 5000-text-node hidden editor and 1000-node menu measured 60 refreshes: 360600 text visits before versus 600 after. This is an artificial work-count reduction, not 99.83% faster gameplay or a mobile FPS claim. Native-Canvas render timing does not exercise DOM mutation work, so it cannot quantify this accepted change.

Validation: all 30 stages scripted-flight smoke matches the v0.337 outcome exactly (one fixed timing policy clears 9/30, not a solvability test); six seeded native-Canvas frame hashes match v0.337 on 2-1/5-2; hidden-localization-work, startup-language, hangar-localization, editor-localization, tunnel-diagonal-landing, tunnel-roof-fall, hazard-tunnels, tunnel-collision, ship-tunnel-clip and performance/lifecycle tests passed. Browser sample at 390x780: open English editor, test flight, return to editor and reopen tool picker; visible panels translate correctly.

Raw experimental data: qa/render-20261023/before.json, after.json, target-pairs.json and summaries. The after files represent the rejected experiment, not the accepted release. Actual phone frame-time and stutter verification remains outstanding.
