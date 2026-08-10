/* ═══ LUCIUS BURGER — motion engine + render ══════════════════════════
   Klasszikus script, egy IIFE. Nincs GSAP: egyetlen rAF loop hajtja a
   Lenist és a scroll-állapotot, a keyframe-ek deklaratívak a HTML-ben
   (data-window="start,end").
   ═══════════════════════════════════════════════════════════════════ */
(() => {
"use strict";

/* ── segédek ──────────────────────────────────────────────────────── */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const smoothstep = (from, to, v) => { const t = clamp((v - from) / (to - from || 1e-6)); return t * t * (3 - 2 * t); };
const pad3 = n => String(n).padStart(3, "0");
const money = LOCALE.money;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;

/* Kép + placeholder. Ha a .webp nincs meg, az <img> kiveszi magát és
   a mögötte lévő .ph parázs-placeholder marad. */
function pic(slug, alt, cls = "", icon = "&#127828;") {
  return `<div class="ph"><span class="ph-icon">${icon}</span><span class="ph-slug">${esc(slug)}</span></div>` +
         `<img class="${cls}" src="media/menu/${slug}.webp" alt="${esc(alt)}" loading="lazy" decoding="async" onerror="this.remove()">`;
}
function starsInner(v) {
  let h = "";
  for (let i = 1; i <= 5; i++) h += `<i class="${v >= i ? "on" : v >= i - .5 ? "half" : ""}"></i>`;
  return h;
}
function starsHtml(v) {
  return `<span class="stars" aria-label="${T.starsAria(String(v).replace(".", ","))}">${starsInner(v)}</span>`;
}
const TAG_LABEL = T.tags;

/* ── DOM ──────────────────────────────────────────────────────────── */
const curtain = $("#curtain"), curtainBar = $("#curtainBar"), curtainPct = $("#curtainPct");
const masthead = $("#masthead"), heroSec = $("#hero"), canvas = $("#heroCanvas");
const ctx = canvas.getContext("2d", { alpha: false });
const heroBar = $("#heroBar"), heroType = $(".hero-type");

/* ── hero frame sequence ──────────────────────────────────────────── */
const FRAMES = 145;
const frames = new Array(FRAMES);
let loaded = 0, current = -1, fallback = false;

function frameSrc(i) { return `media/hero/frame-${pad3(i + 1)}.webp`; }

function loadFrame(i) {
  return new Promise(res => {
    if (frames[i]) return res(true);
    const im = new Image();
    im.decoding = "async";
    im.onload = () => { frames[i] = im; loaded++; res(true); };
    im.onerror = () => res(false);
    im.src = frameSrc(i);
  });
}

function setProgress(p) {
  curtainBar.style.width = (p * 100).toFixed(0) + "%";
  curtainPct.textContent = Math.round(p * 100);
}

/* Ritkított frame-betöltés — a nearest() kitölti a lyukakat.
   iframe-ben (portfólió-előnézet) a legritkább: ott senki nem scrubol
   végig, viszont 47 kártya mellett a 7 MB komoly sávszélesség lenne. */
const embedded = (() => { try { return window.self !== window.top; } catch { return true; } })();
const STEP = embedded ? 6
           : (navigator.connection && navigator.connection.saveData) ? 3
           : innerWidth < 760 ? 2 : 1;

async function bootFrames() {
  const priority = [0, 1, 2, 3, 4, 36, 72, 108, 144];
  const ok = await Promise.all(priority.map(loadFrame));
  if (!ok.some(Boolean)) {           // nincs frame-mappa → videó-fallback
    fallback = true;
    heroSec.classList.add("is-fallback");
    const v = $("#heroFallback"); v.preload = "auto"; if (!reduced) v.play().catch(() => {});
    return;
  }
  setProgress(.18); draw(0); reveal();
  // a maradék batchekben, háttérben
  const rest = [];
  for (let i = 0; i < FRAMES; i += STEP) if (!priority.includes(i)) rest.push(i);
  const want = rest.length + priority.length;
  for (let i = 0; i < rest.length; i += 18) {
    await Promise.all(rest.slice(i, i + 18).map(loadFrame));
    setProgress(.18 + .82 * (loaded / want));
  }
}

let revealed = false;
function reveal() {
  if (revealed) return; revealed = true;
  setProgress(1);
  setTimeout(() => { curtain.classList.add("is-done"); document.body.classList.remove("is-locked"); }, 320);
}

function nearest(i) {
  if (frames[i]) return frames[i];
  for (let d = 1; d < FRAMES; d++) {
    if (frames[i - d]) return frames[i - d];
    if (frames[i + d]) return frames[i + d];
  }
  return null;
}

function sizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
  current = -1;
}

function draw(i) {
  const im = nearest(i);
  if (!im) return;
  const cw = canvas.width, ch = canvas.height;
  const s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
  const w = im.naturalWidth * s, h = im.naturalHeight * s;
  ctx.fillStyle = "#070504"; ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
  current = i;
}

/* ── scroll-motor ─────────────────────────────────────────────────── */
let lenis = null;
if (!reduced && window.Lenis) {
  lenis = new window.Lenis({ duration: 1.2, smoothWheel: true, wheelMultiplier: .9, touchMultiplier: 1.15 });
}

function chapterProgress(el) {
  const r = el.getBoundingClientRect();
  const span = r.height - window.innerHeight;
  return span <= 0 ? clamp(-r.top / (r.height || 1)) : clamp(-r.top / span);
}

/* data-window="a,b": a-tól b-ig látszik, előtte/utána finoman elúszik. */
function applyWindow(el, p) {
  const [a, b] = el.dataset.window.split(",").map(Number);
  const fadeIn = Math.max((b - a) * .3, .04);
  /* a=0 → már a betöltéskor látszik, nem kell hozzá görgetni */
  const vis = (a <= 0 ? 1 : smoothstep(a, a + fadeIn, p)) * (1 - smoothstep(b, b + .09, p));
  el.style.opacity = vis;
  el.style.setProperty("--vis", vis);
  el.style.transform = `translate3d(0,${((1 - vis) * 26).toFixed(2)}px,0)`;
  el.style.pointerEvents = vis > .5 ? "" : "none";
}

const windowEls = $$("[data-window]");
const chapters = [];   // {el, bg, inner} — sztori fejezetek, render után töltjük

let tickerX = 0, lastScroll = 0, tickerSpeed = .35;
const tickerTrack = $("#tickerTrack");

function updateScroll() {
  const y = window.scrollY || 0;
  masthead.classList.toggle("is-compact", y > 40);

  /* hero */
  const hp = chapterProgress(heroSec);
  heroBar.style.width = (hp * 100).toFixed(1) + "%";
  if (!fallback) {
    const idx = Math.min(FRAMES - 1, Math.round(hp * (FRAMES - 1)));
    if (idx !== current) draw(idx);
  } else if (hp > 0) {
    const v = $("#heroFallback");
    if (v.duration) v.currentTime = hp * v.duration;
  }
  heroType.style.setProperty("--split", smoothstep(.17, .52, hp).toFixed(3));
  heroType.style.setProperty("--fade", (1 - smoothstep(.58, .72, hp)).toFixed(3));

  windowEls.forEach(el => applyWindow(el, el.closest(".scroll-chapter") === heroSec ? hp : chapterProgress(el.closest(".scroll-chapter") || heroSec)));

  /* sztori fejezetek */
  for (const c of chapters) {
    const p = chapterProgress(c.el);
    c.bg.style.transform = `translate3d(0,${((p - .5) * -9).toFixed(2)}%,0) scale(${(1.1 - p * .07).toFixed(3)})`;
    /* p=0-nál már olvasható — különben az #story anchorra ugorva üres a
       képernyő. A belépés csak elmozdulás, nem áttűnés. */
    const vis = 1 - smoothstep(.78, .96, p);
    c.inner.style.opacity = vis;
    c.inner.style.transform = `translate3d(0,${((1 - smoothstep(0, .2, p)) * 30 - smoothstep(.78, 1, p) * 26).toFixed(1)}px,0)`;
    c.num.style.transform = `translate3d(0,${((p - .5) * -60).toFixed(0)}px,0)`;
  }

  /* ticker: a scroll iránya gyorsítja */
  const d = y - lastScroll; lastScroll = y;
  tickerSpeed = .35 + clamp(Math.abs(d) / 26, 0, 2.6) * (d < 0 ? -1 : 1);
  if (tickerTrack.firstElementChild) {
    tickerX -= tickerSpeed;
    const half = tickerTrack.scrollWidth / 2 || 1;
    if (tickerX <= -half) tickerX += half;
    if (tickerX > 0) tickerX -= half;
    tickerTrack.style.transform = `translate3d(${tickerX.toFixed(1)}px,0,0)`;
  }

  /* aktív nav-link */
  navLinks.forEach(a => {
    const t = document.getElementById(a.getAttribute("href").slice(1));
    if (!t) return;
    const r = t.getBoundingClientRect();
    a.classList.toggle("is-current", r.top <= window.innerHeight * .45 && r.bottom >= window.innerHeight * .45);
  });
}

function raf(t) { if (lenis) lenis.raf(t); updateScroll(); drawEmbers(); requestAnimationFrame(raf); }

/* ── parázs-részecskék ────────────────────────────────────────────── */
const emberCanvas = $("#embers"), ectx = emberCanvas.getContext("2d");
let parts = [];
function initEmbers() {
  if (reduced) return;
  emberCanvas.width = innerWidth; emberCanvas.height = innerHeight;
  parts = Array.from({ length: 58 }, () => ({
    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
    r: Math.random() * 1.7 + .4, v: Math.random() * .5 + .16,
    d: Math.random() * Math.PI * 2, a: Math.random() * .5 + .18,
  }));
}
function drawEmbers() {
  if (reduced || !parts.length) return;
  ectx.clearRect(0, 0, emberCanvas.width, emberCanvas.height);
  for (const p of parts) {
    p.y -= p.v; p.d += .012; p.x += Math.sin(p.d) * .32;
    if (p.y < -12) { p.y = emberCanvas.height + 12; p.x = Math.random() * emberCanvas.width; }
    ectx.beginPath();
    ectx.arc(p.x, p.y, p.r, 0, 6.284);
    ectx.fillStyle = `rgba(255,${120 + Math.round(p.a * 120)},40,${p.a})`;
    ectx.fill();
  }
}

/* ── split text ───────────────────────────────────────────────────── */
function splitAll() {
  $$("[data-split]").forEach(el => {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const txt = el.textContent;
    el.textContent = "";
    el.setAttribute("aria-label", txt);
    [...txt].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "ch"; s.style.setProperty("--i", i);
      s.textContent = ch === " " ? " " : ch;
      s.setAttribute("aria-hidden", "true");
      el.appendChild(s);
    });
  });
}

