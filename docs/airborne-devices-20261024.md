# Airborne device activation — v0.361

Acceleration and slow pads activate while crossing their tile at any flight height; gravity gates no longer filter the interpolated crossing height. Lane checks remain. No-jump and enable zones already use height-independent swept cell entries; the regression suite explicitly verifies both in flight.

Acceleration retains immediate 800km/h and three-second duration. Same-row occupancy does not repeatedly refresh a pad. Gravity still crosses the marker's row center in its placed lane. Jump blocking clears buffered/new jump inputs without interrupting the flight already in progress. Persistent block/release semantics and legacy cell-only maps remain unchanged. Fuel pads and coins retain their existing collection-height requirements. No map data or UI layout was changed.

Validation: airborne-devices covers all five device types, adjacent-lane isolation, pad row retrigger protection, continued airborne motion, jump buffer blocking/release and unchanged fuel pickup. Full gate in release-audit.md. No physical device verification performed for this change.
