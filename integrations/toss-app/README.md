# STARWAY Apps in Toss test build

This is a standalone SDK 3.8.0 package of the existing game. The hosted Sites build is unchanged.

## Build

Use Node 22.12+ and `npm ci`, then `npm run build` in this directory. Set `TOSS_APP_NAME` to the exact registered console name before building for an actual app. The default `starway-runner` is a provisional development slug, not evidence of console registration. Output: `<appName>.ait`. The CLI's build deploymentId is package metadata, not a published Toss deployment.

Game, audio, logo and version data are packaged locally. Back during play opens pause; back from pause uses the current mode's parent screen. Main-menu exit requests confirmation and calls the native close API. Native safe area changes update the existing layouts. WebView media autoplay is enabled, subject to actual host/device behavior. Engine audio remains absent.

## Current limitations

- Story, infinite mode, shop and editor use this WebView's local storage. No Toss account or cross-device cloud save is connected. Existing browser data is not automatically transferred; use the game's backup export/import.
- Creator online operations deliberately show an unavailable message rather than using ChatGPT authentication or trusting a client identity.
- Secure creator/account integration needs a registered app, partner backend HTTPS URL, and server-side mTLS certificates. Use `User.createAnonymousKeyAuthCode()` followed by server code exchange at `/api-partner/v1/apps-in-toss/users/anon-key/exchange`. Never treat an anonymous key supplied by the client as proof of identity. Keep certificates and session secrets out of the client bundle/repository.
- No ads, Toss login, console upload, distribution or release review has been performed.

## Validation

`node tests/toss-runtime.cjs` from the repository checks navigation routing, close handling, unavailable creator behavior and local bundled assets. SDK TypeScript checks and Vite/ait packaging pass. These checks do not replace actual Toss runtime testing.

Before upload: replace the provisional app name; test real Android/iOS Toss playback from loading, interruption/resume, close/back, Fold cover/unfold safe areas, multitouch, and persistence after restart. Configure and verify server authentication and account isolation before enabling online creator mode.
