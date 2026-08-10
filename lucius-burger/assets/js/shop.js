/* ═══ LUCIUS BURGER — kosár, checkout, asztalfoglalás ═════════════════
   Nincs backend: localStorage + determinisztikus fake foglaltság.
   A teljes workflow végigvihető.
   ═══════════════════════════════════════════════════════════════════ */
(() => {
"use strict";
const { $, $$, clamp, money, esc, pic, goto, reduced } = window.LB;

const CART_KEY = "lucius.cart.v1";
const RES_KEY  = "lucius.reservations.v1";
const SEQ_KEY  = "lucius.seq.v1";

/* ── tétel-feloldás (étlap + napi menü) ───────────────────────────── */
const DAILY_ITEMS = DAILY.map(d => ({
  id: "daily-" + d.day, cat: "combo", name: d.name + " · " + T.dailySuffix,
  img: d.img, desc: d.desc, price: d.price, rating: 4.8, votes: 40, tags: [],
}));
const ALL = MENU.concat(DAILY_ITEMS);
const byId = id => ALL.find(m => m.id === id);

/* ── kosár állapot ────────────────────────────────────────────────── */
/* ponytail: lapos tömb, egységenként egy id — a groupCart vonja sorokká.
   Így a "-1 db" pontosan egy darabot vesz le, nincs qty-számolgatás. */
let cart = [];
try { cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]").filter(byId); } catch { cart = []; }

function saveCart() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {} }
function groupCart() {
  const map = new Map();
  cart.forEach(id => map.set(id, (map.get(id) || 0) + 1));
  return [...map].map(([id, qty]) => ({ item: byId(id), qty }));
}
const subtotal = () => cart.reduce((s, id) => s + byId(id).price, 0);

function zoneFor(zip) {
  const z = parseInt(zip, 10);
  return DELIVERY_ZONES.find(d => z >= d.from && z <= d.to) || null;
}
function deliveryFee() {
  if (order.mode === "pickup") return 0;
  if (subtotal() >= FREE_DELIVERY_OVER) return 0;
  const z = zoneFor(order.zip);
  return z ? z.fee : DELIVERY_ZONES[0].fee;
}

/* ── toast ────────────────────────────────────────────────────────── */
const toastEl = $("#toast");
let toastT = 0;
function toast(msg) {
  clearTimeout(toastT);
  toastEl.hidden = false; toastEl.textContent = msg;
  requestAnimationFrame(() => toastEl.classList.add("is-on"));
  toastT = setTimeout(() => {
    toastEl.classList.remove("is-on");
    setTimeout(() => { toastEl.hidden = true; }, 400);
  }, 2600);
}

/* ── fókusz-csapda ────────────────────────────────────────────────── */
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
let trapped = null, lastFocus = null;
function trap(el) {
  lastFocus = document.activeElement; trapped = el;
  const f = $$(FOCUSABLE, el).filter(n => n.offsetParent !== null);
  if (f[0]) f[0].focus();
}
function untrap() { if (lastFocus) lastFocus.focus(); trapped = null; }
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { if ($("#thanksModal").hidden === false) closeThanks(); else if ($("#resModal").hidden === false) closeRes(); else if (drawerOpen) closeCart(); return; }
  if (e.key !== "Tab" || !trapped) return;
  const f = $$(FOCUSABLE, trapped).filter(n => n.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* ══ KOSÁR DRAWER ══════════════════════════════════════════════════ */
const drawer = $("#cartDrawer"), scrim = $("#scrim");
const badge = $("#cartBadge"), cartLines = $("#cartLines"), cartEmpty = $("#cartEmpty");
const totalsEl = $("#totals"), stepNext = $("#stepNext"), stepBack = $("#stepBack");
const progressEl = $("#checkoutProgress"), drawerStep = $("#drawerStep"), drawerTitle = $("#drawerTitle");
const formStatus = $("#formStatus");
let drawerOpen = false, step = 0;

const STEPS = ["cart", "details", "when", "pay"].map((key, i) => ({ key, ...T.steps[i] }));

function openCart() {
  drawer.hidden = false; scrim.hidden = false;
  requestAnimationFrame(() => { drawer.classList.add("is-open"); scrim.classList.add("is-open"); });
  document.body.classList.add("is-locked");
  drawerOpen = true; $("#cartToggle").setAttribute("aria-expanded", "true");
  trap(drawer);
}
function closeCart() {
  drawer.classList.remove("is-open"); scrim.classList.remove("is-open");
  document.body.classList.remove("is-locked");
  drawerOpen = false; $("#cartToggle").setAttribute("aria-expanded", "false");
  setTimeout(() => { drawer.hidden = true; scrim.hidden = true; }, 520);
  untrap();
}
$("#cartToggle").addEventListener("click", () => drawerOpen ? closeCart() : openCart());
$("#cartClose").addEventListener("click", closeCart);
scrim.addEventListener("click", closeCart);

function setStep(n) {
  step = clamp(n, 0, 3);
  $$(".pane", drawer).forEach(p => p.classList.toggle("is-active", p.dataset.pane === STEPS[step].key));
  drawerStep.textContent = STEPS[step].label;
  drawerTitle.textContent = STEPS[step].title;
  stepNext.textContent = STEPS[step].next;
  stepBack.hidden = step === 0;
  progressEl.hidden = step === 0;
  $$("i", progressEl).forEach(i => i.classList.toggle("is-on", +i.dataset.step <= step));
  formStatus.textContent = ""; formStatus.classList.remove("is-ok");
  if (step === 2) { refreshEta(); renderSlots(); }
  if (step === 3) renderSummary();
  drawer.querySelector(".drawer-body").scrollTop = 0;
  syncNext();
}
stepBack.addEventListener("click", () => setStep(step - 1));

function syncNext() {
  if (step === 0) stepNext.disabled = cart.length === 0;
  else if (step === 3) stepNext.disabled = !$("#termsOk").checked;
  else stepNext.disabled = false;
}

/* ── render kosár ─────────────────────────────────────────────────── */
function renderCart() {
  const lines = groupCart();
  const n = cart.length;
  badge.hidden = n === 0; badge.textContent = n;
  cartEmpty.hidden = n > 0;
  cartLines.innerHTML = lines.map(({ item, qty }) => `
    <div class="line" data-line="${item.id}">
      <div class="line-thumb">${pic(item.img, item.name)}</div>
      <div class="line-main">
        <p class="line-n">${esc(item.name)}</p>
        <p class="line-p">${money(item.price)} / db &middot; <b>${money(item.price * qty)}</b></p>
      </div>
      <div class="qty">
        <button type="button" data-dec="${item.id}" aria-label="${esc(T.cart.less(item.name))}">&minus;</button>
        <b>${qty}</b>
        <button type="button" data-inc="${item.id}" aria-label="${esc(T.cart.more(item.name))}">+</button>
      </div>
    </div>`).join("");
  renderUpsell();
  renderTotals();
  syncNext();
}

/* Upsell: köretek/italok/desszertek, amik még nincsenek a kosárban.
   ponytail: fix prioritási lista, nem ajánló-motor — 4 tétel kell, nem ML. */
const UPSELL_POOL = ["fries", "onion-rings", "amber-ale", "caramel-shake", "pecan-pie", "truffle-fries", "cornbread", "lemonade"];
const upsellBox = $("#upsell"), upsellRow = $("#upsellRow");

function renderUpsell() {
  const inCart = new Set(cart);
  const picks = UPSELL_POOL.filter(id => !inCart.has(id)).slice(0, 4).map(byId).filter(Boolean);
  upsellBox.hidden = cart.length === 0 || picks.length === 0;
  if (upsellBox.hidden) return;
  upsellRow.innerHTML = picks.map(m => `
    <button class="up-card" type="button" data-add="${m.id}" aria-label="${esc(T.cart.upsellAdd(m.name, money(m.price)))}">
      <div class="up-media">${pic(m.img, m.name)}</div>
      <div class="up-body">
        <span class="up-n">${esc(m.name)}</span>
        <span class="up-p">${money(m.price)}<i aria-hidden="true">+</i></span>
      </div>
    </button>`).join("");
}

function renderTotals() {
  const s = subtotal();
  if (!s) { totalsEl.innerHTML = ""; return; }
  const fee = deliveryFee();
  const z = zoneFor(order.zip);
  totalsEl.innerHTML =
    `<div class="row"><span>${T.cart.subtotal}</span><span>${money(s)}</span></div>` +
    (order.mode === "pickup"
      ? `<div class="row free"><span>${T.cart.pickupFree}</span><span>${T.cart.free}</span></div>`
      : `<div class="row ${fee === 0 ? "free" : ""}"><span>${T.cart.delivery}${z ? " · " + esc(z.name.split(" · ")[0]) : ""}</span><span>${fee === 0 ? T.cart.free : money(fee)}</span></div>` +
        (fee > 0 ? `<div class="row"><span>${T.cart.freeOver(money(FREE_DELIVERY_OVER))}</span><span>${T.cart.stillNeeded(money(FREE_DELIVERY_OVER - s))}</span></div>` : "")) +
    `<div class="row grand"><span>${T.cart.total}</span><b>${money(s + fee)}</b></div>`;
}

function addItem(id, silent) {
  if (!byId(id)) return;
  cart.push(id); saveCart(); renderCart();
  badge.classList.remove("is-pop"); void badge.offsetWidth; badge.classList.add("is-pop");
  if (!silent) toast(T.cart.added(byId(id).name));
}

document.addEventListener("click", e => {
  const add = e.target.closest("[data-add]");
  if (add) {
    addItem(add.dataset.add);
    if (add.classList.contains("up-card")) return;   // az upsell-kártya újrarendelődik
    add.classList.add("is-added"); add.textContent = T.inCart;
    setTimeout(() => { add.classList.remove("is-added"); add.textContent = T.addToCart + " · " + money(byId(add.dataset.add).price); }, 1400);
    return;
  }
  const daily = e.target.closest("[data-add-daily]");
  if (daily) { addItem("daily-" + daily.dataset.addDaily); openCart(); return; }
  const inc = e.target.closest("[data-inc]"); if (inc) return addItem(inc.dataset.inc, true);
  const dec = e.target.closest("[data-dec]");
  if (dec) {
    const i = cart.lastIndexOf(dec.dataset.dec);
    if (i > -1) { cart.splice(i, 1); saveCart(); renderCart(); }
    if (!cart.length && step > 0) setStep(0);
  }
});

/* ══ CHECKOUT ══════════════════════════════════════════════════════ */
const order = { mode: "delivery", zip: "", when: "asap", date: "", slot: "", pay: "cash" };
const detailsForm = $("#detailsForm");

/* kiszállítás ↔ elvitel */
const addrBlock = $("#addrBlock"), pickupNote = $("#pickupNote");
const ADDR_REQUIRED = ["zip", "city", "street"];

function setMode(mode) {
  order.mode = mode;
  $$("[data-mode]").forEach(b => b.classList.toggle("is-active", b.dataset.mode === mode));
  const pickup = mode === "pickup";
  addrBlock.hidden = pickup;
  pickupNote.hidden = !pickup;
  /* a rejtett mezőkön a required blokkolná a checkValidity()-t */
  ADDR_REQUIRED.forEach(n => { detailsForm[n].required = !pickup; });
  if (pickup) { $("#zoneHint").textContent = ""; $("#zoneHint").className = "zone-hint"; renderTotals(); }
  else zoneHintUpdate();
  if (step === 2) { refreshEta(); renderSlots(); }
}

/* irányítószám → zóna visszajelzés élőben */
function zoneHintUpdate() {
  order.zip = detailsForm.zip.value.trim();
  const hint = $("#zoneHint");
  if (order.mode === "pickup" || order.zip.length < 4) { hint.textContent = ""; hint.className = "zone-hint"; renderTotals(); return; }
  const z = zoneFor(order.zip);
  if (z) {
    hint.textContent = T.zone.ok(z.name, money(z.fee), subtotal() >= FREE_DELIVERY_OVER);
    hint.className = "zone-hint is-ok";
  } else {
    hint.innerHTML = T.zone.bad +
      `<button type="button" class="swap">${T.zone.swap(LOCALE.street)}</button>`;
    hint.className = "zone-hint is-bad";
    $(".swap", hint).addEventListener("click", () => setMode("pickup"));
  }
  renderTotals();
}
detailsForm.zip.addEventListener("input", zoneHintUpdate);
$$("[data-mode]").forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));

