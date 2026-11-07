/* KonnectX page 3: celebration (confetti cannons, confetti rain, fireworks) while "WE ARE LAUNCHING SOON" appears. */
(() => {
  const cv = document.getElementById('fx'); if (!cv) return;
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLORS = ['#ffd86b', '#fff3b0', '#e0a800', '#1fff4a', '#b8ffc6', '#ffffff', '#ffb52e', '#7dffa0'];
  const LOW = matchMedia('(max-width:700px)').matches || matchMedia('(pointer:coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4;
  const MAX_PARTS = LOW ? 420 : 1100;   // fewer pieces on phones = smooth
  const K = LOW ? .5 : 1;                // amount multiplier

  let W = 0, H = 0, dpr = 1, S = 1, parts = [], raf = 0, last = 0, started = false, startedAt = 0;

  function size() {
    dpr = Math.min(devicePixelRatio || 1, LOW ? 1.25 : 2);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    S = dpr * Math.max(.75, Math.min(1.4, innerHeight / 820));   // speed/size scale
  }
  addEventListener('resize', size); size();
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = () => COLORS[(Math.random() * COLORS.length) | 0];

  /* ======================= VISUALS ======================= */
  // confetti cannon: pieces fly out at an angle, then flutter down at a medium speed
  function cannon(x, y, angle, n) {
    n = Math.max(0, Math.min(Math.round(n * K), MAX_PARTS - parts.length));
    for (let i = 0; i < n; i++) {
      const a = angle + rnd(-.5, .5), v = rnd(15, 30) * S;
      parts.push({t: 'c', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: .24 * S, drag: .96,
        w: rnd(6, 12) * S, h: rnd(4, 7) * S, r: rnd(0, 6.28), vr: rnd(-.3, .3), c: pick(), life: 0, max: rnd(190, 300)});
    }
  }
  // confetti rain from the top of the screen
  function rain(n) {
    n = Math.max(0, Math.min(Math.round(n * K), MAX_PARTS - parts.length));
    for (let i = 0; i < n; i++) {
      parts.push({t: 'c', x: rnd(0, W), y: -20 * S, vx: rnd(-1.6, 1.6) * S, vy: rnd(1, 5) * S, g: .22 * S, drag: .96,
        w: rnd(6, 11) * S, h: rnd(4, 7) * S, r: rnd(0, 6.28), vr: rnd(-.25, .25), c: pick(), life: 0, max: rnd(220, 320)});
    }
  }
  // firework: round burst of glowing sparks (no shadowBlur: drawn as soft double dots, which is much faster)
  function firework(x, y) {
    const n = LOW ? 36 : 70, col = Math.random() < .6 ? ['#ffd86b', '#fff3b0'] : ['#1fff4a', '#b8ffc6'];
    for (let i = 0; i < n; i++) {
      const a = i / n * 6.283 + rnd(-.05, .05), v = rnd(2.6, 7.4) * S;
      parts.push({t: 's', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: .06 * S, drag: .965,
        r: rnd(1.3, 2.6) * S, c: col[i % 2], life: 0, max: rnd(55, 90)});
    }
    for (let i = 0; i < (LOW ? 4 : 10); i++) parts.push({t: 's', x, y, vx: rnd(-1, 1) * S, vy: rnd(-1, 1) * S, g: 0, drag: .9,
      r: rnd(4, 7) * S, c: '#fff3b0', life: 0, max: 10});
  }
  // launches a firework: whistle up, then burst + boom
  function fw(v) {
    v = v == null ? 1 : v;
    const x = rnd(.12, .88) * W, y = rnd(.12, .5) * H;
    setTimeout(() => { firework(x, y); kick(); }, 420);
  }

  function step(t) {
    const dt = Math.min(2.5, (t - last) / 16.7 || 1); last = t;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life += dt; p.vx *= Math.pow(p.drag, dt); p.vy = p.vy * Math.pow(p.drag, dt) + p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      const k = 1 - p.life / p.max;
      if (k <= 0 || p.y > H + 40 * S) { parts.splice(i, 1); continue; }
      if (p.t === 'c') {
        p.r += p.vr * dt;
        const c = Math.cos(p.r), s = Math.sin(p.r), f = Math.abs(Math.cos(p.life * .15 + p.r)) * .9 + .1;   // flutter
        ctx.setTransform(c, s, -s * f, c * f, p.x, p.y);
        ctx.globalAlpha = Math.min(1, k * 4);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
    }
    // sparks (additive glow)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of parts) {
      if (p.t !== 's') continue;
      const k = Math.max(0, 1 - p.life / p.max), r = p.r * (.5 + k * .5);
      ctx.fillStyle = p.c;
      if (!LOW) { ctx.globalAlpha = k * .22; ctx.beginPath(); ctx.arc(p.x, p.y, r * 3, 0, 6.283); ctx.fill(); }
      ctx.globalAlpha = k;       ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.283); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    raf = parts.length ? requestAnimationFrame(step) : 0;
  }
  function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } }

  // tiny gold burst when the stamp lands (impact is ~0.66s after the stamp starts)
  window.KX_stampBurst = function () {
    if (reduce) return;
    setTimeout(() => {
      const el = document.getElementById('stamp'); if (!el) return;
      const r = el.getBoundingClientRect(), x = (r.left + r.width / 2) * dpr, y = (r.top + r.height / 2) * dpr;
      firework(x, y); kick();
    }, 660);
  };

  // called from main.js when page 3 opens
  window.KX_launchFX = function () {
    if (reduce || started) return; started = true; startedAt = performance.now();
    const at = (ms, fn) => setTimeout(() => { fn(); kick(); }, ms);

    // wave 1: two big cannons + fanfare + applause
    at(400,  () => { cannon(0, H, -1.05, 120); cannon(W, H, -2.09, 120); });
    // confetti rain from the top for ~5 seconds
    for (let i = 0; i < 55; i++) at(900 + i * 90, () => rain(5));
    // fireworks, one after another
    [700, 1200, 1700, 2300, 2900, 3600, 4400, 5300].forEach(ms => at(ms, () => fw(1)));
    // wave 2 and 3 of cannons
    at(1500, () => { cannon(0, H, -1.0, 90);  cannon(W, H, -2.14, 90);  });
    at(2800, () => { cannon(0, H, -.9, 80);   cannon(W, H, -2.24, 80);  });
    at(4200, () => { cannon(W * .5, H, -1.57, 90); });

    // gentle fireworks keep going in the background 
    setInterval(() => { if (Math.random() < .7) { fw(1); kick(); } }, 2600);
  };

})();
