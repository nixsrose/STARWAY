# Story preflight briefing — v0.351

The existing map-derived course features and medal requirements now sit beside equipped ship speed, jump output and fuel efficiency. First-time course attempts show a localized tip selected from map gravity gates, no-jump zones, hazards or tunnels. The upgrade shortcut preserves the selected course and list position; closing upgrades returns to the story selection and refreshes the ship stats.

Map data, medals, unlock rules, purchases and movement physics remain unchanged. Briefings use current STORY_COURSES and equipped ship upgrades; editor-saved medal targets remain authoritative.

Validation: story-selection, story-briefing, ship-upgrades and quest-flow tests passed. Browser QA at 390×660 Korean and 768×820 English confirmed visible launch/back actions and navigation to upgrades and back to course 3-3. Only the course list scrolls. Physical-device testing remains outside this verification.