const PHONE_RE = LOCALE.phoneRe;

function validate(form, extra) {
  $$("input,select,textarea", form).forEach(f => f.classList.remove("is-invalid"));
  let bad = null, msg = "";
  for (const f of $$("input,select,textarea", form)) {
    if (!f.checkValidity()) { bad = f; msg = T.form.missing(f.previousElementSibling.textContent.replace(" *", "")); break; }
  }
  if (!bad && form.phone && !PHONE_RE.test(form.phone.value.trim())) { bad = form.phone; msg = T.form.phoneBad(LOCALE.phoneHint); }
  if (!bad && extra) { const r = extra(); if (r) { bad = r.field; msg = r.msg; } }
  if (bad) { bad.classList.add("is-invalid"); bad.focus(); return msg; }
  return "";
}

/* ── időpont ──────────────────────────────────────────────────────── */
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const hm = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
const parseHM = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

function slotsFor(dateStr, stepMin, tailMin) {
  const d = new Date(dateStr + "T00:00:00");
  const o = OPENING.find(x => x.day === d.getDay());
  const open = parseHM(o.open);
  let close = parseHM(o.close); if (close < open) close += 1440;      // hajnali zárás
  const isToday = dateStr === ymd(new Date());
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const out = [];
  for (let t = open; t <= close - tailMin; t += stepMin) {
    const past = isToday && t < nowMin + 45;
    out.push({ label: hm(Math.floor((t % 1440) / 60), t % 60), past });
  }
  return out;
}

