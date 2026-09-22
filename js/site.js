const pageLang = document.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "zh";

function urlFor(lang) {
  const hash = location.hash || "";
  if (lang === "en") return pageLang === "en" ? `./${hash}` : `en/${hash}`;
  return pageLang === "zh" ? `./${hash}` : `../${hash}`;
}

const savedLang = localStorage.getItem("site-lang");
const prefersEnglish = (navigator.language || "").toLowerCase().startsWith("en");
if (savedLang === "en" || savedLang === "zh") {
  if (savedLang !== pageLang) location.replace(urlFor(savedLang));
} else if (pageLang === "zh" && prefersEnglish) {
  localStorage.setItem("site-lang", "en");
  location.replace(urlFor("en"));
}

document.querySelectorAll("[data-lang-switch]").forEach((link) => {
  link.addEventListener("click", () => {
    const next = link.dataset.langSwitch;
    localStorage.setItem("site-lang", next);
    const base = link.getAttribute("href").split("#")[0];
    link.href = `${base}${location.hash}`;
  });
});

const header = document.querySelector(".topbar");
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const links = [...document.querySelectorAll(".site-nav a")];
const sections = links
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function setHeader() {
  header.classList.toggle("is-solid", window.scrollY > 24);
}

toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
});

links.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) => {
        const current = link.getAttribute("href") === `#${visible.target.id}`;
        if (current) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-30% 0px -55% 0px", threshold: [0.1, 0.4] }
  );
  sections.forEach((section) => spy.observe(section));
}

document.querySelectorAll('a[href^="http"]').forEach((link) => {
  link.target = "_blank";
  const rel = new Set((link.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
  rel.add("noopener");
  rel.add("noreferrer");
  link.setAttribute("rel", [...rel].join(" "));
});

setHeader();
window.addEventListener("scroll", setHeader, { passive: true });
