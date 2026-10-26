# Visual polish pilot — 1-1 / 2-2

Updated roads with inset panel joints and edge shading; block fascias with recessed details; ships with projected wing highlights; background stars and 1-1 sun with reduced contrast. Tunnel shells now have directional shading, longitudinal seams, periodic reinforcement bands, dark entrance reveals and highlighted rim thickness. Existing straight tunnel profiles and roof landing geometry are unchanged. No new collision, level layout or hazard color semantics.

The pilot is limited to story levels 0 and 4 and respects low graphics detail reduction. Other courses retain existing rendering pending user review.

Validated: 90 actual Canvas tunnel views across three viewport sizes and entrance/interior/roof/air positions; 13,881 independently checked visible block pixels; 1,356 boundary views across 21 courses; ship design, material/physics parity, lifecycle/cache, hazard and all 21 sequential course traversal tests. Canvas pilot images were visually inspected. No browser or physical phone FPS/layout verification was performed.

The previously generated Toss .ait test artifact is unchanged; this visual pilot is deployed to the web game first.

## Tunnel follow-up fix

Opaque shell facets now cull the hidden exterior half against the actual camera, with farther tunnel centers/facets drawn before nearer ones. Removed the inset entrance reveal that could overlap a nearer shell. Interior shell shading stays opaque. Visually inspected the approaching and inside tunnel Canvas renders.

Shared physics now sweeps the ship body across tunnel cross sections before handling missing floor tiles. Side contact explodes instead of falling; underside impacts explode; descending roof landings and roof walking remain allowed. Coverage includes both lateral directions, large side displacement, safe centered travel, underside contact and overhead clearance. Existing 21-course progression, block pixels, viewport tunnel frames, lifecycle and 504 endless recipe traversals plus seeded long runs passed.

## Complete entrance arch correction

The previous exterior back-face cull removed interior surfaces visible through an open entrance. Replaced it with two-sided shell painting: back-facing inner facets first, facing outer facets second, and the complete16-segment entrance cap after the shell. This preserves the open arch without revealing hidden external facets through the nearer roof. Actual approach and inside renders were inspected. Added an explicit32-cap-segment assertion for twin tunnels. Collision code is unchanged from the prior fix. Tunnel collision,90 viewport views,21-course progression and lifecycle/cache suites passed.