const orderDate = $("#orderDate"), slotGrid = $("#slotGrid"), slotNote = $("#slotNote");
const todayStr = ymd(new Date());
const maxStr = ymd(new Date(Date.now() + 14 * 864e5));
orderDate.min = todayStr; orderDate.max = maxStr; orderDate.value = todayStr;
order.date = todayStr;

$$(".when-opt").forEach(b => b.addEventListener("click", () => {
  $$(".when-opt").forEach(x => x.classList.toggle("is-active", x === b));
  order.when = b.dataset.when;
  $("#whenSched").hidden = order.when !== "scheduled";
  if (order.when === "scheduled") renderSlots();
}));
orderDate.addEventListener("change", () => { order.date = orderDate.value; order.slot = ""; renderSlots(); });

function renderSlots() {
  if (order.when !== "scheduled") return;
  const list = slotsFor(order.date, 15, order.mode === "pickup" ? 30 : 60);
  const open = list.filter(s => !s.past).length;
  slotGrid.innerHTML = list.map(s =>
    `<button class="slot${s.label === order.slot ? " is-active" : ""}" type="button" data-slot="${s.label}"${s.past ? " disabled" : ""}>${s.label}</button>`).join("");
  slotNote.textContent = open
    ? T.slots.free(open, order.mode === "pickup" ? T.slots.tailPickup : T.slots.tailDelivery)
    : T.slots.none;
}
slotGrid.addEventListener("click", e => {
  const b = e.target.closest(".slot"); if (!b || b.disabled) return;
  order.slot = b.dataset.slot;
  $$(".slot", slotGrid).forEach(x => x.classList.toggle("is-active", x === b));
});

