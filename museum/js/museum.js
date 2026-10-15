(() => {
  const PAGE_SIZE = 6;
  const root = document.documentElement;
  const grid = document.querySelector("[data-grid]");
  const filtersEl = document.querySelector("[data-filters]");
  const pagerEl = document.querySelector("[data-pager]");
  const totalCountEl = document.querySelector("[data-total-count]");
  const filterNoteEl = document.querySelector("[data-filter-note]");
  let totalCount = 0;
  const lightbox = document.querySelector("[data-lightbox]");
  const lbImg = document.querySelector("[data-lb-img]");
  const lbTitle = document.querySelector("[data-lb-title]");
  const lbMeta = document.querySelector("[data-lb-meta]");
  const lbStory = document.querySelector("[data-lb-story]");
  const viewToggle = document.querySelector("[data-view-toggle]");
  const themeBtn = document.querySelector("[data-theme-toggle]");
  const closeBtn = document.querySelector("[data-lb-close]");

  let works = [];
  let filters = [];
  let activeFilter = "all";
  let page = 1;
  let current = null;
  let viewMode = "art"; // art | original

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("nmf-theme", theme);
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      themeBtn.textContent = theme === "dark" ? "日间" : "夜间";
    }
  }

  function initTheme() {
    const saved = localStorage.getItem("nmf-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
  }

  function filtered() {
    if (activeFilter === "all") return works;
    return works.filter((w) => w.filter === activeFilter);
  }

  function renderFilters() {
    filtersEl.innerHTML = "";
    filters.forEach((f) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-btn";
      btn.textContent = f.label;
      btn.setAttribute("aria-pressed", f.id === activeFilter ? "true" : "false");
      btn.addEventListener("click", () => {
        activeFilter = f.id;
        page = 1;
        renderFilters();
        renderGrid();
      });
      filtersEl.appendChild(btn);
    });
  }

  function displayArtist(artist) {
    const name = (artist || "").trim();
    if (!name || name === "佚名" || name.toLowerCase() === "unknown") return "";
    return name;
  }

  function card(work) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card";
    btn.setAttribute("aria-label", `查看作品：${work.creation_title}`);
    const artist = displayArtist(work.artist);
    const footLeft = artist
      ? `仿 ${work.original_title} · ${artist}`
      : `仿 ${work.original_title}`;
    btn.innerHTML = `
      <div class="card-frame"><img src="${work.art}" alt="${work.creation_title}" loading="lazy" decoding="async"></div>
      <div class="card-meta"><span>${work.era_label}</span><span>${work.catalog}</span></div>
      <h3 class="card-title">${work.creation_title}</h3>
      <p class="card-sub">${work.original_title}</p>
      <div class="card-foot"><span>${footLeft}</span><span>${work.original_date || ""}</span></div>
    `;
    btn.addEventListener("click", () => openLightbox(work));
    return btn;
  }

  function pageWindow(totalPages) {
    if (totalPages <= 9) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([1, totalPages, page]);
    for (let i = page - 1; i <= page + 1; i += 1) {
      if (i >= 1 && i <= totalPages) pages.add(i);
    }
    if (page <= 3) [2, 3, 4, 5].forEach((n) => pages.add(n));
    if (page >= totalPages - 2) {
      [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1].forEach((n) => {
        if (n >= 1) pages.add(n);
      });
    }
    return [...pages].sort((a, b) => a - b);
  }

  function renderPager(totalPages) {
    pagerEl.innerHTML = "";
    if (totalPages <= 1) return;

    const go = (nextPage) => {
      page = nextPage;
      renderGrid();
      document.getElementById("collection")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const prev = document.createElement("button");
    prev.type = "button";
    prev.textContent = "上一页";
    prev.disabled = page <= 1;
    prev.addEventListener("click", () => go(page - 1));
    pagerEl.appendChild(prev);

    const nums = pageWindow(totalPages);
    let cursor = 0;
    nums.forEach((n) => {
      if (cursor && n - cursor > 1) {
        const gap = document.createElement("span");
        gap.className = "pager-gap";
        gap.textContent = "…";
        gap.setAttribute("aria-hidden", "true");
        pagerEl.appendChild(gap);
      }
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = String(n);
      if (n === page) b.setAttribute("aria-current", "page");
      b.addEventListener("click", () => go(n));
      pagerEl.appendChild(b);
      cursor = n;
    });

    const next = document.createElement("button");
    next.type = "button";
    next.textContent = "下一页";
    next.disabled = page >= totalPages;
    next.addEventListener("click", () => go(page + 1));
    pagerEl.appendChild(next);
  }

  function renderCount() {
    if (totalCountEl) totalCountEl.textContent = String(totalCount);
    if (!filterNoteEl) return;
    if (activeFilter === "all") {
      filterNoteEl.textContent = "";
      return;
    }
    const active = filters.find((f) => f.id === activeFilter);
    const label = active?.label || activeFilter;
    const n = filtered().length;
    filterNoteEl.textContent = `，当前「${label}」筛选 ${n} 件`;
  }

  function renderGrid() {
    const list = filtered();
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (page > totalPages) page = totalPages;
    const start = (page - 1) * PAGE_SIZE;
    const slice = list.slice(start, start + PAGE_SIZE);
    grid.innerHTML = "";
    slice.forEach((w) => grid.appendChild(card(w)));
    renderCount();
    renderPager(totalPages);
  }

  function setView(mode) {
    viewMode = mode;
    if (!current || !lbImg) return;
    const hasOriginal = Boolean(current.original);
    const showOriginal = mode === "original" && hasOriginal;
    lbImg.src = showOriginal ? current.original : current.art;
    lbImg.alt = showOriginal
      ? `${current.original_title}（原作参考）`
      : current.creation_title;

    viewToggle?.querySelectorAll("button").forEach((b) => {
      b.setAttribute("aria-pressed", b.dataset.mode === viewMode ? "true" : "false");
    });
  }

  function openLightbox(work) {
    if (!lightbox) return;
    current = work;
    viewMode = "art";
    if (lbTitle) lbTitle.textContent = work.creation_title;
    const artist = displayArtist(work.artist);
    if (lbMeta) {
      lbMeta.innerHTML =
        `<li><strong>原作</strong>仿 ${work.original_title}</li>` +
        (artist ? `<li><strong>艺术家</strong>${artist}</li>` : "") +
        `<li><strong>年代</strong>${work.original_date || "—"}</li>` +
        `<li><strong>馆藏号</strong>${work.catalog}</li>`;
    }
    if (lbStory) lbStory.textContent = work.background || "";

    const hasOriginal = Boolean(work.original);
    viewToggle?.classList.toggle("is-disabled", !hasOriginal);
    const origBtn = viewToggle?.querySelector('[data-mode="original"]');
    if (origBtn) {
      origBtn.disabled = !hasOriginal;
      origBtn.title = hasOriginal ? "切换到原作图片" : "暂无原作图";
    }

    // Open panel first so the detail view is never lost if image swap hiccups.
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lb-lock");
    setView("art");
    closeBtn?.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lb-lock");
    current = null;
  }

  themeBtn?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
  });

  closeBtn?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
  });

  viewToggle?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-mode]");
    if (!btn || btn.disabled) return;
    setView(btn.dataset.mode);
  });

  initTheme();

  fetch("data/collection.json")
    .then((r) => {
      if (!r.ok) throw new Error("failed to load collection");
      return r.json();
    })
    .then((data) => {
      works = data.works || [];
      filters = data.filters || [];
      totalCount = Number(data.count) || works.length;
      renderFilters();
      renderGrid();
    })
    .catch((err) => {
      grid.innerHTML = `<p style="grid-column:1/-1;color:var(--muted)">典藏加载失败：${err.message}</p>`;
    });
})();
