# Story coin coverage — v0.356

Audit of the current 30 built-in courses found 4-3 empty (normalization discarded its authored collectibles). All other built-in courses retain their existing coins.

Story normalization now preserves valid authored coin coordinates, one per row, and generates deterministic spaced coins only when none remain. Candidates require safe ground on three consecutive rows; gaps, hazard paint and raised blocks are excluded. Placement stops before the earliest finish. If no safe ground exists, no unsafe coins are manufactured. Geometry and medal settings are untouched. Existing browser overrides receive the same repair on load without replacing their map geometry or resetting progress.

4-3 now has 16 coins. All 30 courses have nonzero coins, preserved across normalization. Story editor now exposes the existing coin brush and coin cell markers; ordinary edits prune unsupported collectibles. Repeated normalization retains positions.

Validation: 39/39 current release suites pass, plus reset-storage. The new story-coins suite checks all courses, preservation, empty-map repair, unsafe terrain, editor add/remove and runtime population. Browser verified the story coin tool and coin marker in a 390×780 viewport. This does not verify the user's phone-specific saved maps or all physical collection routes.
