(() => {
  const canvas = document.querySelector("[data-pixel-beach]");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const H = 44;
  let W = 200;
  let scale = 4;
  let dpr = 1;

  const C = {
    mist: "#f3ebe0",
    sky: "#e8f0ee",
    waterHi: "#b9d4d6",
    water: "#8fbfc4",
    waterLo: "#6ea5ad",
    waterDeep: "#5a949e",
    foam: "#eef7f5",
    foamSoft: "#d9ecea",
    sandHi: "#efe0c4",
    sand: "#e6cfa4",
    sandLo: "#d4b888",
    wet: "#cdb58c",
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
    orange: "#f0a04a",
    orangeHi: "#ffc878",
    orangeLo: "#d87a2e",
    leaf: "#6aa86a",
    ink: "#3a2c24",
    spark: "#ffe8a0",
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
    const speed = calm ? 0.55 : 1;
    // Soft paper mist -> pale sky -> sea -> wet sand -> beach
    rect(0, 0, W, 6, C.mist);
    rect(0, 5, W, 4, C.sky);

    // Sea body
    rect(0, 8, W, 5, C.waterHi);
    rect(0, 12, W, 5, C.water);
    rect(0, 16, W, 4, C.waterLo);
    rect(0, 19, W, 3, C.waterDeep);

    // Rolling wave crests (two layers, different speeds)
    const w1 = Math.floor((t * 14 * speed) % 16);
    const w2 = Math.floor((t * 9 * speed + 7) % 18);
    for (let x = -w1; x < W + 16; x += 16) {
      // back swell
      px(x + 2, 10, C.foamSoft);
      px(x + 4, 9, C.foam);
      px(x + 6, 10, C.foamSoft);
      px(x + 8, 11, C.foam);
      px(x + 11, 10, C.foamSoft);
    }
    for (let x = -w2; x < W + 18; x += 18) {
      // front breaker + foam lace
      px(x + 1, 15, C.foam);
      px(x + 3, 14, C.foam);
      px(x + 5, 15, C.foam);
      px(x + 7, 16, C.foamSoft);
      px(x + 9, 15, C.foam);
      px(x + 12, 14, C.foam);
      px(x + 14, 16, C.foamSoft);
      // little splash dots
      if (((x + Math.floor(t * 3)) % 36) < 10) {
        px(x + 6, 13, C.foam);
        px(x + 10, 12, C.foamSoft);
      }
    }

    // Shoreline wash advancing/retreating slightly
    const wash = Math.floor(Math.sin(t * 1.4 * speed) * 1.5);
    rect(0, 21 + wash, W, 2, C.foamSoft);
    rect(0, 22 + wash, W, 2, C.wet);

    // Sand where friends walk
    const sandTop = 23 + wash;
    rect(0, sandTop, W, H - sandTop, C.sand);
    rect(0, sandTop, W, 1, C.sandHi);
    for (let x = 0; x < W; x += 12) {
      px((x + Math.floor(t * 0.35)) % W, sandTop + 3, C.sandLo);
      px((x + 5) % W, sandTop + 8, C.shell);
      px((x + 9) % W, sandTop + 13, C.sandLo);
      px((x + 2) % W, sandTop + 17, C.foam);
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

  // Tiny 3x5 "a" / "b" for the orange sticker
  function drawLetterA(x, y, color) {
    px(x + 1, y, color);
    px(x, y + 1, color);
    px(x + 2, y + 1, color);
    px(x, y + 2, color);
    px(x + 1, y + 2, color);
    px(x + 2, y + 2, color);
    px(x, y + 3, color);
    px(x + 2, y + 3, color);
    px(x, y + 4, color);
    px(x + 2, y + 4, color);
  }

  function drawLetterB(x, y, color) {
    px(x, y, color);
    px(x + 1, y, color);
    px(x, y + 1, color);
    px(x + 2, y + 1, color);
    px(x, y + 2, color);
    px(x + 1, y + 2, color);
    px(x, y + 3, color);
    px(x + 2, y + 3, color);
    px(x, y + 4, color);
    px(x + 1, y + 4, color);
  }

  function drawOrange(x, y, lift) {
    const yy = y - lift;
    // fruit body
    rect(x + 1, yy + 1, 8, 7, C.orange);
    rect(x + 2, yy, 6, 1, C.orangeHi);
    rect(x + 2, yy + 8, 6, 1, C.orangeLo);
    px(x, yy + 3, C.orange);
    px(x, yy + 4, C.orange);
    px(x + 9, yy + 3, C.orange);
    px(x + 9, yy + 4, C.orangeLo);
    // leaf + stem
    px(x + 4, yy - 1, C.leaf);
    px(x + 5, yy - 1, C.leaf);
    px(x + 6, yy - 2, C.leaf);
    // "ab" sticker
    drawLetterA(x + 2, yy + 2, C.ink);
    drawLetterB(x + 6, yy + 2, C.ink);
  }

  function cheerSparkles(cx, cy, t) {
    for (let i = 0; i < 7; i += 1) {
      const ang = t * 3.2 + i * 0.95;
      const r = 6 + (i % 3) * 3 + Math.sin(t * 5 + i) * 2;
      const x = cx + Math.cos(ang) * r;
      const y = cy - 4 + Math.sin(ang * 1.3) * (r * 0.45) - ((t * 8 + i * 3) % 10);
      px(x, y, i % 2 ? C.spark : C.heartHi);
      if (i % 2 === 0) drawHeart(x - 1, y - 2, 1);
    }
  }

  const LOOP = calm ? 38 : 32;

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

    // Story beats (fractions of LOOP)
    const T_FISH = 0.1;
    const T_STAR = 0.28;
    const T_OCTO = 0.46;
    const T_GATHER = 0.58; // all walk to center
    const T_LIFT = 0.68; // raise the ab-orange together
    const T_CHEER = 0.8; // jump & cheer
    const T_END = 0.96;

    const meetFish = Math.floor(W * 0.2);
    const meetStar = Math.floor(W * 0.42);
    const meetOcto = Math.floor(W * 0.62);
    const center = Math.floor(W * 0.5);

    // Crab leads parade, then gathers at center for the orange finale
    const crabPoints = [
      { t: 0, x: -16 },
      { t: LOOP * T_FISH, x: meetFish },
      { t: LOOP * (T_FISH + 0.08), x: meetFish },
      { t: LOOP * T_STAR, x: meetStar },
      { t: LOOP * (T_STAR + 0.08), x: meetStar },
      { t: LOOP * T_OCTO, x: meetOcto },
      { t: LOOP * (T_OCTO + 0.08), x: meetOcto },
      { t: LOOP * T_GATHER, x: center + 6 },
      { t: LOOP * T_END, x: center + 6 },
      { t: LOOP, x: W + 24 },
    ];
    const crabX = lerpPath(t, crabPoints);
    const wash = Math.floor(Math.sin(t * 1.4 * (calm ? 0.55 : 1)) * 1.5);
    const ground = 29 + wash;

    const fishJoined = t >= LOOP * T_FISH;
    const starJoined = t >= LOOP * T_STAR;
    const octoJoined = t >= LOOP * T_OCTO;
    const gathering = t >= LOOP * T_GATHER;
    const lifting = t >= LOOP * T_LIFT;
    const cheering = t >= LOOP * T_CHEER && t < LOOP * T_END;

    // Jump hop during cheer (shared bounce, slight phase offsets)
    const cheerPhase = cheering ? (t - LOOP * T_CHEER) / Math.max(0.001, LOOP * (T_END - T_CHEER)) : 0;
    const hop = (phase) => {
      if (!cheering) return 0;
      const u = (cheerPhase * 4 + phase) % 1;
      return Math.floor(Math.sin(u * Math.PI) * (calm ? 2 : 4));
    };
    // Orange lift height: ground → overhead
    let orangeLift = 0;
    if (lifting && !cheering) {
      const u = ease(Math.min(1, (t - LOOP * T_LIFT) / (LOOP * (T_CHEER - T_LIFT))));
      orangeLift = Math.floor(u * 10);
    } else if (cheering) {
      orangeLift = 10 + hop(0);
    } else if (gathering) {
      orangeLift = 0;
    }

    // Friend x positions: follow crab until gather, then fan around center
    function friendX(slot, meetX, joined) {
      if (!joined) return meetX + 14;
      if (gathering) {
        // slots: fish left, star mid-left, octo right of crab
        const targets = [center - 22, center - 8, center + 18];
        const from = Math.min(crabX - (16 + slot * 14), meetX + (crabX - meetX));
        const u = ease(Math.min(1, (t - LOOP * T_GATHER) / (LOOP * (T_LIFT - T_GATHER))));
        return from + (targets[slot] - from) * u;
      }
      return Math.min(crabX - (16 + slot * 14), meetX + (crabX - meetX));
    }

    const fishX = friendX(0, meetFish, fishJoined);
    const starX = friendX(1, meetStar, starJoined);
    const octoX = friendX(2, meetOcto, octoJoined);

    const crabY = ground - hop(0);
    const fishY = ground - 2 - hop(0.15);
    const starY = ground - 1 - hop(0.3);
    const octoY = ground - 2 - hop(0.45);

    // Waiting friends before joining
    if (!fishJoined) drawFish(meetFish + 14, ground - 2, frame);
    if (!starJoined) drawPatrick(meetStar + 14, ground - 1, frame);
    if (!octoJoined) drawOctopus(meetOcto + 14, ground - 2, frame);

    if (fishJoined) drawFish(fishX, fishY, frame);
    if (starJoined) drawPatrick(starX, starY, frame);
    if (octoJoined) drawOctopus(octoX, octoY, frame);
    drawCrab(crabX, crabY, frame);

    // Orange appears at gather, then rises overhead with everyone
    if (gathering) {
      const ox = center - 4;
      const oy = ground - 2;
      drawOrange(ox, oy, orangeLift);
      // tiny arms / reach lines toward the fruit while lifting
      if (lifting) {
        px(fishX + 8, fishY - 1 - Math.min(orangeLift, 6), C.fishFin);
        px(starX + 4, starY - 3 - Math.min(orangeLift, 5), C.pat);
        px(crabX + 4, crabY - 2 - Math.min(orangeLift, 6), C.crab);
        px(octoX + 2, octoY - 1 - Math.min(orangeLift, 5), C.octo);
      }
    }

    // Meeting heart storms
    if (t >= LOOP * T_FISH && t < LOOP * (T_FISH + 0.1)) burstHearts(meetFish + 6, ground - 4, t, 0.2);
    if (t >= LOOP * T_STAR && t < LOOP * (T_STAR + 0.1)) burstHearts(meetStar + 6, ground - 4, t, 1.1);
    if (t >= LOOP * T_OCTO && t < LOOP * (T_OCTO + 0.1)) burstHearts(meetOcto + 6, ground - 4, t, 2.0);

    // Parade heart trail (before finale)
    if (fishJoined && t >= LOOP * (T_FISH + 0.1) && t < LOOP * T_LIFT) {
      const hx = crabX - 8;
      drawHeart(hx + Math.sin(t * 3) * 2, ground - 8 - (frame % 3), 2);
      drawHeart(hx - 10 + Math.cos(t * 2.4) * 2, ground - 11 - ((frame + 1) % 3), 1);
      if (starJoined) drawHeart(hx - 20, ground - 9 - ((frame + 2) % 2), 2);
      if (octoJoined) drawHeart(hx - 32 + Math.sin(t * 2) * 2, ground - 12, 1);
    }

    // Cheer finale: sparkles + heart storm around the raised orange
    if (cheering) {
      cheerSparkles(center + 1, ground - 12 - hop(0), t);
      burstHearts(center, ground - 10 - hop(0), t * 1.4, 3.3);
      // little "!" cheer marks
      const bangY = ground - 16 - hop(0) - (frame % 2);
      px(center - 14, bangY, C.ink);
      px(center - 14, bangY + 1, C.ink);
      px(center - 14, bangY + 3, C.ink);
      px(center + 16, bangY + 1, C.ink);
      px(center + 16, bangY + 2, C.ink);
      px(center + 16, bangY + 4, C.ink);
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
