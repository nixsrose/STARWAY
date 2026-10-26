# Random run coins — v0.357

Non-challenge story/custom/editor-test runs randomize collectible rows and lanes at buildTrack, after geometry setup. Stored course coins and map geometry remain untouched. Endless retains its existing procedural random coins. Active challenges and challenge editor tests preserve authored coordinates exactly.

Candidates use safe road/fuel/boost/slow tiles supported on the previous and next rows; exclude pink paint, blocks, gaps, first eight rows and rows at/after earliest finish. Stratified random row/lane selection distributes coins through the course. Target count matches authored coin count when safe rows suffice; empty maps use a length-based 6–16 target. With no safe candidates, no unsafe coins are spawned. Random retry need not mathematically guarantee unique layouts but all 30 current courses varied in repeated tests.

Validation: 40/40 current release suites pass. random-coins validates 20 layouts for each of 30 stages, position safety, variation, no saved map mutation, runtime retry variation and fixed positions across all three challenge modes. No UI layout changed. Real phone collection routes were not manually replayed in this change.