/* ── reveal ───────────────────────────────────────────────────────── */
const io = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); } });
}, { threshold: .18, rootMargin: "0px 0px -6% 0px" });
function observeReveals(root = document) {
  $$(".section-head, [data-reveal], [data-split]", root).forEach(el => io.observe(el));
}

/* ── odométer ─────────────────────────────────────────────────────── */
function odometer(el, target, suffix) {
  const dec = target % 1 !== 0 ? 1 : 0, t0 = performance.now(), dur = 1500;
  (function step(t) {
    const k = clamp((t - t0) / dur);
    const e = 1 - Math.pow(2, -10 * k);
    el.textContent = LOCALE.num(target * e, dec) + suffix;
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}

/* ══ RENDER ═══════════════════════════════════════════════════════ */

/* ticker + hero csillagok */
(function renderTicker() {
  const one = SLOGANS.map(s => `<span>${esc(s)}</span>`).join("");
  tickerTrack.innerHTML = one + one;
})();
$("#heroStars").innerHTML = starsInner(4.9);

/* kártya */
function cardHtml(item, i, rank) {
  const tags = (item.tags || []).map(t => `<span class="tag tag-${t}">${TAG_LABEL[t] || t}</span>`).join("");
  return `<article class="card" style="--i:${i}" data-id="${item.id}">
    <div class="card-media">${pic(item.img, item.name)}${tags ? `<div class="tags">${tags}</div>` : ""}${rank ? `<span class="sig-rank">${rank}</span>` : ""}</div>
    <div class="card-body">
      <div class="card-top"><h3 class="card-name">${esc(item.name)}</h3><span class="card-price">${money(item.price)}</span></div>
      <p class="card-desc">${esc(item.desc)}</p>
      <div class="card-meta">${starsHtml(item.rating)}<b>${String(item.rating).replace(".", ",")}</b><span>(${item.votes})</span></div>
      <button class="btn add-btn" type="button" data-add="${item.id}">${T.addToCart} &middot; ${money(item.price)}</button>
    </div>
  </article>`;
}

/* signature */
$("#signatureGrid").innerHTML = MENU.filter(m => m.hero).map((m, i) => cardHtml(m, i, "0" + (i + 1))).join("");

/* napi menü */
const dailyTabs = $("#dailyTabs"), dailyStage = $("#dailyStage");
const today = new Date().getDay();
const dailyOrder = [1, 2, 3, 4, 5, 6, 0];
dailyTabs.innerHTML = dailyOrder.map(d => {
  const m = DAILY.find(x => x.day === d);
  return `<button class="daily-tab${d === today ? " is-today" : ""}" role="tab" type="button" data-day="${d}" aria-selected="false">${m.code}</button>`;
}).join("");

function renderDaily(day) {
  const m = DAILY.find(x => x.day === day) || DAILY[0];
  const label = OPENING.find(o => o.day === day).label;
  dailyStage.classList.add("is-swap");
  setTimeout(() => {
    dailyStage.innerHTML = `<article class="daily-card">
      <div class="daily-media">${pic(m.img, m.name)}</div>
      <div class="daily-text">
        <span class="daily-day">${label}${day === today ? " &middot; " + T.today : ""}</span>
        <h3 class="daily-name">${esc(m.name)}</h3>
        <p class="daily-desc">${esc(m.desc)}</p>
        <div class="daily-foot">
          <span class="daily-price">${money(m.price)}</span>
          <button class="btn btn-solid" type="button" data-add-daily="${m.day}">${T.addToCart}</button>
          <span class="daily-window">${T.dailyWindow}</span>
        </div>
      </div></article>`;
    dailyStage.classList.remove("is-swap");
  }, 180);
  $$(".daily-tab", dailyTabs).forEach(b => b.setAttribute("aria-selected", String(+b.dataset.day === day)));
}
dailyTabs.addEventListener("click", e => { const b = e.target.closest(".daily-tab"); if (b) renderDaily(+b.dataset.day); });
renderDaily(today);

/* étlap + szűrő */
const menuGrid = $("#menuGrid"), filterBar = $("#filterBar");
filterBar.innerHTML = CATEGORIES.map(c =>
  `<button class="filter-tab" role="tab" type="button" data-cat="${c.id}" aria-selected="${c.id === "all"}">${c.label}</button>`).join("");
function renderMenu(cat) {
  const list = cat === "all" ? MENU : MENU.filter(m => m.cat === cat);
  menuGrid.innerHTML = list.map((m, i) => cardHtml(m, i)).join("");
  $$(".filter-tab", filterBar).forEach(b => b.setAttribute("aria-selected", String(b.dataset.cat === cat)));
  bindTilt(menuGrid);
}
filterBar.addEventListener("click", e => { const b = e.target.closest(".filter-tab"); if (b) renderMenu(b.dataset.cat); });
renderMenu("all");

/* sztori */
$("#story").innerHTML = STORY.map(c => `
  <div class="chapter scroll-chapter">
    <div class="sticky-stage">
      <div class="chapter-bg" style="background-image:url(media/menu/${c.img}.webp),url(media/hamburger-bg.jpg)"></div>
      <span class="chapter-num" aria-hidden="true">${c.n}</span>
      <div class="chapter-inner">
        <p class="chapter-kicker">${esc(c.kicker)}</p>
        <h2 class="chapter-title">${esc(c.title)}</h2>
        <p class="chapter-body">${esc(c.body)}</p>
      </div>
    </div>
  </div>`).join("");
$$(".chapter").forEach(el => chapters.push({
  el, bg: $(".chapter-bg", el), inner: $(".chapter-inner", el), num: $(".chapter-num", el),
}));

/* filozófia + számok */
$("#pillars").innerHTML = PILLARS.map((p, i) =>
  `<div class="pillar" data-reveal style="--i:${i}"><div class="pillar-k">${p.k}</div><h3 class="pillar-t">${esc(p.t)}</h3><p class="pillar-d">${esc(p.d)}</p></div>`).join("");
$("#stats").innerHTML = STATS.map((s, i) =>
  `<div class="stat" data-reveal style="--i:${i}"><b data-count="${s.v}" data-suffix="${s.s}">0</b><span>${esc(s.l)}</span></div>`).join("");
const statIo = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  statIo.unobserve(e.target);
  odometer(e.target, +e.target.dataset.count, e.target.dataset.suffix);
}), { threshold: .5 });
$$("[data-count]").forEach(el => reduced
  ? el.textContent = LOCALE.num(+el.dataset.count) + el.dataset.suffix
  : statIo.observe(el));

