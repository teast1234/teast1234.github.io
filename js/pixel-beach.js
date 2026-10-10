(() => {
  const canvas = document.querySelector("[data-pixel-beach]");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Keep sprites large enough on wide screens: scale from strip height, not tiny.
  const H = 40;
  let W = 200;
  let scale = 4;
  let dpr = 1;

  const C = {
    mist: "#f1e8db",
    sandHi: "#ead7b6",
    sand: "#e2c79c",
    sandLo: "#d2b585",
    wet: "#cbb48a",
    waterHi: "#c3d6cf",
    water: "#a8c4bf",
    waterLo: "#8aada8",
    foam: "#eef6f2",
    crab: "#e07a55",
    crabLo: "#c45d3c",
    eye: "#3a2c24",
    fish: "#6aa6c9",
    fishHi: "#c5e2f0",
    fishFin: "#e2a86a",
    star: "#e8a07a",
    starLo: "#d07b52",
    octo: "#d08a9a",
    octoLo: "#b66b7d",
    heart: "#e58b8b",
    shell: "#dcc3a3",
  };

  function ease(u) {
    return u * u * (3 - 2 * u);
  }

  function resize() {
    const parent = canvas.parentElement;
    const cssW = Math.max(320, parent ? parent.clientWidth : window.innerWidth);
    const cssH = parent ? parent.clientHeight : 150;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Prefer chunky pixels: ~4–6x so a 10px crab reads clearly
    scale = Math.max(4, Math.min(6, Math.floor(cssH / H)));
    W = Math.max(140, Math.ceil(cssW / scale));
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
    rect(0, 0, W, 10, C.mist);
    rect(0, 8, W, 5, C.sandHi);

    rect(0, 12, W, 7, C.waterHi);
    rect(0, 17, W, 5, C.water);
    rect(0, 21, W, 3, C.waterLo);

    const foam = Math.floor((t * (calm ? 5 : 11)) % 12);
    for (let x = -foam; x < W + 12; x += 12) {
      px(x + 2, 12, C.foam);
      px(x + 5, 13, C.foam);
      px(x + 8, 12, C.foam);
      px(x + 10, 14, C.foam);
    }

    rect(0, 23, W, H - 23, C.sand);
    rect(0, 23, W, 2, C.wet);
    for (let x = 0; x < W; x += 11) {
      px((x + Math.floor(t * 0.5)) % W, 27, C.sandLo);
      px((x + 5) % W, 33, C.sandLo);
      px((x + 8) % W, 37, C.shell);
    }
  }

  // Larger, cuter sprites
  function drawCrab(x, y, frame) {
    const bob = frame % 2;
    const yy = y + bob;
    rect(x + 1, yy, 8, 4, C.crab);
    rect(x + 2, yy + 1, 6, 3, C.crabLo);
    // eyes
    px(x + 2, yy - 1, C.eye);
    px(x + 7, yy - 1, C.eye);
    px(x + 2, yy - 2, C.crab);
    px(x + 7, yy - 2, C.crab);
    // claws
    rect(x - 2, yy + 1, 2, 2, C.crab);
    px(x - 3, yy, C.crab);
    rect(x + 10, yy + 1, 2, 2, C.crab);
    px(x + 12, yy, C.crab);
    // legs
    const a = bob ? 1 : 0;
    px(x + 1, yy + 4, C.crabLo);
    px(x, yy + 5 - a, C.crabLo);
    px(x + 4, yy + 4, C.crabLo);
    px(x + 5, yy + 5 - (1 - a), C.crabLo);
    px(x + 8, yy + 4, C.crabLo);
    px(x + 9, yy + 5 - a, C.crabLo);
  }

  function drawFish(x, y, frame) {
    const flap = frame % 2;
    rect(x, y, 9, 4, C.fish);
    rect(x + 2, y + 1, 5, 2, C.fishHi);
    px(x + 2, y, C.eye);
    px(x + 9, y + 1, C.fishFin);
    px(x + 10, y + flap, C.fishFin);
    px(x + 10, y + 3 - flap, C.fishFin);
    px(x + 11, y + 1 + flap, C.fishFin);
  }

  function drawStar(x, y, frame) {
    const p = frame % 2;
    px(x + 3, y - 1 - p, C.star);
    px(x + 3, y, C.star);
    rect(x + 2, y + 1, 3, 2, C.starLo);
    px(x + 3, y + 3, C.star);
    px(x + 3, y + 4 + p, C.star);
    rect(x, y + 1, 2, 2, C.star);
    rect(x + 5, y + 1, 2, 2, C.star);
    px(x + 1, y, C.star);
    px(x + 5, y, C.star);
    px(x + 1, y + 3, C.star);
    px(x + 5, y + 3, C.star);
  }

  function drawOctopus(x, y, frame) {
    const w = frame % 2;
    rect(x + 1, y, 7, 4, C.octo);
    rect(x + 2, y + 1, 5, 2, C.octoLo);
    px(x + 3, y, C.eye);
    px(x + 6, y, C.eye);
    for (let i = 0; i < 5; i += 1) {
      const tx = x + 1 + i + (i > 2 ? 1 : 0);
      px(tx, y + 4, C.octo);
      px(tx + (w ? 1 : 0), y + 5, C.octoLo);
      px(tx + (w ? 0 : 1), y + 6, C.octo);
    }
  }

  function drawHeart(x, y, frame) {
    const up = frame % 2;
    px(x, y - up, C.heart);
    px(x + 2, y - up, C.heart);
    px(x + 1, y + 1 - up, C.heart);
    px(x + 1, y - up, C.heart);
  }

  const LOOP = calm ? 30 : 24;

  function lerpPath(t, points) {
    if (t <= points[0].t) return points[0].x;
    for (let i = 0; i < points.length - 1; i += 1) {
      const a = points[i];
      const b = points[i + 1];
      if (t >= a.t && t <= b.t) {
        const u = ease((t - a.t) / Math.max(0.0001, b.t - a.t));
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

    drawFish(fishX, 14 + (frame % 2), frame);
    drawStar(starX, 27, frame);
    drawOctopus(octX, 13, frame);

    const crabPoints = [
      { t: 0, x: -14 },
      { t: LOOP * 0.14, x: fishX - 12 },
      { t: LOOP * 0.27, x: fishX - 12 },
      { t: LOOP * 0.43, x: starX - 10 },
      { t: LOOP * 0.56, x: starX - 10 },
      { t: LOOP * 0.73, x: octX - 12 },
      { t: LOOP * 0.86, x: octX - 12 },
      { t: LOOP, x: W + 16 },
    ];
    const meets = [
      { t0: LOOP * 0.14, t1: LOOP * 0.27, kind: "fish" },
      { t0: LOOP * 0.43, t1: LOOP * 0.56, kind: "star" },
      { t0: LOOP * 0.73, t1: LOOP * 0.86, kind: "octopus" },
    ];

    const crabX = lerpPath(t, crabPoints);
    drawCrab(crabX, 28, frame);

    const meet = meetingAt(t, meets);
    if (meet === "fish") drawHeart(fishX + 3, 9, frame);
    if (meet === "star") drawHeart(starX + 2, 21, frame);
    if (meet === "octopus") drawHeart(octX + 3, 8, frame);
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

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else {
      start = performance.now() - (((performance.now() - start) / 1000) % LOOP) * 1000;
      raf = requestAnimationFrame(tick);
    }
  });
})();
