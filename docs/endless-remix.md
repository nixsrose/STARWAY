# Endless story remix

The generator uses all 21 built-in story courses. Each source contributes measured road widths, lane spread, paint and block/tunnel vocabulary, together with a named traversal recipe. It composes new geometry around continuous entry/exit coordinates; it does not paste complete story chunks.

Source selection is shuffled without replacement across 21-course cycles. Direction, lateral span, exits, gap timing, palette and optional coin placement vary between runs. Sections keep their off-centre exit as the next section's entry. Tunnel centres remain constant along every bore. Mandatory jumps stay within the 200-coefficient flight envelope at speed18–24; the second jump has enough landing/recharge spacing even at coefficient50. Slow speeds can still require the player to accelerate before a gap.

The first two sections are wider adaptation routes. Progress increases gap width from2 to3, tightens lateral transitions, and combines jumps with block/hazard decisions. Every fifth section after a challenge is a broad, hazard-free recovery route with a guaranteed fuel pad. Normal fuel spacing stays54 rows; scarcity is not the difficulty driver. Feature geometry defers a fuel pad when unsafe, then places it on the next stable route. Fuel remains speed-dependent and has no life timer. Random gravity uses the legacy acceleration values9/18/27/36, which display as50/100/150/200. It changes only when grounded. The chosen next coefficient is displayed48 rows before each180-row boundary and remains fixed through pause/airborne deferral.

Tests: `node tests/endless-remix.cjs` covers504 recipe/gravity/speed/progression traversals, a12km run, three seeded10km maximum-speed runs, all-source coverage, centre pressure and memory cleanup. `node tests/render-endless-remix.cjs` creates a contact sheet for visual inspection. These are physics/autopilot and Canvas checks, not human mobile difficulty evaluation. Earlier fixed P01–P40 generator tests describe the superseded generator.

`node tests/endless-pacing.cjs` checks the pacing schedule, recovery hazards/fuel, announced coefficient stability and landing-only application.