/* beszállítók */
$("#supplierStrip").innerHTML = SUPPLIERS.map((s, i) =>
  `<div class="supplier" data-reveal style="--i:${i}">
     <div class="supplier-media">${pic(s.img, s.n, "", "&#128230;")}</div>
     <div><div class="supplier-c">${s.c}</div><h3 class="supplier-n">${esc(s.n)}</h3><p class="supplier-d">${esc(s.d)}</p></div>
   </div>`).join("");

/* csapat */
$("#teamGrid").innerHTML = TEAM.map((t, i) =>
  `<figure class="member" data-reveal style="--i:${i}">
     ${pic(t.img, t.n, "", "&#128100;")}
     <figcaption class="member-info">
       <h3 class="member-n">${esc(t.n)}</h3><p class="member-r">${esc(t.r)}</p><p class="member-q">&bdquo;${esc(t.q)}&rdquo;</p>
     </figcaption>
   </figure>`).join("");

/* értékelések */
$("#reviewGrid").innerHTML = REVIEWS.map((r, i) =>
  `<blockquote class="review" data-reveal style="--i:${i % 3}">
     ${starsHtml(r.s)}<p class="review-t">${esc(r.t)}</p>
     <footer><div class="review-n">${esc(r.n)}</div><div class="review-d">${esc(r.d)}</div></footer>
   </blockquote>`).join("");

