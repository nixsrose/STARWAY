# Retry and result feedback — v0.342

Existing retry already returns synchronously to the same course at rest; retained the handler and added six-cause regression coverage for ready state, zero speed/throttle/time, no queued next-stage timer and unchanged rewards/records. No loading delay, collision effect or guide behavior was changed.

Added surface-specific failure advice in Korean, English, Japanese and Simplified Chinese: tunnel wall, ceiling, overhead structure, hazard tunnel roof, hazard floor and hazard block. Hazard-roof advice now directs the player through the interior rather than implying every normal roof is dangerous. Existing early-course hints and unknown-cause fallback remain.

Next-medal improvement gaps round upward to hundredths, preventing a positive gap such as 0.001s from displaying 0.00s. Medal thresholds and records are unchanged.

Validation: result-report, failure-cues, medal-localization and challenge-failure-fx pass. Browser samples: 390×660 failure report, actual retry click and 768×820 completion report. Both result overlays have scrollHeight equal to clientHeight at these sizes; existing layout required no CSS changes. This is viewport QA, not a physical foldable-device test.
