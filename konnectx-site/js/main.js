/* KonnectX: animated network background + intro -> event section (all on one page) */
(() => {
  // ---- SETTINGS ----
  const SHOW_EVENT_AFTER = 3300;   // ms: intro finishes at about 4.7s, then the event section appears
  const ALLOW_SKIP = true;         // tap/click or press Enter to skip the intro
  const GREEN = '31,255,74';       // neon green (RGB)
  const redirectToHome = new URLSearchParams(window.location.search).get('next') === 'home';

  // ---- background: soft floating light particles (gold + green) and slow bokeh, no lines ----
  const c = document.getElementById('bg'), ctx = c.getContext('2d');
  let W, H, dpr, pts = [], bokeh = [];
  const LOW = matchMedia('(max-width:700px)').matches || matchMedia('(pointer:coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4;   // phones / weak devices
  function sprite(rgb) {
    const s = document.createElement('canvas'); s.width = s.height = 64;
    const g = s.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(.35, `rgba(${rgb},.35)`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return s;
  }
  const SP = {gold: sprite('255,216,107'), green: sprite(GREEN), white: sprite('235,245,255')};
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, LOW ? 1.25 : 2);
    W = c.width = innerWidth * dpr; H = c.height = innerHeight * dpr;
    const n = Math.round(Math.min(LOW ? 32 : 90, innerWidth * innerHeight / (LOW ? 22000 : 15000)));
    const kinds = ['gold', 'gold', 'green', 'green', 'white'];
    pts = Array.from({length: n}, () => ({
      x: Math.random() * W, y: Math.random() * H, k: kinds[(Math.random() * 5) | 0],
      r: (Math.random() * 3.2 + 1.6) * dpr, vy: -(Math.random() * .22 + .06) * dpr,
      sw: Math.random() * 6.28, sv: Math.random() * .6 + .2, tw: Math.random() * 6.28, ts: Math.random() * 1.2 + .5
    }));
    bokeh = Array.from({length: LOW ? 3 : 7}, () => ({
      x: Math.random() * W, y: Math.random() * H, k: Math.random() < .55 ? 'gold' : 'green',
      r: (Math.random() * 70 + 50) * dpr, vx: (Math.random() - .5) * .12 * dpr, vy: (Math.random() - .5) * .1 * dpr, a: Math.random() * .05 + .035
    }));
  }
  addEventListener('resize', resize); resize();
  const start = performance.now();
  let lastT = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    if ((document.body.classList.contains('launch-on') || document.body.classList.contains('event-on')) && t - lastT < (LOW ? 40 : 30)) return;   // ~30fps (25fps on phones) on pages 2 & 3 keeps the video smooth
    lastT = t;
    ctx.clearRect(0, 0, W, H);
    const fade = Math.min(1, (t - start) / 2500), time = t / 1000;
    for (const b of bokeh) {
      b.x += b.vx; b.y += b.vy;
      if (b.x < -b.r) b.x = W + b.r; if (b.x > W + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = H + b.r; if (b.y > H + b.r) b.y = -b.r;
      ctx.globalAlpha = b.a * fade; ctx.drawImage(SP[b.k], b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    }
    for (const p of pts) {
      p.y += p.vy; p.x += Math.sin(time * p.sv + p.sw) * .25 * dpr;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      const tw = .55 + .45 * Math.sin(time * p.ts + p.tw);
      ctx.globalAlpha = tw * .8 * fade;
      ctx.drawImage(SP[p.k], p.x - p.r * 2, p.y - p.r * 2, p.r * 4, p.r * 4);
    }
    ctx.globalAlpha = 1;
  }
  requestAnimationFrame(frame);

  // ---- intro -> event (same page, no reload) ----
  const intro = document.getElementById('intro'), event = document.getElementById('event'),
        opener = document.getElementById('opener');
  let shown = false;
  function showEvent() {
    if (shown) return; shown = true;
    // smooth cross-fade (no flash): intro fades out while the event section fades in
    intro.classList.add('out');
    intro.classList.remove('on');
    event.classList.add('on');
    document.body.classList.add('event-on');
    runEventTimeline();
    const v = document.getElementById('bgVideo'); if (v && v.play) v.play().catch(() => {});
  }
  // ---- page 3 ----
  const launch = document.getElementById('launch');
  let launched = false;
  function showLaunch() {
    if (launched) return; launched = true;
    // neat transition: page 2 lifts away and fades, then page 3 rises in
    event.classList.add('leave');
    setTimeout(() => {
      event.classList.remove('on');
      launch.classList.add('on');
      document.body.classList.add('launch-on');
      try { hv.pause(); } catch (e) {}
      if (window.KX_launchFX) window.KX_launchFX();
      // phones finish their install animation -> they disappear -> the stamp is stamped in their place
      const devices = document.querySelector('#launch .devices'), stamp = document.getElementById('stamp');
      const PHONES_OUT = 11800, STAMP_IN = 12900;      // ms after page 3 opens (phones run one full cycle first)
      setTimeout(() => { if (devices) devices.classList.add('out'); }, PHONES_OUT);
      setTimeout(() => { if (devices) devices.classList.add('gone'); }, PHONES_OUT + 950);
      setTimeout(() => {
        if (!stamp) return;
        stamp.classList.add('on');
        if (devices) devices.classList.add('shake');
        if (window.KX_stampBurst) window.KX_stampBurst();
      }, STAMP_IN);
      if (redirectToHome) {
        setTimeout(() => window.location.replace('../home.html'), STAMP_IN + 3000);
      }
    }, 450);
  }
  // ---- event timeline ----
  // people walk in + shake hands (video) -> thumbs-up -> they move apart -> SUCCESS between them -> people disappear -> date + venue box
  const stage = document.getElementById('stage'),
        hv = document.getElementById('hsVideo'),
        cL = document.getElementById('hsL'), cR = document.getElementById('hsR');
  const VENUE_HOLD = 2200;            // ms the venue details stay on screen (after the people have disappeared), then page 3 opens
  const SPLIT = 0.48;                 // video is cut in two at 48% of its width (between the two people)
  const THUMBS_AT = 6.85;              // seconds into the video when the thumbs-up is showing (video skips its own SUCCESS text and goes on to the dissolve)
  let vw = 0, vh = 0, rafOn = false, apartDone = false;
  const add = (name, ms) => setTimeout(() => event.classList.add('s-' + name), ms);

  const gL = cL.getContext('2d', {alpha: false, desynchronized: true}),
        gR = cR.getContext('2d', {alpha: false, desynchronized: true});
  function draw() {
    if (!vw) return;
    const sw = Math.round(vw * SPLIT);
    gL.drawImage(hv, 0, 0, sw, vh, 0, 0, cL.width, cL.height);
    gR.drawImage(hv, sw, 0, vw - sw, vh, 0, 0, cR.width, cR.height);
  }
  function setup() {
    vw = hv.videoWidth; vh = hv.videoHeight;
    const sw = Math.round(vw * SPLIT);
    cL.width = sw; cL.height = vh; cR.width = vw - sw; cR.height = vh;
    draw();
  }
  const ARRIVE = 2.8;                 // video seconds when they meet; before that they glide in from the screen edges
  const hasRVFC = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
  let lastIn = -1;
  function tick() {
    draw();
    const p = Math.min(1, hv.currentTime / ARRIVE);
    if (p < 1 || lastIn !== 0) {            // after they have arrived --in stays 0: no more style updates
      const v = +Math.pow(1 - p, 1.7).toFixed(4);
      if (v !== lastIn) { stage.style.setProperty('--in', v); lastIn = v; }
    }
    if (!apartDone && hv.currentTime >= THUMBS_AT) { apartDone = true; thumbsUp(); }
  }
  function loop() {
    tick();
    if (hv.ended) { draw(); rafOn = false; return; }
    if (hasRVFC) hv.requestVideoFrameCallback(loop); else requestAnimationFrame(loop);
  }
  function thumbsUp() {
    event.classList.add('s-apart');            // people slide apart
    add('success', 300);                        // SUCCESS appears between them
    // the video's own dissolve removes the people; 'ended' then calls peopleGone(). This is only a safety net.
    const left = (isFinite(hv.duration) && hv.currentTime > 0) ? Math.max(0, (hv.duration - hv.currentTime) * 1000) : 0;
    setTimeout(peopleGone, left + 700);
  }
  let goneDone = false;
  function peopleGone() {
    if (goneDone) return; goneDone = true;
    event.classList.add('s-gone');              // people are gone
    add('info', 350);                           // ONLY NOW the venue details appear
    setTimeout(showLaunch, 350 + VENUE_HOLD);   // ...and page 3 opens right after
  }
  hv.addEventListener('loadeddata', setup);
  hv.addEventListener('ended', () => { draw(); if (!apartDone) { apartDone = true; thumbsUp(); } peopleGone(); });
  hv.load();

  function runEventTimeline() {
    setTimeout(() => {
      event.classList.add('s-people');
      if (hv.readyState >= 2 && !vw) setup();
      hv.playbackRate = 1.0;
      const p = hv.play();
      if (p && p.catch) p.catch(() => { if (!apartDone) { apartDone = true; thumbsUp(); } });
      if (!rafOn) { rafOn = true; if (hasRVFC) hv.requestVideoFrameCallback(loop); else requestAnimationFrame(loop); }
    }, 700);
    // safety: if the video never starts, still show SUCCESS + venue
    setTimeout(() => { if (!apartDone && hv.currentTime === 0) { apartDone = true; thumbsUp(); } }, 4000);
  }

  // ---- opening animation: start intro after the panels open ----
  const OPEN_MS = 700;
  const go = () => document.body.classList.add('go');
  if (document.readyState === 'complete') go(); else addEventListener('load', go);
  setTimeout(go, 800);                       // safety if load is slow
  setTimeout(() => { if (opener) opener.remove(); }, OPEN_MS + 1200);
  if (ALLOW_SKIP) {
    addEventListener('click', () => { if (document.body.classList.contains('go')) showEvent(); });
    addEventListener('keydown', e => { if (e.key === 'Enter' && document.body.classList.contains('go')) showEvent(); });
  }
  setTimeout(showEvent, OPEN_MS + SHOW_EVENT_AFTER);
})();
