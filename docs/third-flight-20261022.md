# 1-3 introductory challenge polish

Reviewed all 238 rows, including full gaps at zero-based rows 62–65, 120–123 and 184–187, lateral route changes and the last raised landing at 188. Geometry, authored guides, medal conditions and physics remain unchanged. Prior intro-course simulation establishes feasible Scout Lv0 clears; it does not establish novice success rates.

1-3 now uses the existing road-edge visual cues. Exposed fronts of ordinary raised platforms gain pale cyan top-edge corners, bounded to 25 rows ahead. Hazard blocks retain hazard semantics. Editor testing is excluded. No additional in-run tutorial is introduced.

Failure reports distinguish gap landing, raised-block collision near a gap, narrow-road steering and ordinary block avoidance. Advice uses the actual course rows and failure location; fuel/hazard/tunnel causes keep their existing hints. Four languages are supported.

The completion action uses the common next-stage label and leads to 2-1. Tests and browser QA verify manual next-stage selection, unlock, and a ready state with time zero rather than automatic movement. Completion layout fits the 390×700 cover viewport; `qa/third-complete-20261022.jpg` records the result.

Passing checks: third-flight-polish, result-report, flight-guide and second-flight-guide. New checks include render bounds, hint contexts, tutorial scope, unchanged map data and 1-3 → 2-1 transition. Physical-device frame time and novice comprehension remain unmeasured. Preview fixtures are development-only.
