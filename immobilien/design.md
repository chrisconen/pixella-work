---
version: 1.0.0
name: RelayEstate System
description: A premium visual language for real estate automation focusing on trust, speed, and architectural precision.
colors:
  bg-ink: "#120F0C"
  bg-deep: "#241A14"
  surface-cream: "#F4EFE7"
  surface-stone: "#E7D8C6"
  accent-copper: "#C98755"
  accent-gold: "#D6A85F"
  text-dark: "#18130F"
  text-light: "#FBF6EE"
  text-muted: "#B8A99B"
  border-dark: "rgba(255, 255, 255, 0.10)"
  border-light: "rgba(24, 19, 15, 0.12)"
typography:
  headings:
    family: "'Sora', sans-serif"
    weight: "500-800"
    letterSpacing: "-0.045em"
  body:
    family: "'Inter', sans-serif"
    weight: "400-600"
    lineHeight: "1.7"
  eyebrow:
    family: "'Inter', sans-serif"
    weight: "800"
    letterSpacing: "0.17em"
    transform: "uppercase"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "80px"
  section-v: "9rem"
rounded:
  md: "20px"
  lg: "28px"
  xl: "32px"
  full: "999px"
components:
  buttons:
    primary: "Gradient from #F1C08A to copper, pill-shaped, uppercase, heavy shadow"
    secondary: "Glassmorphic, 1px border light, backdrop-blur 10px"
  cards:
    light: "Stone/Cream gradient background, subtle 1px border, 22px-32px rounded"
    engine: "Dark slate background, inner glow top-border, grid pattern overlay"
  navigation:
    sticky: "Fixed top, blur 18px, cream background at 94% opacity, bottom border light"
  status-chips:
    flow: "Pill-shaped, dark translucent background, 1px border, lucide icon integration"
motion:
  reveal: "1.1s cubic-bezier revealFlow animation (translateY 34px to 0, blur 10px to 0)"
  parallax: "Background image translation at 0.25x scroll speed"
  track: "3.8s linear vertical glow flow for diagnostic rail"
---
## Overview
RelayEstate uses a high-contrast "Light/Dark/Light" layer stack. The system represents the "frontend" of real estate (luxury homes, light editorial surfaces) and the "backend engine" (dark orchestration layers, data grids, and automated flows).

## Colors
The palette is rooted in earth tones and metallics. `bg-ink` provides a deep foundation for the "Engine" sections, while `surface-cream` and `surface-stone` handle the "Editorial" sections. `accent-copper` is the primary action color, used for CTA gradients and high-visibility status indicators.

## Typography
- **Sora** is the display font, used for high-impact headlines with tight tracking (-0.085em in hero) to create a premium architectural feel.
- **Inter** handles all body and utility text, emphasizing legibility and rigorous information hierarchy in data-heavy components.

## Spacing
The system uses a 4vw slant-margin for section transitions, creating a sense of forward momentum. Internal component spacing follows a strict 1.5rem to 2rem padding rule for cards.

## Layout
- **Z-Index Strategy**: Nav (80), Final CTA (8), FAQ (7), Process (6), Hero (5).
- **Shells**: Maximum content width is capped at 1240px for content sections and 1440px for hero/nav shells.
- **Slant System**: Sections use `clip-path` polygons (4vw offsets) to overlap and stitch together different visual themes.

## Elevation & Depth
- **Engine Depth**: Uses 1px padding gradients and translucent window bars to simulate a software interface (IDE-style).
- **Editorial Elevation**: Uses large spread shadows (0 24px 70px) on light cards to make them float above stone-textured backgrounds.

## Shapes
Edges are heavily rounded (28px-32px) to soften the technical nature of automation. Interactive elements like buttons and status chips always use a full pill shape (999px).

## Components
- **Lead Engine**: A 4-column grid representing a pipeline with 1px border-right separators and flow-cards that use vertical left-accent bars.
- **Diagnostic Track**: A vertical rail system with an animated glow that connects alternating text/card nodes.
- **Process Story Card**: A tall, image-backed container with bottom-aligned text and a three-dot status indicator.
- **Accordion FAQ**: A structured list of pill-rounded items with a rotate-on-click (+ to x) icon transition.

## Motion
Animations emphasize "revealing" through glass. The `revealFlow` animation combined with Lucide icon icons provides a high-tech feedback loop. Parallax is used on luxury imagery to maintain high-end brand perception during scroll.

## Do's and Don'ts
- **Do**: Use 18px-size grain overlays on dark sections to add texture.
- **Do**: Maintain the 60-second response theme in microcopy and metrics.
- **Don't**: Use sharp corners on any UI element except the diagnostic rail.
- **Don't**: Mix the copper gradient with any other brand colors in a single component.

## Accessibility
- **Contrast**: Text on dark sections must maintain `text-light` (FBF6EE) at 80% opacity or higher.
- **Hierarchy**: All sections must be clearly labeled with an `.eyebrow` (H8 equivalent) containing a status dot.
- **Interactions**: Button hover states must include a translateY(-2px) shift to provide tactile feedback for screen reader users.