/* ETA */
function etaText() {
  const mins = order.mode === "pickup" ? 20 : 35;
  const t = new Date(Date.now() + mins * 6e4);
  return T.slots.eta(mins, hm(t.getHours(), t.getMinutes()));
}
const asapEta = $("#asapEta");
function refreshEta() { asapEta.textContent = etaText(); }
refreshEta();

/* ── fizetés + összegzés ──────────────────────────────────────────── */
$$(".pay-opt").forEach(b => b.addEventListener("click", () => {
  $$(".pay-opt").forEach(x => x.classList.toggle("is-active", x === b));
  order.pay = b.dataset.pay;
}));
$("#termsOk").addEventListener("change", syncNext);

const PAY_LABEL = T.pay;

function whenText() {
  if (order.when === "asap") return etaText();
  const d = new Date(order.date + "T00:00:00");
  const label = OPENING.find(x => x.day === d.getDay()).label;
  return `${order.date} (${label}) ${order.slot}`;
}

function renderSummary() {
  const f = new FormData(detailsForm);
  const s = subtotal(), fee = deliveryFee();
  $("#orderSummary").innerHTML =
    groupCart().map(({ item, qty }) => `<div class="srow"><span>${qty}× ${esc(item.name)}</span><b>${money(item.price * qty)}</b></div>`).join("") +
    `<hr>` +
    (order.mode === "pickup"
      ? `<div class="srow"><span>${T.summary.pickup}</span><b>${T.summary.pickupValue(LOCALE.street)}</b></div>`
      : `<div class="srow"><span>${T.summary.address}</span><b>${esc(f.get("zip"))} ${esc(f.get("city"))}, ${esc(f.get("street"))}${f.get("unit") ? " — " + esc(f.get("unit")) : ""}</b></div>`) +
    `<div class="srow"><span>${T.summary.namePhone}</span><b>${esc(f.get("name"))} · ${esc(f.get("phone"))}</b></div>` +
    `<div class="srow"><span>${T.summary.time}</span><b>${esc(whenText())}</b></div>` +
    (f.get("note") ? `<div class="srow"><span>${T.summary.note}</span><b>${esc(f.get("note"))}</b></div>` : "") +
    `<hr>` +
    `<div class="srow"><span>${T.summary.subtotal}</span><b>${money(s)}</b></div>` +
    `<div class="srow"><span>${T.summary.delivery}</span><b>${fee ? money(fee) : T.summary.free}</b></div>` +
    `<div class="srow"><span>${T.summary.due}</span><b>${money(s + fee)}</b></div>`;
}

