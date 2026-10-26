# Coin and fuel presentation upgrade

Coins now have a rotating face, visible thickness, gold material gradient, inset rim and embossed diamond. Draw size is capped to prevent very-near coins dominating the viewport. Rotation uses simulation time and stops when paused. Existing distance and structure-occlusion checks remain in effect. Coin collection triggers a short world-space glint; fuel charging adds a short anchored mint ground ring alongside the existing fuel-gauge amount cue. Fuel pad uses a battery-style frame and pale mint charging glyph.

Placement, collection rules, rewards, fuel drain and refuel amounts are unchanged. No forced advertisements or new audio added. Effects reset on retry and simplify in low graphics.

Validated actual coin collection→single glint, pause/retry lifecycle, animated Canvas pixels, occluded coin suppresses all pixels, resource-gauge limits and reset, material/physics parity,21-course traversal, viewport tunnel/roof continuity and lifecycle/cache tests. Actual-device visual/FPS testing remains pending.
