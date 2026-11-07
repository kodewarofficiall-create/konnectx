KonnectX single-page website
----------------------------
index.html  - the whole website (intro + event section, no second page)
css/style.css, js/main.js, assets/logo-neon.jpg

1. Unzip and open index.html (internet needed once for Google Fonts).
2. The intro finishes by itself and the event section appears on the same page. Timing: SHOW_EVENT_AFTER in js/main.js.
3. Background video for the event section: save it as assets/bg-video.mp4 (muted, short, compressed).
4. Change event date/venue in index.html (search "24 NOV 2026"). Change the green in css/style.css (--green) and js/main.js (GREEN).

Event timeline (js/main.js, STEPS, in ms after the event section opens): hands slide in -> shake -> vanish -> SUCCESS -> venue box.
Intro size: change --L at the top of css/style.css (logo width; the KonnectX text and tagline scale from it).

PAGE 2 HANDSHAKE VIDEO
----------------------
assets/handshake.mp4 is the generated clip, processed: baked-in title/venue box removed, cropped to the people, upscaled 1.5x.
Timeline: people glide in from both screen edges and shake hands -> thumbs-up -> they slide apart -> SUCCESS -> date + venue box -> the video dissolves the people away.
-> the two people slide apart -> SUCCESS appears between them -> venue box appears between them.
Change event date/venue in index.html (search "24 NOV 2026").

UPDATES (this version)
- Green flash between page 1 and page 2 removed: now a smooth cross-fade.
- Page opening animation added (two black panels slide apart to reveal the intro). Timing (fast version): OPEN_MS in js/main.js.
- Page 2: new handshake video integrated (see above). The old drawn hands were removed.

LATEST UPDATE
- assets/handshake.mp4 replaced with the new video: cut just before its own SUCCESS text, corner watermark removed,
  upscaled to 1920x1080 (HD), sharpened, no audio. SUCCESS is now the site's own gold text.
- Timeline: thumbs-up -> people slide apart -> SUCCESS in the gap -> people fade out -> DATE + VENUE box.
  Timings are in thumbsUp() in js/main.js.

UPDATE 3
- Video: skips its own SUCCESS part, uses its dissolve to remove the people, people brightened (gamma) + sharpened, 1920x1080.
- Order: SUCCESS -> venue box immediately -> people dissolve. Venue box is in the middle, SUCCESS sits high near the title.
- Desktop: people walk in from the left/right screen edges (--dist in css/style.css, ARRIVE in js/main.js).
- People ~17% bigger; more space between the title and the video (margin-top on .stage).

PAGE 3 (new)
- index.html #launch section, css/page3.css, js/page3.js (celebration), plus showLaunch() in js/main.js.
- Page 3 opens LAUNCH_AFTER ms (js/main.js, 5200) after the thumbs-up, i.e. a few seconds after the venue details appear.
- "WE ARE LAUNCHING SOON" in neon gold + confetti cannons and fireworks (js/page3.js).
- iPhone: home screen -> App Store opens -> KonnectX -> GET -> OPEN -> KonnectX app launches (12 s loop).
- Android: home screen -> Play Store opens -> KonnectX -> Install -> Open -> KonnectX app launches (12 s loop).
- Store icons are generic glyphs (not the official logos); swap them in css/page3.css (.bag / .play) if you have licensed artwork.

UPDATE 4 (smooth page 2 -> 3, clear title, bigger celebration + sound)
- Page 2: the people dissolve first; ONLY THEN the venue details appear (js/main.js: peopleGone). They stay VENUE_HOLD ms (2200), then page 3 opens immediately.
- Transition 2 -> 3: page 2 zooms out while a gold light-burst and two rings expand from the centre (css/page3.css, ".warp"). Only transform/opacity are animated, so it is smooth.
- Lag fixes: no shadowBlur in the background network, 30fps background on page 3, no filter drop-shadow on the phones, no animated filters on the title, page-2 effects are paused while it leaves.
- Page 3 title: same gold as SUCCESS with a light steady glow (css/page3.css: titleGlow).
- Confetti: medium fall speed, ~3x more pieces: 5 cannon waves, confetti rain from the top for ~5s, 8 fireworks then gentle ones. Tune in js/page3.js (cannon/rain/KX_launchFX).
- Sound (synthesized, no files): cannon pops, fanfare, applause, firework whistle + boom + crackle. Browsers only allow sound after a tap/click on the page, so a "Tap for sound" button appears bottom-right; tapping it (or anywhere) turns sound on and plays an encore.

UPDATE 5 (professional background, calm page 3 opening)
- Removed: the green diagonal lines and the connected-dots network.
- New background on all 3 pages: slow drifting gold/green light glows (css/style.css ".aurora") + soft floating gold/green particles and bokeh (js/main.js, background section).
- Page 2 -> 3: the gold bloom/rings are gone. Page 2 lifts away and fades, page 3 rises in smoothly (css/page3.css, showLaunch in js/main.js).

UPDATE 6
- Sound removed from page 3 (no audio, no sound button). Confetti, fireworks and everything else are unchanged.

UPDATE 7 (brand chrome "X")
- The "X" in KonnectX now uses the chrome X from the brand image (assets/x-chrome.png, transparent PNG) everywhere the name appears: page 1 big name, page 2 "KONNECTX PRESENTS", page 3 title label + subtitle, and both phone screens (store listing, search, app splash).
- It is an <img class="kxx"> sized in em, so it scales with the surrounding text. To change it, replace assets/x-chrome.png.
- Logo on page 1/2 is now assets/logo-neon.png (transparent) so no black box shows over the new background.

UPDATE 8 (footer half globe)
- assets/footer-globe.webp + css/footer-globe.css: your new globe image (2400x600, 4:1 crop),
  slightly dimmed, no glow/shadow. It runs edge to edge along the very bottom of all 3 pages (works on desktop and mobile).
- Globe strip: --fh (visible height; taller shows more of the planet) at the top of css/footer-globe.css. Opacity: --fg-op (page 3 uses a little less).
- Page 2: the event page reserves the footer height at the bottom, so the two people stand above the globe, never over it.

UPDATE 9 (page 3 photo background, faster phones, mobile speed-ups)
- Page 3 background: your business-people + handshake image, Gemini sparkle mark removed (inpainted + grain matched).
  assets/page3-bg.jpg (2560w, desktop) and assets/page3-bg-m.jpg (1400w, phones). Styled in css/page3.css (.l-bg).
- Phone mockup animations are faster: one install cycle is now 8.5s (was 12s). Change #launch{--cyc:8.5s} in css/page3.css.
  Start delays were shortened and the phones->stamp timing in js/main.js (PHONES_OUT / STAMP_IN) matches the new speed.
- Mobile speed-ups (phones / touch / weak devices): fewer background particles, lower pixel ratio, 25fps background,
  half the confetti and lighter fireworks, no animated filters or animated gradient text, static aurora glows.
  Switches: LOW in js/main.js and js/page3.js, and the "MOBILE SPEED-UPS" block at the end of css/style.css.

UPDATE 10
- Page 3 stamp reduced to medium size (was 2.05x a phone's width, now 1.45x, max 64vw). Change the 1.45 in ".stamp{width:...}" in css/page3.css.
