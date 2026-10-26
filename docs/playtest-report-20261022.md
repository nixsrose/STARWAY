# Playtest diagnostics and compact results

Diagnostics remain opt-in and local. Enable them in Settings → Data. Reloading leaves diagnostics disabled. Export schema 2 includes the existing detailed runs and aggregate study data; clearing diagnostics clears both without changing game progress.

The latest 20 detailed runs remain bounded. Up to 60 mode/stage/map-revision summaries retain attempts, failures, clears, retries, menu exits, launch delay and the first clear observed during diagnostics. Active time includes ready and play time, excluding menus, pause and hidden/suspended time. It is not lifetime player progression. Failure locations and post-failure decisions are bounded and deduplicated. Nested simulation substeps do not count elapsed time twice.

Completion and failure reports use viewport-constrained grids. Completion keeps medals, time, coins and navigation visible; quest details remain accessible through the quest button rather than expanding the result page.

Browser QA checked 320×568, 390×620, 390×700, 768×700 and 844×390 frames. Report content and actions fit without panel overflow; failure layout was also checked in landscape. Screenshot: `qa/result-report-cover-20261022.jpg`. These are browser viewport checks, not physical-device performance measurements.

Passing checks: flight-diagnostics, pc-keyboard, run-summary, result-report and banner-placement Node tests. Diagnostic tests cover opt-in, reload persistence, timing exclusions, map revisions, retry/menu decisions, first clear and duplicate terminal events.

`npm run dev` provides a local preview. `/__qa/result` and `/__qa/viewport` are development-server fixtures only and are not production routes or shipped client assets. No server analytics or runtime player data was added.
