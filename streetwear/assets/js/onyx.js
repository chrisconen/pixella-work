(() => {
  "use strict";

  const FRAME_COUNT = 144;
  const DROP_AT = new Date("2026-08-01T00:00:00").getTime();
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smoothstep = (from, to, value) => {
    const x = clamp((value - from) / Math.max(0.0001, to - from));
    return x * x * (3 - 2 * x);
  };
  const pad3 = (value) => String(value).padStart(3, "0");
  const pad2 = (value) => String(value).padStart(2, "0");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const body = document.body;
  const root = document.documentElement;
  const loader = document.querySelector("[data-loader]");
  const loaderBar = document.querySelector("[data-loader-bar]");
  const loaderValue = document.querySelector("[data-loader-value]");
  const canvas = document.querySelector("[data-hero-canvas]");
  const context = canvas.getContext("2d", { alpha: false, desynchronized: true });
  const frameValue = document.querySelector("[data-frame-value]");
  const header = document.querySelector("[data-header]");
  const stickyChapters = [...document.querySelectorAll(".scroll-chapter")];

  const frames = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let currentFrame = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let lenis = null;
  let fabricVideo = null;
  let lastFabricTime = -1;

  body.classList.add("is-loading");

  /* ---------- hero frame scrub ---------- */

  function framePath(index) {
    return `./assets/media/hero/frame-${pad3(index + 1)}.webp`;
  }

  function loadFrame(index) {
    return new Promise((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        frames[index] = image;
        loadedCount += 1;
        const percent = Math.round((loadedCount / FRAME_COUNT) * 100);
        loaderBar.style.transform = `scaleX(${percent / 100})`;
        loaderValue.textContent = String(percent);
        if (index === 0) {
          drawFrame(0);
          body.classList.add("has-canvas");
        }
        resolve(true);
      };
      image.onerror = () => {
        loadedCount += 1;
        resolve(false);
      };
      image.src = framePath(index);
    });
  }

  async function preloadFrames() {
    const priority = [0, 1, 2, 3, 4, 5, 35, 71, 107, 143];
    await Promise.all(priority.map(loadFrame));
    const rest = Array.from({ length: FRAME_COUNT }, (_, index) => index).filter((index) => !priority.includes(index));
    const batchSize = 18;
    for (let index = 0; index < rest.length; index += batchSize) {
      await Promise.all(rest.slice(index, index + batchSize).map(loadFrame));
    }
    loaderValue.textContent = "100";
    loaderBar.style.transform = "scaleX(1)";
    window.setTimeout(() => {
      loader.classList.add("is-complete");
      body.classList.remove("is-loading");
      body.classList.add("is-ready");
    }, 280);
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvasWidth = Math.max(1, Math.round(rect.width * dpr));
    canvasHeight = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      drawFrame(currentFrame);
    }
  }

  function nearestLoadedFrame(index) {
    if (frames[index]) return frames[index];
    for (let radius = 1; radius < FRAME_COUNT; radius += 1) {
      if (frames[index - radius]) return frames[index - radius];
      if (frames[index + radius]) return frames[index + radius];
    }
    return null;
  }

  function drawFrame(index) {
    if (!context || !canvasWidth || !canvasHeight) return;
    const image = nearestLoadedFrame(index);
    if (!image) return;
    const scale = Math.max(canvasWidth / image.naturalWidth, canvasHeight / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const x = (canvasWidth - width) / 2;
    const y = (canvasHeight - height) / 2;
    context.fillStyle = "#080808";
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(image, x, y, width, height);
    canvas.dataset.frame = String(index + 1);
    frameValue.textContent = pad3(index + 1);
  }

  /* ---------- scroll state ---------- */

  function chapterProgress(element) {
    const rect = element.getBoundingClientRect();
    const scrollable = Math.max(1, rect.height - window.innerHeight);
    return clamp(-rect.top / scrollable);
  }

  function applyWindows(section, progress) {
    section.querySelectorAll("[data-window]").forEach((element) => {
      const [start, end] = element.dataset.window.split(",").map(Number);
      const fadeSpan = Math.min(0.1, Math.max(0.045, (end - start) * 0.26));
      const enter = smoothstep(start, start + fadeSpan, progress);
      const exit = 1 - smoothstep(end - fadeSpan, end, progress);
      const opacity = clamp(Math.min(enter, exit));
      const y = (1 - enter) * 32 - (1 - exit) * 18;
      element.style.opacity = opacity.toFixed(3);
      element.style.translate = `0 ${y.toFixed(1)}px`;
    });
  }

  function updateFabric(progress) {
    if (!fabricVideo || !Number.isFinite(fabricVideo.duration) || fabricVideo.duration <= 0) return;
    const target = clamp(smoothstep(0.05, 0.95, progress), 0, 0.997) * fabricVideo.duration;
    if (Math.abs(target - lastFabricTime) > 0.025) {
      fabricVideo.currentTime = target;
      lastFabricTime = target;
      fabricVideo.dataset.time = target.toFixed(2);
    }
  }

  function updateScrollState() {
    const heroProgress = chapterProgress(document.querySelector("#hero"));
    const heroFrame = reducedMotion ? 36 : Math.round(heroProgress * (FRAME_COUNT - 1));
    if (heroFrame !== currentFrame) {
      currentFrame = heroFrame;
      drawFrame(currentFrame);
    }
    root.style.setProperty("--hero-progress", heroProgress.toFixed(4));

    stickyChapters.forEach((section) => {
      const progress = chapterProgress(section);
      section.dataset.progress = progress.toFixed(3);
      applyWindows(section, progress);
      if (section.id === "fabric") updateFabric(progress);
    });

    header.classList.toggle("is-compact", window.scrollY > 80);
  }

  /* ---------- countdown ---------- */

  function setupCountdown() {
    const rootEl = document.querySelector("[data-countdown]");
    const fields = {
      days: rootEl.querySelector('[data-cd="days"]'),
      hours: rootEl.querySelector('[data-cd="hours"]'),
      mins: rootEl.querySelector('[data-cd="mins"]'),
      secs: rootEl.querySelector('[data-cd="secs"]'),
    };
    const tick = () => {
      const remaining = Math.max(0, Math.floor((DROP_AT - Date.now()) / 1000));
      fields.days.textContent = pad2(Math.floor(remaining / 86400));
      fields.hours.textContent = pad2(Math.floor((remaining % 86400) / 3600));
      fields.mins.textContent = pad2(Math.floor((remaining % 3600) / 60));
      fields.secs.textContent = pad2(remaining % 60);
      rootEl.dataset.remaining = String(remaining);
    };
    tick();
    window.setInterval(tick, 500);
  }

  /* ---------- graceful future media ---------- */

  // ponytail: fetch + r.ok gate — missing files stay silent, present files get blob URLs (frame-exact scrubbing, no broken players)
  // file:// alatt a fetch tiltott — ott a nyers URL-t adjuk vissza (helyi mp4 közvetlenül seekelhető)
  function fetchMedia(url) {
    if (window.location.protocol === "file:") return Promise.resolve(url);
    return fetch(url)
      .then((response) => (response.ok ? response.blob() : null))
      .then((blob) => (blob ? URL.createObjectURL(blob) : null))
      .catch(() => null);
  }

  function setupSpinVideos() {
    document.querySelectorAll("[data-spin]").forEach((media) => {
      fetchMedia(media.dataset.spin).then((src) => {
        if (!src) return;
        const video = document.createElement("video");
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = "auto";
        video.src = src;
        media.appendChild(video);
        const card = media.closest(".card");
        card.addEventListener("mouseenter", () => {
          card.classList.add("is-spinning");
          video.play().catch(() => {});
        });
        card.addEventListener("mouseleave", () => {
          card.classList.remove("is-spinning");
          video.pause();
          video.currentTime = 0;
        });
      });
    });
  }

  function setupFabricVideo() {
    fetchMedia("https://cdn.pixella.at/streetwear/assets/media/clip-fabric.mp4").then((src) => {
      if (!src) return;
      const video = document.createElement("video");
      video.className = "fabric-video";
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        video.pause();
        fabricVideo = video;
        updateScrollState();
      });
      document.querySelector("[data-fabric-stage]").prepend(video);
      video.load();
    });
  }

  /* ---------- cart ---------- */

  const cart = new Map(); // key: "product|size" -> {name, size, price, qty}
  const drawer = document.querySelector("[data-cart-drawer]");
  const scrim = document.querySelector("[data-cart-scrim]");
  const badge = document.querySelector("[data-cart-badge]");
  const itemsList = document.querySelector("[data-cart-items]");
  const totalEl = document.querySelector("[data-cart-total]");
  const titleCount = document.querySelector("[data-cart-title-count]");

  function openCart() {
    drawer.classList.add("is-open");
    scrim.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    body.classList.add("cart-open");
    if (lenis) lenis.stop();
  }

  function closeCart() {
    drawer.classList.remove("is-open");
    scrim.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    body.classList.remove("cart-open");
    if (lenis) lenis.start();
  }

  function renderCart() {
    const entries = [...cart.entries()];
    const count = entries.reduce((sum, [, item]) => sum + item.qty, 0);
    const total = entries.reduce((sum, [, item]) => sum + item.qty * item.price, 0);

    badge.textContent = String(count);
    badge.dataset.cartCount = String(count);
    badge.classList.add("is-bump");
    window.setTimeout(() => badge.classList.remove("is-bump"), 260);
    titleCount.textContent = `(${count})`;
    totalEl.textContent = `$${total.toLocaleString("en-US")}`;
    drawer.classList.toggle("has-items", count > 0);

    itemsList.innerHTML = "";
    entries.forEach(([key, item]) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <p class="cart-item-name"></p>
        <b class="cart-item-price"></b>
        <p class="cart-item-size"></p>
        <span class="cart-qty">
          <button type="button" data-dec aria-label="Decrease quantity">−</button>
          <b>${item.qty}</b>
          <button type="button" data-inc aria-label="Increase quantity">+</button>
        </span>`;
      li.querySelector(".cart-item-name").textContent = item.name;
      li.querySelector(".cart-item-price").textContent = `$${(item.qty * item.price).toLocaleString("en-US")}`;
      li.querySelector(".cart-item-size").textContent = `Size ${item.size} · $${item.price} each`;
      li.querySelector("[data-inc]").addEventListener("click", () => {
        item.qty += 1;
        renderCart();
      });
      li.querySelector("[data-dec]").addEventListener("click", () => {
        item.qty -= 1;
        if (item.qty <= 0) cart.delete(key);
        renderCart();
      });
      itemsList.appendChild(li);
    });
  }

  function setupCart() {
    document.querySelector("[data-cart-toggle]").addEventListener("click", () => {
      drawer.classList.contains("is-open") ? closeCart() : openCart();
    });
    document.querySelector("[data-cart-close]").addEventListener("click", closeCart);
    scrim.addEventListener("click", closeCart);
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && drawer.classList.contains("is-open")) closeCart();
    });
    document.querySelector("[data-checkout]").addEventListener("click", (event) => {
      event.currentTarget.textContent = "Demo only — nothing ships";
      document.querySelector("[data-cart-note]").textContent = "This storefront is a portfolio piece. Your fit stays imaginary.";
    });
  }

  function setupProducts() {
    const notifyContext = document.querySelector("[data-notify-context]");
    document.querySelectorAll(".card").forEach((card) => {
      const sizesRow = card.querySelector("[data-sizes]");
      const status = card.querySelector("[data-card-status]");
      let selectedSize = null;

      sizesRow.querySelectorAll("button").forEach((pill) => {
        pill.addEventListener("click", () => {
          if (pill.classList.contains("is-soldout")) {
            notifyContext.textContent = `Waiting on: ${card.dataset.name} — size ${pill.dataset.size}`;
            status.textContent = "";
            const target = document.querySelector("#notify");
            lenis ? lenis.scrollTo(target, { duration: 1.2 }) : target.scrollIntoView({ behavior: "smooth" });
            return;
          }
          selectedSize = pill.dataset.size;
          sizesRow.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b === pill));
          sizesRow.classList.remove("needs-size");
          status.textContent = "";
        });
      });

      card.querySelector("[data-add]").addEventListener("click", () => {
        if (!selectedSize) {
          sizesRow.classList.remove("needs-size");
          void sizesRow.offsetWidth; // restart nudge animation
          sizesRow.classList.add("needs-size");
          status.classList.remove("is-ok");
          status.textContent = "Pick a size first.";
          return;
        }
        const key = `${card.dataset.product}|${selectedSize}`;
        const existing = cart.get(key);
        if (existing) existing.qty += 1;
        else cart.set(key, { name: card.dataset.name, size: selectedSize, price: Number(card.dataset.price), qty: 1 });
        status.classList.add("is-ok");
        status.textContent = `Added — size ${selectedSize}.`;
        renderCart();
        openCart();
      });
    });
  }

  /* ---------- notify form ---------- */

  function setupNotifyForm() {
    const form = document.querySelector("[data-notify-form]");
    const status = document.querySelector("[data-notify-status]");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const field = form.querySelector("input[name='email']");
      field.classList.remove("is-invalid");
      if (!field.checkValidity()) {
        field.classList.add("is-invalid");
        field.focus();
        status.textContent = "That email will not survive the fog. Try again.";
        return;
      }
      form.dataset.submitted = "true";
      form.querySelector("button span").textContent = "You're on the list";
      status.textContent = "Locked in. First word goes to you.";
      field.disabled = true;
    });
  }

  /* ---------- reveal-on-scroll for flow sections ---------- */

  function setupReveals() {
    const targets = document.querySelectorAll(".reveal");
    if (reducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach((el) => observer.observe(el));
  }

  /* ---------- boot ---------- */

  function setupNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const target = document.querySelector(anchor.getAttribute("href"));
        if (!target) return;
        if (lenis) {
          event.preventDefault();
          lenis.scrollTo(target, { duration: 1.35 });
        }
      });
    });
  }

  function animate(time) {
    if (lenis) lenis.raf(time);
    updateScrollState();
    window.requestAnimationFrame(animate);
  }

  function init() {
    resizeCanvas();
    if (!reducedMotion && window.Lenis) {
      lenis = new window.Lenis({ duration: 1.2, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.1 });
    }
    window.addEventListener("resize", resizeCanvas, { passive: true });
    setupCountdown();
    setupNavigation();
    setupCart();
    setupProducts();
    setupNotifyForm();
    setupReveals();
    setupSpinVideos();
    setupFabricVideo();
    preloadFrames();
    updateScrollState();
    window.requestAnimationFrame(animate);
  }

  init();
})();
