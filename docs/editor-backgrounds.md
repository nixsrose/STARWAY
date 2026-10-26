# Custom editor backgrounds

Map Editor → 배경 커스텀: choose stage default, red star, blue planet, deep stars or uploaded image. Set base color and0–80% dimming. Image accepts JPEG/PNG/WebP up to8MB input, downscales to1280px and compresses to a JPEG data URI capped at300,000 characters. Uploaded image is embedded in the map rather than stored at an external URL. Default reset clears the image. Changes participate in editor undo and existing explicit save/apply.

Shared pure normalization preserves background configuration in map JSON, local saves, backups and creator uploads/downloads. Server rejects external URLs, SVG/data scripts, oversized images and invalid settings. Map JSON import retains its500KB total limit. Multiple large embedded images can exceed device local-storage quota; existing save-failure reporting still applies.

Validated editor controls/reset/JSON roundtrip/trial rendering, creator image roundtrip and invalid settings rejection, editor save/apply, backup/restore, creator client/server flows,21-course progression, boot and cache/lifecycle. Actual phone image chooser/decoder and compression need device testing. Appearance of user-supplied images depends on crop and dimming.

## External testers

Site access was checked and remains owner-only; no invitations or public-access change were made. A URL alone does not grant access. Use selected tester invitations for a closed test or explicitly authorize public-link access. Local progress/editor overrides are per browser; use map JSON export/import or creator publication to share the same edited map. Toss testing remains a separate .ait/console workflow; the web build is the current test target.
