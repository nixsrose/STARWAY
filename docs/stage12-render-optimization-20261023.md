# 1-2 tunnel rendering optimization

The uploaded v0.306 device diagnostics repeatedly showed higher drawing cost around editor rows 321–350. A native Canvas profile of the current built-in course at the same row range identifies tunnel rendering as a major cost when the parallel tunnels approach. This is a rendering computation optimization, not a map or physics change.

Changes in `surfaces.js`:

- Cache exact tunnel color blends by both input colors and blend ratio, bounded to 128 entries.
- Cache arc endpoints, midpoint normals and lighting trigonometry by segment count, bounded to 8 entries.
- Reuse the arc within each mesh while retaining camera-dependent facet sorting, identical geometry, lighting, support bands, entrance caps, foreground occlusion and draw order.

No texture resolution, facet LOD threshold, draw distance, collision function or authored map data changed. Because the renderer is shared, other courses and editor previews also reuse the bounded calculations.

## Validation

`node tests/stage12-tunnel-cache.cjs` compares full native Canvas RGBA buffers to the pre-optimization renderer in `tests/fixtures/tunnel-render-reference.js`. All 42 comparisons matched exactly across 749×454, 390×780 and 820×900 viewports, sampled 1-2 and 2-2 positions and ground/roof altitudes. Map data remained unchanged. Color-cache size bounds passed.

Passing collision checks: `tunnel-collision`, `tunnel-diagonal-landing` and `tunnel-roof-fall`. Browser QA also inspected 1-2 at row 331 in the 749×454 preview; `qa/render12-20261023.jpg` records the preserved appearance. The deterministic preview fixture is development-only.

## Performance evidence and limits

Reproduce the before profile with `STARWAY_TUNNEL_REFERENCE=1 node tests/stage12-render-profile.cjs`, then run the same command without the environment variable for the optimized renderer. Both render 60 frames across zero-based rows 320–349 with 749×454 DPR2 and native Canvas.

The final pair measured accumulated tunnel routine time per rendered frame at 13.472ms before and 12.665ms after (about 6% lower). Other pairs varied with host load, so this is not a stable percentage guarantee. Nested routine measurements can overlap and must not be summed as total frame time. These native Canvas CPU measurements are not Android browser timings and cannot be substituted for the user's earlier 6–7ms whole-draw samples.

Next validation: record 1-2 again on the same physical device, viewport and graphics setting and compare rows 321–350 against the existing diagnostics. Do not claim an actual mobile FPS improvement before that measurement.