/* info */
$("#hours").innerHTML = OPENING.map(o =>
  `<li class="${o.day === today ? "is-today" : ""}"><span>${o.label}</span><b>${o.open}&ndash;${o.close}</b></li>`).join("");
$("#zones").innerHTML = DELIVERY_ZONES.map(z =>
  `<li><span>${esc(z.name)}<br><small style="opacity:.6">${z.from}&ndash;${z.to}</small></span><b>${money(z.fee)}</b></li>`).join("");

/* ── élő nyitva/zárva badge ───────────────────────────────────────── */
const toMin = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

function openState(now = new Date()) {
  const min = now.getHours() * 60 + now.getMinutes(), day = now.getDay();
  const t = OPENING.find(o => o.day === day);
  /* Az előző nap hajnalba nyúló zárása (P–Szo 00:30) még "ma hajnalban"
     nyitva tartást jelent — enélkül 00:10-kor zártnak mutatnánk magunkat. */
  const y = OPENING.find(o => o.day === (day + 6) % 7);
  if (toMin(y.close) < toMin(y.open) && min < toMin(y.close)) return { open: true, until: y.close };
  const o = toMin(t.open);
  let c = toMin(t.close); if (c < o) c += 1440;
  if (min >= o && min < c) return { open: true, until: t.close };
  if (min < o) return { open: false, next: T.open.todayFrom(t.open), soon: o - min <= 60 };
  const n = OPENING.find(x => x.day === (day + 1) % 7);
  return { open: false, next: T.open.tomorrowFrom(n.open) };
}

