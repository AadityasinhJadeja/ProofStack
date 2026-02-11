# Design System Update & UI Architecture

This document serves as the single source of truth for the **ProofStack** visual identity and layout logic. It captures the transition from a standard dashboard to a premium, "airy," and trust-focused security platform.

## 1. Visual Philosophy: "Airy Premium"
The design objective is to communicate **Trust** and **Clarity**. We moved away from cluttered enterprise dashboards toward a minimalist, high-contrast aesthetic that uses white space as a functional tool.

- **Background**: Soft radial gradients (`body::before`) create a "mesh-glow" effect, adding depth without distraction.
- **Glassmorphism**: Surfaces (`.glass-card`, `.panel`) use backdrop blurs and subtle borders (`rgba(255, 255, 255, 0.8)`) to feel light and modern.
- **Micro-Detailing**: Custom scrollbars and refined shadows (`--shadow-xl`) provide a tactile, high-end feel.

## 2. Global Layout & Alignment
A critical update was the implementation of a strict **Mathematical Centering** system to ensure the UI feels balanced regardless of content changes.

- **The 3-Column Topbar**: The `app-topbar` uses a `1fr auto 1fr` grid. This forces the navigation links into the dead center of the screen, with the logo on the left and actions on the right perfectly balanced.
- **Vertical Rhythm**: 
  - Section headers now have a `160px` bottom buffer to ensure transitions between "Features" and "Tools" feel intentional and spacious.
  - The hero section uses optimized padding (`80px`) to ensure primary CTAs are visible above the fold on all screen sizes.

## 3. Core Component System

### Buttons (Primary & Secondary)
- **Shape**: Consistent `999px` border-radius (Pill shape) across all interactive elements.
- **Dynamics**: Hover states include a `translateY(-2px)` lift and a subtle glow effect (`--accent-glow`).
- **Logic**: The "Get Demo" button is now path-aware (via `TopBarActions.tsx`) and only appears on the Home page to reduce nav-clutter in data-heavy views.

### Mission Feature Cards
- **Structure**: High-padding (`48px`) containers with 3D-lift animations.
- **Color Coding**: Each security pillar (Traceable, Defensible, Paced) triggers a unique top-accent color on hover (Blue, Green, Amber).
- **Iconography**: Icons scale and rotate slightly on hover to provide tactile feedback.

### Floating Hero Assets
- **Animation**: The `floatSoft` keyframe provides a non-linear, drift-like motion to graphical cards (Verified Intelligence, Active Audit).
- **Aesthetic**: Layered shadows and glass backgrounds make these assets feel like physical cards floating in a light space.

## 4. Typography & Information Hierarchy
- **Typography**: Primary font is **Outfit** (Modern, geometric).
- **Kickers**: Section headers use a bold (`800`), uppercase kicker with wide tracking (`0.1em`) to anchor the title.
- **Headings**: `page-heading` uses a clamped font size (`clamp(1.8rem, 3vw, 2.55rem)`) for fluid responsiveness.
- **Subtitles**: Strictly centered via `margin: 0 auto` and `text-align: center` to maintain alignment on wide monitors.

## 5. UI Evolution & Removals
- **No Sign-In**: Removed all "Sign-in" functionality. The app is designed as an "Artifact Generator" first; user accounts were deemed unnecessary clutter for the current audit workflow.
- **Header Optimization**: Removed the `brand-subtitle` from the header. This reclaimed vertical space and allowed the hero title to breathe.
- **Alignment Fixes**: Centrally-aligned all documentation headers (Report Artifact, Claim Audit) using a grid-spacer pattern to prevent text-shifting when export buttons are present.

## 6. CSS Architecture Note
All major layout and design tokens are centralized in `globals.css` using CSS Variables. Avoid using inline styles for layout; rely on the `.section-header`, `.page-shell`, and `.panel` utility classes to preserve this system.
