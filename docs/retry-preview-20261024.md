# Ready-only retry route preview

Built-in story retries now show the last failure's row/lane, a compact map of the surrounding 11 rows, a failure marker, and localized contact-specific advice. The map distinguishes roads, blocks, tunnels, hazardous floors/roofs, and fuel pads. Existing detailed failure reports remain intact.

The preview is local session state. It appears only for a direct retry of the same course/map, hides immediately at launch or dismissal, and clears on menu navigation, wins, other stages, or changed map objects. Endless, creator, editor tests and challenge runs are excluded. Rendering happens once on retry; simulation, collision, scoring and saves are unchanged.

Passed: retry-route-preview, failure-cues, challenge-failure-fx and story-briefing tests. Browser QA at 390×660 confirmed a 4-2 tunnel map, row/lane and cause advice, plus immediate hiding after throttle launch. Physical-device testing remains outside this verification.
