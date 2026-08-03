# Elysian Editorial Architecture Template

Recreate the website "Elysian Editorial Architecture Template" with high visual fidelity as a Tailwind CSS and GSAP-powered site. The result must match the supplied reference screenshots exactly, preserving its brutalist editorial aesthetic.

### TECH STACK / DEPENDENCIES
- CSS: Tailwind CSS (v3)
- Icons: Iconify (Solar Linear set)
- Animation: GSAP 3.12.2, ScrollTrigger
- 3D/Background: Three.js (r134) (optional, but requested for the noise background)

### GLOBAL STYLE
- Background: `#e5e1d8` (A slightly warmer/lighter limestone grey based on the new screenshots).
- Dark Background (Section 4 top): `#121722` (Deep slate/navy).
- Text: `#1e293b` (Main), `#475569` (Secondary), `#ffffff` (Dark sections).
- Font: Sans-serif (Inter) for headers/UI, and Serif (Georgia/ui-serif) for body copy where applicable. Note: The new design uses Sans-serif mostly! The headers ("SPATIAL DYNAMICS", "ELYSIAN CONSTRUCTS") are a clean, elegant Sans-Serif. The body text also looks Sans-serif but very clean. Let's stick to Inter for everything, using varying weights (light, regular, medium).

### ASSET MAP (Expected in `assets/` folder)
- Hero Left: `assets/hero-left.png`
- Hero Center: `assets/hero-center.png`
- Hero Right: `assets/hero-right.png`
- Hero Card Image: `assets/hero-card.png`
- Phase 1 Left: `assets/section_1-left.png`
- Phase 1 Right: `assets/section_1-right.png`
- Phase 2 Left: `assets/section_2-left.png`
- Phase 2 Right: `assets/section_2-right.png`
- Phase 3 Left: `assets/section_3-left.png`
- Phase 3 Right: `assets/section_3-right.png`

### LAYOUT & SECTIONS

**Navbar:**
- Left: `■ ELYSIAN` (Square bullet, tracking-widest, text-sm).
- Right: `WORK`, `MODELS`, `CONTACT` (Gap-8, text-sm).
- Fixed top, z-50.

**Hero Section (`hero.png`):**
- Layout: Complex overlapping grid/absolute positioning.
- Text Top Left: `ELYSIAN` (block) `CONSTRUCTS` (block), large text, light weight. Below it: "Exploring the delicate balance between brutalist geometry and organic fluid forms." (max-w-xs).
- Images:
  - Left image (bottom-aligned relative to text): Tall vertical crop.
  - Center image (main): Very large, spanning from top to bottom, offset to the right of the center.
  - Right image (top-aligned): Tall vertical crop.
  - Floating Card (bottom right, overlapping center/right images): White background, contains a small avatar (`hero-card.png`), text "Curated environments engineered for deep focus, tranquility, and aesthetic permanence.", a bulleted list (Minimalist material integration, Sustainable raw sourcing, Natural light trajectory mapping), and a footer logo "VERTEX".

**Phase 01: Spatial Dynamics (`section_1.png`):**
- Header: `PHASE 01` (with a horizontal line). Below: `SPATIAL` <br> `DYNAMICS`.
- Right text (opposite header): "We approach every volume as an opportunity to define light, shadow, and human interaction. Materials are selected not just for appearance, but for resonance."
- Two Columns of Images:
  - Left column: Image `section_1-left.png` (Starts higher). Below it: `MONOLITHIC PRESENCE` and subtext.
  - Right column: Image `section_1-right.png` (Starts lower, staggered). Below it: `LUMINOUS INTERVENTIONS` and subtext.

**Phase 02: Material Articulation (`section_2.png`):**
- Header: `PHASE 02` | `MATERIAL` <br> `ARTICULATION`.
- Right text: "Sourcing rare and fundamental elements to craft textures that demand tactile engagement and age gracefully, blending raw brutalism with refinement."
- Two Columns:
  - Left: `section_2-left.png` (Higher). Subtext: `TACTILE RESONANCE`...
  - Right: `section_2-right.png` (Lower). Subtext: `STRUCTURAL HONESTY`...

**Phase 03: Environmental Synthesis (`section_3.png`):**
- Header: `PHASE 03` | `ENVIRONMENTAL` <br> `SYNTHESIS`.
- Right text: "Integrating built forms seamlessly with their surrounding landscapes to blur the boundaries between interior and exterior dimensions."
- Two Columns:
  - Left: `section_3-left.png` (Higher). Subtext: `FLUID BOUNDARIES`...
  - Right: `section_3-right.png` (Lower). Subtext: `HOLISTIC ECOSYSTEMS`...

**Dark Quote Section (`section_4.png` top):**
- Full width dark background (`bg-[#121722]`).
- Centered large serif or elegant sans quote: `"The environment they constructed doesn't just house our operations; it actively shapes the psychology of everyone who enters. A masterclass in pure restraint."`
- Attribution: `— MARCUS V., DIRECTOR —`

**Client Perspectives (`section_4.png` bottom):**
- Back to light background.
- Centered header: `CLIENT PERSPECTIVES` and "Reflections on the environments we've shaped."
- 3 Column Grid of Cards. Each card has a slight border/background, containing the quote and the author.

**Engagement Models (`section_5.png`):**
- Centered header: `ENGAGEMENT MODELS` and "Tailored structural and spatial interventions."
- 3 Column Grid of Cards:
  - Card 1: `PHASE I Concept`. Includes checklist and `INQUIRE` outline button.
  - Card 2: `PHASE II Design`. Dark background (`bg-[#121722]`), white text. Checklist and `COMMENCE` solid white button.
  - Card 3: `PHASE III Execution`. Includes checklist and `INQUIRE` outline button.

**Footer (`section_5.png` bottom):**
- Left: `■ ELYSIAN`
- Center: `INDEX`, `JOURNAL`, `CONTACT`
- Right: `© 2024. Impeccably resolved.`

### ANIMATION RULES
- Use GSAP ScrollTrigger for revealing sections (fade in up).
- Images should have a subtle parallax or scale effect on scroll/hover.
- The WebGL background should remain as a subtle noise texture covering the light background areas.