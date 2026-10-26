# Upgrade feedback and flight display scale

Upgrade cards show current → next values. Successful saved purchases animate the card and gauge, announce before/after values, and update the numeric panel. Failed saves roll back coins and levels without success feedback. Insufficient coins show the shortfall and route to quests. MAX shows final stats and disables purchases. Existing two-step purchase confirmation remains.

Flight speed, lever, shop, upgrades, diagnostics and distance displays now use a 10× world scale. Internal movement, record storage, quests, achievement thresholds, economy and stage timings remain unchanged. Saved best distances are displayed at 10× without rewriting their stored values. Quest and achievement distance progress and targets use the same display scale.

Passed: ship-upgrades, upgrade-feedback, speed-units, distance-origin, endless-distance-hud, quest-flow, hangar-localization, progress-localization, badges. Browser QA at 390×660 confirmed 757→677 coins, speed 554.4→604.8 km/h, level 0→1, and a compact single-screen layout. Physical-device performance was not measured.

The older standalone cockpit test harness cannot load current cockpit code because it omits shipSpeedCap; integrated bundle tests above exercise the current speed/lever and physics paths instead.
