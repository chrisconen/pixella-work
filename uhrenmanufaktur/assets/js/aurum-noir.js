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
  const root = document.documentElement;
  const loader = document.querySelector("[data-loader]");
  const loaderBar = document.querySelector("[data-loader-bar]");
  const loaderValue = document.querySelector("[data-loader-value]");
  const canvas = document.querySelector("[data-orbit-canvas]");
  const context = canvas.getContext("2d", { alpha: false, desynchronized: true });
  const frameValue = document.querySelector("[data-frame-value]");
  const chapters = [...document.querySelectorAll("[data-chapter]")];
  const stickyChapters = [...document.querySelectorAll(".scroll-chapter")];
  const railItems = [...document.querySelectorAll(".chapter-rail li")];
  const railProgress = document.querySelector("[data-rail-progress]");
  const header = document.querySelector("[data-header]");
  const scrubVideo = document.querySelector("[data-scrub-video]");
  const assemblyVideo = document.querySelector("[data-assembly-video]");
  const assemblyLabel = document.querySelector("[data-assembly-label]");
  const assemblyPercent = document.querySelector("[data-assembly-percent]");

  const frames = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let currentFrame = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let lenis = null;
  let lastVideoTime = -1;
  let lastAssemblyTime = -1;

  body.classList.add("is-loading");

  function framePath(index) {
    return `./assets/aurum/orbit/frame-${pad(index + 1)}.webp`;
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
    const mobile = window.innerWidth <= 720;
    const fitWidth = canvasWidth / image.naturalWidth;
    const fitHeight = canvasHeight / image.naturalHeight;
    const scale = Math.min(fitWidth * (mobile ? 1.12 : 0.74), fitHeight * (mobile ? 1.02 : 0.92));
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const x = (canvasWidth - width) / 2;
    const y = (canvasHeight - height) / 2 + canvasHeight * (mobile ? 0.01 : -0.005);
    context.fillStyle = "#020202";
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

  function updateAssembly(progress) {
    const assembled = smoothstep(0.08, 0.86, progress);
    if (Number.isFinite(assemblyVideo.duration) && assemblyVideo.duration > 0) {
      const target = clamp(assembled, 0, 0.997) * assemblyVideo.duration;
      if (Math.abs(target - lastAssemblyTime) > 0.025) {
        assemblyVideo.currentTime = target;
        lastAssemblyTime = target;
        assemblyVideo.dataset.time = target.toFixed(2);
      }
    }
    const percent = Math.round(assembled * 100);
    assemblyPercent.textContent = `${percent}%`;
    assemblyLabel.textContent = percent > 94 ? "Calibre complete" : percent > 48 ? "Converging" : "Disassembled";
    root.style.setProperty("--assembly-progress", `${percent}%`);
    assemblyVideo.dataset.assembly = String(percent);
  }

  function updateMacro(progress) {
    const zoom = 1.0 + progress * 0.12;
    const driftX = (progress - 0.5) * -9;
    const driftY = Math.sin(progress * Math.PI) * -3;
    scrubVideo.style.transform = `translate3d(${driftX.toFixed(2)}%, ${driftY.toFixed(2)}%, 0) scale(${zoom.toFixed(3)})`;
    if (Number.isFinite(scrubVideo.duration) && scrubVideo.duration > 0) {
      const target = clamp(progress, 0, 0.997) * scrubVideo.duration;
      if (Math.abs(target - lastVideoTime) > 0.025) {
        scrubVideo.currentTime = target;
        lastVideoTime = target;
        scrubVideo.dataset.time = target.toFixed(2);
      }
    }
  }

  function activeChapterIndex() {
    const anchor = window.innerHeight * 0.48;
    let index = 0;
    chapters.forEach((chapter, chapterIndex) => {
      const rect = chapter.getBoundingClientRect();
      if (rect.top <= anchor) index = chapterIndex;
    });
    return index;
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
      if (section.id === "story") root.style.setProperty("--story-progress", progress.toFixed(4));
      if (section.id === "macro") updateMacro(progress);
      if (section.id === "engineering") updateAssembly(progress);
    });

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pageProgress = clamp(window.scrollY / maxScroll);
    railProgress.style.transform = `scaleY(${pageProgress.toFixed(4)})`;
    header.classList.toggle("is-compact", window.scrollY > 80);

    const activeIndex = activeChapterIndex();
    chapters.forEach((chapter, index) => chapter.classList.toggle("is-active", index === activeIndex));
    railItems.forEach((item, index) => item.classList.toggle("is-active", index === activeIndex));
    body.dataset.activeChapter = chapters[activeIndex]?.id || "hero";
  }

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

  function setupForm() {
    const form = document.querySelector("[data-waitlist-form]");
    const status = document.querySelector("[data-form-status]");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fields = [...form.querySelectorAll("input")];
      fields.forEach((field) => field.classList.remove("is-invalid"));
      const invalid = fields.find((field) => !field.checkValidity());
      if (invalid) {
        invalid.classList.add("is-invalid");
        invalid.focus();
        status.textContent = "Please complete the private request details.";
        return;
      }
      form.dataset.submitted = "true";
      form.querySelector("button span").textContent = "Request received";
      status.textContent = "The maison will contact you privately.";
      fields.forEach((field) => {
        field.disabled = true;
      });
    });
  }

  function setupPointer() {
    if (window.matchMedia("(pointer:fine)").matches) {
      window.addEventListener("pointermove", (event) => {
        root.style.setProperty("--mouse-x", `${event.clientX}px`);
        root.style.setProperty("--mouse-y", `${event.clientY}px`);
      }, { passive: true });
    }
  }

  function animate(time) {
    if (lenis) lenis.raf(time);
    updateScrollState();
    window.requestAnimationFrame(animate);
  }

  function init() {
    resizeCanvas();
    if (!reducedMotion && window.Lenis) {
      lenis = new window.Lenis({ duration: 1.25, smoothWheel: true, wheelMultiplier: 0.88, touchMultiplier: 1.1 });
    }
    // ponytail: fetch->blob makes scrubbing frame-exact even without HTTP Range support
    [scrubVideo, assemblyVideo].forEach((video) => {
      video.pause();
      video.addEventListener("loadedmetadata", updateScrollState);
      fetch(video.querySelector("source").src)
        .then((response) => response.blob())
        .then((blob) => {
          video.src = URL.createObjectURL(blob);
          video.load();
          video.pause();
        });
    });
    window.addEventListener("resize", resizeCanvas, { passive: true });
    setupNavigation();
    setupForm();
    setupPointer();
    preloadFrames();
    updateScrollState();
    window.requestAnimationFrame(animate);
  }

  init();
})();
