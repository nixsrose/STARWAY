# Editor and diagnostics localization — v0.332

Expanded English, Japanese and Chinese translations for editor tools, colors, map settings, gravity devices, medal conditions, ranges, save dialogs and map checks. Added numeric diagnostic summaries, failure locations and recording guidance. Korean remains the fallback.

User-authored map names are preserved, including names matching translated interface labels. Map data and diagnostic export schemas are unchanged. Mobile labels and diagnostic text wrap within their panels.

Validation: editor-localization, editor-pickers, editor-rectangle, editor-course-rules, editor-map-check, editor-range, flight-diagnostics, intro-study-summary, startup-language and hangar-localization tests passed; production build and git diff whitespace check passed. Browser samples checked English editor/tools and diagnostic details, plus Japanese editor/settings at 390×780. Chinese dynamic strings covered by automated tests. This is a localization expansion, not a guarantee that every uncommon fallback message is translated.

Screenshot: qa/editor-localized-20261023.png