/* ── lépésváltás ──────────────────────────────────────────────────── */
stepNext.addEventListener("click", () => {
  if (step === 0) { if (!cart.length) return; return setStep(1); }

  if (step === 1) {
    const err = validate(detailsForm, () => {
      if (order.mode === "pickup") return null;
      const z = zoneFor(detailsForm.zip.value.trim());
      return z ? null : { field: detailsForm.zip, msg: T.zone.blocked };
    });
    if (err) { formStatus.textContent = err; return; }
    order.zip = detailsForm.zip.value.trim();
    renderTotals();
    return setStep(2);
  }

  if (step === 2) {
    if (order.when === "scheduled" && !order.slot) { formStatus.textContent = T.form.pickSlot; return; }
    return setStep(3);
  }

  if (step === 3) {
    if (!$("#termsOk").checked) { formStatus.textContent = T.form.acceptTerms; return; }
    submitOrder();
  }
});

function nextSeq() {
  let n = 846;
  try { n = parseInt(localStorage.getItem(SEQ_KEY) || "846", 10) + 1; localStorage.setItem(SEQ_KEY, n); } catch { n++; }
  return String(n).padStart(4, "0");
}

function submitOrder() {
  const f = new FormData(detailsForm);
  const s = subtotal(), fee = deliveryFee();
  const items = groupCart().map(({ item, qty }) => ({ n: `${qty}× ${item.name}`, p: money(item.price * qty) }));
  openThanks({
    kicker: T.thanks.orderKicker,
    title: T.thanks.orderTitle,
    lede: order.mode === "pickup" ? T.thanks.ledePickup : T.thanks.ledeDelivery,
    facts: [
      [T.thanks.orderNo, `${LOCALE.orderPrefix}${nextSeq()}`, false],
      [order.mode === "pickup" ? T.thanks.readyAt : T.thanks.arrival,
       order.when === "asap" ? etaText().replace("≈ ", "") : whenText(), true],
      [order.mode === "pickup" ? T.thanks.pickupAt : T.thanks.addressAt,
       order.mode === "pickup" ? LOCALE.street : `${f.get("zip")} ${f.get("city")}, ${f.get("street")}`, false],
      [T.thanks.payment, `${PAY_LABEL[order.pay]} · ${money(s + fee)}`, false],
    ],
    items,
  });
  cart = []; saveCart(); renderCart();
  detailsForm.reset(); $("#termsOk").checked = false; order.zip = "";
  setMode("delivery");
  closeCart(); setStep(0);
}

