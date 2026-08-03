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
  const canvas = document.querySelector("[data-chalk-canvas]");
  const context = canvas.getContext("2d", { alpha: false, desynchronized: true });
  const frameValue = document.querySelector("[data-frame-value]");
  const stickyChapters = [...document.querySelectorAll(".scroll-chapter")];
  const header = document.querySelector("[data-header]");
  const philosophy = document.querySelector("#philosophy");
  const lineValue = document.querySelector("[data-line-value]");
  const results = document.querySelector("#results");
  const counters = [...document.querySelectorAll("[data-count-to]")];

  const frames = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let currentFrame = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let lenis = null;

  body.classList.add("is-loading");

  function framePath(index) {
    return `./assets/media/hero/frame-${pad(index + 1)}.webp`;
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
    // cover-fit: the chalk cloud fills the stage edge to edge
    const scale = Math.max(canvasWidth / image.naturalWidth, canvasHeight / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const x = (canvasWidth - width) / 2;
    const y = (canvasHeight - height) / 2;
    context.fillStyle = "#080808";
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(image, x, y, width, height);
    canvas.dataset.frame = String(index + 1);
    frameValue.textContent = pad(index + 1);
  }

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

  function updatePhilosophy(progress) {
    const step = progress < 1 / 3 ? 1 : progress < 2 / 3 ? 2 : 3;
    if (philosophy.dataset.line !== String(step)) {
      philosophy.dataset.line = String(step);
      lineValue.textContent = pad(step).slice(1);
    }
  }

  function updateScrollState() {
    const heroProgress = chapterProgress(document.querySelector("#hero"));
    const heroFrame = reducedMotion ? 36 : Math.round(heroProgress * (FRAME_COUNT - 1));
    if (heroFrame !== currentFrame) {
      currentFrame = heroFrame;
      drawFrame(currentFrame);
    }

    stickyChapters.forEach((section) => {
      const progress = chapterProgress(section);
      section.dataset.progress = progress.toFixed(3);
      applyWindows(section, progress);
      if (section.id === "philosophy") updatePhilosophy(progress);
    });

    header.classList.toggle("is-compact", window.scrollY > 80);
  }

  function runCounters() {
    if (results.dataset.counters !== "idle") return;
    results.dataset.counters = "running";
    if (reducedMotion) {
      counters.forEach((el) => { el.textContent = el.dataset.countTo; });
      results.dataset.counters = "done";
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = clamp((now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      counters.forEach((el) => {
        el.textContent = String(Math.round(Number(el.dataset.countTo) * eased));
      });
      if (t < 1) {
        window.requestAnimationFrame(tick);
      } else {
        results.dataset.counters = "done";
      }
    };
    window.requestAnimationFrame(tick);
  }

  function setupCounters() {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        runCounters();
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    observer.observe(results);
  }

  function setupAmbientVideos() {
    // ponytail: clips ship later — wire them, degrade to the charcoal gradient until then
    const wiring = [
      ["./assets/media/clip-2-iron.mp4", "[data-programs-video]"],
      ["./assets/media/clip-3-grind.mp4", "[data-results-video]"],
    ];
    wiring.forEach(([src, selector]) => {
      const video = document.querySelector(selector);
      if (!video || reducedMotion) return;
      fetch(src)
        .then((response) => (response.ok ? response.blob() : null))
        .then((blob) => {
          if (!blob || !blob.type.startsWith("video")) return;
          video.src = URL.createObjectURL(blob);
          video.play().catch(() => {});
          video.closest("section").classList.add("has-video");
        })
        .catch(() => {});
    });
  }

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

  function setupForm() {
    const form = document.querySelector("[data-signup-form]");
    const status = document.querySelector("[data-form-status]");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fields = [...form.querySelectorAll("input")];
      fields.forEach((field) => field.classList.remove("is-invalid"));
      const invalid = fields.find((field) => !field.checkValidity());
      if (invalid) {
        invalid.classList.add("is-invalid");
        invalid.focus();
        status.textContent = "Name and a real email. That is all we ask.";
        return;
      }
      form.dataset.submitted = "true";
      form.querySelector("button span").textContent = "See you on the floor";
      status.textContent = "Week claimed. Bring shoes that mean it.";
      fields.forEach((field) => {
        field.disabled = true;
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
    setupNavigation();
    setupForm();
    setupCounters();
    setupAmbientVideos();
    preloadFrames();
    updateScrollState();
    window.requestAnimationFrame(animate);
  }

  init();
})();
