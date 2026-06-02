---
name: Lumina Stream
colors:
  surface: '#111415'
  surface-dim: '#111415'
  surface-bright: '#373a3b'
  surface-container-lowest: '#0c0f10'
  surface-container-low: '#191c1d'
  surface-container: '#1d2021'
  surface-container-high: '#282a2b'
  surface-container-highest: '#323536'
  on-surface: '#e1e3e4'
  on-surface-variant: '#bac9cc'
  inverse-surface: '#e1e3e4'
  inverse-on-surface: '#2e3132'
  outline: '#849396'
  outline-variant: '#3b494c'
  surface-tint: '#00daf3'
  primary: '#c3f5ff'
  on-primary: '#00363d'
  primary-container: '#00e5ff'
  on-primary-container: '#00626e'
  inverse-primary: '#006875'
  secondary: '#d8b9ff'
  on-secondary: '#450086'
  secondary-container: '#6e06d0'
  on-secondary-container: '#d5b5ff'
  tertiary: '#edeaff'
  on-tertiary: '#2c2c52'
  tertiary-container: '#cdccfb'
  on-tertiary-container: '#55557e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#9cf0ff'
  primary-fixed-dim: '#00daf3'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f58'
  secondary-fixed: '#eddcff'
  secondary-fixed-dim: '#d8b9ff'
  on-secondary-fixed: '#290055'
  on-secondary-fixed-variant: '#6200bc'
  tertiary-fixed: '#e2dfff'
  tertiary-fixed-dim: '#c3c2f1'
  on-tertiary-fixed: '#17173c'
  on-tertiary-fixed-variant: '#43436a'
  background: '#111415'
  on-background: '#e1e3e4'
  surface-variant: '#323536'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 72px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 24px
  margin-mobile: 20px
  section-padding: 120px
  unit: 8px
---

## Brand & Style
The design system is engineered for a premium, high-tech streaming platform that prioritizes intimacy and exclusivity. The brand personality is modern, cinematic, and sophisticated, targeting tech-savvy users who value privacy and high-quality digital experiences. 

The visual style is a blend of **Glassmorphism** and **High-Contrast Dark Mode**. It utilizes deep, multi-layered backgrounds to create a sense of infinite depth, punctuated by vibrant, glowing accents that guide the user's attention to primary actions. The emotional response is one of security, excitement, and "digital luxury."

## Colors
The palette is rooted in a deep, nocturnal base to minimize eye strain and maximize the "pop" of foreground elements.

- **Primary & Secondary:** A high-energy gradient spanning from Electric Purple to Cyan. This is reserved for primary CTAs and brand-defining highlights.
- **Background:** A complex dark navy (#0F0C29). Avoid pure black to maintain a softer, more premium feel.
- **Surface:** Semi-transparent white or navy washes to create the glassmorphism effect.
- **Accent Glows:** Low-opacity radial gradients using the primary colors are used behind key cards or headings to create a "halo" effect.

## Typography
The typography system uses a hierarchical mix of expressive sans-serifs. 

**Plus Jakarta Sans** is used for headlines to provide a friendly yet modern character, featuring tight letter-spacing for high-impact display moments. **Inter** is used for body text to ensure maximum legibility against dark backgrounds. 

For the most important marketing copy (e.g., the Hero section), use the Primary Gradient as a text fill. Body text should never be pure white; use 60-80% opacity to reduce contrast-induced vibration.

## Layout & Spacing
The design system follows a **12-column fixed grid** on desktop, centered within the viewport. 

- **Desktop:** 12 columns, 24px gutters, max-width 1200px.
- **Tablet:** 8 columns, 16px gutters, fluid width.
- **Mobile:** 4 columns, 16px gutters.

The spacing rhythm is based on an 8px base unit. Sections are heavily padded (120px+) to create an airy, premium feel that allows high-resolution imagery and glassmorphic cards to breathe. Content is generally center-aligned for landing pages to maintain a cinematic focus.

## Elevation & Depth
Depth is created through "Visual Stacking" rather than traditional heavy shadows.

1.  **Level 0 (Background):** Deep navy solid or subtle radial gradient.
2.  **Level 1 (Cards/Containers):** `rgba(255, 255, 255, 0.03)` with a 1px `rgba(255, 255, 255, 0.1)` border and 20px backdrop-blur.
3.  **Level 2 (Interactive Elements):** Buttons and active states utilize a "Glow" shadow. These are 0px offset, 20px blur shadows that match the color of the element (Cyan or Purple) at 40% opacity.

## Shapes
The shape language is "Soft-Modern." All primary containers and buttons use significant rounding to counter the "cold" feel of dark, technical interfaces. 

- **Cards:** 24px (rounded-xl)
- **Buttons:** 16px (rounded-lg)
- **Inputs:** 12px (standard)

Avoid sharp 90-degree angles entirely to maintain the approachable, organic personality of the brand.

## Components

### Buttons
- **Primary:** Gradient background (Purple to Cyan), white text, bold weight. Features a soft glow shadow on hover.
- **Secondary/Ghost:** 1px white border (30% opacity) with a hover state that fills with `rgba(255, 255, 255, 0.1)`.

### Cards
Cards are the primary content vehicle. They must use the glassmorphism treatment (backdrop-blur: 20px) and a subtle top-down light stroke (1px white at 10% opacity) to simulate a glass edge catching the light.

### Input Fields
Darker than the background (#0a081a) with a 1px border. On focus, the border transitions to the primary cyan, and a subtle cyan outer glow appears.

### Chips/Tags
Small, pill-shaped elements with a low-opacity purple background and high-saturation purple text for metadata or category labels.

### Feature Icons
Icons should be styled with a "duotone" approach or contained within a circular glass container with a subtle glow matching the primary brand colors.