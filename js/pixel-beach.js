(() => {
  const canvas = document.querySelector("[data-pixel-beach]");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Logical pixel grid
  const H = 48;
  let W = 160;
  let scale = 4;
  let dpr = 1;

  // Palette
  const C = {
    sky: "#f4ebe0",
    sky2: "#e9dfd0",
    water: "#6eafc2",
    waterDeep: "#4f93a8",
    foam: "#dff3f7",
    sand: "#e7d2a6",
    sandDark: "#d2b787",
    sandWet: "#c9ad7a",
    crab: "#d45a32",
    crabDark: "#a84222",
    crabEye: "#1a1410",
    fish: "#3f8fd6",
    fishBelly: "#a8d4ff",
    fishFin: "#e89a3c",
    star: "#e8895a",
    starDark: "#c45f2f",
    octopus: "#c45f7a",
    octopusDark: "#8f3d56",
    ink: "#1a1410",
  };

  function resize() {
    const parent = canvas.parentElement;
    const cssW = Math.max(320, parent ? parent.clientWidth : window.innerWidth);
    const cssH = 96;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    scale = Math.max(3, Math.floor(cssH / H));
    W = Math.ceil(cssW / scale);
    canvas.width = Math.floor(W * scale * dpr);
    canvas.height = Math.floor(H * scale * dpr);
    canvas.style.width = `${W * scale}px`;
    canvas.style.height = `${H * scale}px`;
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }

  function px(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  }

  function fillRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  function drawBackground(t) {
    // sky
    fillRect(0, 0, W, 18, C.sky);
    fillRect(0, 14, W, 5, C.sky2);

    // water band with gentle scroll foam
    fillRect(0, 18, W, 12, C.water);
    fillRect(0, 24, W, 6, C.waterDeep);
    const foamOff = Math.floor((t * 12) % 8);
    for (let x = -foamOff; x < W; x += 8) {
      px(x, 18, C.foam);
      px(x + 2, 19, C.foam);
      px(x + 5, 18, C.foam);
    }

    // sand
    fillRect(0, 30, W, H - 30, C.sand);
    fillRect(0, 30, W, 3, C.sandWet);
    for (let x = 0; x < W; x += 7) {
      px(x + ((Math.floor(t) + x) % 3), 34, C.sandDark);
      px(x + 3, 40, C.sandDark);
      px(x + 1, 45, C.sandDark);
    }

    // tiny sun
    fillRect(W - 18, 4, 3, 3, "#f0c27a");
    px(W - 17, 3, "#f0c27a");
    px(W - 17, 7, "#f0c27a");
  }

  function drawCrab(x, y, frame) {
    const bob = frame % 2;
    // body
    fillRect(x, y + bob, 5, 3, C.crab);
    fillRect(x + 1, y + 1 + bob, 3, 2, C.crabDark);
    // eyes on stalks
    px(x + 1, y - 1 + bob, C.crabEye);
    px(x + 3, y - 1 + bob, C.crabEye);
    px(x + 1, y - 2 + bob, C.crab);
    px(x + 3, y - 2 + bob, C.crab);
    // claws
    px(x - 1, y + 1 + bob, C.crab);
    px(x - 2, y + bob, C.crab);
    px(x + 5, y + 1 + bob, C.crab);
    px(x + 6, y + bob, C.crab);
    // legs
    const leg = bob ? 1 : 0;
    px(x, y + 3 + bob, C.crabDark);
    px(x - 1, y + 4 + bob - leg, C.crabDark);
    px(x + 2, y + 3 + bob, C.crabDark);
    px(x + 4, y + 3 + bob, C.crabDark);
    px(x + 5, y + 4 + bob - (1 - leg), C.crabDark);
  }

  function drawFish(x, y, frame) {
    const flap = frame % 2;
    fillRect(x, y, 5, 3, C.fish);
    fillRect(x + 1, y + 1, 3, 1, C.fishBelly);
    px(x + 4, y, C.fish);
    px(x + 5, y + 1, C.fishFin);
    px(x + 6, y + flap, C.fishFin);
    px(x + 6, y + 2 - flap, C.fishFin);
    px(x + 1, y, C.ink);
    px(x, y + 1, C.fish);
  }

  function drawStar(x, y, frame) {
    const pulse = frame % 2;
    px(x + 2, y - pulse, C.star);
    px(x + 2, y + 1, C.starDark);
    px(x + 2, y + 2 + pulse, C.star);
    px(x, y + 1, C.star);
    px(x + 1, y + 1, C.starDark);
    px(x + 3, y + 1, C.starDark);
    px(x + 4, y + 1, C.star);
    px(x + 1, y, C.star);
    px(x + 3, y, C.star);
    px(x + 1, y + 2, C.star);
    px(x + 3, y + 2, C.star);
  }

  function drawOctopus(x, y, frame) {
    const wiggle = frame % 2;
    fillRect(x + 1, y, 4, 3, C.octopus);
    fillRect(x + 2, y + 1, 2, 1, C.octopusDark);
    px(x + 2, y, C.ink);
    px(x + 4, y, C.ink);
    // tentacles
    for (let i = 0; i < 4; i += 1) {
      const tx = x + i + (i > 1 ? 1 : 0);
      px(tx, y + 3, C.octopus);
      px(tx + (wiggle ? 1 : -1) * (i % 2 === 0 ? 1 : 0), y + 4, C.octopusDark);
      px(tx + (wiggle ? 0 : 1), y + 5, C.octopus);
    }
  }

  function drawHeart(x, y) {
    px(x, y, "#e35d6a");
    px(x + 2, y, "#e35d6a");
    px(x + 1, y + 1, "#e35d6a");
  }

  // Encounter stations as fractions of width
  const stations = [
    { at: 0.22, kind: "fish", labelY: 20 },
    { at: 0.48, kind: "star", labelY: 34 },
    { at: 0.74, kind: "octopus", labelY: 22 },
  ];

  const LOOP = 16; // seconds

  function scene(time) {
    const t = reduceMotion ? 2.2 : time % LOOP;
    drawBackground(t);

    // place friends
    const fishX = Math.floor(W * stations[0].at);
    const starX = Math.floor(W * stations[1].at);
    const octX = Math.floor(W * stations[2].at);
    const frame = Math.floor(t * 6);

    // fish bobbing in shallows
    drawFish(fishX, 21 + (frame % 2), frame);
    // starfish on sand
    drawStar(starX, 36, frame);
    // octopus at water edge
    drawOctopus(octX, 22, frame);

    // crab path with pauses at each friend
    // segments: walk -> pause meet -> walk -> pause -> walk -> pause -> walk off
    const path = [
      { t0: 0, t1: 2.2, x0: -8, x1: fishX - 8, meet: null },
      { t0: 2.2, t1: 4.0, x0: fishX - 8, x1: fishX - 8, meet: "fish" },
      { t0: 4.0, t1: 6.4, x0: fishX - 8, x1: starX - 7, meet: null },
      { t0: 6.4, t1: 8.2, x0: starX - 7, x1: starX - 7, meet: "star" },
      { t0: 8.2, t1: 11.0, x0: starX - 7, x1: octX - 8, meet: null },
      { t0: 11.0, t1: 13.0, x0: octX - 8, x1: octX - 8, meet: "octopus" },
      { t0: 13.0, t1: 16.0, x0: octX - 8, x1: W + 10, meet: null },
    ];

    let crabX = -8;
    let meeting = null;
    for (const seg of path) {
      if (t >= seg.t0 && t < seg.t1) {
        const u = (t - seg.t0) / (seg.t1 - seg.t0);
        crabX = seg.x0 + (seg.x1 - seg.x0) * u;
        meeting = seg.meet;
        break;
      }
      if (t >= seg.t1) {
        crabX = seg.x1;
        meeting = seg.meet;
      }
    }

    const walkFrame = Math.floor(t * 8);
    drawCrab(crabX, 35, walkFrame);

    if (meeting === "fish") drawHeart(fishX + 2, 16);
    if (meeting === "star") drawHeart(starX + 1, 31);
    if (meeting === "octopus") drawHeart(octX + 2, 17);
  }

  let start = performance.now();
  let raf = 0;

  function tick(now) {
    const t = (now - start) / 1000;
    scene(t);
    if (!reduceMotion) raf = requestAnimationFrame(tick);
  }

  resize();
  scene(0);
  if (!reduceMotion) raf = requestAnimationFrame(tick);

  window.addEventListener(
    "resize",
    () => {
      resize();
      if (reduceMotion) scene(2.2);
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else if (!reduceMotion) {
      start = performance.now() - ((performance.now() - start) % (LOOP * 1000));
      raf = requestAnimationFrame(tick);
    }
  });
})();
