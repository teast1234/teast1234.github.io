(() => {
  const canvas = document.querySelector("[data-pixel-beach]");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  // Even with reduced-motion, keep a very gentle drift so the scene still feels alive.
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const H = 56;
  let W = 200;
  let scale = 3;
  let dpr = 1;

  // Soft palette matched to the warm paper cover
  const C = {
    mist: "#f3ebe0",
    sandHi: "#ead9b8",
    sand: "#e0c9a0",
    sandLo: "#d2b585",
    wet: "#cbb48a",
    waterHi: "#b7cfc8",
    water: "#9bbab8",
    waterLo: "#7fa3a4",
    foam: "#eef6f3",
    crab: "#e07a55",
    crabLo: "#c45d3c",
    crabEye: "#3a2c24",
    fish: "#6aa6c9",
    fishHi: "#c5e2f0",
    fishFin: "#e2a86a",
    star: "#e8a07a",
    starLo: "#d07b52",
    octo: "#d08a9a",
    octoLo: "#b66b7d",
    ink: "#3a2c24",
    heart: "#e58b8b",
    shell: "#dcc3a3",
  };

  function easeInOut(u) {
    return u * u * (3 - 2 * u);
  }

  function resize() {
    const parent = canvas.parentElement;
    const cssW = Math.max(320, parent ? parent.clientWidth : window.innerWidth);
    const cssH = parent ? parent.clientHeight : 120;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    scale = Math.max(2, Math.floor(cssH / H));
    W = Math.max(120, Math.ceil(cssW / scale));
    canvas.width = Math.floor(W * scale * dpr);
    canvas.height = Math.floor(H * scale * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }

  function px(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x | 0, y | 0, 1, 1);
  }

  function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x | 0, y | 0, w, h);
  }

  function drawBackdrop(t) {
    // Soft mist top that blends into the cover paper
    rect(0, 0, W, 16, C.mist);
    rect(0, 12, W, 6, C.sandHi);

    // Shallow lagoon
    rect(0, 16, W, 10, C.waterHi);
    rect(0, 22, W, 7, C.water);
    rect(0, 27, W, 4, C.waterLo);

    // Gentle foam line drifting
    const foam = Math.floor((t * (calm ? 4 : 10)) % 10);
    for (let x = -foam; x < W + 10; x += 10) {
      px(x + 1, 16, C.foam);
      px(x + 3, 17, C.foam);
      px(x + 6, 16, C.foam);
      px(x + 8, 18, C.foam);
    }

    // Beach
    rect(0, 30, W, H - 30, C.sand);
    rect(0, 30, W, 3, C.wet);
    for (let x = 0; x < W; x += 9) {
      px((x + Math.floor(t * 0.4)) % W, 35, C.sandLo);
      px((x + 4) % W, 42, C.sandLo);
      px((x + 7) % W, 50, C.shell);
    }

    // Soft dunes / sparkle
    for (let i = 0; i < 5; i += 1) {
      const sx = Math.floor((t * 3 + i * 37) % W);
      px(sx, 14 + (i % 3), C.foam);
    }
  }

  function drawCrab(x, y, frame) {
    const bob = frame % 2;
    const yy = y + bob;
    rect(x, yy, 6, 3, C.crab);
    rect(x + 1, yy + 1, 4, 2, C.crabLo);
    // eyes
    px(x + 1, yy - 1, C.crabEye);
    px(x + 4, yy - 1, C.crabEye);
    px(x + 1, yy - 2, C.crab);
    px(x + 4, yy - 2, C.crab);
    // claws
    px(x - 1, yy + 1, C.crab);
    px(x - 2, yy, C.crab);
    px(x + 6, yy + 1, C.crab);
    px(x + 7, yy, C.crab);
    // legs
    const a = bob ? 1 : 0;
    px(x, yy + 3, C.crabLo);
    px(x - 1, yy + 4 - a, C.crabLo);
    px(x + 2, yy + 3, C.crabLo);
    px(x + 3, yy + 4 - (1 - a), C.crabLo);
    px(x + 5, yy + 3, C.crabLo);
    px(x + 6, yy + 4 - a, C.crabLo);
  }

  function drawFish(x, y, frame) {
    const flap = frame % 2;
    rect(x, y, 6, 3, C.fish);
    rect(x + 1, y + 1, 3, 1, C.fishHi);
    px(x + 1, y, C.ink);
    px(x + 6, y + 1, C.fishFin);
    px(x + 7, y + flap, C.fishFin);
    px(x + 7, y + 2 - flap, C.fishFin);
  }

  function drawStar(x, y, frame) {
    const p = frame % 2;
    px(x + 2, y - p, C.star);
    px(x + 2, y + 1, C.starLo);
    px(x + 2, y + 2 + p, C.star);
    px(x, y + 1, C.star);
    px(x + 1, y + 1, C.starLo);
    px(x + 3, y + 1, C.starLo);
    px(x + 4, y + 1, C.star);
    px(x + 1, y, C.star);
    px(x + 3, y, C.star);
    px(x + 1, y + 2, C.star);
    px(x + 3, y + 2, C.star);
  }

  function drawOctopus(x, y, frame) {
    const w = frame % 2;
    rect(x + 1, y, 5, 3, C.octo);
    rect(x + 2, y + 1, 3, 1, C.octoLo);
    px(x + 2, y, C.ink);
    px(x + 5, y, C.ink);
    for (let i = 0; i < 4; i += 1) {
      const tx = x + 1 + i + (i > 1 ? 1 : 0);
      px(tx, y + 3, C.octo);
      px(tx + (w ? 1 : 0), y + 4, C.octoLo);
      px(tx + (w ? 0 : 1), y + 5, C.octo);
    }
  }

  function drawHeart(x, y, frame) {
    const up = frame % 2;
    px(x, y - up, C.heart);
    px(x + 2, y - up, C.heart);
    px(x + 1, y + 1 - up, C.heart);
  }

  // Longer, slower loop for a healing pace
  const LOOP = calm ? 28 : 22;

  function lerpPath(t, points) {
    // points: [{t, x}]
    if (t <= points[0].t) return points[0].x;
    for (let i = 0; i < points.length - 1; i += 1) {
      const a = points[i];
      const b = points[i + 1];
      if (t >= a.t && t <= b.t) {
        const u = easeInOut((t - a.t) / Math.max(0.0001, b.t - a.t));
        return a.x + (b.x - a.x) * u;
      }
    }
    return points[points.length - 1].x;
  }

  function meetingAt(t, meets) {
    for (const m of meets) {
      if (t >= m.t0 && t < m.t1) return m.kind;
    }
    return null;
  }

  function scene(time) {
    const t = ((time % LOOP) + LOOP) % LOOP;
    drawBackdrop(t);

    const fishX = Math.floor(W * 0.24);
    const starX = Math.floor(W * 0.5);
    const octX = Math.floor(W * 0.76);
    const frame = Math.floor(t * (calm ? 3 : 5));

    // Friends idle with soft motion
    drawFish(fishX, 20 + (frame % 2), frame);
    drawStar(starX, 38, frame);
    drawOctopus(octX, 21, frame);

    const crabPoints = [
      { t: 0, x: -10 },
      { t: LOOP * 0.14, x: fishX - 9 },
      { t: LOOP * 0.26, x: fishX - 9 },
      { t: LOOP * 0.42, x: starX - 8 },
      { t: LOOP * 0.54, x: starX - 8 },
      { t: LOOP * 0.72, x: octX - 9 },
      { t: LOOP * 0.84, x: octX - 9 },
      { t: LOOP, x: W + 12 },
    ];
    const meets = [
      { t0: LOOP * 0.14, t1: LOOP * 0.26, kind: "fish" },
      { t0: LOOP * 0.42, t1: LOOP * 0.54, kind: "star" },
      { t0: LOOP * 0.72, t1: LOOP * 0.84, kind: "octopus" },
    ];

    const crabX = lerpPath(t, crabPoints);
    drawCrab(crabX, 40, frame);

    const meet = meetingAt(t, meets);
    if (meet === "fish") drawHeart(fishX + 2, 15, frame);
    if (meet === "star") drawHeart(starX + 1, 33, frame);
    if (meet === "octopus") drawHeart(octX + 2, 16, frame);
  }

  let start = performance.now();
  let raf = 0;

  function tick(now) {
    scene((now - start) / 1000);
    raf = requestAnimationFrame(tick);
  }

  resize();
  scene(0);
  raf = requestAnimationFrame(tick);

  window.addEventListener(
    "resize",
    () => {
      resize();
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      start = performance.now() - (((performance.now() - start) / 1000) % LOOP) * 1000;
      raf = requestAnimationFrame(tick);
    }
  });
})();