/* ══ KÖSZÖNŐ MODAL ═════════════════════════════════════════════════ */
const thanks = $("#thanksModal"), burst = $("#thanksBurst");
function openThanks(cfg) {
  $("#thanksKicker").textContent = cfg.kicker;
  $("#thanksTitle").textContent = cfg.title;
  $("#thanksLede").textContent = cfg.lede;
  $("#thanksFacts").innerHTML = cfg.facts.map(([k, v, hot]) => `<div><dt>${esc(k)}</dt><dd class="${hot ? "hot" : ""}">${esc(v)}</dd></div>`).join("");
  $("#thanksItems").innerHTML = (cfg.items || []).map(i => `<div class="ti"><span>${esc(i.n)}</span><span>${esc(i.p)}</span></div>`).join("");
  thanks.hidden = false;
  requestAnimationFrame(() => thanks.classList.add("is-open"));
  document.body.classList.add("is-locked");
  trap(thanks);
  if (!reduced) setTimeout(burstFx, 620);
}
function closeThanks() {
  thanks.classList.remove("is-open");
  document.body.classList.remove("is-locked");
  setTimeout(() => { thanks.hidden = true; }, 480);
  untrap();
}
$$("[data-close-modal]").forEach(b => b.addEventListener("click", () => {
  if (b.closest("#thanksModal")) closeThanks(); else closeRes();
}));

/* parázs-robbanás a pecsét mögött */
function burstFx() {
  const r = burst.getBoundingClientRect();
  const seal = $(".thanks-seal").getBoundingClientRect();
  burst.width = r.width; burst.height = r.height;
  const c = burst.getContext("2d");
  const cx = seal.left - r.left + seal.width / 2;
  const cy = seal.top - r.top + seal.height / 2;
  const ps = Array.from({ length: 90 }, () => {
    const a = Math.random() * Math.PI * 2, v = Math.random() * 5.2 + 1.4;
    return { x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.2, r: Math.random() * 2.4 + .7, l: 1 };
  });
  (function tick() {
    c.clearRect(0, 0, r.width, r.height);
    let alive = false;
    for (const p of ps) {
      if (p.l <= 0) continue;
      alive = true;
      p.x += p.vx; p.y += p.vy; p.vy += .085; p.vx *= .985; p.l -= .014;
      c.beginPath(); c.arc(p.x, p.y, p.r * p.l, 0, 6.284);
      c.fillStyle = `rgba(255,${60 + Math.round(p.l * 110)},${Math.round(p.l * 25)},${p.l})`;
      c.fill();
    }
    if (alive) requestAnimationFrame(tick); else c.clearRect(0, 0, r.width, r.height);
  })();
}

/* ══ ASZTALFOGLALÁS ════════════════════════════════════════════════ */
const resDate = $("#resDate"), resTime = $("#resTime"), resGuestsEl = $("#resGuests");
const fp = $("#floorplan"), tablePanel = $("#tablePanel");
let guests = 2, selected = null;

resDate.min = todayStr; resDate.max = maxStr; resDate.value = todayStr;

function fillResTimes() {
  const list = slotsFor(resDate.value, 30, 90);
  resTime.innerHTML = list.map(s => `<option${s.past ? " disabled" : ""}>${s.label}</option>`).join("");
  const first = list.find(s => !s.past);
  if (first) resTime.value = first.label;
}
fillResTimes();

/* determinisztikus foglaltság: ugyanaz a nap+idő+asztal → ugyanaz az eredmény */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  /* murmur3 fmix32 zárás: FNV önmagában beragad, ha a kulcsok csak az
     utolsó pár karakterben térnek el (…|T1, …|T2) — akkor minden asztal
     ugyanabba a sávba esne és sosem lenne foglalt. */
  h ^= h >>> 15; h = Math.imul(h, 2246822507);
  h ^= h >>> 13; h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
