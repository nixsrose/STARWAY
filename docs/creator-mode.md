# Creator mode

Shared data is stored in the Site's D1 binding DB. User identity comes from Sites authenticated request headers; no emails are exposed to the game. Audience remains owner-private until explicitly changed.

- Immutable uploaded map payloads:16–500 rows ×7 lanes, gravity coefficient50/100/150/200 (gravityUnit: coefficient); legacy values8–30 migrate on upload, bounded palette/tunnels, safe spawn.
- Drafts visible only to their author. First successful author run publishes the exact uploaded payload.
- New uploads produce a new map ID; leaderboards do not mix changed geometry.
- One best elapsed time per authenticated user per map; ascending ranking and stable tie order.
- Single-use run sessions, same-origin writes, per-user upload/run limits, idempotent retry after a lost success response.
- Basic server trajectory validation: elapsed wall-time bound, distance/speed, lateral movement, altitude/duration, supported road/box/tunnel and hazardous contact. This is not a deterministic input replay or comprehensive anticheat system. No competitive rewards are issued. Harden to authoritative fixed-step replay before public prize-bearing competitions.
- Story unlocks, coins and story records are isolated by the existing editor-trial path; temporary course0 is restored on exit.

Build: `node scripts/package-client.cjs` then `node scripts/build-community.cjs`. Assets are embedded in one Worker ES module; there are no external asset or service dependencies. Schema migrations are copied to dist/.openai/drizzle for hosted application. Do not alter applied migrations.

Tests: tests/creator-server.mjs uses a real SQLite database and D1-compatible adapter to exercise two identities. tests/creator-client.mjs exercises game upload/clear/publish, record isolation, restoration and crash VFX against the same API. Phone layout and hosted browser authentication still require device testing.

## Map deletion
Owners can delete draft or published maps from My maps → map detail after an explicit confirmation. DELETE /api/creator/maps/:id enforces identity, origin and ownership, and atomically removes the map, leaderboard entries and run sessions. Deleted maps cannot accept records. Device-local editor data is preserved.
