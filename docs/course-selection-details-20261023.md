# Course selection details — v0.345

Selected course summary now groups personal best, earned medal, next medal threshold and rounded-up improvement gap. First-clear and highest-medal states have dedicated text. Course characteristics derive from current map geometry/metadata (gravity gates, no-jump zones, hazards, tunnels, gaps, raised platforms and narrow roads); show at most two concise features. Custom medal thresholds are respected. No geometry, thresholds, rewards or records are modified.

Preserved existing course/scroll storage and fixed return from result/pause screens: restore after the list rebuild and layout, disable native overflow anchoring on this list, and avoid a pending scroll-save callback writing after navigation. Main/modes reentry also restores the remembered selected course. Only the course list scrolls.

Validation: story-selection tests cover saved course/reload, next uncleared/all-cleared, bronze/silver/gold/no-record states, custom thresholds, rounded sub-hundredth gaps, four languages, unchanged map data and result return with a DOM-reset mock. medal-localization and result-report pass. Browser QA: 390x660 Korean and 768x820 English; overlay scrollHeight equals clientHeight. Actual start/pause/return preserved scrollTop 366 exactly. Screenshot uses deterministic sample records, not user performance. Physical device QA remains separate.
