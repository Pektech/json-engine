# Technical Design System: Design Specification & Implementation Guide

## 1. Overview & Creative North Star: "The Engineered Canvas"

This design system is built for high-density, technical environments where precision is paramount. Our Creative North Star is **"The Engineered Canvas."** Unlike consumer apps that rely on rounded friendliness and vibrant pops of color, this system treats the UI as a sophisticated terminal—a high-performance tool for builders.

We break the "generic dashboard" mold through **Functional Asymmetry** and **Tonal Depth**. Instead of standard centered layouts, we prioritize a left-heavy, information-dense hierarchy that mimics a code editor’s efficiency. We reject the "boxed-in" look of traditional grids; instead, we use strict typography alignment and subtle background shifts to imply structure, creating a digital workspace that feels expensive, intentional, and quiet.

---

## 2. Colors & Surface Philosophy

The palette is rooted in deep charcols and ink-blacks, designed to minimize eye strain during long-form technical work.

### Tonal Hierarchy
- **Base Layer:** `surface` (`#131313`) – The foundation for the entire application.
- **Deep Wells:** `surface_container_lowest` (`#0e0e0e`) – Used for recessed areas like terminal outputs or sidebars to create "negative depth."
- **Elevated Plates:** `surface_container_high` (`#2a2a2a`) – Reserved for active panels or floating modals.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off primary layout areas. Boundaries must be defined through color shifts. A sidebar using `surface_container_low` should simply sit flush against the `surface` background. The shift in hex code provides the "border" without adding visual noise.

### The "Glass & Gradient" Rule
To elevate the system above a standard flat UI, utilize **Monochromatic Glassmorphism**. For floating elements (command palettes, dropdowns), use `surface_variant` at 80% opacity with a `20px` backdrop blur. 
*   **Signature Texture:** Use a subtle linear gradient on primary CTAs—transitioning from `primary_container` (`#007acc`) to `primary` (`#9fcaff`) at a 45-degree angle—to give buttons a machined, metallic sheen.

---

## 3. Typography: Precision Engineering

We utilize a dual-font strategy to balance readability with a technical aesthetic.

*   **Proportional (Inter):** Used for all UI chrome, body text, and headlines. It provides a clean, neutral foundation.
*   **Monospace (Space Grotesk/JetBrains Mono):** Reserved for labels, metadata, and status indicators. This adds an "engineered" feel to secondary information.

### Typographic Identity
- **Display-LG (3.5rem / Inter):** Used sparingly for hero moments. Set with tight tracking (-0.02em).
- **Label-MD (0.75rem / Space Grotesk):** All-caps for table headers and section titles to evoke the look of a technical blueprint.
- **Body-MD (0.875rem / Inter):** The workhorse size for all content, optimized for high-density data.

---

## 4. Elevation & Depth: Tonal Layering

We convey hierarchy through **Tonal Layering** rather than structural lines or heavy drop shadows.

### The Layering Principle
Depth is achieved by "stacking" the surface-container tiers. 
- Place a `surface_container_lowest` card on a `surface_container_low` section to create a soft, natural recessed effect.
- **Ambient Shadows:** When a "floating" effect (like a context menu) is required, use an extra-diffused shadow: `0px 8px 32px rgba(0, 0, 0, 0.5)`. The shadow must feel like an occlusion of light, not a black glow.

### The "Ghost Border" Fallback
If a border is absolutely necessary for accessibility (e.g., input fields), use a **Ghost Border**. Apply `outline_variant` at 20% opacity. 100% opaque, high-contrast borders are strictly forbidden as they clutter the "Engineered Canvas."

---

## 5. Components

### Buttons
- **Primary:** Gradient-filled (`primary_container` to `primary`). 4px radius. No border.
- **Secondary:** Ghost style. `surface_container_highest` background with a `Ghost Border` on hover.
- **Tertiary:** Text-only using `primary` color, strictly for low-priority actions.

### Input Fields
- **Architecture:** Use `surface_container_low` as the field background. 
- **States:** Active states are signaled by a 1px solid `primary` border on the bottom only, mimicking a terminal cursor.
- **Error:** Background shifts to `error_container` at 10% opacity; text remains high-contrast `error` (`#ffb4ab`).

### Cards & Lists
- **No Dividers:** Forbid the use of divider lines. Separate items using `2.5` (0.5rem) or `4` (0.9rem) spacing units.
- **Interactive States:** On hover, a list item should shift from `surface` to `surface_container_low`.

### Technical Components (Context-Specific)
- **Status Pills:** Use `label-sm` (Space Grotesk) inside a 2px rounded container.
- **The "Command Palette":** A center-aligned modal using the Glassmorphism rule. It should be the most elevated element in the system (`surface_container_highest`).

---

## 6. Do’s and Don’ts

### Do
- **Do** prioritize vertical rhythm. Use the `spacing-4` (0.9rem) unit as your default "breath" between elements.
- **Do** use `on_surface_variant` for secondary text to create a clear visual hierarchy against the primary `on_surface` content.
- **Do** use minimal rounding (`4px` for small components, `8px` for large containers) to maintain a crisp, sharp-edged feel.

### Don’t
- **Don’t** use pure black (#000) for large surfaces; it creates "black smear" on many displays. Stick to `surface` (#131313).
- **Don’t** use icons with a stroke weight heavier than 1.5px. The icons must feel as thin and precise as the typography.
- **Don’t** use traditional "Drop Shadows" on cards. Use tonal background shifts instead. If it doesn't float, it doesn't shadow.