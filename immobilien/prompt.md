Recreate the website "RelayEstate" with high visual fidelity using Tailwind CSS and Lucide icons.

The result must match the supplied reference website, including its cinematic dark-to-light editorial flow and complex layering.

Preserve source quirks:
- The navigation bar uses a specific height of 78px with a grid-based 3-column layout (1fr auto 1fr).
- Multi-stage clipping paths are used for sections (e.g., .section-slant-both, .section-slant-bottom) which create overlap effects.
- The "RelayEstate" title uses a specific letter-spacing of -0.07em.
- Custom grain overlays are applied via ::after pseudo-elements with radial gradients and overlay blend modes.

CRITICAL FIDELITY CONSTRAINTS
- Background colors must follow the exact defined palette: Ink (#120F0C), Deep (#241A14), Slate (#34251C), and Cream (#F4EFE7).
- Text line-height must be strictly 1.05 for headings and 1.7 for paragraphs.
- All transitions must use the exact --transition-smooth duration (220ms ease).
- No additional hover effects should be added beyond those explicitly in the source (e.g., translateY(-2px) on primary buttons).

TECH STACK / DEPENDENCIES
- Tailwind CSS (v3.x CDN)
- Lucide Icons (v0.x CDN via unpkg)
- Google Fonts: Inter (400, 500, 600, 700, 800) and Sora (500, 600, 700, 800).
- Google Tag Manager script (ID: G-2M6V79H761).

GLOBAL STYLE
- Body: -webkit-font-smoothing: antialiased; background: #120F0C; color: #FBF6EE.
- Headings: Sora font, letter-spacing -0.045em.
- Component: .btn-primary uses a gradient (135deg, #F1C08A, #C98755) with box-shadow: 0 14px 40px rgba(201, 135, 85, 0.28).

ASSET MAP
- Hero Background: https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/b88b71ee-6e8c-4230-b004-094bc0a9f86f_3840w.jpg
- Impact Card Media: https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/159f2747-a817-4c4c-b3c6-3cb76fd687fd_1600w.jpg
- Workflow Wide Card: https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/18afa835-2089-4735-a843-41e6dead8283_1600w.jpg
- Workflow Tall 1: https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/363c853e-1ed3-4fd6-b9bf-692f68f58f0b_1600w.jpg?w=800&q=80
- Workflow Tall 2: https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/f5b115de-1738-4c7b-b50d-5a214d631dd1_1600w.jpg?w=800&q=80
- Process Background: https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/867d0995-3ba9-4162-ab74-3d309156d96e_1600w.jpg
- Client Avatar: https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/71d7ad40-af9f-4af2-baa2-8d7eb0382908_320w.webp
- Audit Parallax: https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/42b483d1-26b5-4f11-b4a0-a5307a34acf1_3840w.jpg

MEDIA BEHAVIOR
- Hero Parallax: Simple translateY scroll effect (scrollY * 0.25).
- Audit Parallax: Calculated progress-based transform (translate3d(0, (clamped - 0.5) * 120px, 0) scale(1.12)).
- Image Transitions: .impact-card:hover img uses 900ms ease transform scale(1.04).

LAYER STACK / POSITIONING MAP
- Navbar: Fixed (top: 0), z-index: 80, backdrop-filter: blur(18px).
- Grain Overlays: Relative parent with ::after pseudo-element, z-index: 1, pointer-events: none.
- Section Content: Relative, z-index: 2.
- Diagnostic Rail Glow: Absolute within rail, z-index 1, animated top: -90px to 100%.
- FAQ Answer: Grid-template-rows 0fr to 1fr for CSS-only accordion animation.

SECTION 1 - HERO
- Background: Absolute layer with mask-image (radial-gradient) and linear-gradient overlays.
- Reveal Items: Custom animation 'revealFlow' (opacity 0 + scale 0.985 -> opacity 1 + scale 1) with staggered delays (100ms, 200ms, 300ms).
- Copy: Main title font-size clamp(3.8rem, 8vw, 8.4rem).

SECTION 2 - DIAGNOSTIC TIMELINE
- Background: Cream to Stone gradient with a subtle copper radial glow at the top left.
- Component: A centered vertical rail with a 'diagnostic-rail-glow' animation (3.8s linear loop).
- Logic: Staggered .diagnostic-step blocks; alternate even steps with .reverse class (flex-direction: row-reverse).

SECTION 3 - SOLUTION ARCHITECTURE
- Background: Dark cinematic gradient (#17120E -> #2D211A) with a 72px grid pattern mask.
- Component: .automate-engine-shell includes a macOS-style window bar, a glow-top border, and a 4-column flow grid.
- Visuals: Bottom fade gradient (linear-gradient to top, rgba(11, 8, 6, 0.98), transparent) to blend content into the support grid.

SECTION 4 - PROOF & IMPACT
- Background: Light-themed with Stone/Cream gradients.
- Layout: 2-column grid; left side is a line-item list, right side is a media card with overlay text.
- Metrics: .impact-metric-row uses flexbox with Sora font for large percentage/time values.

SECTION 5 - WORKFLOW SCENARIOS
- Layout: Uses clip-path polygon(0 4vw, 100% 0, 100% 100%, 0 100%) for entry transition.
- Feature: Left column contains a vertical timeline with specific dot styles (.workflow-point-dot with 6px rgba box-shadow).

SECTION 6 - IMPLEMENTATION + FAQ
- Process: 3-column panel (Story Card, Step-List Card, Stat Stack).
- FAQ: Accordion using 'is-open' class to toggle grid-template-rows from 0fr to 1fr. Uses Lucide 'plus' icon rotating 45 degrees.

SECTION 7 - AUDIT / FINAL CTA
- Layout: Full viewport height (min-height: 100vh) with heavy cinematic overlays.
- Parallax: Parallax image with high contrast/brightness filters. Side card uses backdrop-filter: blur(16px).

GLOBAL ANIMATION / INTERACTION RULES
- Scroll-triggered 'is-scrolled' class on navbar for background shift.
- IntersectionObserver for adding 'reveal-active' to items in view.
- Custom JS logic for the FAQ accordion and the audit parallax positioning.

COMMON MISTAKES TO AVOID
- Do not use standard grid gaps for the timeline; use the specific calculated widths (calc(50% - 34px)).
- Do not miss the negative margins on slanted sections which ensure seamless transitions between backgrounds.
- Ensure the grain-overlay ::after is correctly z-indexed so it sits below text but above background colors.