const openBadge = $("#openBadge");
function renderOpenBadge() {
  const s = openState();
  openBadge.hidden = false;
  openBadge.classList.toggle("is-open", s.open);
  openBadge.classList.toggle("is-soon", !s.open && !!s.soon);
  $("b", openBadge).textContent = s.open ? T.open.now : s.soon ? T.open.soon : T.open.closed;
  $("em", openBadge).textContent = s.open ? T.open.until(s.until) : s.next;
  openBadge.setAttribute("title", s.open ? T.open.titleOpen(s.until) : T.open.titleClosed(s.next));
}
renderOpenBadge();
setInterval(renderOpenBadge, 60000);

/* ── JSON-LD (a MENU/OPENING/REVIEWS adatból, nincs duplikáció) ────── */
(function structuredData() {
  const url = location.origin + location.pathname;
  const ld = {
    "@context": "https://schema.org", "@type": "Restaurant",
    name: "Lucius Burger", url,
    image: [url + "media/og-cover.jpg"],
    description: SEO.description,
    servesCuisine: SEO.cuisine,
    priceRange: "$$",
    telephone: LOCALE.phone,
    email: LOCALE.email,
    currenciesAccepted: "HUF",
    paymentAccepted: SEO.payment,
    acceptsReservations: url + "#reserve",
    hasDeliveryMethod: ["http://purl.org/goodrelations/v1#DeliveryModeOwnFleet",
                        "http://purl.org/goodrelations/v1#DeliveryModePickUp"],
    address: {
      "@type": "PostalAddress", streetAddress: LOCALE.street, addressLocality: LOCALE.city,
      postalCode: LOCALE.postalCode, addressCountry: SEO.country,
    },
    openingHoursSpecification: OPENING.map(o => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "https://schema.org/" + ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][o.day],
      opens: o.open, closes: o.close,
    })),
    aggregateRating: {
      "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "1842", bestRating: "5",
    },
    review: REVIEWS.slice(0, 3).map(r => ({
      "@type": "Review", author: { "@type": "Person", name: r.n }, reviewBody: r.t,
      reviewRating: { "@type": "Rating", ratingValue: String(r.s), bestRating: "5" },
    })),
    hasMenu: {
      "@type": "Menu", name: SEO.menuName,
      hasMenuSection: CATEGORIES.filter(c => c.id !== "all").map(c => ({
        "@type": "MenuSection", name: c.label,
        hasMenuItem: MENU.filter(m => m.cat === c.id).map(m => ({
          "@type": "MenuItem", name: m.name, description: m.desc,
          offers: { "@type": "Offer", price: String(m.price), priceCurrency: "HUF" },
          suitableForDiet: m.tags.includes("veg") ? "https://schema.org/VegetarianDiet" : undefined,
        })),
      })),
    },
  };
  const tag = document.createElement("script");
  tag.type = "application/ld+json";
  tag.textContent = JSON.stringify(ld);
  document.head.appendChild(tag);
})();

