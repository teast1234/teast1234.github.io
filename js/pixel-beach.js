(() => {
  const canvas = document.querySelector("[data-pixel-beach]");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const H = 42;
  let W = 200;
  let scale = 4;
  let dpr = 1;

  const C = {
    mist: "#f3ebe0",
    sandHi: "#efe0c4",
    sand: "#e6cfa4",
    sandLo: "#d4b888",
    wet: "#cdb58c",
    foam: "#f7f1e6",
    crab: "#e07a55",
    crabLo: "#c45d3c",
    eye: "#3a2c24",
    fish: "#6eb0d4",
    fishHi: "#d0ebf7",
    fishFin: "#f0b46e",
    // Patrick-ish starfish
    pat: "#f0a0b4",
    patLo: "#d97d96",
    patBelly: "#f6c4d0",
    octo: "#d08a9a",
    octoLo: "#b66b7d",
    heart: "#ff6b7a",
    heartHi: "#ff9aa5",
    shell: "#e0c9a8",
  };

  function ease(u) {
    return u * u * (3 - 2 * u);
  }

  function resize() {
    const parent = canvas.parentElement;
    const cssW = Math.max(320, parent ? parent.clientWidth : window.innerWidth);
    const cssH = parent ? parent.clientHeight : 150;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
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
    // Soft sky/paper fade into beach — no hard "ocean zone"
    rect(0, 0, W, 14, C.mist);
    rect(0, 10, W, 6, C.sandHi);
    rect(0, 14, W, H - 14, C.sand);
    rect(0, 14, W, 2, C.wet);

    // gentle sparkle / shells
    for (let x = 0; x < W; x += 13) {
      px((x + Math.floor(t * 0.4)) % W, 18, C.sandLo);
      px((x + 6) % W, 26, C.shell);
      px((x + 9) % W, 34, C.sandLo);
      px((x + 2) % W, 38, C.foam);
    }
  }

  function drawCrab(x, y, frame) {
    const bob = frame % 2;
    const yy = y + bob;
    rect(x + 1, yy, 8, 4, C.crab);
    rect(x + 2, yy + 1, 6, 3, C.crabLo);
    px(x + 2, yy - 1, C.eye);
    px(x + 7, yy - 1, C.eye);
    px(x + 2, yy - 2, C.crab);
    px(x + 7, yy - 2, C.crab);
    rect(x - 2, yy + 1, 2, 2, C.crab);
    px(x - 3, yy, C.crab);
    rect(x + 10, yy + 1, 2, 2, C.crab);
    px(x + 12, yy, C.crab);
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
    const yy = y + (frame % 2);
    rect(x, yy, 9, 4, C.fish);
    rect(x + 2, yy + 1, 5, 2, C.fishHi);
    px(x + 2, yy, C.eye);
    px(x + 9, yy + 1, C.fishFin);
    px(x + 10, yy + flap, C.fishFin);
    px(x + 10, yy + 3 - flap, C.fishFin);
    px(x + 11, yy + 1 + flap, C.fishFin);
  }

  // Patrick-like five-pointed starfish with a cute face
  function drawPatrick(x, y, frame) {
    const bob = frame % 2;
    const yy = y + bob;
    // vertical arm
    rect(x + 3, yy - 2, 3, 3, C.pat);
    // body
    rect(x + 2, yy + 1, 5, 4, C.pat);
    rect(x + 3, yy + 2, 3, 2, C.patBelly);
    // left / right arms
    rect(x - 1, yy + 1, 3, 3, C.pat);
    rect(x + 7, yy + 1, 3, 3, C.pat);
    // lower left / right legs
    rect(x, yy + 5, 3, 3, C.patLo);
    rect(x + 6, yy + 5, 3, 3, C.patLo);
    // face
    px(x + 3, yy + 2, C.eye);
    px(x + 5, yy + 2, C.eye);
    px(x + 3, yy + 4, C.patLo);
    px(x + 4, yy + 4, C.patLo);
    px(x + 5, yy + 4, C.patLo);
  }

  function drawOctopus(x, y, frame) {
    const w = frame % 2;
    const yy = y + (frame % 2);
    rect(x + 1, yy, 7, 4, C.octo);
    rect(x + 2, yy + 1, 5, 2, C.octoLo);
    px(x + 3, yy, C.eye);
    px(x + 6, yy, C.eye);
    for (let i = 0; i < 5; i += 1) {
      const tx = x + 1 + i + (i > 2 ? 1 : 0);
      px(tx, yy + 4, C.octo);
      px(tx + (w ? 1 : 0), yy + 5, C.octoLo);
      px(tx + (w ? 0 : 1), yy + 6, C.octo);
    }
  }

  function drawHeart(x, y, size) {
    // size 1 = small, 2 = bigger chunky heart
    if (size >= 2) {
      px(x, y, C.heartHi);
      px(x + 1, y, C.heart);
      px(x + 3, y, C.heart);
      px(x + 4, y, C.heartHi);
      rect(x, y + 1, 5, 2, C.heart);
      px(x + 1, y + 3, C.heart);
      px(x + 2, y + 3, C.heart);
      px(x + 3, y + 3, C.heart);
      px(x + 2, y + 4, C.heart);
    } else {
      px(x, y, C.heartHi);
      px(x + 2, y, C.heartHi);
      px(x + 1, y, C.heart);
      px(x, y + 1, C.heart);
      px(x + 1, y + 1, C.heart);
      px(x + 2, y + 1, C.heart);
      px(x + 1, y + 2, C.heart);
    }
  }

  function burstHearts(cx, cy, t, seed) {
    // denser floating hearts
    for (let i = 0; i < 5; i += 1) {
      const phase = t * (1.2 + i * 0.15) + seed + i * 1.7;
      const rise = ((phase % 2.4) / 2.4) * 10;
      const sway = Math.sin(phase * 2.2) * (1 + (i % 3));
      const x = cx + sway + (i - 2) * 3;
      const y = cy - rise;
      drawHeart(x, y, i % 2 === 0 ? 2 : 1);
    }
  }

  const LOOP = calm ? 32 : 26;

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

  function scene(time) {
    const t = ((time % LOOP) + LOOP) % LOOP;
    drawBackdrop(t);
    const frame = Math.floor(t * (calm ? 3.5 : 6));

    // Meet points along the beach (all on sand)
    const meetFish = Math.floor(W * 0.22);
    const meetStar = Math.floor(W * 0.48);
    const meetOcto = Math.floor(W * 0.72);

    // Crab leads the parade
    const crabPoints = [
      { t: 0, x: -16 },
      { t: LOOP * 0.12, x: meetFish },
      { t: LOOP * 0.22, x: meetFish },
      { t: LOOP * 0.38, x: meetStar },
      { t: LOOP * 0.48, x: meetStar },
      { t: LOOP * 0.64, x: meetOcto },
      { t: LOOP * 0.76, x: meetOcto },
      { t: LOOP, x: W + 20 },
    ];
    const crabX = lerpPath(t, crabPoints);
    const ground = 28;

    // Join flags
    const fishJoined = t >= LOOP * 0.12;
    const starJoined = t >= LOOP * 0.38;
    const octoJoined = t >= LOOP * 0.64;

    // Waiting friends before joining (idle on beach)
    if (!fishJoined) drawFish(meetFish + 14, ground - 2, frame);
    if (!starJoined) drawPatrick(meetStar + 14, ground - 1, frame);
    if (!octoJoined) drawOctopus(meetOcto + 14, ground - 2, frame);

    // After joining, friends walk behind the crab as a cute parade
    if (fishJoined) {
      const follow = Math.min(crabX - 16, meetFish + (crabX - meetFish));
      drawFish(follow, ground - 2, frame);
    }
    if (starJoined) {
      const follow = Math.min(crabX - 30, meetStar + (crabX - meetStar));
      drawPatrick(follow, ground - 1, frame);
    }
    if (octoJoined) {
      const follow = Math.min(crabX - 44, meetOcto + (crabX - meetOcto));
      drawOctopus(follow, ground - 2, frame);
    }

    drawCrab(crabX, ground, frame);

    // Meeting heart storms + ongoing hearts while parade walks
    if (t >= LOOP * 0.12 && t < LOOP * 0.24) burstHearts(meetFish + 6, ground - 4, t, 0.2);
    if (t >= LOOP * 0.38 && t < LOOP * 0.5) burstHearts(meetStar + 6, ground - 4, t, 1.1);
    if (t >= LOOP * 0.64 && t < LOOP * 0.78) burstHearts(meetOcto + 6, ground - 4, t, 2.0);

    if (fishJoined && t >= LOOP * 0.24) {
      // soft trail of hearts above the group
      const hx = crabX - 8;
      drawHeart(hx + Math.sin(t * 3) * 2, ground - 8 - (frame % 3), 2);
      drawHeart(hx - 10 + Math.cos(t * 2.4) * 2, ground - 11 - ((frame + 1) % 3), 1);
      if (starJoined) drawHeart(hx - 20, ground - 9 - ((frame + 2) % 2), 2);
      if (octoJoined) drawHeart(hx - 32 + Math.sin(t * 2) * 2, ground - 12, 1);
    }
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
