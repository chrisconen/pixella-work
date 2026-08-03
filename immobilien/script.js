(function () {
  const nav = document.querySelector(".site-nav");
  const heroBg = document.querySelector("[data-hero-parallax]");
  const heroVideo = document.querySelector(".hero-bg");
  const auditBg = document.querySelector("[data-audit-parallax]");
  const audit = document.querySelector(".audit");
  const engine = document.querySelector("#engine");
  const impact = document.querySelector("#proof");
  const workflow = document.querySelector("#workflow");
  const process = document.querySelector("#process");
  const diagnosticTrack = document.querySelector("[data-diagnostic-track]");
  const diagnosticProgress = document.querySelector("[data-diagnostic-progress]");

  function updateScrollState() {
    const y = window.scrollY || 0;
    nav.classList.toggle("is-scrolled", y > 24);

    if (engine || impact || workflow || process) {
      const engineRect = engine.getBoundingClientRect();
      const impactRect = impact.getBoundingClientRect();
      const workflowRect = workflow.getBoundingClientRect();
      const processRect = process.getBoundingClientRect();
      const engineActive = engineRect.top < 90 && engineRect.bottom > 180;
      const impactActive = impactRect.top < 90 && impactRect.bottom > 180;
      const workflowActive = workflowRect.top < 90 && workflowRect.bottom > 180;
      const processActive = processRect.top < 90 && processRect.bottom > 180;
      nav.classList.toggle("is-hidden", engineActive || impactActive || workflowActive || processActive);
    }

    if (heroBg) {
      heroBg.style.transform = `translate3d(0, ${y * 0.25}px, 0)`;
    }

    if (auditBg && audit) {
      const rect = audit.getBoundingClientRect();
      const progress = 1 - rect.top / (window.innerHeight + rect.height);
      const clamped = Math.min(1, Math.max(0, progress));
      const offset = (clamped - 0.5) * 120;
      auditBg.style.transform = `translate3d(0, ${offset}px, 0) scale(1.12)`;
    }

    if (diagnosticTrack && diagnosticProgress) {
      const rect = diagnosticTrack.getBoundingClientRect();
      const viewportMid = window.innerHeight * 0.58;
      const progress = (viewportMid - rect.top) / Math.max(1, rect.height * 0.82);
      const clamped = Math.min(1, Math.max(0, progress));
      diagnosticTrack.style.setProperty("--timeline-progress", clamped.toFixed(3));
      diagnosticTrack.classList.toggle("timeline-active", clamped > 0.04);
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-active");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  document.querySelectorAll(".reveal-on-scroll").forEach((item) => observer.observe(item));

  document.querySelectorAll(".faq-item button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      const wasOpen = item.classList.contains("is-open");
      const faq = item.closest(".faq");
      faq.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
        openItem.classList.remove("is-open");
      });
      if (!wasOpen) {
        item.classList.add("is-open");
      }
    });
  });

  if (heroVideo && heroVideo.tagName === "VIDEO") {
    heroVideo.addEventListener("ended", () => {
      heroVideo.pause();
    });
  }

  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", updateScrollState);
  updateScrollState();

  if (window.lucide) {
    window.lucide.createIcons();
  }
})();
