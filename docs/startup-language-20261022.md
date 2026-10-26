# First-run language selection

First launch shows Korean, English, Japanese and Simplified Chinese before the logo/loading sequence. A valid choice updates the existing menu translation and loading messages, persists languageConfirmed alongside settings, and leaves progress intact. Existing installs without that flag choose once after this update. Settings can still change language. Reload skips selection after confirmation.

Validation: tests/startup.cjs and tests/startup-language.cjs passed, covering all choices, invalid/repeated input, persistence, Settings changes, version/offline paths and existing progress. Browser QA at 390×780 confirmed layout, English menu application and reload skipping selection. Some existing game strings remain Korean; complete localization is outside this change.