function myReservations() { try { return JSON.parse(localStorage.getItem(RES_KEY) || "[]"); } catch { return []; } }
function isTaken(t) {
  const key = `${resDate.value}|${resTime.value}|${t.id}`;
  if (myReservations().some(r => r.date === resDate.value && r.time === resTime.value && r.table === t.id)) return true;
  const d = new Date(resDate.value + "T00:00:00").getDay();
  const busy = (d === 5 || d === 6) ? .52 : d === 0 ? .3 : .34;   // hétvégén telt házunk van
  return hash(key) < busy;
}

/* alaprajz háttere — egyszer rajzoljuk ki */
const FP_BG = `
<defs>
  <radialGradient id="fpFire" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#ffb347" stop-opacity=".95"/>
    <stop offset="55%" stop-color="#ff5b15" stop-opacity=".55"/>
    <stop offset="100%" stop-color="#ff5b15" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect class="fp-room" x="24" y="24" width="952" height="572" rx="16"/>
<rect class="fp-zone" x="48" y="60" width="290" height="440" rx="12"/>
<rect class="fp-zone" x="360" y="60" width="450" height="500" rx="12"/>
<rect class="fp-zone" x="826" y="60" width="128" height="512" rx="12"/>
<text class="fp-label" x="60" y="86">Pit Side</text>
<text class="fp-label" x="372" y="86">Booths &amp; Long Table</text>
<text class="fp-label" x="838" y="86">Terrace</text>
<!-- nyitott konyha / grill -->
<rect x="48" y="512" width="290" height="60" rx="10" fill="#1c1512" stroke="#3a2c23"/>
<circle class="fp-fire" cx="130" cy="542" r="34"/>
<circle class="fp-fire" cx="200" cy="542" r="26"/>
<text class="fp-label" x="238" y="547" style="font-size:11px">${T.fp.grill}</text>
<!-- bar -->
<rect x="360" y="576" width="240" height="0" fill="none"/>
<rect x="620" y="512" width="190" height="48" rx="8" fill="#1c1512" stroke="#3a2c23"/>
<text class="fp-label" x="660" y="541" style="font-size:11px">${T.fp.bar}</text>
<!-- entrance -->
<rect x="470" y="588" width="120" height="8" rx="4" fill="#ff5b15" opacity=".55"/>
<text class="fp-label" x="600" y="598" style="font-size:10px">${T.fp.entrance}</text>`;

function renderFloorplan() {
  const shapes = TABLES.map(t => {
    const taken = isTaken(t);
    const small = t.seats < guests;
    const cls = "fp-t " + (taken ? "is-taken" : small ? "is-small" : "is-free") + (selected === t.id ? " is-sel" : "");
    const cx = t.r ? t.x : t.x + t.w / 2;
    const cy = t.r ? t.y : t.y + t.h / 2;
    const shape = t.r
      ? `<circle class="fp-shape" cx="${t.x}" cy="${t.y}" r="${t.r}"/>`
      : `<rect class="fp-shape" x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" rx="9"/>`;
    const disabled = taken || small;
    return `<g class="${cls}" data-table="${t.id}" role="button" tabindex="${disabled ? -1 : 0}"
      aria-disabled="${disabled}" aria-pressed="${selected === t.id}"
      aria-label="${t.id}, ${t.zone}, ${T.fp.pax(t.seats)}, ${taken ? T.fp.taken : small ? T.fp.tooSmall : T.fp.free}">
      ${shape}
      <text class="fp-id" x="${cx}" y="${cy - 5}">${t.id}</text>
      <text class="fp-seats" x="${cx}" y="${cy + 11}">${T.fp.pax(t.seats)}</text>
    </g>`;
  }).join("");
  fp.innerHTML = FP_BG + shapes;
}

