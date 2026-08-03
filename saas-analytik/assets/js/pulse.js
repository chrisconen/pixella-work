(() => {
  "use strict";

  const FRAME_COUNT = 144;
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smoothstep = (from, to, value) => {
    const x = clamp((value - from) / Math.max(0.0001, to - from));
    return x * x * (3 - 2 * x);
  };
  const pad = (value) => String(value).padStart(3, "0");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const body = document.body;
  const loader = document.querySelector("[data-loader]");
  const loaderBar = document.querySelector("[data-loader-bar]");
  const loaderValue = document.querySelector("[data-loader-value]");
  const canvas = document.querySelector("[data-hero-canvas]");
  const context = canvas.getContext("2d", { alpha: false, desynchronized: true });
  const frameValue = document.querySelector("[data-frame-value]");
  const header = document.querySelector("[data-header]");
  const hero = document.querySelector("#hero");
  const logos = document.querySelector("#logos");
  const pinSections = [...document.querySelectorAll(".pin-section")];
  const featuresPanel = document.querySelector("[data-features-panel]");
  const signalVideo = document.querySelector("[data-signal-video]");
  const calmVideo = document.querySelector("[data-calm-video]");
  const ctaSection = document.querySelector("#cta");

  const frames = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let currentFrame = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let lenis = null;
  let lastSignalTime = -1;

  body.classList.add("is-loading");

  /* ---------- hero frame scrub ---------- */
  const framePath = (index) => `./assets/media/hero/frame-${pad(index + 1)}.webp`;

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
    }, 260);
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
    const mobile = window.innerWidth <= 720;
    const fitWidth = canvasWidth / image.naturalWidth;
    const fitHeight = canvasHeight / image.naturalHeight;
    const scale = mobile ? Math.max(fitWidth, fitHeight) * 0.92 : Math.min(fitWidth, fitHeight) * 1.04;
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const x = (canvasWidth - width) / 2;
    const y = (canvasHeight - height) / 2 - canvasHeight * 0.04;
    context.fillStyle = "#07070b";
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(image, x, y, width, height);
    canvas.dataset.frame = String(index + 1);
    frameValue.textContent = pad(index + 1);
  }

  /* ---------- scroll state ---------- */
  function sectionProgress(element) {
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

  const DARK = [7, 7, 11];
  const LIGHT = [250, 250, 253];

  function updateBackground() {
    const rect = logos.getBoundingClientRect();
    const t = smoothstep(0, 1, clamp(1 - rect.top / (window.innerHeight * 0.85)));
    const channel = (i) => Math.round(DARK[i] + (LIGHT[i] - DARK[i]) * t);
    body.style.backgroundColor = `rgb(${channel(0)},${channel(1)},${channel(2)})`;
    body.classList.toggle("is-light", t > 0.5);
  }

  function updateSignalScrub(progress) {
    if (!featuresPanel.classList.contains("has-video")) return;
    if (Number.isFinite(signalVideo.duration) && signalVideo.duration > 0) {
      const target = clamp(progress, 0, 0.997) * signalVideo.duration;
      if (Math.abs(target - lastSignalTime) > 0.025) {
        signalVideo.currentTime = target;
        lastSignalTime = target;
        signalVideo.dataset.time = target.toFixed(2);
      }
    }
  }

  function updateScrollState() {
    const heroProgress = sectionProgress(hero);
    const heroFrame = reducedMotion ? FRAME_COUNT - 1 : Math.round(heroProgress * (FRAME_COUNT - 1));
    if (heroFrame !== currentFrame) {
      currentFrame = heroFrame;
      drawFrame(currentFrame);
    }

    pinSections.forEach((section) => {
      const progress = sectionProgress(section);
      section.dataset.progress = progress.toFixed(3);
      applyWindows(section, progress);
      if (section.id === "features") updateSignalScrub(progress);
    });

    updateBackground();
    header.classList.toggle("is-compact", window.scrollY > 60);
  }

  /* ---------- optional clips: wire but degrade gracefully ---------- */
  function wireClip(url, video, host, onReady) {
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`missing ${url}`);
        return response.blob();
      })
      .then((blob) => {
        video.src = URL.createObjectURL(blob);
        video.load();
        host.classList.add("has-video");
        if (onReady) onReady();
      })
      .catch(() => {
        /* clip not shipped yet — gradient fallback stays */
      });
  }

  /* ---------- metrics counters ---------- */
  function formatCount(value) {
    return Math.round(value).toLocaleString("en-US");
  }

  function runCounter(element) {
    const target = Number(element.dataset.target);
    if (reducedMotion) {
      element.textContent = formatCount(target);
      element.dataset.done = "true";
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = clamp((now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      element.textContent = formatCount(target * eased);
      if (t < 1) {
        window.requestAnimationFrame(tick);
      } else {
        element.textContent = formatCount(target);
        element.dataset.done = "true";
      }
    };
    window.requestAnimationFrame(tick);
  }

  function setupCounters() {
    const section = document.querySelector("[data-metrics]");
    const counters = [...section.querySelectorAll("[data-counter]")];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        section.dataset.counted = "true";
        counters.forEach(runCounter);
      });
    }, { threshold: 0.35 });
    observer.observe(section);
  }

  /* ---------- pricing toggle ---------- */
  function setupPricing() {
    const section = document.querySelector("[data-pricing]");
    const toggle = section.querySelector("[data-billing-toggle]");
    const prices = [...section.querySelectorAll("[data-price]")];
    const notes = [...section.querySelectorAll("[data-billing-note]")];
    const apply = () => {
      const annual = section.dataset.billing === "annual";
      toggle.setAttribute("aria-checked", String(annual));
      prices.forEach((price) => {
        price.textContent = annual ? price.dataset.annual : price.dataset.monthly;
      });
      notes.forEach((note) => {
        note.textContent = annual ? "per month, billed annually" : "per month, billed monthly";
      });
    };
    toggle.addEventListener("click", () => {
      section.dataset.billing = section.dataset.billing === "annual" ? "monthly" : "annual";
      apply();
    });
    apply();
  }

  /* ---------- FAQ accordion ---------- */
  function setupFaq() {
    const items = [...document.querySelectorAll(".faq-item")];
    const set = (item, open) => {
      item.querySelector("button").setAttribute("aria-expanded", String(open));
      item.querySelector(".faq-answer").hidden = !open;
    };
    items.forEach((item) => {
      item.querySelector("button").addEventListener("click", () => {
        const isOpen = item.querySelector("button").getAttribute("aria-expanded") === "true";
        items.forEach((other) => set(other, false));
        if (!isOpen) set(item, true);
      });
    });
  }

  /* ---------- navigation ---------- */
  function setupNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const target = document.querySelector(anchor.getAttribute("href"));
        if (!target) return;
        if (lenis) {
          event.preventDefault();
          lenis.scrollTo(target, { duration: 1.3 });
        }
      });
    });
  }

  /* ---------- main loop ---------- */
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
    wireClip("./assets/media/clip-2-signal.mp4", signalVideo, featuresPanel, () => signalVideo.pause());
    wireClip("./assets/media/clip-3-calm.mp4", calmVideo, ctaSection, () => {
      if (!reducedMotion) calmVideo.play().catch(() => {});
    });
    window.addEventListener("resize", resizeCanvas, { passive: true });
    setupNavigation();
    setupCounters();
    setupPricing();
    setupFaq();
    preloadFrames();
    updateScrollState();
    window.requestAnimationFrame(animate);
  }

  init();
})();
