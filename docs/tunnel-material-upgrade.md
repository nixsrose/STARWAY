# Shared tunnel material upgrade

Shared story/endless/editor tunnel renderer now uses24 curve facets in detailed graphics,16 in low graphics. Existing two-sided painter ordering and complete entrance cap are preserved. The cap has a metallic bevel gradient, dark inner lip and two small pale-green guide lights. Shell details use narrow tinted metal support bands with paired shadow/highlight edges rather than dark gap-like bands. Interior wall facets carry low guide-light strips. Details are limited to35 world units; low graphics omits additional detail.

The roof profile, thickness, collision sweep, tunnel centers and level layouts are unchanged. No boxes or extra collision structures added.

Validated90 viewport/pose tunnel renders, full cap segment coverage excluding decorative lights, side impact and roof landing tests,21-course progression, lifecycle/cache and13,881 visible block pixels. Approach and interior Canvas renders visually inspected. Real mobile FPS and on-device appearance remain unverified.

## Roof-riding continuity fix

The base tunnel pass previously began at the ship's depth, while roof-riding intentionally skipped the post-ship foreground pass. This left the shell behind the ship undrawn. The base pass now includes the complete visible near shell down to the same z-3.5 near limit. The post-ship pass still restores occlusion for ships below the roof and remains skipped while riding on top. Collision/landing logic is unchanged.

Reproduced4-3 on the roof and visually inspected the render. Added real Canvas alpha checks at9 points behind the roof-riding ship over cover/unfolded/landscape viewports; previous code would leave those positions transparent. Tunnel viewport/cap, collision,21-course traversal and lifecycle/cache regressions passed.