function selectTable(id) {
  const t = TABLES.find(x => x.id === id);
  if (!t || isTaken(t) || t.seats < guests) return;
  selected = id;
  renderFloorplan();
  tablePanel.innerHTML = `
    <div class="tp-id">${t.id}</div>
    <p class="tp-zone">${esc(t.zone)}</p>
    <p class="tp-note">${esc(ZONE_NOTE[t.zone])}</p>
    <ul class="tp-list">
      <li><span>${T.fp.capacity}</span><b>${T.fp.pax(t.seats)}</b></li>
      <li><span>${T.fp.date}</span><b>${resDate.value}</b></li>
      <li><span>${T.fp.time}</span><b>${resTime.value}</b></li>
      <li><span>${T.fp.guests}</span><b>${T.fp.pax(guests)}</b></li>
    </ul>
    <button class="btn btn-solid btn-block" type="button" id="toResForm">${T.fp.book(esc(t.id))}</button>
    <p class="note">${T.fp.hold}</p>`;
  $("#toResForm").addEventListener("click", openRes);
}

fp.addEventListener("click", e => { const g = e.target.closest(".fp-t"); if (g) selectTable(g.dataset.table); });
fp.addEventListener("keydown", e => {
  const g = e.target.closest(".fp-t");
  if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); selectTable(g.dataset.table); }
});
resDate.addEventListener("change", () => { fillResTimes(); selected = null; resetPanel(); renderFloorplan(); });
resTime.addEventListener("change", () => { selected = null; resetPanel(); renderFloorplan(); });
$$("[data-guests]").forEach(b => b.addEventListener("click", () => {
  guests = clamp(guests + (+b.dataset.guests), 1, 12);
  resGuestsEl.textContent = guests;
  if (selected) { const t = TABLES.find(x => x.id === selected); if (t.seats < guests) { selected = null; resetPanel(); } }
  renderFloorplan();
}));
function resetPanel() { tablePanel.innerHTML = `<p class="table-panel-empty">${T.fp.pickPrompt}</p>`; }
renderFloorplan();

/* ── foglalás modal ───────────────────────────────────────────────── */
const resModal = $("#resModal"), resForm = $("#resForm"), resStatus = $("#resStatus");
function openRes() {
  if (!selected) { goto("#reserve"); toast(T.fp.pickFirst); return; }
  const t = TABLES.find(x => x.id === selected);
  $("#resRecap").innerHTML = `<b>${t.id}</b> · ${esc(t.zone)} &nbsp;|&nbsp; <b>${resDate.value}</b> ${resTime.value} &nbsp;|&nbsp; <b>${T.fp.pax(guests)}</b>`;
  resModal.hidden = false;
  requestAnimationFrame(() => resModal.classList.add("is-open"));
  document.body.classList.add("is-locked");
  trap(resModal);
}
function closeRes() {
  resModal.classList.remove("is-open");
  document.body.classList.remove("is-locked");
  setTimeout(() => { resModal.hidden = true; }, 480);
  untrap();
}
$$("[data-open-reserve]").forEach(b => b.addEventListener("click", () => {
  if (selected) openRes();
  else { goto("#reserve"); toast(T.fp.pickThenData); }
}));

resForm.addEventListener("submit", e => {
  e.preventDefault();
  const err = validate(resForm);
  if (err) { resStatus.textContent = err; resStatus.classList.remove("is-ok"); return; }
  const f = new FormData(resForm);
  const t = TABLES.find(x => x.id === selected);
  const list = myReservations();
  list.push({ date: resDate.value, time: resTime.value, table: t.id, guests, name: f.get("name") });
  try { localStorage.setItem(RES_KEY, JSON.stringify(list)); } catch {}

  const code = LOCALE.resPrefix + String(4400 + list.length * 7).slice(0, 4);
  closeRes();
  openThanks({
    kicker: T.thanks.resKicker,
    title: T.thanks.resTitle,
    lede: T.thanks.resLede,
    facts: [
      [T.thanks.resCode, code, false],
      [T.thanks.resTable, `${t.id} · ${t.zone}`, true],
      [T.thanks.resWhen, `${resDate.value} ${resTime.value}`, false],
      [T.thanks.resGuests, T.fp.pax(guests), false],
    ],
    items: [{ n: String(f.get("occasion")), p: f.get("note") ? String(f.get("note")).slice(0, 60) : "—" }],
  });
  resForm.reset(); selected = null; resetPanel(); renderFloorplan();
});

/* ── indulás ──────────────────────────────────────────────────────── */
renderCart();
setStep(0);
if (cart.length) toast(T.cart.waiting(cart.length));
})();