/* ── 3D tilt ──────────────────────────────────────────────────────── */
function bindTilt(root) {
  if (!fine || reduced) return;
  $$(".card,.supplier", root).forEach(el => {
    if (el.dataset.tilt) return; el.dataset.tilt = "1";
    el.addEventListener("pointermove", ev => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--ry", (((ev.clientX - r.left) / r.width - .5) * 9).toFixed(2) + "deg");
      el.style.setProperty("--rx", (((ev.clientY - r.top) / r.height - .5) * -9).toFixed(2) + "deg");
    });
    el.addEventListener("pointerleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
  });
}

/* ── magnetic + kurzor ────────────────────────────────────────────── */
if (fine && !reduced) {
  const cur = $("#cursor");
  addEventListener("pointermove", e => {
    cur.classList.add("is-on");
    cur.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
    cur.classList.toggle("is-hot", !!e.target.closest("a,button,.fp-t,.card"));
  }, { passive: true });
  $$("[data-magnetic]").forEach(el => {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * .18).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * .3).toFixed(1)}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
}

/* ── navigáció ────────────────────────────────────────────────────── */
const navLinks = $$(".mainnav a");
const nav = $(".mainnav"), navToggle = $("#navToggle");
navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});
function goto(hash) {
  const t = document.querySelector(hash);
  if (!t) return;
  nav.classList.remove("is-open"); navToggle.setAttribute("aria-expanded", "false");
  if (lenis) lenis.scrollTo(t, { duration: 1.3, offset: -70 });
  else t.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
}
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]:not(.skip-link)');
  if (a) { e.preventDefault(); goto(a.getAttribute("href")); return; }
  const g = e.target.closest("[data-goto]");
  if (g) setTimeout(() => goto(g.dataset.goto), 60);
});

/* ── boot ─────────────────────────────────────────────────────────── */
/* A fejléc befér-e? A nav szélessége nyelv- és betűméret-függő, ezért
   mérünk, nem tippelünk breakpointot: előbb a másodlagos elemek mennek,
   ha még mindig lóg, a nav hamburgerré alakul. */
function fitHeader() {
  masthead.classList.remove("is-cramped", "nav-collapsed");
  if (masthead.scrollWidth > masthead.clientWidth + 1) masthead.classList.add("is-cramped");
  if (masthead.scrollWidth > masthead.clientWidth + 1) masthead.classList.add("nav-collapsed");
}

function onResize() { fitHeader(); sizeCanvas(); if (!fallback) draw(Math.max(current, 0)); initEmbers(); }
addEventListener("resize", onResize, { passive: true });

document.body.classList.add("is-locked");
splitAll(); observeReveals(); bindTilt(document); fitHeader();
sizeCanvas(); initEmbers();
requestAnimationFrame(raf);
bootFrames().then(reveal);
setTimeout(reveal, 6000);          // ponytail: vészkijárat, ha a hálózat beragad

/* megosztott segédek a shop.js-nek */
window.LB = { $, $$, clamp, money, esc, pic, starsHtml, goto, reduced, fine, observeReveals, bindTilt, today };
})();
